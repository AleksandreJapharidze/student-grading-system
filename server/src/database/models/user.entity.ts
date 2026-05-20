import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import {ClassroomEntity} from "./classroom.entity";
import {AssignmentSubmissionEntity} from "./assignment-submission.entity";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false, type: "varchar"})
    name: string

    @Column({nullable: false, type: "varchar"})
    email: string

    @Column({nullable: false, type: "varchar"})
    role: string

    @OneToMany(() => AssignmentSubmissionEntity, assignmentSubmission => assignmentSubmission.student)
    assignmentSubmissions: AssignmentSubmissionEntity[]

    @ManyToOne(() => ClassroomEntity, classroom => classroom.users, {nullable: true})
    @JoinColumn({ name: 'classroomId' })
    classroom: ClassroomEntity | null
}