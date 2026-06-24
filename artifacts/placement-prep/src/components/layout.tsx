import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Compass, LayoutDashboard, Code2, Map as MapIcon, UserCircle, LogOut } from "lucide-react";
import { useProfileStore } from "@/lib/profile-store";

export function Layout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { clearProfile } = useProfileStore();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Skills", href: "/skills", icon: Code2 },
    { name: "Roadmap", href: "/roadmap", icon: MapIcon },
    { name: "Profile", href: "/profile", icon: UserCircle },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col fixed inset-y-0 left-0 border-r border-sidebar-border z-10">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border gap-2">
          <Compass className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-lg tracking-tight">PlacementPulse</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <button 
            onClick={() => {
              clearProfile();
              setLocation("/");
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
