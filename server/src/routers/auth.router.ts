import Router from "express";
import {login} from "../services/auth.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateSchema} from "../middleware/validation.middleware";

const authRouter = Router();

authRouter.post(
    "/login",
    validateSchema({
        email: {required: true, type: "string"},
        password: {required: true, type: "string"},
    }),
    asyncHandler(login)
);

export default authRouter;