import path from "path";
import { DataSource, DataSourceOptions } from "typeorm";

import { AssignmentEntity } from "../database/models/assignment.entity";
import { AssignmentSubmissionEntity } from "../database/models/assignment-submission.entity";
import { SubmissionFilePathEntity } from "../database/models/submission-file-path.entity";
import { ClassroomEntity } from "../database/models/classroom.entity";
import { UserEntity } from "../database/models/user.entity";

const config: DataSourceOptions = {
    type: "mysql",
    host: process.env.DB_HOSTNAME,
    port: parseInt(process.env.DB_PORT as string),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    entities: [
        AssignmentEntity,
        AssignmentSubmissionEntity,
        SubmissionFilePathEntity,
        ClassroomEntity,
        UserEntity,
    ],
    synchronize: true,
};

export default config;

export const AppDataSource = new DataSource(config);