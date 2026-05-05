"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.optionalAuth = optionalAuth;
exports.generateTokens = generateTokens;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "couponus-dev-secret-change-in-prod";
/**
 * Middleware: Require authentication
 */
function requireAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
/**
 * Middleware: Require specific role
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }
        next();
    };
}
/**
 * Middleware: Optional authentication (sets req.user if token present)
 */
function optionalAuth(req, _res, next) {
    const token = extractToken(req);
    if (token) {
        try {
            req.user = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch {
            // Invalid token — continue without user
        }
    }
    next();
}
/**
 * Generate JWT tokens
 */
function generateTokens(payload) {
    const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    return req.cookies?.accessToken || null;
}
//# sourceMappingURL=auth.js.map