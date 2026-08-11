# Projeto Flask - Hub de Tarefas & Ideias v4

Aplicação web desenvolvida em **Python + Flask**, utilizando **SQLite** como banco de dados e variáveis de ambiente configuráveis via `.env`.
# gustavo
## 🚀 Como Executar

### 1. Criar e ativar o ambiente virtual (opcional, mas recomendado)
```bash
python -m venv venv
# No Windows PowerShell:
.\venv\Scripts\Activate.ps1
# No Linux/macOS:
source venv/bin/activate
```

### 2. Instalar as dependências
```bash
pip install -r requirements.txt
```

### 3. Configurar as variáveis de ambiente
Edite ou crie o arquivo `.env` com base no `.env.example`:
```env
APP_TITLE=Flask Hub de Projetos
APP_SUBTITLE=Gerenciador simples de tarefas e ideias em Flask + SQLite
PORT=5000
FLASK_ENV=development
DATABASE_PATH=data/database.db
SECRET_KEY=sua_chave_secreta_super_segura_aqui
```

### 4. Iniciar a aplicação
```bash
python app.py
```

Acesse em seu navegador: `http://localhost:5000`.

## 📌 Rotas da API
- `GET /` — Painel Web de tarefas.
- `POST /tasks/add` — Adiciona uma nova tarefa.
- `POST /tasks/<id>/toggle` — Alterna status da tarefa (PENDENTE / CONCLUIDO).
- `POST /tasks/<id>/delete` — Remove uma tarefa.
- `GET /api/tasks` — Endpoint JSON com a lista completa de tarefas.
- `GET /infra/health` — Endpoint de verificação de saúde (health check).
