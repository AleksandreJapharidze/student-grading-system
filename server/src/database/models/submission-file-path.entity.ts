import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn} from "typeorm";
import {AssignmentSubmissionEntity} from "./assignment-submission.entity";

@Entity()
export class SubmissionFilePathEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false, type: "varchar"})
    path: string

    @ManyToOne(() => AssignmentSubmissionEntity, submission => submission.submissionFilePaths, {
        onDelete: "CASCADE"
    })
    @JoinColumn({name: "submissionId"})
    submission: AssignmentSubmissionEntity
}