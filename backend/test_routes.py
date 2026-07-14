"""Integration smoke tests for the backend REST API."""

import json
from pathlib import Path

import pytest

from backend.app import create_app
from backend import app as app_module


@pytest.fixture
def client(tmp_path):
    """Create a fresh Flask test client with an empty repository."""
    # Reset the module-level singletons for test isolation
    from backend.repository import NoteRepository
    from backend.service import NoteService

    test_file = tmp_path / "notes.json"
    app_module.repository = NoteRepository(file_path=test_file)
    app_module.service = NoteService(app_module.repository)

    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestCreateNote:
    """POST /api/notes"""

    def test_create_valid_note_returns_201(self, client):
        response = client.post(
            "/api/notes",
            data=json.dumps({"title": "Test Note", "body": "Some body text"}),
            content_type="application/json",
        )
        assert response.status_code == 201
        data = response.get_json()
        assert data["title"] == "Test Note"
        assert data["body"] == "Some body text"
        assert "id" in data
        assert "createdAt" in data
        assert "updatedAt" in data

    def test_create_with_empty_title_returns_400(self, client):
        response = client.post(
            "/api/notes",
            data=json.dumps({"title": "", "body": "Body"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "errors" in data
        assert "title" in data["errors"]

    def test_create_with_whitespace_only_title_returns_400(self, client):
        response = client.post(
            "/api/notes",
            data=json.dumps({"title": "   ", "body": "Body"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "errors" in data
        assert "title" in data["errors"]

    def test_create_with_title_exceeding_200_chars_returns_400(self, client):
        response = client.post(
            "/api/notes",
            data=json.dumps({"title": "x" * 201, "body": "Body"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "errors" in data
        assert "title" in data["errors"]

    def test_create_with_body_exceeding_10000_chars_returns_400(self, client):
        response = client.post(
            "/api/notes",
            data=json.dumps({"title": "Valid", "body": "x" * 10001}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "errors" in data
        assert "body" in data["errors"]

    def test_create_with_missing_fields_returns_400(self, client):
        response = client.post(
            "/api/notes",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "errors" in data
        assert "title" in data["errors"]
        assert "body" in data["errors"]


class TestListNotes:
    """GET /api/notes"""

    def test_list_empty_returns_200_with_empty_array(self, client):
        response = client.get("/api/notes")
        assert response.status_code == 200
        data = response.get_json()
        assert data == []

    def test_list_returns_created_note(self, client):
        # Create a note first
        client.post(
            "/api/notes",
            data=json.dumps({"title": "Note 1", "body": "Body 1"}),
            content_type="application/json",
        )

        response = client.get("/api/notes")
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["title"] == "Note 1"


class TestUpdateNote:
    """PUT /api/notes/<id>"""

    def test_update_existing_note_returns_200(self, client):
        # Create a note
        create_resp = client.post(
            "/api/notes",
            data=json.dumps({"title": "Original", "body": "Original body"}),
            content_type="application/json",
        )
        note_id = create_resp.get_json()["id"]

        # Update it
        response = client.put(
            f"/api/notes/{note_id}",
            data=json.dumps({"title": "Updated", "body": "Updated body"}),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["title"] == "Updated"
        assert data["body"] == "Updated body"
        assert data["id"] == note_id

    def test_update_nonexistent_note_returns_404(self, client):
        response = client.put(
            "/api/notes/nonexistent-id",
            data=json.dumps({"title": "Title", "body": "Body"}),
            content_type="application/json",
        )
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data

    def test_update_with_invalid_data_returns_400(self, client):
        # Create a note
        create_resp = client.post(
            "/api/notes",
            data=json.dumps({"title": "Original", "body": "Body"}),
            content_type="application/json",
        )
        note_id = create_resp.get_json()["id"]

        # Update with invalid data
        response = client.put(
            f"/api/notes/{note_id}",
            data=json.dumps({"title": "", "body": "Body"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = response.get_json()
        assert "errors" in data
        assert "title" in data["errors"]


class TestDeleteNote:
    """DELETE /api/notes/<id>"""

    def test_delete_existing_note_returns_204(self, client):
        # Create a note
        create_resp = client.post(
            "/api/notes",
            data=json.dumps({"title": "To Delete", "body": "Body"}),
            content_type="application/json",
        )
        note_id = create_resp.get_json()["id"]

        # Delete it
        response = client.delete(f"/api/notes/{note_id}")
        assert response.status_code == 204

        # Verify it's gone
        list_resp = client.get("/api/notes")
        notes = list_resp.get_json()
        assert all(n["id"] != note_id for n in notes)

    def test_delete_nonexistent_note_returns_404(self, client):
        response = client.delete("/api/notes/nonexistent-id")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data
