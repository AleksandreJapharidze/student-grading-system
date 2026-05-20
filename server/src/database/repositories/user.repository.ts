import {AppDataSource} from "../../config/type-orm-config";
import {UserEntity} from "../models/user.entity";

export const userRepository = AppDataSource.getRepository(UserEntity);