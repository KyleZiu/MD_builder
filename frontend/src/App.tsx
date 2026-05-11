import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Toaster } from "@/components/ui/toast-provider";

function App() {
  const [activeTab, setActiveTab] = useState<"home" | "settings">("home");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "home" ? <HomePage /> : <SettingsPage />}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
