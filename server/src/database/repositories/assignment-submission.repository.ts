import {AppDataSource} from "../../config/type-orm-config";
import {AssignmentSubmissionEntity} from "../models/assignment-submission.entity";

export const assignmentSubmissionRepository = AppDataSource.getRepository(AssignmentSubmissionEntity);
