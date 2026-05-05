import { createServer } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const requireFromRoot = createRequire(import.meta.url);
const next = requireFromRoot("next");
const { createApp } = await import("./backend/dist/app.js");

const port = Number(process.env.PORT || 3000);
const frontendDir = path.join(__dirname, "frontend");
const nextApp = next({ dev: false, dir: frontendDir });
const handleNext = nextApp.getRequestHandler();
const apiApp = createApp({ serveRootInfo: false });

await nextApp.prepare();

createServer((req, res) => {
  if (req.url?.startsWith("/api")) {
    apiApp(req, res);
    return;
  }

  handleNext(req, res);
}).listen(port, () => {
  console.log(`COUPONUS BD app running on port ${port}`);
});
