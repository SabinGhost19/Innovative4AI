import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
};

const navigationItems = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { name: "Reports", path: "/dashboard/reports", icon: FileText },
  { name: "Competitors", path: "/dashboard/competitors", icon: Users },
];

const DashboardLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen glass-card border-r border-border/50 transition-all duration-300 z-40",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-border/50 relative">
          {!collapsed && (
            <h1 className="text-2xl font-bold gradient-text">Sim-E</h1>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center hover:scale-110 transition-transform"
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-primary/10 text-muted-foreground"
                activeClassName="bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border border-primary/30 shadow-lg"
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "ml-20" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
