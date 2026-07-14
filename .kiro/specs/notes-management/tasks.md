# Implementation Plan: Notes Management

## Overview

Implement a notes management application with a Vue.js frontend and Python REST API backend supporting full CRUD operations. The implementation proceeds from backend data models and API through frontend components, wiring everything together with proper validation, error handling, and testing.

## Tasks

- [x] 1. Set up backend project structure and data model
  - [x] 1.1 Create Python backend project structure with route handlers, service layer, repository layer, and validation module
    - Set up directory layout: `backend/` with `routes.py`, `service.py`, `repository.py`, `validation.py`, `models.py`
    - Define the `Note` dataclass with `id`, `title`, `body`, `created_at`, `updated_at` fields
    - Implement `NoteRepository` with in-memory storage: `get_all()`, `get_by_id(id)`, `save(note)`, `delete(id)`
    - _Requirements: 1.3, 2.3, 3.3, 4.3_

  - [x] 1.2 Implement backend validation layer
    - Create `validate_note_input(data: dict) -> tuple[bool, dict]`
    - Title validation: must be string, 1–200 chars after trimming, at least 1 non-whitespace char
    - Body validation: must be string, 0–10000 chars
    - Return field-specific error messages for each failing field
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 1.3 Implement NoteService business logic
    - `list_notes()` returning notes sorted by `updated_at` descending
    - `create_note(title, body)` generating UUID v4, setting timestamps
    - `update_note(id, title, body)` updating fields and `updated_at` timestamp
    - `delete_note(id)` removing the note from the repository
    - _Requirements: 1.3, 2.3, 3.3, 4.3_

  - [x] 1.4 Implement REST API route handlers
    - `GET /api/notes` — return all notes as JSON array (200)
    - `POST /api/notes` — validate input, create note, return 201 with note JSON
    - `PUT /api/notes/<id>` — validate input, update note, return 200 or 404/400
    - `DELETE /api/notes/<id>` — delete note, return 204 or 404
    - Consistent error response format: `{ "errors": { "field": "msg" } }` for 400, `{ "error": "msg" }` for 404/500
    - _Requirements: 1.3, 2.3, 3.3, 3.5, 3.7, 4.3, 4.5, 5.3_

  - [ ]* 1.5 Write property tests for backend validation (Hypothesis)
    - **Property 3: Note validation accepts valid inputs and rejects invalid inputs**
    - **Validates: Requirements 5.1, 5.2**
    - Generate valid title+body combinations (1–200 char title with non-whitespace, 0–10000 char body), verify accepted
    - Generate invalid combinations (empty/whitespace-only title, >200 char title, >10000 char body), verify rejected

  - [ ]* 1.6 Write property tests for validation error responses (Hypothesis)
    - **Property 4: Validation error response identifies all failing fields**
    - **Validates: Requirements 5.3**
    - Generate combinations of invalid fields, verify response contains entry for each failing field and no entries for passing fields

  - [ ]* 1.7 Write property tests for note creation unique IDs (Hypothesis)
    - **Property 5: Created notes have unique identifiers**
    - **Validates: Requirements 2.3**
    - Generate sequences of valid note creation calls, verify all returned IDs are distinct

  - [ ]* 1.8 Write property test for update timestamp invariant (Hypothesis)
    - **Property 7: Update sets modification timestamp**
    - **Validates: Requirements 3.3**
    - Generate existing notes and valid update data, verify `updated_at >= created_at` and fields match submitted values

  - [ ]* 1.9 Write property test for deletion (Hypothesis)
    - **Property 8: Deletion removes note**
    - **Validates: Requirements 4.3**
    - Generate notes, delete them, verify they no longer appear in `list_notes()` results

  - [ ]* 1.10 Write property test for serialization round-trip (Hypothesis)
    - **Property 9: Note serialization round-trip**
    - **Validates: Requirements 5.4**
    - Generate valid Note objects, serialize to JSON, deserialize back, verify all fields identical

- [x] 2. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Set up frontend project structure and shared modules
  - [x] 3.1 Create Vue.js frontend project structure with API client and validation module
    - Set up directory layout: `frontend/src/` with `components/`, `store/`, `api/`, `utils/`
    - Define TypeScript interfaces: `Note`, `ValidationResult`, `ApiError`
    - Implement `ApiClient` with methods for GET/POST/PUT/DELETE to `/api/notes`, 5s timeout handling, and structured error parsing
    - _Requirements: 1.1, 1.4, 2.2, 3.2, 4.2_

  - [x] 3.2 Implement frontend validation module
    - `validateTitle(title: string): ValidationResult` — trim, check non-empty, check ≤200 chars
    - `validateBody(body: string): ValidationResult` — check ≤10000 chars
    - `validateNote(data: { title, body }): ValidationResult` — combine field validations
    - _Requirements: 2.5, 2.7, 3.6_

  - [x] 3.3 Implement string truncation utility
    - `truncate(text: string, maxLength: number): string` — return original if within limit, otherwise first `maxLength` chars + "..."
    - _Requirements: 1.2_

  - [ ]* 3.4 Write property tests for string truncation (fast-check)
    - **Property 2: String truncation correctness**
    - **Validates: Requirements 1.2**
    - Generate random strings and limit values, verify truncation rules

  - [ ]* 3.5 Write property tests for frontend validation (fast-check)
    - **Property 3: Note validation accepts valid inputs and rejects invalid inputs (client-side)**
    - **Validates: Requirements 2.2, 2.5**
    - Generate valid/invalid title+body combinations, verify accept/reject decisions match specification

