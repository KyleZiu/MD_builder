import { useEffect, useState } from "react";
import { FileX } from "lucide-react";
import type { Task } from "@/types";
import { listTasks, deleteTask, downloadTask } from "@/services/api";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert("删除失败: " + (e as Error).message);
    }
  };

  const handleDownload = async (task: Task) => {
    try {
      await downloadTask(task.id, task.filename);
    } catch (e) {
      alert("下载失败: " + (e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">转换历史</h2>
        <Button variant="ghost" size="sm" onClick={fetchTasks} disabled={loading}>
          {loading ? "刷新中..." : "刷新"}
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-muted-foreground">
          <FileX className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">暂无转换任务</p>
          <p className="text-xs mt-1">上传文件开始转换</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
