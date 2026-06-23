import Router from "express";
import {getSubmissionFileByFileName} from "../services/assignment-submission.service";
import {asyncHandler} from "../middleware/async-handler";
import {validateSchema} from "../middleware/validation.middleware";

const fileRouter = Router();

fileRouter.get(
    "/:fileName",
    validateSchema({fileName: {in: "params", required: true, type: "string"}}),
    asyncHandler(getSubmissionFileByFileName)
);

export default fileRouter;