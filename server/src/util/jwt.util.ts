import jwt from "jsonwebtoken"

type JwtPayload = {
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