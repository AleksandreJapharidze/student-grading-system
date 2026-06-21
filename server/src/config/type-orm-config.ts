import path from "path";
import { DataSource, DataSourceOptions } from "typeorm";

import { AssignmentEntity } from "../database/models/assignment.entity";
import { AssignmentSubmissionEntity } from "../database/models/assignment-submission.entity";
import { SubmissionFilePathEntity } from "../database/models/submission-file-path.entity";
import { ClassroomEntity } from "../database/models/classroom.entity";
import { UserEntity } from "../database/models/user.entity";

const config: DataSourceOptions = {
    type: "better-sqlite3",
    database: path.join(process.cwd(), "database.sqlite"),
    synchronize: true,
    entities: [
        AssignmentEntity,
        AssignmentSubmissionEntity,
        SubmissionFilePathEntity,
        ClassroomEntity,
        UserEntity,
    ],
    migrations: [path.join(__dirname, "../database/migrations/*{.ts,.js}")],
};

export default config;

export const AppDataSource = new DataSource(config);