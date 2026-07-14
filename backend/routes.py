"""REST API route handlers for notes management."""

from flask import Blueprint, jsonify, request

from backend.validation import validate_note_input

notes_bp = Blueprint("notes", __name__)

# Module-level service reference, set by init_routes()
_service = None


def init_routes(service) -> None:
    """Initialize routes with the given service instance.

    Must be called before any requests are handled.
    """
    global _service
    _service = service


@notes_bp.route("/api/notes", methods=["GET"])
def list_notes():
    notes = _service.list_notes()
    return jsonify([note.to_dict() for note in notes]), 200


@notes_bp.route("/api/notes", methods=["POST"])
def create_note():
    data = request.get_json(silent=True) or {}

    is_valid, errors = validate_note_input(data)
    if not is_valid:
        return jsonify({"errors": errors}), 400

    note = _service.create_note(data["title"], data["body"])
    return jsonify(note.to_dict()), 201


@notes_bp.route("/api/notes/<note_id>", methods=["PUT"])
def update_note(note_id: str):
    data = request.get_json(silent=True) or {}

    is_valid, errors = validate_note_input(data)
    if not is_valid:
        return jsonify({"errors": errors}), 400

    note = _service.update_note(note_id, data["title"], data["body"])
    if note is None:
        return jsonify({"error": "Note not found"}), 404

    return jsonify(note.to_dict()), 200


@notes_bp.route("/api/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id: str):
    deleted = _service.delete_note(note_id)
    if not deleted:
        return jsonify({"error": "Note not found"}), 404

    return "", 204
