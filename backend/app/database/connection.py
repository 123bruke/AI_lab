import os
import shutil
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "moseb_lab.db"))

def _is_serverless_or_readonly(directory: str) -> bool:
    # Vercel and AWS Lambda serverless execution environments have read-only root filesystems
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") or os.environ.get("LAMBDA_TASK_ROOT"):
        return True
    # Test actual write permissions with a temporary probe file
    try:
        test_file = os.path.join(directory, f".probe_write_{os.getpid()}")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        return False
    except Exception:
        return True

def _resolve_writable_db_path(target_path: str, db_name: str = "moseb_lab.db") -> str:
    db_dir = os.path.dirname(target_path)
    if not _is_serverless_or_readonly(db_dir):
        return target_path
    
    # Serverless runtime: Use writable /tmp directory
    tmp_dir = "/tmp" if os.path.exists("/tmp") else tempfile.gettempdir()
    tmp_path = os.path.join(tmp_dir, db_name)
    if os.path.exists(target_path) and not os.path.exists(tmp_path):
        try:
            shutil.copy2(target_path, tmp_path)
        except Exception:
            pass
    return tmp_path

DB_PATH = _resolve_writable_db_path(DEFAULT_DB_PATH, "moseb_lab.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

