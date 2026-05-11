import { useEffect, useState } from "react";
import {
  FileType,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskProgressEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onDownload: (task: Task) => void;
}

const FILE_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  pdf: { color: "text-red-500", bg: "bg-red-50", label: "PDF" },
  doc: { color: "text-blue-500", bg: "bg-blue-50", label: "Word" },
  docx: { color: "text-blue-500", bg: "bg-blue-50", label: "Word" },
  ppt: { color: "text-orange-500", bg: "bg-orange-50", label: "PPT" },
  pptx: { color: "text-orange-500", bg: "bg-orange-50", label: "PPT" },
  xls: { color: "text-green-500", bg: "bg-green-50", label: "Excel" },
  xlsx: { color: "text-green-500", bg: "bg-green-50", label: "Excel" },
  jpg: { color: "text-purple-500", bg: "bg-purple-50", label: "图片" },
  jpeg: { color: "text-purple-500", bg: "bg-purple-50", label: "图片" },
  png: { color: "text-purple-500", bg: "bg-purple-50", label: "图片" },
  gif: { color: "text-purple-500", bg: "bg-purple-50", label: "图片" },
  webp: { color: "text-purple-500", bg: "bg-purple-50", label: "图片" },
  mp3: { color: "text-pink-500", bg: "bg-pink-50", label: "音频" },
  wav: { color: "text-pink-500", bg: "bg-pink-50", label: "音频" },
  ogg: { color: "text-pink-500", bg: "bg-pink-50", label: "音频" },
  mp4: { color: "text-pink-500", bg: "bg-pink-50", label: "视频" },
  webm: { color: "text-pink-500", bg: "bg-pink-50", label: "视频" },
  html: { color: "text-orange-500", bg: "bg-orange-50", label: "HTML" },
  htm: { color: "text-orange-500", bg: "bg-orange-50", label: "HTML" },
  csv: { color: "text-green-500", bg: "bg-green-50", label: "CSV" },
  json: { color: "text-yellow-500", bg: "bg-yellow-50", label: "JSON" },
  xml: { color: "text-blue-500", bg: "bg-blue-50", label: "XML" },
  txt: { color: "text-slate-500", bg: "bg-slate-50", label: "文本" },
  md: { color: "text-slate-500", bg: "bg-slate-50", label: "Markdown" },
  zip: { color: "text-amber-500", bg: "bg-amber-50", label: "ZIP" },
  epub: { color: "text-teal-500", bg: "bg-teal-50", label: "EPUB" },
};

function getFileStyle(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return (ext && FILE_STYLES[ext]) || { color: "text-slate-500", bg: "bg-slate-50", label: "文件" };
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5">
          <Clock className="h-3 w-3" />
          等待中
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="warning" className="gap-1.5 px-2.5 py-0.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          转换中
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="success" className="gap-1.5 px-2.5 py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          已完成
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1.5 px-2.5 py-0.5">
          <XCircle className="h-3 w-3" />
          失败
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function TaskCard({ task, onDelete, onDownload }: TaskCardProps) {
  const [liveProgress, setLiveProgress] = useState(task.progress);
  const [liveStatus, setLiveStatus] = useState<string>(task.status);
  const [showError, setShowError] = useState(false);
  const style = getFileStyle(task.filename);

  useEffect(() => {
    if (task.status === "pending" || task.status === "processing") {
      const source = new EventSource(`/api/tasks/${task.id}/stream`);
      source.onmessage = (e) => {
        if (e.data === "[DONE]") {
          source.close();
          return;
        }
        try {
          const data: TaskProgressEvent = JSON.parse(e.data);
          setLiveProgress(data.progress);
          setLiveStatus(data.status);
          if (data.status === "completed" || data.status === "failed") {
            source.close();
          }
        } catch {
          // ignore
        }
      };
      source.onerror = () => source.close();
      return () => source.close();
    }
  }, [task.id, task.status]);

  const progress = task.status === "completed" || task.status === "failed"
    ? task.progress
    : liveProgress;
  const status = task.status === "completed" || task.status === "failed"
    ? task.status
    : liveStatus;

  return (
    <>
      <div className="group rounded-xl border bg-card p-4 hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-slide-in">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            style.bg, "dark:opacity-90"
          )}>
            <FileType className={cn("h-6 w-6", style.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium truncate">
                {task.filename}
              </h4>
              <StatusBadge status={status} />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(task.created_at).toLocaleString("zh-CN")}</span>
              <span>·</span>
              <span>{style.label}</span>
            </div>

            {(status === "processing" || status === "pending") && (
              <div className="space-y-1.5 mt-3">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </div>
            )}

            {status === "failed" && task.error_message && (
              <button
                onClick={() => setShowError(true)}
                className="inline-flex items-center gap-1 text-xs text-destructive hover:underline mt-2"
              >
                <AlertCircle className="h-3 w-3" />
                查看错误详情
              </button>
            )}

            {status === "completed" && task.output_size && (
              <p className="text-xs text-muted-foreground mt-2">
                输出: {(task.output_size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {status === "completed" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(task)}
                title="下载 Markdown"
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              title="删除"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              转换错误
            </DialogTitle>
            <DialogDescription>
              任务 {task.filename} 转换失败：
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-sm text-destructive overflow-auto max-h-60">
            <pre className="whitespace-pre-wrap break-words font-mono text-xs">
              {task.error_message}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
