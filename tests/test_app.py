import os

import pytest

from app import app, init_db


@pytest.fixture
def client(tmp_path):
    db_file = tmp_path / "test_db.sqlite"
    os.environ["DATABASE_PATH"] = str(db_file)
    app.config["TESTING"] = True

    init_db()

    with app.test_client() as client:
        yield client

def test_index_page(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Flask Hub de Projetos" in response.data

def test_api_tasks(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.get_json()
    assert "tasks" in data
    assert data["total"] > 0

def test_add_task(client):
    response = client.post(
        "/tasks/add",
        data={"title": "Nova Tarefa de Teste", "description": "Desc Teste", "category": "Testes"},
        follow_redirects=True
    )
    assert response.status_code == 200
    assert b"Nova Tarefa de Teste" in response.data
