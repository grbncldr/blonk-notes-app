# PEP 8 Python Style Guide

All Python code in this project must follow the PEP 8 style guide.

## Key Rules

### Indentation and Formatting
- Use 4 spaces per indentation level (no tabs).
- Limit lines to 79 characters; docstrings and comments to 72.
- Use blank lines to separate top-level definitions (2) and method definitions (1).

### Imports
- Imports go at the top of the file, after module comments and docstrings.
- Group imports in this order, separated by a blank line:
  1. Standard library
  2. Third-party packages
  3. Local application imports
- Use absolute imports. Avoid wildcard imports (`from module import *`).

### Naming Conventions
- `snake_case` for functions, methods, variables, and module names.
- `PascalCase` for class names.
- `UPPER_SNAKE_CASE` for constants.
- Prefix private attributes with a single underscore (`_private`).

### Whitespace
- No extra whitespace inside parentheses, brackets, or braces.
- One space around assignment and comparison operators.
- No space before a colon in slices; one space around binary operators.

### Strings
- Use consistent quote style (prefer double quotes for this project).
- Use f-strings for interpolation.

### Type Hints
- Add type hints to function signatures and return types.
- Use `from __future__ import annotations` where appropriate.

### Docstrings
- Use triple double quotes for all public modules, classes, and functions.
- Follow the one-line summary + optional body pattern.

### General
- Avoid mutable default arguments (use `None` and assign inside the function).
- Use `is` / `is not` for comparisons to `None`.
- Prefer list/dict/set comprehensions over `map`/`filter` with lambdas.
