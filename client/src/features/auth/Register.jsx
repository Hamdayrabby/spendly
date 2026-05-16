import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validators";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Register() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await authRegister(data.name, data.email, data.password, "BDT");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Logo href="/" />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground mt-2">Enter your details below to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            {serverError && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
                {serverError}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`flex h-10 w-full rounded-md border ${errors.name ? 'border-destructive' : 'border-input'} bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`flex h-10 w-full rounded-md border ${errors.email ? 'border-destructive' : 'border-input'} bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors`}
                  placeholder="name@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`flex h-10 w-full rounded-md border ${errors.password ? 'border-destructive' : 'border-input'} bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - The "Gravity" Visualization */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center overflow-hidden border-l border-border/50 bg-black/20">
        
        {/* Orbital Rings Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full border border-primary/40 animate-spin-slow-reverse" style={{ animationDuration: '60s' }} />
          <div className="absolute w-[800px] h-[800px] rounded-full border border-primary/20 animate-spin-slow" style={{ animationDuration: '80s' }} />
          <div className="absolute w-[1000px] h-[1000px] rounded-full border border-primary/10 animate-spin-slow-reverse" style={{ animationDuration: '120s' }} />
        </div>

        <div className="relative z-10 max-w-md px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20">
              <TrendingUp className="w-10 h-10 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-light tracking-tight mb-4">
              Take control of your finances.
            </h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Join Spendly and stop wondering where your money went. Start directing it.
            </p>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
