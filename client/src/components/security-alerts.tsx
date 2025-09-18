import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { getAuthToken } from "@/lib/auth-utils";
import { type SecurityEvent } from "@shared/schema";

export function SecurityAlerts() {
  const { data: alerts, isLoading } = useQuery<SecurityEvent[]>({
    queryKey: ["/api/security-events"],
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch("/api/security-events?limit=5", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch security events");
      return response.json();
    },
  });

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      default:
        return Shield;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "warning":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "info":
        return "bg-primary/10 border-primary/20 text-primary";
      default:
        return "bg-accent/10 border-accent/20 text-accent";
    }
  };

  const formatTimeAgo = (timestamp: string | Date) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Security Alerts</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Security Alerts</h3>
          <Button variant="link" className="text-sm text-primary hover:underline p-0">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => {
              const Icon = getAlertIcon(alert.severity);
              const colorClass = getAlertColor(alert.severity);
              
              return (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${colorClass}`}
                  data-testid={`alert-${alert.id}`}
                >
                  <Icon className="w-4 h-4 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {alert.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.ipAddress && `IP: ${alert.ipAddress} - `}
                      {alert.timestamp && formatTimeAgo(alert.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No security alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
