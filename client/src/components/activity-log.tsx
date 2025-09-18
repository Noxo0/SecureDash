import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { getAuthToken } from "@/lib/auth-utils";
import { type ActivityLog } from "@shared/schema";

export function ActivityLogTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: logs, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch("/api/activity-logs?limit=20", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch activity logs");
      return response.json();
    },
  });

  const filteredLogs = logs?.filter(log => 
    log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.ipAddress && log.ipAddress.includes(searchTerm))
  ) || [];

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "success") {
      return (
        <Badge className="bg-accent/20 text-accent hover:bg-accent/30">
          Success
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">
          Failed
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              data-testid="input-activity-search"
            />
            <Button variant="secondary" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP Address</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/50 transition-colors" data-testid={`log-row-${log.id}`}>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {log.timestamp ? formatTimestamp(log.timestamp) : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {log.username}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {log.ipAddress || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No matching activities found" : "No activity logs available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
