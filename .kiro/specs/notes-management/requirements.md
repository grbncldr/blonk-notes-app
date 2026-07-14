# Requirements Document

## Introduction

A notes management web application that allows users to create, view, edit, and delete personal notes. The application consists of a Vue.js frontend and a Python backend API, providing a simple and intuitive interface for managing textual notes.

## Glossary

- **Frontend**: The Vue.js single-page application that renders the user interface and communicates with the Backend_API
- **Backend_API**: The Python REST API server that handles HTTP requests and manages note data
- **Note**: A data entity consisting of a unique identifier, a title, a body, and timestamps for creation and last modification
- **Notes_List**: The UI component in the Frontend that displays all existing notes
- **Note_Editor**: The UI component in the Frontend that allows creating or editing a note

## Requirements

### Requirement 1: Display Notes

**User Story:** As a user, I want to see a list of all my notes, so that I can quickly find and access any note I have created.

#### Acceptance Criteria

1. WHEN the user opens the application, THE Frontend SHALL retrieve all notes from the Backend_API and display them in the Notes_List ordered by most recently updated first
2. THE Notes_List SHALL display the title (truncated to 50 characters with ellipsis if exceeded) and a preview of the body (truncated to 120 characters with ellipsis if exceeded) for each Note
3. WHEN the Backend_API receives a GET request to the notes endpoint, THE Backend_API SHALL return all stored notes as a JSON array within 2 seconds
4. IF the Backend_API fails to return notes within 5 seconds or returns a non-success response, THEN THE Frontend SHALL display an error message indicating that notes could not be loaded and provide a retry option
5. WHEN no notes exist, THE Frontend SHALL display a message indicating that no notes are available and prompt the user to create their first note
6. WHILE the Frontend is retrieving notes from the Backend_API, THE Frontend SHALL display a loading indicator to the user

### Requirement 2: Add a Note

**User Story:** As a user, I want to create a new note with a title and body, so that I can capture and store information.

#### Acceptance Criteria

1. WHEN the user activates the create action, THE Frontend SHALL display the Note_Editor with empty title and body fields
2. WHEN the user submits a new note with a title between 1 and 200 characters and a body between 0 and 10,000 characters (after trimming leading and trailing whitespace), THE Frontend SHALL send a POST request to the Backend_API with the note data
3. WHEN the Backend_API receives a valid POST request, THE Backend_API SHALL create a new Note with a unique identifier and a creation timestamp, and return the created Note
4. WHEN the Backend_API successfully creates a note, THE Frontend SHALL add the new Note to the Notes_List without requiring a full page reload
5. IF the user submits a note with a title that is empty or contains only whitespace characters, THEN THE Frontend SHALL display a validation error indicating that a title is required and SHALL retain the user's input in the Note_Editor
6. IF the Backend_API fails to create the note, THEN THE Frontend SHALL display an error message to the user and SHALL retain the user's input in the Note_Editor
7. IF the user submits a note with a title exceeding 200 characters or a body exceeding 10,000 characters, THEN THE Frontend SHALL display a validation error indicating which field exceeds the maximum allowed length

### Requirement 3: Edit a Note

**User Story:** As a user, I want to edit an existing note, so that I can update or correct the information it contains.

#### Acceptance Criteria

1. WHEN the user selects a note for editing, THE Frontend SHALL display the Note_Editor pre-populated with the existing title and body of the selected Note
2. WHEN the user submits the edited note, THE Frontend SHALL send a PUT request to the Backend_API with the updated title and body fields
3. WHEN the Backend_API receives a PUT request for an existing Note with a non-empty title of at most 200 characters and a body of at most 10,000 characters, THE Backend_API SHALL update the Note title and body, set the last modification timestamp, and return the updated Note
4. WHEN the Backend_API successfully updates a note, THE Frontend SHALL reflect the changes in the Notes_List without requiring a full page reload
5. IF the Backend_API receives a PUT request for a non-existent Note, THEN THE Backend_API SHALL return a 404 error response
6. IF the user submits an edited note with an empty title or a title exceeding 200 characters, THEN THE Frontend SHALL display a validation error indicating the title constraint that was violated
7. IF the Backend_API receives a PUT request with invalid data for an existing Note, THEN THE Backend_API SHALL return a 400 error response indicating which field failed validation

### Requirement 4: Delete a Note

**User Story:** As a user, I want to delete a note I no longer need, so that I can keep my notes organized and relevant.

#### Acceptance Criteria

1. WHEN the user activates the delete action on a note, THE Frontend SHALL prompt the user for confirmation before proceeding
2. WHEN the user confirms deletion, THE Frontend SHALL send a DELETE request to the Backend_API with the note identifier
3. WHEN the Backend_API receives a valid DELETE request for an existing Note, THE Backend_API SHALL remove the Note and return a success response
4. WHEN the Backend_API successfully deletes a note, THE Frontend SHALL remove the Note from the Notes_List without requiring a full page reload
5. IF the Backend_API receives a DELETE request for a non-existent Note, THEN THE Backend_API SHALL return a 404 error response
6. IF the Backend_API fails to delete the note, THEN THE Frontend SHALL display an error message to the user

### Requirement 5: API Data Validation

**User Story:** As a developer, I want the backend to validate incoming data, so that only well-formed notes are stored.

#### Acceptance Criteria

1. WHEN the Backend_API receives a POST or PUT request, THE Backend_API SHALL validate that the title field is present, is a string, and contains at least 1 non-whitespace character with a total maximum length of 200 characters
2. WHEN the Backend_API receives a POST or PUT request, THE Backend_API SHALL validate that the body field is present and is a string with a minimum length of 0 characters and a maximum length of 10000 characters
3. IF the Backend_API receives a request with missing or invalid fields, THEN THE Backend_API SHALL reject the request and return a 400 error response that identifies which field(s) failed validation and the reason for each failure
4. THE Backend_API SHALL produce an equivalent Note object when a valid Note object is serialized to JSON and then deserialized back, where equivalence means all fields contain identical values after the round-trip
