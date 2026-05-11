import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


def now_utc():
    return datetime.now(timezone.utc)


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default=TaskStatus.PENDING.value)
    progress = Column(Integer, nullable=False, default=0)
    error_message = Column(Text, nullable=True)
    output_path = Column(String(500), nullable=True)
    output_size = Column(Integer, nullable=True)
    llm_config_id = Column(String(36), ForeignKey("llm_configs.id"), nullable=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    llm_config = relationship("LLMConfig", back_populates="tasks")


class LLMConfig(Base):
    __tablename__ = "llm_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    provider = Column(String(50), nullable=False, default="openai")
    api_url = Column(String(500), nullable=False)
    api_key = Column(Text, nullable=False)
    model_id = Column(String(100), nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now_utc)

    tasks = relationship("Task", back_populates="llm_config")
