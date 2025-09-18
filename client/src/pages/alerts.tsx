import { SecurityAlerts } from "@/components/security-alerts";

export default function Alerts() {
  return (
    <main className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Security Alerts</h2>
        <p className="text-muted-foreground">Recent alerts and event details.</p>
      </div>
      <SecurityAlerts />
    </main>
  );
}
