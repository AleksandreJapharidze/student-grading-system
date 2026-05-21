import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import {AssignmentEntity} from "./assignment.entity";
import {UserEntity} from "./user.entity";

@Entity()
export class AssignmentSubmissionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true, type: "text"})
    content: string | null

    @CreateDateColumn({nullable: false, type: "datetime"})
    turnInDate: Date

    @Column({nullable: true, type: "integer"})
    grade: number | null

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