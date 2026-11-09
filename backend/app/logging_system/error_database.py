import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from .logger import lab_logger

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ERROR_DB_PATH = os.path.join(BASE_DIR, "..", "..", "error_logs.db")
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

# Create the dedicated error database tables
ErrorBase.metadata.create_all(bind=engine)

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
            lab_logger.error(f"[{source.upper()}] {message} (Error Logged ID: {record.id})")
            return record.id
        except Exception as e:
            lab_logger.critical(f"Failed to persist error into error_logs.db: {e}")
            return -1
        finally:
            db.close()

    @staticmethod
    def get_recent_errors(limit: int = 50):
        db = SessionLocal()
        try:
            return db.query(ErrorRecord).order_by(ErrorRecord.created_at.desc()).limit(limit).all()
        finally:
            db.close()

def log_error(message: str, source: str = "backend", stack_trace: str = None):
    return ErrorLogService.log(message=message, source=source, stack_trace=stack_trace)
