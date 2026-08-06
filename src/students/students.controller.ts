import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateGradeDto } from "./dto/create-grade.dto";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./students.service";

@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateStudentDto) {
    return this.studentsService.create(data);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() data: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.studentsService
      .remove(id)
      .then(() => ({ message: "Aluno removido com sucesso." }));
  }

  @Post(":studentId/grades")
  addGrade(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Body() data: CreateGradeDto,
  ) {
    return this.studentsService.addGrade(studentId, data);
  }

  @Patch(":studentId/grades/:gradeId")
  updateGrade(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Param("gradeId", ParseIntPipe) gradeId: number,
    @Body() data: CreateGradeDto,
  ) {
    return this.studentsService.updateGrade(studentId, gradeId, data);
  }

  @Delete(":studentId/grades/:gradeId")
  removeGrade(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Param("gradeId", ParseIntPipe) gradeId: number,
  ) {
    return this.studentsService.removeGrade(studentId, gradeId);
  }
}
