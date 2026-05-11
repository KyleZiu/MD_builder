import io
import sys
from pathlib import Path
from typing import Optional
from markitdown import MarkItDown
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)


async def convert_file(
    file_path: Path,
    file_type: str,
    llm_client: Optional[OpenAI] = None,
    llm_model: Optional[str] = None,
) -> str:
    """使用 MarkItDown 转换文件为 Markdown 文本."""

    kwargs = {"enable_plugins": True}
    if llm_client and llm_model:
        kwargs["llm_client"] = llm_client
        kwargs["llm_model"] = llm_model

    md = MarkItDown(**kwargs)

    # 文件扩展名处理
    file_extension = file_path.suffix.lower()

    # 读取文件为二进制流
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    stream = io.BytesIO(file_bytes)

    try:
        result = md.convert_stream(stream, file_extension=file_extension or None)
        return result.text_content or ""
    except RecursionError:
        logger.warning("HTML 嵌套过深导致 RecursionError，尝试以纯文本方式提取")
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(file_bytes, "html.parser")
            for tag in soup(["script", "style"]):
                tag.extract()
            body = soup.find("body") or soup
            return body.get_text("\n", strip=True)
        except Exception as fallback_e:
            logger.error(f"纯文本回退也失败: {fallback_e}")
            raise
    except Exception as e:
        logger.error(f"转换失败: {e}")
        raise
