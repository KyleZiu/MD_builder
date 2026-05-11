import asyncio
import re
import shutil
import uuid
from typing import List, Optional
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Task, TaskStatus, LLMConfig
from app.schemas import TaskResponse, TaskCreate, TaskProgressEvent
from app.dependencies import get_task_upload_path, get_task_output_path
from app.services.task_processor import process_task

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    query = select(Task).order_by(Task.created_at.desc())
    if status:
        query = query.where(Task.status == status)
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    tasks = result.scalars().all()
    return tasks


@router.post("", response_model=TaskResponse)
async def create_task(
    file: UploadFile = File(...),
    llm_config_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    task_id = str(uuid.uuid4())
    upload_dir = get_task_upload_path(task_id)
    file_path = upload_dir / file.filename

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    task = Task(
        id=task_id,
        filename=file.filename,
        file_type=file.content_type or "application/octet-stream",
        status=TaskStatus.PENDING.value,
        progress=0,
        llm_config_id=llm_config_id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    asyncio.create_task(process_task(task_id))
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task


@router.delete("/{task_id}")
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    upload_dir = get_task_upload_path(task_id)
    output_dir = get_task_output_path(task_id)
    shutil.rmtree(upload_dir, ignore_errors=True)
    shutil.rmtree(output_dir, ignore_errors=True)

    await db.delete(task)
    await db.commit()
    return {"success": True}


@router.get("/{task_id}/download")
async def download_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task or not task.output_path:
        raise HTTPException(status_code=404, detail="转换结果不存在")

    from pathlib import Path

    path = Path(task.output_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    def _safe_disposition(filename: str) -> str:
        download_name = filename + ".md"
        ascii_name = re.sub(r"[^\x00-\x7F]", "_", download_name)
        if ascii_name == download_name:
            return f'attachment; filename="{download_name}"'
        return (
            f'attachment; filename="{ascii_name}"; '
            f"filename*=UTF-8''{quote(download_name)}"
        )

    def iterfile():
        with open(path, "rb") as f:
            yield from f

    return StreamingResponse(
        iterfile(),
        media_type="text/markdown",
        headers={"Content-Disposition": _safe_disposition(task.filename)},
    )


@router.get("/{task_id}/stream")
async def stream_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    async def event_generator():
        last_status = None
        last_progress = -1
        for _ in range(600):  # 最多监听 10 分钟
            result = await db.execute(select(Task).where(Task.id == task_id))
            current = result.scalar_one_or_none()
            if not current:
                break
            if current.status != last_status or current.progress != last_progress:
                last_status = current.status
                last_progress = current.progress
                event = TaskProgressEvent(
                    task_id=task_id,
                    status=current.status,
                    progress=current.progress,
                    error_message=current.error_message,
                )
                yield f"data: {event.model_dump_json()}\n\n"
                if current.status in (TaskStatus.COMPLETED.value, TaskStatus.FAILED.value):
                    break
            await asyncio.sleep(1)
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
