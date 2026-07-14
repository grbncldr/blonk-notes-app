#!/bin/bash
cd "$(dirname "$0")"
source .venv/bin/activate
flask --app backend.app run --port 5000
