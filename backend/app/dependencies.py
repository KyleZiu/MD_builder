import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "52428800"))  # 50MB


def get_task_upload_path(task_id: str) -> Path:
    path = UPLOAD_DIR / task_id
    path.mkdir(exist_ok=True)
    return path


def get_task_output_path(task_id: str) -> Path:
    path = OUTPUT_DIR / task_id
    path.mkdir(exist_ok=True)
    return path
