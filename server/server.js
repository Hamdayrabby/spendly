const env = require("./src/config/env");
const connectDB = require("./src/config/db");
const app = require("./src/app");

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`✦ Spendly server running on port ${env.PORT}`);
      console.log(`  Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
