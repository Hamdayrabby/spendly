import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Target, 
  LogOut, 
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";

export function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
    { name: "Budgets", path: "/budgets", icon: Wallet },
    { name: "Goals", path: "/goals", icon: Target },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border/50 bg-card/30 flex flex-col justify-between hidden md:flex z-10 relative">
        {/* Subtle decorative glow */}
        <div 
          className="absolute top-0 left-0 w-full h-32 -z-10" 
          style={{ background: 'radial-gradient(ellipse at top left, hsl(var(--primary) / 0.1) 0%, transparent 70%)' }}
        />
        
        <div>
          <div className="h-16 flex items-center px-6 border-b border-border/50">
            <Logo href="/dashboard" />
          </div>

          <nav className="p-4 space-y-1 mt-4">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all relative ${
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border/50 space-y-1">
          <div className="px-3 py-2 mb-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm border border-primary/30">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          
          <Link 
            to="/settings"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        
        {/* Mobile Header */}
        <header className="h-14 flex md:hidden items-center justify-between px-4 border-b border-border/50 bg-card/30 z-20">
          <Logo href="/dashboard" size="sm" />
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </header>

        {/* Dynamic Page Content — extra bottom padding on mobile for the fixed nav */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 relative z-10">
          <Outlet />
        </div>
        
        {/* Subtle global background glow to maintain dark theme aesthetic */}
        <div 
          className="fixed bottom-0 right-0 w-[800px] h-[800px] pointer-events-none -z-10" 
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)' }}
        />

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 flex md:hidden items-center justify-around z-30">
          {[...navItems, { name: "Settings", path: "/settings", icon: Settings }].map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
