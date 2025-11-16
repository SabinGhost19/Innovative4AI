import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  History
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  strategyPanel?: ReactNode;
};

const navigationItems = [
  { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { name: "Reports", path: "/dashboard/reports", icon: FileText },
  { name: "Competitors", path: "/dashboard/competitors", icon: Users },
  { name: "Time Travel", path: "/dashboard/revert", icon: History },
];

const DashboardLayout = ({ children, strategyPanel }: Props) => {
  const [collapsed, setCollapsed] = useState(true);
  const [strategyOpen, setStrategyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black flex relative">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10"
        style={{ filter: "blur(3px) brightness(0.5)" }}
      >
        <source src="/bg_video.mp4" type="video/mp4" />
      </video>

      {/* Minimalist Glassy Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen backdrop-blur-xl transition-all duration-500 z-40",
          "border-r border-white/10",
          collapsed ? "w-20" : "w-64"
        )}
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Minimalist Logo */}
        <div className="h-20 flex items-center justify-center border-b border-white/10 relative">
          {!collapsed && (
            <h1 className="text-2xl font-light tracking-wider text-primary glow-text">
              PROXITY
            </h1>
          )}
          {collapsed && (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl bg-primary/10 border border-primary/20">
              <span className="text-primary font-medium text-lg">P</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full backdrop-blur-xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:scale-110 hover:bg-primary/20 transition-all duration-300"
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
                  "text-white/60 hover:text-white hover:bg-white/5",
                  "group relative"
                )}
                activeClassName="text-primary bg-primary/10 border border-primary/20 glow-sm"
              >
                <Icon className="h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110" />
                {!collapsed && (
                  <span className="font-normal text-sm tracking-wide">{item.name}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 rounded-lg backdrop-blur-xl bg-black/80 border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 whitespace-nowrap">
                    <span className="text-sm text-white">{item.name}</span>
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

      {/* Floating Strategy Button */}
      {strategyPanel && (
        <button
          onClick={() => setStrategyOpen(true)}
          className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent backdrop-blur-xl border-2 border-primary/50 shadow-lg shadow-primary/25 hover:shadow-primary/50 hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center group"
        >
          <Settings className="h-6 w-6 text-black group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Strategy Drawer Overlay */}
      {strategyOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setStrategyOpen(false)}
        />
      )}

      {/* Strategy Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-96 backdrop-blur-xl bg-black/40 border-l border-white/10 z-50 transition-transform duration-500 ease-out overflow-y-auto",
          strategyOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 p-4 border-b border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white glow-text">Strategy Options</h2>
                <p className="text-xs text-white/50">Configure your business</p>
              </div>
            </div>
            <button
              onClick={() => setStrategyOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-4">
          {strategyPanel}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
