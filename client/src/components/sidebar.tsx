import { LayoutDashboard, Users, Activity, AlertTriangle, Settings } from "lucide-react";
import { useLocation } from "wouter";

const navigationItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    active: true,
    enabled: true,
  },
  {
    name: "User Management",
    icon: Users,
    href: "/users",
    active: false,
    enabled: true,
  },
  {
    name: "Activity Logs",
    icon: Activity,
    href: "/activity",
    active: false,
    enabled: true,
  },
  {
    name: "Security Alerts",
    icon: AlertTriangle,
    href: "/alerts",
    active: false,
    enabled: true,
  },
  {
    name: "System Settings",
    icon: Settings,
    href: "/settings",
    active: false,
    enabled: true,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.name}>
              {item.enabled ? (
                <a
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    (location === item.href || (location === "/" && item.href === "/"))
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className={(location === item.href || (location === "/" && item.href === "/")) ? "font-medium" : ""}>{item.name}</span>
                </a>
              ) : (
                <div
                  className="flex items-center justify-between space-x-3 px-3 py-2 rounded-md cursor-not-allowed opacity-50"
                  data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Soon</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
