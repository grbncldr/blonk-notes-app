# Design Document

## Overview

Replace the in-memory `dict`-based `NoteRepository` with a JSON file-backed implementation. The repository continues to use an in-memory dictionary for fast reads, but every write operation (`save`, `delete`) flushes the full collection to a JSON file. On construction the file is read (or created if absent). The public interface is unchanged so no modifications are needed in the service or route layers.

## Architecture

The design keeps the existing layered architecture intact:

```
Routes → Service → NoteRepository → notes.json (disk)
```

`NoteRepository` remains the only component that touches persistence. Internally it holds a `dict[str, Note]` for O(1) lookups and a `Path` reference to the backing file.

### Data Flow

**Read path (get_all / get_by_id):**
1. Return directly from the in-memory `_store` dictionary — no disk I/O.

**Write path (save / delete):**
1. Mutate `_store` in memory.
2. Serialize all notes via `Note.to_dict()`.
3. Write the resulting JSON array atomically to the file path.

**Startup:**
1. If the file exists, read and parse it, deserialize each entry with `Note.from_dict()`, populate `_store`.
2. If the file does not exist, create it with an empty JSON array `[]`.

## Components

### NoteRepository (modified)

**File:** `backend/repository.py`

```python
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
```

## Interfaces

The public interface is unchanged:

| Method | Signature | Returns |
|--------|-----------|---------|
| `get_all` | `() -> list[Note]` | All stored notes |
| `get_by_id` | `(note_id: str) -> Note \| None` | Matching note or None |
| `save` | `(note: Note) -> Note` | The saved note |
| `delete` | `(note_id: str) -> bool` | True if deleted, False otherwise |

Constructor change:

```python
def __init__(self, file_path: Path | None = None) -> None
```

When `file_path` is `None`, defaults to `backend/notes.json`.

## Data Model

The JSON file stores a top-level array of note dictionaries using the format produced by `Note.to_dict()`:

```json
[
  {
    "id": "uuid-string",
    "title": "Note title",
    "body": "Note body content",
    "createdAt": "2024-01-01T00:00:00+00:00",
    "updatedAt": "2024-01-01T00:00:00+00:00"
  }
]
```

Keys use camelCase (matching the existing API response format) because `to_dict()` / `from_dict()` already use that convention.

## Error Handling

- **File not found on startup:** Create the file with `[]`. Parent directories are created if needed.
- **Invalid JSON on startup:** Not explicitly handled per requirements (intended for local testing). A `json.JSONDecodeError` will propagate naturally.
- **Disk write failure:** `IOError` propagates to the caller. The in-memory state may diverge from disk in this case, which is acceptable for local testing use.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Serialization round-trip

*For any* list of valid Note objects, writing them to the JSON file via `save()` and then constructing a new NoteRepository from that same file SHALL produce an equivalent set of notes (same IDs, titles, bodies, and timestamps).

**Validates: Requirements 1.1, 1.3, 4.1, 4.2**

### Property 2: Save-then-retrieve consistency

*For any* valid Note, after calling `save(note)`, both `get_all()` SHALL contain that note and `get_by_id(note.id)` SHALL return a note equal to the saved one.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Delete correctness

*For any* NoteRepository state and any note ID, `delete(id)` SHALL return True if and only if the note existed before the call, and after a successful delete `get_by_id(id)` SHALL return None.

**Validates: Requirements 2.4**

### Property 4: File-state consistency after writes

*For any* sequence of `save()` and successful `delete()` operations, the JSON file on disk SHALL contain exactly the same set of notes as `get_all()` returns.

**Validates: Requirements 3.1, 3.2**

### Property 5: No file mutation on failed delete

*For any* NoteRepository state, calling `delete(id)` with an ID that does not exist in the store SHALL not modify the JSON file contents.

**Validates: Requirements 3.3**