- [x] 4. Implement frontend state management and views
  - [x] 4.1 Implement Pinia notes store
    - State: `notes: Note[]`, `loading: boolean`, `error: string | null`
    - Actions: `fetchNotes()`, `createNote(data)`, `updateNote(id, data)`, `deleteNote(id)`
    - Sort notes by `updatedAt` descending after fetch
    - Clear errors on successful operations
    - _Requirements: 1.1, 2.4, 3.4, 4.4_

  - [ ]* 4.2 Write property test for notes display ordering (fast-check)
    - **Property 1: Notes display ordering**
    - **Validates: Requirements 1.1**
    - Generate random note arrays with distinct `updatedAt` timestamps, verify store produces descending order

  - [x] 4.3 Implement NotesListView component
    - Fetch notes on mount via the store
    - Render each note with truncated title (50 chars) and body preview (120 chars)
    - Show loading indicator while fetching
    - Show empty state with "create your first note" prompt when no notes exist
    - Show error state with retry button on fetch failure
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

  - [x] 4.4 Implement NoteEditor component
    - Accept optional `note` prop for edit mode, otherwise render empty fields for create mode
    - Perform client-side validation before submission (title required, length limits)
    - Display field-level validation errors inline
    - Emit `save` event with validated data
    - Retain user input on validation failure or API error
    - _Requirements: 2.1, 2.5, 2.6, 2.7, 3.1, 3.6_

  - [ ]* 4.5 Write property test for editor pre-population (fast-check)
    - **Property 6: Editor pre-population preserves note data**
    - **Validates: Requirements 3.1**
    - Generate random Note objects, verify NoteEditor fields match original title and body when loaded in edit mode

  - [x] 4.6 Implement DeleteConfirmationDialog component
    - Accept `note` prop identifying the note to delete
    - Emit `confirm` or `cancel` events
    - Display note title in confirmation message
    - _Requirements: 4.1_

- [x] 5. Wire components together and integrate frontend with backend
  - [x] 5.1 Connect NotesListView to store actions and NoteEditor/DeleteConfirmationDialog
    - Wire create button to open NoteEditor in create mode
    - Wire note selection to open NoteEditor in edit mode
    - Wire delete button to open DeleteConfirmationDialog
    - Handle `save` and `confirm` events, dispatch store actions
    - Update Notes_List after create/edit/delete without full page reload
    - _Requirements: 2.1, 2.4, 3.1, 3.4, 4.1, 4.4_

  - [x] 5.2 Implement error handling flows in frontend
    - Display "Could not load notes" with retry on API timeout/failure
    - Parse and display inline field errors from 400 responses on create/edit
    - Display "Note not found" on 404, refresh list
    - Display generic error on 500
    - Retain user input in NoteEditor on any submission failure
    - _Requirements: 1.4, 2.6, 3.6, 4.6_

  - [ ]* 5.3 Write unit tests for key frontend components
    - Test empty state rendering (Req 1.5)
    - Test loading indicator display (Req 1.6)
    - Test create action opens empty editor (Req 2.1)
    - Test error retention on API failure (Req 2.6)
    - Test boundary values: title at 200 chars, body at 10000 chars (Req 2.7, 3.6)
    - Test confirmation dialog on delete (Req 4.1)
    - _Requirements: 1.5, 1.6, 2.1, 2.6, 2.7, 3.6, 4.1_

  - [ ]* 5.4 Write unit tests for backend route handlers
    - Test 404 response for non-existent note on PUT (Req 3.5)
    - Test 404 response for non-existent note on DELETE (Req 4.5)
    - Test error message on delete failure (Req 4.6)
    - Test 400 response with field-specific errors on invalid PUT (Req 3.7)
    - _Requirements: 3.5, 3.7, 4.5, 4.6_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Backend uses Python with Hypothesis for property-based testing
- Frontend uses TypeScript/Vue.js with fast-check for property-based testing

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "3.2", "3.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "1.6", "1.7", "3.4", "3.5"] },
    { "id": 3, "tasks": ["1.8", "1.9", "1.10", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.6"] },
    { "id": 5, "tasks": ["4.5", "5.1", "5.2"] },
    { "id": 6, "tasks": ["5.3", "5.4"] }
  ]
}
```
