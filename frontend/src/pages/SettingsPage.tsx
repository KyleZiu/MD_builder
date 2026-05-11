import { Brain } from "lucide-react";
import { LLMConfigPanel } from "@/components/LLMConfigForm";

export function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">设置</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              配置大模型 API 以增强图片 OCR 和音频语音转文字能力
            </p>
          </div>
        </div>
      </div>
      <LLMConfigPanel />
    </div>
  );
}
