import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import {AssignmentEntity} from "./assignment.entity";
import {UserEntity} from "./user.entity";
import {SubmissionFilePathEntity} from "./submission-file-path.entity";

import {Exclude} from "class-transformer";

@Entity()
export class AssignmentSubmissionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({nullable: false, type: "datetime"})
    turnInDate: Date

    @Column({nullable: true, type: "integer"})
    grade: number | null

    @OneToMany(() => SubmissionFilePathEntity, filePath => filePath.submission, {
        nullable: true,
        onDelete: "SET NULL",
        eager: true
    })
    submissionFilePaths: SubmissionFilePathEntity[]

    @ManyToOne(() => AssignmentEntity, assignment => assignment.submissions, {
        nullable: true,
        onDelete: "SET NULL",
        eager: false
    })
    @JoinColumn({name: "assignmentId"})
    @Exclude()
    assignment: AssignmentEntity

    @ManyToOne(() => UserEntity, user => user.assignmentSubmissions)
    @JoinColumn({name: "studentId"})
    student: UserEntity
}