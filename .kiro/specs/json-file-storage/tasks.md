# Implementation Plan: JSON File Storage

## Overview

Replace the in-memory `NoteRepository` with a JSON file-backed implementation. The repository keeps an in-memory dict for fast reads but flushes to a JSON file on every write. The public interface is unchanged, so service and route layers need no modifications.

## Tasks

- [x] 1. Implement JSON file-backed NoteRepository
  - [x] 1.1 Update `backend/repository.py` with file-backed storage
    - Add `import json` and `from pathlib import Path`
    - Define `DEFAULT_FILE_PATH = Path("backend/notes.json")`
    - Modify `__init__` to accept an optional `file_path: Path | None = None` parameter
    - Implement `_load()` method: read and deserialize JSON file if it exists, or create it with `[]` if absent
    - Implement `_flush()` method: serialize all notes via `Note.to_dict()` and write the JSON array to disk
    - Update `save()` to call `self._flush()` after mutating `_store`
    - Update `delete()` to call `self._flush()` only when a note was actually removed
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2_

  - [ ]* 1.2 Write property tests for NoteRepository
    - **Property 1: Serialization round-trip**
    - **Property 2: Save-then-retrieve consistency**
    - **Property 3: Delete correctness**
    - **Property 4: File-state consistency after writes**
    - **Property 5: No file mutation on failed delete**
    - **Validates: Requirements 1.1, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2**

- [x] 2. Update existing tests for file-based repository
  - [x] 2.1 Update the test fixture in `backend/test_routes.py`
    - Modify the `client` fixture to pass a temporary file path (using `tmp_path`) to `NoteRepository(file_path=...)` so tests use an isolated file instead of the default `backend/notes.json`
    - Ensure test isolation: each test gets a fresh temp file
    - _Requirements: 5.2_

  - [ ]* 2.2 Write unit tests for `_load()` and `_flush()` behavior
    - Test that constructing a repository with a non-existent file creates it with `[]`
    - Test that constructing a repository with an existing JSON file loads notes correctly
    - Test that `save()` persists data to disk
    - Test that `delete()` updates the file only when note existed
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add notes.json to .gitignore
  - [x] 4.1 Append `notes.json` to the project root `.gitignore`
    - Add a comment and the ignore pattern for `backend/notes.json`
    - If no root `.gitignore` exists, create one
    - _Requirements: 5.1_

- [x] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The public interface is unchanged so service/routes need no modifications
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- Tests must use `tmp_path` to avoid polluting the real `backend/notes.json`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["4.1"] }
  ]
}
```
