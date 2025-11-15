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
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Minimalist Glassy Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen backdrop-blur-xl transition-all duration-500 z-40",
          "border-r border-white/[0.06]",
          collapsed ? "w-20" : "w-64"
        )}
        style={{
          background: 'rgba(50, 50, 50, 0.3)',
        }}
      >
        {/* Minimalist Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/[0.06] relative">
          {!collapsed && (
            <h1 className="text-2xl font-light tracking-wider text-white/90">
              PROXITY
            </h1>
          )}
          {collapsed && (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(13, 115, 119, 0.15)',
                border: '1px solid rgba(13, 115, 119, 0.3)',
              }}
            >
              <span className="text-primary font-medium text-lg">P</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full glass-button flex items-center justify-center hover:scale-110 transition-all duration-300"
            style={{
              background: 'rgba(13, 115, 119, 0.2)',
              border: '1px solid rgba(13, 115, 119, 0.3)',
            }}
          >
            {collapsed ?
              <ChevronRight className="h-3.5 w-3.5 text-primary" /> :
              <ChevronLeft className="h-3.5 w-3.5 text-primary" />
            }
          </button>
        </div>

        {/* Minimalist Navigation */}
        <nav className="p-4 space-y-1.5 mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                  "text-white/60 hover:text-white/90 hover:bg-white/[0.03]",
                  "group relative"
                )}
                activeClassName="text-accent bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(13,115,119,0.15)]"
              >
                <Icon className="h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110" />
                {!collapsed && (
                  <span className="font-normal text-sm tracking-wide">{item.name}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 rounded-lg glass-card opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 whitespace-nowrap">
                    <span className="text-sm text-white/90">{item.name}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 transition-all duration-500",
        collapsed ? "ml-20" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
