import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.MODE === "production" ? "/api" : "http://localhost:5000/api"),
  withCredentials: true, // Important for sending/receiving cookies (refresh token)
});

// A flag to prevent multiple refresh calls simultaneously
let isRefreshing = false;
// Queue for requests that come in while token is refreshing
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach the access token
api.interceptors.request.use(
  (config) => {
    // In a real app, you might get this from Context/Store.
    // For simplicity, we can also pass it explicitly, or store it in a module variable.
    // But since we use React Context, we will inject it dynamically in AuthProvider,
    // or we can just keep a reference here.
    
    // We will set this token via a helper method from AuthProvider
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s and Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't intercept auth routes (like login itself failing)
      if (originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, put this request in a queue to wait
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh endpoint uses the HTTP-only cookie automatically because of withCredentials
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.accessToken;
        // Save the new token (our Context will also pick this up if we dispatch an event, or just use localStorage)
        localStorage.setItem("accessToken", newAccessToken);

        // Process queue with new token
        processQueue(null, newAccessToken);

        // Update the original request's header and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., refresh token expired)
        processQueue(refreshError, null);
        
        // Clear token and force logout
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // Redirect to login
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
