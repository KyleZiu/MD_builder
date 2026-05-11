from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import LLMConfig
from app.schemas import LLMConfigCreate, LLMConfigUpdate, LLMConfigResponse
from app.services.llm_manager import encrypt_api_key

router = APIRouter(prefix="/api/configs", tags=["configs"])


@router.get("", response_model=List[LLMConfigResponse])
async def list_configs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LLMConfig).order_by(LLMConfig.created_at.desc()))
    configs = result.scalars().all()
    return configs


@router.post("", response_model=LLMConfigResponse)
async def create_config(config: LLMConfigCreate, db: AsyncSession = Depends(get_db)):
    encrypted_key = encrypt_api_key(config.api_key)
    db_config = LLMConfig(
        name=config.name,
        provider=config.provider,
        api_url=config.api_url,
        api_key=encrypted_key,
        model_id=config.model_id,
        is_default=config.is_default,
    )
    db.add(db_config)
    await db.commit()
    await db.refresh(db_config)
    return db_config


@router.put("/{config_id}", response_model=LLMConfigResponse)
async def update_config(
    config_id: str, config: LLMConfigUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LLMConfig).where(LLMConfig.id == config_id))
    db_config = result.scalar_one_or_none()
    if not db_config:
        raise HTTPException(status_code=404, detail="配置不存在")

    if config.name is not None:
        db_config.name = config.name
    if config.provider is not None:
        db_config.provider = config.provider
    if config.api_url is not None:
        db_config.api_url = config.api_url
    if config.api_key is not None and config.api_key != "":
        db_config.api_key = encrypt_api_key(config.api_key)
    if config.model_id is not None:
        db_config.model_id = config.model_id
    if config.is_default is not None:
        db_config.is_default = config.is_default

    await db.commit()
    await db.refresh(db_config)
    return db_config


@router.delete("/{config_id}")
async def delete_config(config_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LLMConfig).where(LLMConfig.id == config_id))
    db_config = result.scalar_one_or_none()
    if not db_config:
        raise HTTPException(status_code=404, detail="配置不存在")
    await db.delete(db_config)
    await db.commit()
    return {"success": True}
