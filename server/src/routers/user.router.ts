import Router from "express";
import {param} from "express-validator";
import {getClassByUserId} from "../services/classroom.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateRequest} from "../middleware/validation.middleware";

const userRouter = Router();

userRouter.get(
    "/:userId/classroom",
    param("userId").isInt().withMessage("userId must be an integer").toInt(),
    validateRequest,
    asyncHandler(getClassByUserId)
);

export default userRouter;