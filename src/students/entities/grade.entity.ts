import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Student } from "./student.entity";

@Entity("grades")
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  subject: string;

  @Column("float")
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Student, (student) => student.grades, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "studentId" })
  student: Student;
}
