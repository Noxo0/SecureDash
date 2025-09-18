import { useQuery } from "@tanstack/react-query";
import { Users, Shield, Server, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricsCard } from "@/components/metrics-card";
import { SecurityAlerts } from "@/components/security-alerts";
import { ActivityLogTable } from "@/components/activity-log";
import { getAuthToken } from "@/lib/auth-utils";
import { SystemPerformanceChart } from "@/components/system-performance-chart";
import { useState } from "react";

interface DashboardMetrics {
  activeUsers: number;
  failedLogins: number;
  securityEvents: number;
  uptime: number;
}

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h");
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch("/api/dashboard/metrics", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <main className="flex-1 p-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Security Dashboard</h2>
        <p className="text-muted-foreground">Monitor system security and user activity in real-time</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card border border-border animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16"></div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricsCard
              title="Active Users"
              value={metrics?.activeUsers.toLocaleString() || "0"}
              change="+12%"
              changeType="positive"
              icon={Users}
            />
            <MetricsCard
              title="Security Events"
              value={metrics?.securityEvents || "0"}
              change="+3"
              changeType="negative"
              icon={Shield}
            />
            <MetricsCard
              title="System Uptime"
              value={`${metrics?.uptime || 0}%`}
              change="+0.1%"
              changeType="positive"
              icon={Server}
            />
            <MetricsCard
              title="Failed Logins"
              value={metrics?.failedLogins || "0"}
              change="+7"
              changeType="negative"
              icon={UserX}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* System Performance Chart */}
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">System Performance</h3>
              <Select value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SystemPerformanceChart timeframe={timeframe} />
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <SecurityAlerts />
      </div>

      {/* Activity Log Table */}
      <ActivityLogTable />
    </main>
  );
}
