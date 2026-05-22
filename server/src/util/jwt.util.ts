import jwt from "jsonwebtoken"
import {NextFunction, Request, Response} from "express";

export type JwtPayload = {
    id: number;
    email: string;
    role: string;
}

export async function generateToken(payload: JwtPayload) {
    const jwtSecret: string | undefined = process.env.JWT_SECRET_STRING;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET_STRING is not defined in the environment variables");
    }

    return jwt.sign(payload, jwtSecret, {expiresIn: "5m"})
}

export async function verifyToken(request: Request) {
    const jwtSecret: string | undefined = process.env.JWT_SECRET_STRING;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET_STRING is not defined in the environment variables");
    }

    const token = getTokenFromHeader(request);
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded as JwtPayload;
    } catch (error) {
        return null;
    }
}

function getTokenFromHeader(req: Request): string | undefined | null {
    // @ts-ignore
    const authHeader = req.headers["authorization"];
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return null;

    return parts[1]; // the actual token
}