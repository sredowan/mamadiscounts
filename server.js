/**
 * Hostinger Node.js entry point
 * Serves the Next.js frontend on the port Hostinger assigns (via PORT env).
 */
const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const FRONTEND_DIR = path.join(__dirname, "frontend");
const PORT = process.env.PORT || 3000;

// Ensure .next build exists — if not, build it
const dotNext = path.join(FRONTEND_DIR, ".next");
if (!fs.existsSync(dotNext)) {
  console.log("⏳ No .next build found — running npm run build...");
  execSync("npm install --production=false && npm run build", {
    cwd: FRONTEND_DIR,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
}

// Start Next.js production server
console.log(`🚀 Starting Next.js on port ${PORT}...`);
const next = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: FRONTEND_DIR,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production", PORT: String(PORT) },
  shell: true,
});

next.on("error", (err) => {
  console.error("❌ Failed to start Next.js:", err);
  process.exit(1);
});

next.on("exit", (code) => {
  console.log(`Next.js exited with code ${code}`);
  process.exit(code || 0);
});
