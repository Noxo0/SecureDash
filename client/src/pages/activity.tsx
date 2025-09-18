import { ActivityLogTable } from "@/components/activity-log";

export default function Activity() {
  return (
    <main className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Activity Logs</h2>
        <p className="text-muted-foreground">Review recent actions, login attempts, and system usage.</p>
      </div>
      <ActivityLogTable />
    </main>
  );
}
