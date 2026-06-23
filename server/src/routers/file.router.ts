import Router from "express";
import {getSubmissionFileByFileName} from "../services/assignment-submission.service";

const fileRouter = Router();

fileRouter.get("/:fileName", getSubmissionFileByFileName);

export default fileRouter;