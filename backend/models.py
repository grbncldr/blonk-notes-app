"""Note data model with serialization support."""

from dataclasses import dataclass


@dataclass
class Note:
    """A note with a unique identifier, title, body, and timestamps."""

    id: str  # Unique identifier (UUID v4)
    title: str  # 1-200 characters, at least 1 non-whitespace
    body: str  # 0-10000 characters
    created_at: str  # ISO 8601 timestamp
    updated_at: str  # ISO 8601 timestamp, >= created_at

    def to_dict(self) -> dict:
        """Serialize the Note to a dictionary for JSON responses."""
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Note":
        """Deserialize a dictionary to a Note instance."""
        return cls(
            id=data["id"],
            title=data["title"],
            body=data["body"],
            created_at=data["created_at"],
            updated_at=data["updated_at"],
        )
