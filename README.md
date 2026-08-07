V1.0.2

# Sistema de notas de alunos

CRUD básico desenvolvido com NestJS, TypeORM, SQLite e Bootstrap. O Express usado pelo Nest serve o frontend da pasta `public`.

## Executar

```bash
npm install
npm run start:dev
```

Acesse `http://localhost:3000`. O banco é criado automaticamente em `data/notas.sqlite`.

## API

Todas as rotas possuem o prefixo `/api`:

- `GET /students` — lista alunos com notas, média e situação.
- `GET /students/:id` — consulta um aluno.
- `POST /students` — cria aluno (`name`, `email` opcional).
- `PATCH /students/:id` — atualiza aluno.
- `DELETE /students/:id` — remove aluno e suas notas.
- `POST /students/:studentId/grades` — cria nota (`subject`, `score` de 0 a 10).
- `PATCH /students/:studentId/grades/:gradeId` — atualiza nota.
- `DELETE /students/:studentId/grades/:gradeId` — remove nota.

A situação é calculada pela média das notas: `APROVADO` para média maior ou igual a 6, `REPROVADO` abaixo de 6 e `PENDENTE` enquanto não houver notas.

## Variáveis de ambiente

O arquivo `.env` já vem configurado com estas variáveis:

```env
PORT=3003
APP_NAME=Sistema de Notas
NODE_ENV=development
DATABASE_PATH=data/notas.sqlite
PASSING_SCORE=6
MIN_SCORE=0
MAX_SCORE=10
```

`PASSING_SCORE` define a nota mínima para aprovação. `MIN_SCORE` e `MAX_SCORE` controlam os limites aceitos ao cadastrar uma nota. As demais variáveis configuram a porta, o nome exibido no log, o ambiente e o caminho do banco SQLite.
