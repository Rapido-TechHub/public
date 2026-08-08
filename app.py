import os
import sqlite3

from dotenv import load_dotenv
from flask import Flask, flash, jsonify, redirect, render_template, request, url_for

# Carrega variáveis de ambiente do .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "default-flask-secret")

# Configurações do App obtidas do .env
APP_TITLE = os.getenv("APP_TITLE", "Flask Project")
APP_SUBTITLE = os.getenv("APP_SUBTITLE", "Gerenciador simples em Flask")
DATA_PATH = os.getenv("DATA_PATH", "data")
_db_rel = os.getenv("DATABASE_PATH", "db/database.db")
DATABASE_PATH = _db_rel if os.path.isabs(_db_rel) else os.path.join(DATA_PATH, _db_rel.lstrip("/\\"))
PORT = int(os.getenv("PORT", "5000"))

def get_db():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT DEFAULT 'Geral',
            status TEXT DEFAULT 'PENDENTE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()

    # Popula dados iniciais caso a tabela esteja vazia
    cursor.execute("SELECT COUNT(*) as count FROM tasks")
    if cursor.fetchone()["count"] == 0:
        cursor.executemany("""
            INSERT INTO tasks (title, description, category, status)
            VALUES (?, ?, ?, ?)
        """, [
            ("Criar estrutura Flask", "Configurar rotas, templates e banco SQLite", "Desenvolvimento", "CONCLUIDO"),
            ("Configurar .env", "Definir título do app e porta no arquivo de ambiente", "Configuração", "CONCLUIDO"),
            ("Testar operações CRUD", "Cadastrar, alterar status e remover tarefas no painel", "Testes", "PENDENTE")
        ])
        conn.commit()
    conn.close()

# Inicializa o banco de dados SQLite
init_db()

@app.context_processor
def inject_global_vars():
    return {
        "app_title": APP_TITLE,
        "app_subtitle": APP_SUBTITLE
    }

@app.route("/")
def index():
    selected_category = request.args.get("category", "").strip()
    conn = get_db()
    if selected_category:
        tasks = conn.execute("SELECT * FROM tasks WHERE category = ? ORDER BY created_at DESC", (selected_category,)).fetchall()
    else:
        tasks = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
    
    total = len(tasks)
    concluidas = sum(1 for t in tasks if t["status"] == "CONCLUIDO")
    pendentes = total - concluidas
    
    conn.close()
    return render_template(
        "index.html",
        tasks=tasks,
        total=total,
        concluidas=concluidas,
        pendentes=pendentes,
        selected_category=selected_category
    )

@app.route("/tasks/add", methods=["POST"])
def add_task():
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "Geral").strip()

    if not title:
        flash("O título da tarefa é obrigatório!", "danger")
        return redirect(url_for("index"))

    conn = get_db()
    conn.execute(
        "INSERT INTO tasks (title, description, category) VALUES (?, ?, ?)",
        (title, description, category or "Geral")
    )
    conn.commit()
    conn.close()
    flash("Tarefa adicionada com sucesso!", "success")
    return redirect(url_for("index"))

@app.route("/tasks/<int:task_id>/toggle", methods=["POST"])
def toggle_task(task_id):
    conn = get_db()
    task = conn.execute("SELECT status FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if task:
        new_status = "PENDENTE" if task["status"] == "CONCLUIDO" else "CONCLUIDO"
        conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
        conn.commit()
        flash("Status atualizado!", "info")
    conn.close()
    return redirect(url_for("index"))

@app.route("/tasks/<int:task_id>/delete", methods=["POST"])
def delete_task(task_id):
    conn = get_db()
    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    flash("Tarefa removida com sucesso!", "warning")
    return redirect(url_for("index"))

@app.route("/api/tasks", methods=["GET"])
def api_tasks():
    conn = get_db()
    tasks = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
    tasks_list = [dict(t) for t in tasks]
    conn.close()
    return jsonify({
        "app_title": APP_TITLE,
        "total": len(tasks_list),
        "tasks": tasks_list
    })

@app.route("/infra/health", methods=["GET"])
@app.route("/api/infra/health", methods=["GET"])
def infra_health():
    return jsonify({"status": "ok"})

def main():
    app.run(host="0.0.0.0", port=PORT, debug=True)

if __name__ == "__main__":
    main()

