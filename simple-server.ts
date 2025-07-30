import express from "express";
import { createServer } from "http";
import { setupVite, log } from "./server/vite";

const app = express();
const server = createServer(app);

app.use(express.json());

// Basic test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working", timestamp: new Date().toISOString() });
});

async function startServer() {
  try {
    console.log("🔧 Starting simple server test...");
    console.log("Current working directory:", process.cwd());
    
    // Setup Vite 
    await setupVite(app, server);
    console.log("✅ Vite setup complete");
    
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Simple server running on http://0.0.0.0:${port}`);
    });
    
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();