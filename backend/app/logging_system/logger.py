import logging
import os
import sys
from logging.handlers import RotatingFileHandler

LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "moseb_lab_agents.log")

def setup_logger() -> logging.Logger:
    logger = logging.getLogger("MOSEB_LAB")
    logger.setLevel(logging.DEBUG)

    # Avoid adding duplicate handlers on reload
    if logger.handlers:
        return logger

    # Formatter with precise ISO timestamps and agent metadata
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s:%(module)s:%(funcName)s:%(lineno)d] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # 1. Console Stream Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 2. Rotating File Handler (Max 10 MB per file, keep 5 backups)
    file_handler = RotatingFileHandler(
        LOG_FILE, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

lab_logger = setup_logger()
app_logger = lab_logger

def log_frontend_error(component: str, error_type: str, message: str, stack_trace: str = None):
    """Log an error originating from frontend React components."""
    lab_logger.error(f"[FRONTEND:{component}] {error_type}: {message} | Stack: {stack_trace}")

