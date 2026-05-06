/**
 * COUPONUS BD — Unified production server for Hostinger Node.js hosting.
 *
 * Serves both the Next.js frontend AND the Express API from a single
 * Node.js process.  This avoids spawning child processes which trigger
 * uv_thread_create crashes on Hostinger's shared hosting thread limits.
 *
 * Entry: root package.json → "main": "server.js" → "start": "node server.js"
 */

// ── Load .env from backend/ (no dotenv dependency needed) ──────────
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Don't overwrite existing env vars (Hostinger panel takes priority)
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
    console.log(`✅ Loaded env from ${filePath}`);
  } catch {
    // File doesn't exist — that's fine, rely on Hostinger env panel
  }
}

// Load env: backend/.env (local, gitignored) → backend/.env.production (committed) → root .env
loadEnvFile(path.join(__dirname, "backend", ".env"));
loadEnvFile(path.join(__dirname, "backend", ".env.production"));
loadEnvFile(path.join(__dirname, ".env"));

// ── Critical: constrain threads and memory BEFORE anything else ────
process.env.UV_THREADPOOL_SIZE = "1";
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || "--max-old-space-size=512";
process.env.NODE_ENV = "production";

const http = require("http");

const FRONTEND_DIR = path.join(__dirname, "frontend");
const PORT = Number(process.env.PORT || 3000);

async function main() {
  // ── 1. Prepare the Express backend API ───────────────────────────
  let apiHandler = null;
  try {
    // backend/dist/app.js exports { createApp } + default
    const appModule = require("./backend/dist/app.js");
    const createApp = appModule.createApp || appModule.default;
    if (typeof createApp === "function") {
      apiHandler = createApp({ serveRootInfo: false });
      console.log("✅ Backend API loaded");
    } else {
      apiHandler = appModule;
      console.log("✅ Backend API loaded (default export)");
    }
  } catch (err) {
    console.warn("⚠️  Backend API not available:", err.message);
    console.warn("   Frontend will still serve, but /api routes will 503.");
  }

  // ── 2. Prepare Next.js ──────────────────────────────────────────
  const next = require(path.join(FRONTEND_DIR, "node_modules", "next"));
  const nextApp = next({ dev: false, dir: FRONTEND_DIR });
  const handleNext = nextApp.getRequestHandler();

  await nextApp.prepare();
  console.log("✅ Next.js ready");

  // ── 3. Create a single HTTP server ──────────────────────────────
  const server = http.createServer((req, res) => {
    // Route /api/* to Express backend if available
    if (req.url && req.url.startsWith("/api")) {
      if (apiHandler) {
        apiHandler(req, res);
        return;
      }
      // No backend: return 503
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "API not available" }));
      return;
    }

    // Everything else → Next.js
    handleNext(req, res);
  });

  server.listen(PORT, () => {
    console.log(`\n🚀 COUPONUS BD running on port ${PORT}`);
    console.log(`   Frontend: http://localhost:${PORT}`);
    if (apiHandler) {
      console.log(`   API:      http://localhost:${PORT}/api/health`);
    }
    console.log("");
  });

  // ── 4. Graceful shutdown ────────────────────────────────────────
  function shutdown(signal) {
    console.log(`\n${signal} received — shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
