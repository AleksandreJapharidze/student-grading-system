import {NextFunction, Request, Response} from "express";
import {AppError} from "../errors/app-error";

export function notFoundHandler(request: Request, response: Response) {
    response.status(404).json({
        status: "error",
        message: "Route not found",
    });
}

export function errorHandler(error: Error, request: Request, response: Response, next: NextFunction) {
    console.error("Unhandled error:", error);

    if (error instanceof AppError) {
        const payload: Record<string, unknown> = {
            status: "error",
            message: error.message,
        };

        if (error.errors) {
            payload.errors = error.errors;
        }

        return response.status(error.statusCode).json(payload);
    }

    return response.status(500).json({
        status: "error",
        message: "Internal server error",
    });
}
