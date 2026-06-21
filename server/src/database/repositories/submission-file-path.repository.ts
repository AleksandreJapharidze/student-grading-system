import {AppDataSource} from "../../config/type-orm-config";
import {SubmissionFilePathEntity} from "../models/submission-file-path.entity";

export const submissionFilePathRepository = AppDataSource.getRepository(SubmissionFilePathEntity);