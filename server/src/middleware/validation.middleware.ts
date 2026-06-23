import {NextFunction, Request, RequestHandler, Response} from "express";
import {ValidationError} from "../errors/app-error";

export type ValidationType = "string" | "number" | "boolean" | "array";

type ValidationRule = {
    in?: "body" | "params" | "query";
    required?: boolean;
    type?: ValidationType;
    min?: number;
    max?: number;
    enum?: readonly unknown[];
};

export type ValidationSchema = Record<string, ValidationRule>;

function getValue(request: Request, rule: ValidationRule, key: string) {
    switch (rule.in) {
        case "query":
            return request.query[key];
        case "params":
            return request.params[key];
        default:
            return request.body[key];
    }
}

function getType(value: unknown): ValidationType | "null" | "undefined" {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value as ValidationType | "undefined";
}

function isNumericString(value: unknown) {
    return typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value));
}

export function validateSchema(schema: ValidationSchema): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
        const errors: string[] = [];
        const entries = Object.entries(schema) as [string, ValidationRule][];

        for (const [key, rule] of entries) {
            const value = getValue(request, rule, key);
            const type = getType(value);

            if (rule.required && (value === undefined || value === null || value === "")) {
                errors.push(`\`${key}\` is required`);
                continue;
            }

            if (value !== undefined && value !== null && rule.type) {
                if (rule.type === "number") {
                    const validNumber = type === "number" || isNumericString(value);
                    if (!validNumber) {
                        errors.push(`\`${key}\` must be a number`);
                        continue;
                    }
                }
                if (rule.type === "string" && type !== "string") {
                    errors.push(`\`${key}\` must be a string`);
                    continue;
                }
                if (rule.type === "boolean" && type !== "boolean") {
                    errors.push(`\`${key}\` must be a boolean`);
                    continue;
                }
                if (rule.type === "array" && type !== "array") {
                    errors.push(`\`${key}\` must be an array`);
                    continue;
                }
            }

            if (rule.enum && value !== undefined && value !== null && !rule.enum.includes(value)) {
                errors.push(`\`${key}\` must be one of: ${rule.enum.join(", ")}`);
                continue;
            }

            if (rule.type === "number") {
                const numericValue = typeof value === "number" ? value : Number(value);
                if (Number.isFinite(numericValue)) {
                    if (rule.min !== undefined && numericValue < rule.min) {
                        errors.push(`\`${key}\` must be >= ${rule.min}`);
                    }
                    if (rule.max !== undefined && numericValue > rule.max) {
                        errors.push(`\`${key}\` must be <= ${rule.max}`);
                    }
                }
            }
        }

        if (errors.length > 0) {
            next(new ValidationError("Validation failed", errors));
            return;
        }

        next();
    };
}
