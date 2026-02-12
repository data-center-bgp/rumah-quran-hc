import {
  Home,
  LogOut,
  X,
  ChevronLeft,
  Building2,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import iconHc from "@/assets/icon-hc.jpg";
import supabase from "../utils/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onLogout: () => void;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  isMobile?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  onLogout,
  userEmail,
  userName,
  userRole,
  isMobile = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const allMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    {
      id: "rumah-quran",
      label: "Rumah Quran",
      icon: Building2,
      masterOnly: true,
    },
    { id: "work-program", label: "Work Program", icon: ClipboardList },
    { id: "santri", label: "Santri", icon: GraduationCap },
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.masterOnly || userRole === "MASTER",
  );

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const NavButton = ({ item }: { item: (typeof menuItems)[0] }) => {
    const Icon = item.icon;
    const isActive = activeMenu === item.id;

    const button = (
      <button
        onClick={() => handleMenuClick(item.id)}
        className={cn(
          "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          collapsed && !isMobile && "justify-center px-2",
          isActive
            ? "bg-yellow-50 text-yellow-700 shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        )}
      >
        <Icon
          className={cn("h-5 w-5 shrink-0", isActive && "text-yellow-600")}
        />
        {(!collapsed || isMobile) && <span>{item.label}</span>}
      </button>
    );

    if (collapsed && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col bg-white transition-all duration-300",
          isMobile
            ? "fixed inset-y-0 left-0 z-50 w-64 shadow-xl"
            : "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 border-r border-gray-200 overflow-y-auto",
          !isMobile && (collapsed ? "lg:w-[70px]" : "lg:w-64"),
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-gray-200 shrink-0",
            collapsed && !isMobile
              ? "justify-center px-2"
              : "justify-between px-4",
          )}
        >
          <div
            className={cn(
              "flex items-center",
              collapsed && !isMobile ? "" : "gap-3",
            )}
          >
            {collapsed && !isMobile && onToggleCollapse ? (
              <button
                onClick={onToggleCollapse}
                className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all"
              >
                <img src={iconHc} alt="HC" className="h-9 w-9 object-cover" />
              </button>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden shadow-sm">
                <img src={iconHc} alt="HC" className="h-9 w-9 object-cover" />
              </div>
            )}
            {(!collapsed || isMobile) && (
              <span className="text-lg font-bold text-gray-800">
                Rumah Quran
              </span>
            )}
          </div>
          {!collapsed && !isMobile && onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="mt-auto">
          <Separator />
          <div className="p-3">
            {isMobile ? (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            ) : collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="w-full text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-sm font-semibold">
                      {(userName || userEmail)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {userName || userEmail}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
