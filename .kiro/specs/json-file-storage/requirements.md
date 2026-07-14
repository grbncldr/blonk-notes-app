# Requirements Document

## Introduction

Replace the in-memory dictionary storage in NoteRepository with a JSON file-backed store at `backend/notes.json`. The public interface (`get_all()`, `get_by_id()`, `save()`, `delete()`) remains unchanged. All write operations flush the full JSON file to disk. On startup, existing data is loaded from the file or a new file is created with an empty list. Serialization uses the Note model's `to_dict()` and `from_dict()` methods. This is intended for local testing and does not require concurrent write safety.

## Glossary

- **NoteRepository**: The Python class responsible for persisting and retrieving Note objects, located at `backend/repository.py`.
- **JSON_File**: The file at path `backend/notes.json` that stores serialized note data as a JSON array.
- **Note**: A dataclass representing a note with fields id, title, body, created_at, and updated_at, defined in `backend/models.py`.
- **Write_Operation**: Any call to `save()` or `delete()` that mutates the stored notes collection.
- **Startup**: The moment a NoteRepository instance is constructed and initialized.

## Requirements

### Requirement 1: File Loading on Startup

**User Story:** As a developer, I want the repository to load notes from a JSON file on startup, so that previously saved notes are available after a restart.

#### Acceptance Criteria

1. WHEN a NoteRepository instance is created and the JSON_File exists, THE NoteRepository SHALL read the JSON_File and deserialize all entries using `Note.from_dict()` into the internal store.
2. WHEN a NoteRepository instance is created and the JSON_File does not exist, THE NoteRepository SHALL create the JSON_File containing an empty JSON array.
3. WHEN the JSON_File is loaded successfully, THE NoteRepository SHALL make all deserialized notes available via `get_all()` and `get_by_id()`.

### Requirement 2: Preserve Public Interface

**User Story:** As a developer, I want the repository to keep the same public interface, so that the service layer and routes require no changes.

#### Acceptance Criteria

1. THE NoteRepository SHALL expose a `get_all()` method that returns a list of all stored Note objects.
2. THE NoteRepository SHALL expose a `get_by_id(note_id: str)` method that returns the matching Note or None if not found.
3. THE NoteRepository SHALL expose a `save(note: Note)` method that persists a note (create or update) and returns the saved Note.
4. THE NoteRepository SHALL expose a `delete(note_id: str)` method that removes the note and returns True if deleted, or False if not found.

### Requirement 3: Flush to Disk on Write

**User Story:** As a developer, I want every write operation to flush the complete note collection to disk, so that data is persisted immediately and survives process restarts.

#### Acceptance Criteria

1. WHEN `save()` is called, THE NoteRepository SHALL serialize all notes using `Note.to_dict()` and write the full JSON array to the JSON_File.
2. WHEN `delete()` successfully removes a note, THE NoteRepository SHALL serialize all remaining notes using `Note.to_dict()` and write the full JSON array to the JSON_File.
3. WHEN `delete()` does not find the specified note, THE NoteRepository SHALL not write to the JSON_File.

### Requirement 4: Serialization Format

**User Story:** As a developer, I want the JSON file to use the Note model's existing serialization methods, so that the format is consistent with the API responses.

#### Acceptance Criteria

1. THE NoteRepository SHALL serialize each Note to the JSON_File using the `Note.to_dict()` method.
2. THE NoteRepository SHALL deserialize each entry from the JSON_File using the `Note.from_dict()` class method.
3. THE NoteRepository SHALL store notes in the JSON_File as a top-level JSON array of note dictionaries.

### Requirement 5: File Path Configuration

**User Story:** As a developer, I want the JSON file path to default to `backend/notes.json`, so that notes are stored in a predictable location.

#### Acceptance Criteria

1. THE NoteRepository SHALL default the storage file path to `backend/notes.json` relative to the project root.
2. WHERE a custom file path is provided to the constructor, THE NoteRepository SHALL use the provided path instead of the default.
