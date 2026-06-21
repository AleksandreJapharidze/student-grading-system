import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn} from "typeorm";
import {AssignmentSubmissionEntity} from "./assignment-submission.entity";

@Entity()
export class SubmissionFilePathEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false, type: "varchar"})
    path: string

    @ManyToOne(() => AssignmentSubmissionEntity, submission => submission.submissionFilePaths, {
        nullable: true,
        onDelete: "CASCADE",
        eager: false
    })
    @JoinColumn({name: "submissionId"})
    submission: AssignmentSubmissionEntity
} 