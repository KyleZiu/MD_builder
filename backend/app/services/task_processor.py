import asyncio
from pathlib import Path
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import async_session
from app.models import Task, TaskStatus, LLMConfig
from app.dependencies import get_task_upload_path, get_task_output_path
from app.services.converter import convert_file
from app.services.llm_manager import llm_manager
import logging

logger = logging.getLogger(__name__)


def _sanitize_filename(name: str) -> str:
    return name.replace("/", "_").replace("\\", "_").replace("..", "_")


async def update_task_progress(
    session: AsyncSession,
    task_id: str,
    status: str,
    progress: int,
    error_message: Optional[str] = None,
    output_path: Optional[str] = None,
    output_size: Optional[int] = None,
):
    stmt = select(Task).where(Task.id == task_id)
    result = await session.execute(stmt)
    task = result.scalar_one_or_none()
    if task:
        task.status = status
        task.progress = progress
        if error_message is not None:
            task.error_message = error_message
        if output_path is not None:
            task.output_path = output_path
        if output_size is not None:
            task.output_size = output_size
        await session.commit()


async def process_task(task_id: str):
    async with async_session() as session:
        stmt = select(Task).where(Task.id == task_id)
        result = await session.execute(stmt)
        task = result.scalar_one_or_none()
        if not task:
            logger.error(f"任务不存在: {task_id}")
            return

        upload_dir = get_task_upload_path(task_id)
        output_dir = get_task_output_path(task_id)

        try:
            # 查找上传的文件
            files = list(upload_dir.iterdir())
            if not files:
                await update_task_progress(
                    session, task_id, TaskStatus.FAILED.value, 0,
                    error_message="未找到上传的文件"
                )
                return

            file_path = files[0]

            # 更新状态为处理中
            await update_task_progress(session, task_id, TaskStatus.PROCESSING.value, 10)
            await asyncio.sleep(0.1)

            # 获取 LLM 配置
            llm_client = None
            llm_model = None
            if task.llm_config_id:
                cfg_result = await session.execute(
                    select(LLMConfig).where(LLMConfig.id == task.llm_config_id)
                )
                llm_config = cfg_result.scalar_one_or_none()
                if llm_config:
                    llm_client = llm_manager.get_client(llm_config)
                    llm_model = llm_config.model_id

            await update_task_progress(session, task_id, TaskStatus.PROCESSING.value, 40)

            # 执行转换
            markdown_text = await convert_file(
                file_path, task.file_type, llm_client, llm_model
            )

            await update_task_progress(session, task_id, TaskStatus.PROCESSING.value, 80)

            # 保存输出
            output_path = output_dir / "result.md"
            output_path.write_text(markdown_text, encoding="utf-8")
            output_size = output_path.stat().st_size

            await update_task_progress(
                session, task_id, TaskStatus.COMPLETED.value, 100,
                output_path=str(output_path), output_size=output_size
            )

        except Exception as e:
            logger.exception(f"任务处理异常: {task_id}")
            await update_task_progress(
                session, task_id, TaskStatus.FAILED.value, 0,
                error_message=str(e)
            )
