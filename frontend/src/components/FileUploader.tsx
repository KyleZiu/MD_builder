import { useCallback, useState, useRef } from "react";
import { Upload, FileType, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx",
  ".xls", ".xlsx", ".jpg", ".jpeg", ".png",
  ".gif", ".webp", ".mp3", ".wav", ".ogg",
  ".mp4", ".webm", ".html", ".htm", ".csv",
  ".json", ".xml", ".txt", ".md", ".zip", ".epub",
];

const ACCEPT_STRING = ACCEPTED_TYPES.join(",");

const FILE_TYPE_INFO: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF 文档", color: "text-red-500" },
  doc: { label: "Word 文档", color: "text-blue-500" },
  docx: { label: "Word 文档", color: "text-blue-500" },
  ppt: { label: "PPT 演示", color: "text-orange-500" },
  pptx: { label: "PPT 演示", color: "text-orange-500" },
  xls: { label: "Excel 表格", color: "text-green-500" },
  xlsx: { label: "Excel 表格", color: "text-green-500" },
  jpg: { label: "图片文件", color: "text-purple-500" },
  jpeg: { label: "图片文件", color: "text-purple-500" },
  png: { label: "图片文件", color: "text-purple-500" },
  gif: { label: "图片文件", color: "text-purple-500" },
  webp: { label: "图片文件", color: "text-purple-500" },
  mp3: { label: "音频文件", color: "text-pink-500" },
  wav: { label: "音频文件", color: "text-pink-500" },
  ogg: { label: "音频文件", color: "text-pink-500" },
};

function getFileInfo(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const info = ext ? FILE_TYPE_INFO[ext] : undefined;
  return {
    color: info?.color ?? "text-slate-500",
    label: info?.label ?? "文件",
  };
}

export function FileUploader({ onUpload, disabled }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [selectedFile, onUpload]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 hover:shadow-md"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className={cn(
          "rounded-2xl p-5 mb-5 transition-all duration-300",
          isDragging
            ? "bg-primary/15 scale-110"
            : "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent group-hover:from-primary/15 group-hover:via-primary/10"
        )}>
          <Upload className={cn(
            "h-10 w-10 transition-all duration-300",
            isDragging ? "text-primary" : "text-primary/70 group-hover:text-primary"
          )} />
        </div>

        <p className="text-base font-heading font-semibold">
          {isDragging ? "释放上传文件" : "拖拽文件到此处，或"}
          <span className="text-primary ml-1 underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all">
            点击选择
          </span>
        </p>

        <p className="text-xs text-muted-foreground mt-3 text-center max-w-lg leading-relaxed">
          支持 PDF、Word、PPT、Excel、图片、音频、HTML、CSV、JSON、XML、ZIP、EPub 等格式
        </p>

        <div className="flex flex-wrap gap-2 mt-5 justify-center">
          {["PDF", "DOCX", "PPTX", "XLSX", "图片", "音频", "EPUB"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground/80"
            >
              <Sparkles className="h-3 w-3 text-primary/60" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm animate-slide-in hover:shadow-md transition-shadow">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
            getFileInfo(selectedFile.name).color.includes("red") && "from-red-50 to-red-100",
            getFileInfo(selectedFile.name).color.includes("blue") && "from-blue-50 to-blue-100",
            getFileInfo(selectedFile.name).color.includes("orange") && "from-orange-50 to-orange-100",
            getFileInfo(selectedFile.name).color.includes("green") && "from-green-50 to-green-100",
            getFileInfo(selectedFile.name).color.includes("purple") && "from-purple-50 to-purple-100",
            getFileInfo(selectedFile.name).color.includes("pink") && "from-pink-50 to-pink-100",
            !getFileInfo(selectedFile.name).color.includes("-") && "from-slate-50 to-slate-100"
          )}>
            <FileType className={cn("h-6 w-6", getFileInfo(selectedFile.name).color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
              <span className="mx-1.5">·</span>
              {getFileInfo(selectedFile.name).label}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button onClick={handleSubmit} disabled={disabled} size="lg">
            {disabled ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                转换中...
              </>
            ) : (
              "开始转换"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
