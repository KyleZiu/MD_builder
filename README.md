# MD_Builder

基于 MarkItDown Python 库的文件转 Markdown Web 工具，支持多种文件格式的转换。

## 功能特性

- **多格式支持**: PDF、Word、PPT、Excel、图片、音频、HTML、CSV、JSON、XML、ZIP、EPub 等
- **AI 增强**: 支持配置 LLM API 进行图片 OCR 和音频语音转文字
- **实时进度**: 实时显示转换进度和状态
- **任务管理**: 任务历史管理和下载
- **多 LLM 配置**: 支持 OpenAI、Azure、Ollama、vLLM 等兼容 API

## 支持的文件格式

| 类型 | 格式 | 说明 |
|------|------|------|
| 文档 | PDF, DOC, DOCX | 文档转换 |
| 演示 | PPT, PPTX | 幻灯片转换 |
| 表格 | XLS, XLSX | 电子表格转换 |
| 图片 | JPG, PNG, GIF, WEBP | 带 OCR 文字识别 |
| 音频 | MP3, WAV, OGG | 带语音转文字 |
| 网页 | HTML, HTM | 网页内容提取 |
| 数据 | CSV, JSON, XML, TXT, MD | 文本/数据文件 |
| 压缩 | ZIP | 自动遍历内容 |
| 电子书 | EPUB | 电子书转换 |
| 视频 | MP4, WEBM | YouTube 字幕提取 |

## 快速开始

### 1. 环境要求

- Python 3.9+
- Node.js 18+

### 2. 后端设置

```bash
# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r backend/requirements.txt

# 设置环境变量（可选）
export FERNET_KEY="your-fernet-key"  # 用于加密 API Key
```

### 3. 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 启动后端

```bash
# 激活虚拟环境
source venv/bin/activate

# 启动后端
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 启动前端

```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 启动。

## 配置 LLM API

在"设置"页面配置 LLM API：

- **Provider**: 提供商名称（如 openai）
- **API URL**: API 端点（如 https://api.openai.com/v1）
- **API Key**: 密钥（会被加密存储）
- **Model ID**: 模型 ID（如 gpt-4o）

## API 端点

- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建转换任务
- `GET /api/tasks/{id}` - 获取任务详情
- `GET /api/tasks/{id}/download` - 下载结果
- `GET /api/tasks/{id}/stream` - SSE 实时进度
- `GET /api/configs` - 获取 LLM 配置列表
- `POST /api/configs` - 创建 LLM 配置
- `PUT /api/configs/{id}` - 更新 LLM 配置
- `DELETE /api/configs/{id}` - 删除 LLM 配置

## Python 示例

```python
from markitdown import MarkItDown

with open("document.pdf", "rb") as f:
    md = MarkItDown(enable_plugins=True)
    result = md.convert_stream(f, file_extension=".pdf")
    print(result.text_content)
```

## 项目结构

```
MD_Builder/
├── backend/          # FastAPI 后端
│   ├── app/
│   │   ├── routers/  # API 路由
│   │   ├── services/ # 业务逻辑
│   │   ├── models.py # 数据库模型
│   │   └── database.py
│   └── requirements.txt
├── frontend/         # React 前端
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── pages/       # 页面组件
│   │   └── services/    # API 服务
│   └── package.json
└── venv/             # Python 虚拟环境
```

## 许可证

MIT
