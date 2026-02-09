import { useState } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import supabase from "../utils/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardProps {
  userEmail?: string;
  userName?: string;
}

export default function Dashboard({ userEmail, userName }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path.startsWith("/rumah-quran")) return "rumah-quran";
    if (path.startsWith("/work-program")) return "work-program";
    if (path.startsWith("/settings")) return "settings";
    return "dashboard";
  };

  const activeMenu = getActiveMenu();

  const getPageTitle = (menu: string) => {
    return menu
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleMenuChange = (menu: string) => {
    navigate(`/${menu === "dashboard" ? "" : menu}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar - Desktop */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={handleMenuChange}
        onLogout={handleLogout}
        userEmail={userEmail}
        userName={userName}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar
            activeMenu={activeMenu}
            setActiveMenu={handleMenuChange}
            onLogout={handleLogout}
            userEmail={userEmail}
            userName={userName}
            isMobile={true}
            onClose={() => setSidebarOpen(false)}
          />
        </>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-64",
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-lg font-semibold text-gray-800">
            {getPageTitle(activeMenu)}
          </h1>

          <div className="ml-auto flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-56 h-8 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Notification */}
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            {/* User Avatar */}
            <Avatar className="hidden lg:flex h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-xs font-semibold">
                {userEmail?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
