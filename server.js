/**
 * Hostinger Node.js entry point for COUPONUS BD
 * 
 * Fixes the uv_thread_create crash on shared hosting by limiting
 * Node.js thread pool size and memory before spawning Next.js.
 */
const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const FRONTEND_DIR = path.join(__dirname, "frontend");
const PORT = process.env.PORT || 3000;

// ── Critical: limit threads to avoid uv_thread_create crash on shared hosting
process.env.UV_THREADPOOL_SIZE = "1";

// Ensure .next build exists
const dotNext = path.join(FRONTEND_DIR, ".next");
if (!fs.existsSync(dotNext)) {
  console.log("⏳ Building Next.js (first deploy)...");
  execSync("npm install && npm run build", {
    cwd: FRONTEND_DIR,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      UV_THREADPOOL_SIZE: "1",
      NODE_OPTIONS: "--max-old-space-size=512",
    },
  });
}

// Start Next.js production server
console.log(`🚀 Starting COUPONUS BD on port ${PORT}...`);
const child = spawn("node", [
  "node_modules/.bin/next",
  "start",
  "-p",
  String(PORT),
], {
  cwd: FRONTEND_DIR,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(PORT),
    UV_THREADPOOL_SIZE: "1",
    NODE_OPTIONS: "--max-old-space-size=512",
  },
});

child.on("error", (err) => {
  console.error("❌ Failed to start:", err);
  process.exit(1);
});

child.on("exit", (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code || 0);
});
