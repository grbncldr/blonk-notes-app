"""Note repository with in-memory storage."""

from backend.models import Note


class NoteRepository:
    """In-memory storage for notes using a dictionary keyed by note ID."""

    def __init__(self) -> None:
        self._store: dict[str, Note] = {}

    def get_all(self) -> list[Note]:
        """Return all stored notes."""
        return list(self._store.values())

    def get_by_id(self, note_id: str) -> Note | None:
        """Return a note by its ID, or None if not found."""
        return self._store.get(note_id)

    def save(self, note: Note) -> Note:
        """Save a note (create or update). Returns the saved note."""
        self._store[note.id] = note
        return note

    def delete(self, note_id: str) -> bool:
        """Delete a note by ID. Returns True if deleted, False if not found."""
        if note_id in self._store:
            del self._store[note_id]
            return True
        return False
