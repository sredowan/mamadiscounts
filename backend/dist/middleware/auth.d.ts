import { Request, Response, NextFunction } from "express";
export interface AuthPayload {
    userId: string;
    email: string;
    role: "CUSTOMER" | "MERCHANT" | "ADMIN";
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
/**
 * Middleware: Require authentication
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
/**
 * Middleware: Require specific role
 */
export declare function requireRole(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware: Optional authentication (sets req.user if token present)
 */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): void;
/**
 * Generate JWT tokens
 */
export declare function generateTokens(payload: AuthPayload): {
    accessToken: string;
    refreshToken: string;
};
export declare function verifyToken(token: string): AuthPayload;
//# sourceMappingURL=auth.d.ts.map