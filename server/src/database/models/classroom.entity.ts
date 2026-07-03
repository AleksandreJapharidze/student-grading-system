import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

import {UserEntity} from "./user.entity"
import {AssignmentEntity} from "./assignment.entity";

@Entity()
export class ClassroomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: "varchar"})
    name: string;

    @OneToMany(() => UserEntity, user => user.classroom, {
        cascade: true,
        orphanedRowAction: "nullify",
    })
    users: UserEntity[];

    @OneToMany(() => AssignmentEntity, assignment => assignment.classroom, {
        cascade: true,
        orphanedRowAction: "delete"
    })
    assignments: AssignmentEntity[];
}