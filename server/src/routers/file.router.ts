import Router from "express";
import {param} from "express-validator";
import {getSubmissionFileByFileName} from "../services/assignment-submission.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateRequest} from "../middleware/validation.middleware";

const fileRouter = Router();

fileRouter.get(
    "/:fileName",
    param("fileName").trim().notEmpty().withMessage("fileName is required"),
    validateRequest,
    asyncHandler(getSubmissionFileByFileName)
);

export default fileRouter;