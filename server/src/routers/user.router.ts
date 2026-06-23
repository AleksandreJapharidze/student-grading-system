import Router from "express";
import {getClassByUserId} from "../services/classroom.service";

const userRouter = Router();

userRouter.get("/:userId/classroom", getClassByUserId);

export default userRouter;