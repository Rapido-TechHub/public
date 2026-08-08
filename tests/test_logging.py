import json
import os
import pytest

from app import app, init_db


@pytest.fixture
def client(tmp_path):
    os.environ["DATA_PATH"] = str(tmp_path)
    os.environ["DATABASE_PATH"] = "db/test_db.sqlite"
    app.config["TESTING"] = True

    init_db()

    with app.test_client() as client:
        yield client


def test_structured_logging_format(client, capsys):
    response = client.get("/", headers={"X-Request-ID": "req_test_123"})
    assert response.status_code == 200

    captured = capsys.readouterr()
    lines = [line.strip() for line in captured.out.splitlines() if line.strip()]

    # Find the HTTP request log line
    json_log = None
    for line in lines:
        if line.startswith("{") and line.endswith("}"):
            parsed = json.loads(line)
            if parsed.get("event") == "GET /":
                json_log = parsed
                break

    assert json_log is not None, f"Expected JSON log for GET / in stdout, got: {captured.out}"
    assert json_log["level"] == "info"
    assert json_log["status_code"] == 200
    assert isinstance(json_log["duration_ms"], (int, float))
    assert json_log["request_id"] == "req_test_123"

    # CRITICAL CONTRACT RULE: timestamp must NOT be emitted by the app
    assert "timestamp" not in json_log, "Key 'timestamp' must not be emitted in structured logs!"


def test_structured_logging_error_level(client, capsys):
    response = client.get("/non-existent-page")
    assert response.status_code == 404

    captured = capsys.readouterr()
    lines = [line.strip() for line in captured.out.splitlines() if line.strip()]

    json_log = None
    for line in lines:
        if line.startswith("{") and line.endswith("}"):
            parsed = json.loads(line)
            if parsed.get("event") == "GET /non-existent-page":
                json_log = parsed
                break

    assert json_log is not None
    assert json_log["level"] == "info"  # 404 is < 500, status_code is 404
    assert json_log["status_code"] == 404
    assert isinstance(json_log["duration_ms"], (int, float))
    assert "timestamp" not in json_log
