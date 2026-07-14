"""Flask application entry point."""

from flask import Flask, jsonify

from backend.repository import NoteRepository
from backend.routes import init_routes, notes_bp
from backend.service import NoteService

# Module-level singletons
repository = NoteRepository()
service = NoteService(repository)


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Initialize routes with the service instance and register blueprint
    init_routes(service)
    app.register_blueprint(notes_bp)

    # Generic 500 error handler
    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


# Create the app instance
app = create_app()
