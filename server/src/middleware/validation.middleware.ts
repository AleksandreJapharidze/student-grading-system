import {RequestHandler} from "express";
import {validationResult} from "express-validator";
import {ValidationError} from "../errors/app-error";

type RequestValidationError = {
    param: string;
    msg: string;
    location: string;
    value: unknown;
};

export const validateRequest: RequestHandler = (request, _response, next) => {
    const errors = validationResult(request);

    if (errors.isEmpty()) {
        return next();
    }

    const formattedErrors = errors.array().map((error) => {
        const typedError = error as unknown as RequestValidationError;
        return {
            field: typedError.param,
            message: typedError.msg,
            location: typedError.location,
            value: typedError.value,
        };
    });

    next(new ValidationError("Validation failed", formattedErrors));
};
