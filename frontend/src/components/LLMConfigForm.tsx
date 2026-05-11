import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, KeyRound } from "lucide-react";
import type { LLMConfig } from "@/types";
import {
  listConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
} from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ConfigFormData {
  name: string;
  provider: string;
  api_url: string;
  api_key: string;
  model_id: string;
  is_default: boolean;
}

const EMPTY_FORM: ConfigFormData = {
  name: "",
  provider: "openai",
  api_url: "",
  api_key: "",
  model_id: "",
  is_default: false,
};

export function LLMConfigPanel() {
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ConfigFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const fetchConfigs = async () => {
    try {
      const data = await listConfigs();
      setConfigs(data);
    } catch (e) {
      console.error("Failed to fetch configs:", e);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.api_url || !form.model_id) return;
    setLoading(true);
    try {
      if (editingId) {
        await updateConfig(editingId, form);
      } else {
        await createConfig(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchConfigs();
    } catch (e) {
      toast({ title: "保存失败", description: (e as Error).message, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: LLMConfig) => {
    setForm({
      name: config.name,
      provider: config.provider,
      api_url: config.api_url,
      api_key: "",
      model_id: config.model_id,
      is_default: config.is_default,
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此配置吗？")) return;
    try {
      await deleteConfig(id);
      fetchConfigs();
    } catch (e) {
      toast({ title: "删除失败", description: (e as Error).message, variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">LLM 配置</h2>
          <p className="text-sm text-muted-foreground">
            配置大模型 API，用于图片 OCR 和音频转录增强
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          添加配置
        </Button>
      </div>

      {configs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <KeyRound className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">暂无 LLM 配置</p>
          <p className="text-xs mt-1">
            添加配置后，转换图片和音频时会使用 AI 进行描述
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{config.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">提供商</span>
                  <span className="font-medium">{config.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">模型</span>
                  <span className="font-medium">{config.model_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API URL</span>
                  <span className="font-medium truncate max-w-[200px]">
                    {config.api_url}
                  </span>
                </div>
                {config.is_default && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary mt-2">
                    <Check className="h-3 w-3" />
                    默认配置
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "编辑配置" : "添加 LLM 配置"}
            </DialogTitle>
            <DialogDescription>
              支持 OpenAI 兼容 API，如 OpenAI、Azure、Ollama、vLLM 等
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">名称</label>
              <Input
                placeholder="例如: OpenAI GPT-4"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">提供商</label>
              <Input
                placeholder="例如: openai"
                value={form.provider}
                onChange={(e) =>
                  setForm({ ...form, provider: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API URL</label>
              <Input
                placeholder="https://api.openai.com/v1"
                value={form.api_url}
                onChange={(e) =>
                  setForm({ ...form, api_url: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                API Key {editingId && "(留空表示不修改)"}
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={form.api_key}
                onChange={(e) =>
                  setForm({ ...form, api_key: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">模型 ID</label>
              <Input
                placeholder="gpt-4o"
                value={form.model_id}
                onChange={(e) =>
                  setForm({ ...form, model_id: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={form.is_default}
                onChange={(e) =>
                  setForm({ ...form, is_default: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="is_default" className="text-sm">
                设为默认配置
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Check className="h-4 w-4 mr-1" />
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
