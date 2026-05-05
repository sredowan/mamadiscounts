"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const PORT = process.env.PORT || 4000;
app_js_1.default.listen(PORT, () => {
    console.log(`\nCOUPONUS BD API running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health\n`);
});
//# sourceMappingURL=server.js.map