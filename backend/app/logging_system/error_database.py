import os
import shutil
import tempfile
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from .logger import lab_logger

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_ERROR_DB = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "error_logs.db"))

def _is_serverless_or_readonly(directory: str) -> bool:
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") or os.environ.get("LAMBDA_TASK_ROOT"):
        return True
    try:
        test_file = os.path.join(directory, f".probe_errdb_{os.getpid()}")
        with open(test_file, "w") as f:
            f.write("probe")
        os.remove(test_file)
        return False
    except Exception:
        return True

def _resolve_error_db_path(target_path: str) -> str:
    db_dir = os.path.dirname(target_path)
    if not _is_serverless_or_readonly(db_dir):
        return target_path
    
    tmp_dir = "/tmp" if os.path.exists("/tmp") else tempfile.gettempdir()
    tmp_path = os.path.join(tmp_dir, "error_logs.db")
    if os.path.exists(target_path) and not os.path.exists(tmp_path):
        try:
            shutil.copy2(target_path, tmp_path)
        except Exception:
            pass
    return tmp_path

ERROR_DB_PATH = _resolve_error_db_path(DEFAULT_ERROR_DB)
ERROR_DB_URL = f"sqlite:///{ERROR_DB_PATH}"

engine = create_engine(ERROR_DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
ErrorBase = declarative_base()


class ErrorRecord(ErrorBase):
    __tablename__ = "system_error_logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(20), default="ERROR", index=True) # ERROR, CRITICAL, WARNING
    source = Column(String(50), default="backend", index=True) # frontend, backend, agent, vision, chromadb
    error_message = Column(Text, nullable=False)
    stack_trace = Column(Text, nullable=True)
    endpoint = Column(String(255), nullable=True)
    client_ip = Column(String(60), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


# Safe schema creation
try:
    ErrorBase.metadata.create_all(bind=engine)
except Exception as e:
    lab_logger.warning(f"Could not automatically create error_logs table: {e}")


class ErrorLogService:
    @staticmethod
    def log(
        message: str,
        level: str = "ERROR",
        source: str = "backend",
        stack_trace: str = None,
        endpoint: str = None,
        client_ip: str = None,
        metadata_json: str = None,
    ) -> int:
        db = SessionLocal()
        try:
            record = ErrorRecord(
                level=level.upper(),
                source=source,
                error_message=message,
                stack_trace=stack_trace,
                endpoint=endpoint,
                client_ip=client_ip,
                metadata_json=metadata_json,
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            return record.id
        except Exception as e:
            db.rollback()
            lab_logger.critical(f"Failed to persist error into error_logs.db: {e}")
            return -1
        finally:
            db.close()

    @staticmethod
    def get_recent_errors(limit: int = 50, level: str = None):
        db = SessionLocal()
        try:
            query = db.query(ErrorRecord).order_by(ErrorRecord.created_at.desc())
            if level:
                query = query.filter(ErrorRecord.level == level.upper())
            return query.limit(limit).all()
        except Exception as e:
            lab_logger.error(f"Error querying error_logs.db: {e}")
            return []
        finally:
            db.close()


def log_error(
    message: str,
    level: str = "ERROR",
    source: str = "backend",
    stack_trace: str = None,
    endpoint: str = None,
    client_ip: str = None,
    metadata_json: str = None,
) -> int:
    """Convenience helper to record an error into error_logs.db."""
    return ErrorLogService.log(
        message=message,
        level=level,
        source=source,
        stack_trace=stack_trace,
        endpoint=endpoint,
        client_ip=client_ip,
        metadata_json=metadata_json,
    )


def record_error_to_db(
    message: str,
    level: str = "ERROR",
    source: str = "backend",
    stack_trace: str = None,
    endpoint: str = None,
    client_ip: str = None,
    metadata_json: str = None,
) -> int:
    """Alias for record_error_to_db imported by multi_agent_router."""
    return log_error(
        message=message,
        level=level,
        source=source,
        stack_trace=stack_trace,
        endpoint=endpoint,
        client_ip=client_ip,
        metadata_json=metadata_json,
    )


def get_recent_errors(limit: int = 50, level: str = None):
    """Retrieve recorded errors from error_logs.db."""
    return ErrorLogService.get_recent_errors(limit=limit, level=level)

