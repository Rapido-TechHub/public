import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Grade } from "./entities/grade.entity";
import { Student } from "./entities/student.entity";
import { StudentsService } from "./students.service";

describe("StudentsService", () => {
  let service: StudentsService;
  let studentsRepository: Repository<Student>;

  const mockStudentsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
  };

  const mockGradesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentsRepository,
        },
        {
          provide: getRepositoryToken(Grade),
          useValue: mockGradesRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentsRepository = module.get<Repository<Student>>(
      getRepositoryToken(Student),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("1. should return all students with calculated average and status (APROVADO / PENDENTE)", async () => {
    const mockStudent = {
      id: 1,
      name: "João Silva",
      email: "joao@email.com",
      grades: [
        { id: 101, subject: "Matemática", score: 8.0 },
        { id: 102, subject: "Física", score: 6.0 },
      ],
    } as Student;

    mockStudentsRepository.find.mockResolvedValue([mockStudent]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("João Silva");
    expect(result[0].average).toBe(7.0);
    expect(result[0].status).toBe("APROVADO");
  });

  it("2. should throw NotFoundException when student is not found", async () => {
    mockStudentsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it("3. should create a new student successfully", async () => {
    const createDto = { name: "Maria Santos", email: "maria@email.com" };
    const createdStudent = { id: 2, ...createDto, grades: [] };

    mockStudentsRepository.create.mockReturnValue(createdStudent);
    mockStudentsRepository.save.mockResolvedValue(createdStudent);
    mockStudentsRepository.findOne.mockResolvedValue(createdStudent);

    const result = await service.create(createDto);

    expect(studentsRepository.create).toHaveBeenCalledWith({
      name: "Maria Santos",
      email: "maria@email.com",
    });
    expect(result.name).toBe("Maria Santos");
    expect(result.status).toBe("PENDENTE");
  });
});
