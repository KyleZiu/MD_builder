from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LLMConfigBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    provider: str = Field(default="openai")
    api_url: str = Field(..., min_length=1, max_length=500)
    api_key: str = Field(..., min_length=1)
    model_id: str = Field(..., min_length=1, max_length=100)
    is_default: bool = False


class LLMConfigCreate(LLMConfigBase):
    pass


class LLMConfigUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    provider: Optional[str] = None
    api_url: Optional[str] = Field(default=None, min_length=1, max_length=500)
    api_key: Optional[str] = None
    model_id: Optional[str] = Field(default=None, min_length=1, max_length=100)
    is_default: Optional[bool] = None


class LLMConfigResponse(BaseModel):
    id: str
    name: str
    provider: str
    api_url: str
    model_id: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    filename: str
    file_type: str


class TaskCreate(BaseModel):
    llm_config_id: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    status: str
    progress: int
    error_message: Optional[str] = None
    output_path: Optional[str] = None
    output_size: Optional[int] = None
    llm_config_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskProgressEvent(BaseModel):
    task_id: str
    status: str
    progress: int
    message: Optional[str] = None
    error_message: Optional[str] = None
