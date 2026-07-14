"""Note repository with JSON file-backed storage."""

import json
from pathlib import Path

from backend.models import Note

DEFAULT_FILE_PATH = Path("backend/notes.json")


class NoteRepository:
    """JSON file-backed storage for notes."""

    def __init__(self, file_path: Path | None = None) -> None:
        self._file_path: Path = file_path or DEFAULT_FILE_PATH
        self._store: dict[str, Note] = {}
        self._load()

    def get_all(self) -> list[Note]:
        """Return all stored notes."""
        return list(self._store.values())

    def get_by_id(self, note_id: str) -> Note | None:
        """Return a note by its ID, or None if not found."""
        return self._store.get(note_id)

    def save(self, note: Note) -> Note:
        """Save a note (create or update). Returns the saved note."""
        self._store[note.id] = note
        self._flush()
        return note

    def delete(self, note_id: str) -> bool:
        """Delete a note by ID. Returns True if deleted, False if not found."""
        if note_id in self._store:
            del self._store[note_id]
            self._flush()
            return True
        return False

    def _load(self) -> None:
        """Load notes from the JSON file, or create it if absent."""
        if self._file_path.exists():
            with open(self._file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self._store = {
                entry["id"]: Note.from_dict(entry) for entry in data
            }
        else:
            self._file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self._file_path, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _flush(self) -> None:
        """Write all notes to the JSON file."""
        data = [note.to_dict() for note in self._store.values()]
        with open(self._file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
