"""Note service layer with business logic."""

import uuid
from datetime import datetime, timezone

from backend.models import Note
from backend.repository import NoteRepository


class NoteService:
    """Business logic for note operations."""

    def __init__(self, repository: NoteRepository) -> None:
        self._repository = repository

    def list_notes(self) -> list[Note]:
        """Return all notes sorted by updated_at descending (most recent first)."""
        notes = self._repository.get_all()
        return sorted(notes, key=lambda n: n.updated_at, reverse=True)

    def create_note(self, title: str, body: str) -> Note:
        """Create a new note with a generated UUID and current timestamps."""
        now = datetime.now(timezone.utc).isoformat()
        note = Note(
            id=str(uuid.uuid4()),
            title=title,
            body=body,
            created_at=now,
            updated_at=now,
        )
        return self._repository.save(note)

    def update_note(self, note_id: str, title: str, body: str) -> Note | None:
        """Update an existing note's title, body, and updated_at timestamp.

        Returns the updated Note, or None if no note with the given ID exists.
        """
        existing = self._repository.get_by_id(note_id)
        if existing is None:
            return None

        existing.title = title
        existing.body = body
        existing.updated_at = datetime.now(timezone.utc).isoformat()
        return self._repository.save(existing)

    def delete_note(self, note_id: str) -> bool:
        """Delete a note by ID. Returns True if deleted, False if not found."""
        return self._repository.delete(note_id)
