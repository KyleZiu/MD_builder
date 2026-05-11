import { FileText, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  activeTab: "home" | "settings";
  onTabChange: (tab: "home" | "settings") => void;
}

export function AppHeader({ activeTab, onTabChange }: AppHeaderProps) {
  return (
    <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 items-center px-6 max-w-6xl mx-auto">
        <button
          onClick={() => onTabChange("home")}
          className="flex items-center gap-2.5 mr-8"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-sm">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-heading font-semibold tracking-tight">
            MarkItDown
          </span>
        </button>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => onTabChange("home")}
            className={cn(
              "inline-flex items-center rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              activeTab === "home"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            转换
          </button>
          <button
            onClick={() => onTabChange("settings")}
            className={cn(
              "inline-flex items-center rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              activeTab === "settings"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Settings className="h-4 w-4 mr-1.5" />
            设置
          </button>
        </nav>
      </div>
    </header>
  );
}
