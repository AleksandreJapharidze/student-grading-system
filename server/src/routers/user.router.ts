import Router from "express";
import {getClassByUserId} from "../services/classroom.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateSchema} from "../middleware/validation.middleware";

const userRouter = Router();

userRouter.get(
    "/:userId/classroom",
    validateSchema({userId: {in: "params", required: true, type: "number"}}),
    asyncHandler(getClassByUserId)
);

export default userRouter;