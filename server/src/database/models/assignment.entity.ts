import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import {ClassroomEntity} from "./classroom.entity";
import {AssignmentSubmissionEntity} from "./assignment-submission.entity";

@Entity()
export class AssignmentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: "varchar"})
    task: string;

    @Column({type: "datetime", nullable: false})
    deadline: Date;

    @ManyToOne(() => ClassroomEntity, classroom => classroom.assignments)
    @JoinColumn({ name: "classroomId" })
    classroom: ClassroomEntity;

    @OneToMany(() => AssignmentSubmissionEntity, submission => submission.assignment, {
        cascade: true,
        orphanedRowAction: "nullify"
    })
    submissions: AssignmentSubmissionEntity[];
}