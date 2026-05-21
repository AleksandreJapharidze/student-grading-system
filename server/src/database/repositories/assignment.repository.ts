import {AppDataSource} from "../../config/type-orm-config";
import {AssignmentEntity} from "../models/assignment.entity";

export const assignmentRepository = AppDataSource.getRepository(AssignmentEntity);
