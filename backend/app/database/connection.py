import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "moseb_lab.db"))

# Check if current directory is writable; if not (e.g. Vercel read-only filesystem), use /tmp
def _resolve_writable_db_path(target_path: str, db_name: str = "moseb_lab.db") -> str:
    db_dir = os.path.dirname(target_path)
    if os.access(db_dir, os.W_OK):
        return target_path
    
    tmp_path = os.path.join("/tmp", db_name)
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
