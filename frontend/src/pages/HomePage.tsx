import { useState, useCallback } from "react";
import { FileUploader } from "@/components/FileUploader";
import { TaskList } from "@/components/TaskList";
import { createTask } from "@/services/api";
import { toast } from "@/components/ui/toast";

export function HomePage() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      await createTask(file);
      toast({
        title: "上传成功",
        description: `${file.name} 已加入转换队列`,
      });
    } catch (e) {
      toast({
        title: "上传失败",
        description: (e as Error).message,
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <div className="space-y-10">
      <section>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            文件转 Markdown
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            上传文件即可自动转换为 Markdown 格式
            <br className="hidden sm:block" />
            支持 PDF、Word、PPT、Excel、图片、音频等多种格式
          </p>
        </div>
        <FileUploader onUpload={handleUpload} disabled={uploading} />
      </section>

      <section>
        <TaskList />
      </section>
    </div>
  );
}
