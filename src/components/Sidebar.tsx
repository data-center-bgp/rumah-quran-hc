import {
  Home,
  BookOpen,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  ClipboardList,
} from "lucide-react";
import supabase from "../utils/supabase";

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onLogout: () => void;
  userEmail?: string;
  userName?: string;
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
  isMobile = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "rumah-quran", label: "Rumah Quran", icon: Building2 },
    { id: "work-program", label: "Work Program", icon: ClipboardList },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`transition-all duration-300 ${
        isMobile
          ? "fixed inset-y-0 left-0 w-64 bg-white z-50"
          : `hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 ${collapsed ? "lg:w-20" : "lg:w-64"} bg-white border-r border-gray-200 overflow-y-auto`
      }`}
    >
      {/* Logo */}
      <div
        className={`h-16 flex items-center border-b border-gray-200 ${
          collapsed && !isMobile
            ? "justify-center px-2"
            : "justify-between px-6"
        }`}
      >
        <div
          className={`flex items-center ${collapsed && !isMobile ? "" : "space-x-3"}`}
        >
          {collapsed && !isMobile && onToggleCollapse ? (
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-lg flex items-center justify-center transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          )}
          {(!collapsed || isMobile) && (
            <span className="text-xl font-bold text-gray-800">Rumah Quran</span>
          )}
        </div>
        {!collapsed && !isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center ${collapsed && !isMobile ? "justify-center" : "space-x-3"} px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-yellow-50 text-yellow-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed && !isMobile ? item.label : ""}
            >
              <Icon className="w-5 h-5" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {isMobile ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        ) : collapsed ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <>
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg mb-2">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {(userName || userEmail)?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {userName || userEmail}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
