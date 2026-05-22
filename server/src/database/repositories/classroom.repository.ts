import {AppDataSource} from "../../config/type-orm-config";
import {ClassroomEntity} from "../models/classroom.entity";

export const classroomRepository = AppDataSource.getRepository(ClassroomEntity);