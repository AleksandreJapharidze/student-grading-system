import Router from "express";
import {body} from "express-validator";
import {login} from "../services/auth.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateRequest} from "../middleware/validation.middleware";

const authRouter = Router();

authRouter.post(
    "/login",
    body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("email must be valid"),
    body("password").notEmpty().withMessage("password is required"),
    validateRequest,
    asyncHandler(login)
);

export default authRouter;