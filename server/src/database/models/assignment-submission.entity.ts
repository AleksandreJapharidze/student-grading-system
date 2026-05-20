import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import {AssignmentEntity} from "./assignment.entity";
import {UserEntity} from "./user.entity";

@Entity()
export class AssignmentSubmissionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false, type: "text"})
    content: string

    @CreateDateColumn({nullable: false, type: "datetime"})
    turnInDate: Date

    @ManyToOne(() => AssignmentEntity, assignment => assignment.submissions, {
        nullable: true,
        onDelete: "SET NULL"
    })
    @JoinColumn({name: "assignmentId"})
    assignment: AssignmentEntity

    @ManyToOne(() => UserEntity, user => user.assignmentSubmissions)
    @JoinColumn({name: "studentId"})
    student: UserEntity
}