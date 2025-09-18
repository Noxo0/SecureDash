import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);

  useEffect(() => {
    const saved = localStorage.getItem("app-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.notifications === "boolean") setNotifications(parsed.notifications);
      if (typeof parsed.refreshInterval === "number") setRefreshInterval(parsed.refreshInterval);
    }
  }, []);

  const save = () => {
    localStorage.setItem("app-settings", JSON.stringify({ notifications, refreshInterval }));
  };

  return (
    <main className="flex-1 p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">System Settings</h2>
        <p className="text-muted-foreground">Configure appearance and basic app behaviors.</p>
      </div>

      <Card className="bg-card border border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">Current: {theme}</div>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>Toggle Theme</Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Notifications</label>
              <div className="text-sm text-muted-foreground">Enable in-app notifications</div>
              <div className="mt-1">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="accent-cyan-400" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                  <span>Enabled</span>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Refresh Interval (seconds)</label>
              <div className="text-sm text-muted-foreground">How often to refresh dashboard metrics</div>
              <input
                type="number"
                min={5}
                max={300}
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value || "0", 10))}
                className="mt-1 w-40 px-2 py-1 rounded border border-border bg-background"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={save}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
