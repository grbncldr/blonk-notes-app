"""Input validation for note data."""


def validate_note_input(data: dict) -> tuple[bool, dict]:
    """Validate note input data.

    Args:
        data: Dictionary with 'title' and 'body' fields.

    Returns:
        A tuple of (is_valid, errors) where errors maps field names
        to human-readable error messages. If is_valid is True, errors
        is an empty dict.
    """
    errors: dict[str, str] = {}

    # Title validation
    title = data.get("title")
    if not isinstance(title, str):
        errors["title"] = "Title is required and must be a string"
    else:
        trimmed = title.strip()
        if len(trimmed) == 0:
            errors["title"] = (
                "Title must contain at least 1 non-whitespace character"
            )
        elif len(trimmed) > 200:
            errors["title"] = "Title must not exceed 200 characters"

    # Body validation
    body = data.get("body")
    if not isinstance(body, str):
        errors["body"] = "Body is required and must be a string"
    else:
        if len(body) > 10000:
            errors["body"] = "Body must not exceed 10000 characters"

    is_valid = len(errors) == 0
    return (is_valid, errors)
