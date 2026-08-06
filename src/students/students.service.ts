import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { env } from "../config/env";
import { CreateGradeDto } from "./dto/create-grade.dto";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { Grade } from "./entities/grade.entity";
import { Student } from "./entities/student.entity";

export type StudentSummary = {
  id: number;
  name: string;
  email: string | null;
  grades: Grade[];
  average: number | null;
  status: "APROVADO" | "REPROVADO" | "PENDENTE";
};

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Grade)
    private readonly gradesRepository: Repository<Grade>,
  ) {}

  async findAll(): Promise<StudentSummary[]> {
    const students = await this.studentsRepository.find({
      relations: { grades: true },
      order: { name: "ASC" },
    });
    return students.map((student) => this.toSummary(student));
  }

  async findOne(id: number): Promise<StudentSummary> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: { grades: true },
    });
    if (!student) throw new NotFoundException("Aluno não encontrado.");
    return this.toSummary(student);
  }

  async create(data: CreateStudentDto): Promise<StudentSummary> {
    const student = await this.studentsRepository.save(
      this.studentsRepository.create({
        name: data.name,
        email: data.email || null,
      }),
    );
    return this.findOne(student.id);
  }

  async update(id: number, data: UpdateStudentDto): Promise<StudentSummary> {
    const student = await this.studentsRepository.preload({ id, ...data });
    if (!student) throw new NotFoundException("Aluno não encontrado.");
    await this.studentsRepository.save(student);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.studentsRepository.delete(id);
    if (!result.affected) throw new NotFoundException("Aluno não encontrado.");
  }

  async addGrade(
    studentId: number,
    data: CreateGradeDto,
  ): Promise<StudentSummary> {
    const student = await this.getStudentEntity(studentId);
    await this.gradesRepository.save(
      this.gradesRepository.create({ ...data, student }),
    );
    return this.findOne(studentId);
  }

  async updateGrade(
    studentId: number,
    gradeId: number,
    data: CreateGradeDto,
  ): Promise<StudentSummary> {
    const grade = await this.gradesRepository.findOne({
      where: { id: gradeId, student: { id: studentId } },
    });
    if (!grade) throw new NotFoundException("Nota não encontrada.");
    Object.assign(grade, data);
    await this.gradesRepository.save(grade);
    return this.findOne(studentId);
  }

  async removeGrade(
    studentId: number,
    gradeId: number,
  ): Promise<StudentSummary> {
    const grade = await this.gradesRepository.findOne({
      where: { id: gradeId, student: { id: studentId } },
    });
    if (!grade) throw new NotFoundException("Nota não encontrada.");
    await this.gradesRepository.remove(grade);
    return this.findOne(studentId);
  }

  private async getStudentEntity(id: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) throw new NotFoundException("Aluno não encontrado.");
    return student;
  }

  private toSummary(student: Student): StudentSummary {
    const grades = [...(student.grades || [])].sort((a, b) =>
      a.subject.localeCompare(b.subject),
    );
    const average = grades.length
      ? Number(
          (
            grades.reduce((total, grade) => total + grade.score, 0) /
            grades.length
          ).toFixed(2),
        )
      : null;
    const status =
      average === null
        ? "PENDENTE"
        : average >= env.passingScore
          ? "APROVADO"
          : "REPROVADO";

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      grades,
      average,
      status,
    };
  }
}
