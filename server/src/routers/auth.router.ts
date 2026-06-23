import Router from "express";
import {login} from "../services/auth.service";

const authRouter = Router();

authRouter.post("/login", login);

export default authRouter;