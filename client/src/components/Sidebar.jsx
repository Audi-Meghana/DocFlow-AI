import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  FileText,
  LogOut,
  // eslint-disable-next-line no-unused-vars
  Sparkles,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

export default function Sidebar({ logout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <aside className="flex h-full w-64 shrink-0 flex-col justify-between bg-white p-6 font-body text-[#191B2E]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {/* Top Section: Brand & Nav Links */}
      <div className="space-y-8">
        
        {/* Logo / Brand Header */}
        <div 
          onClick={() => handleNavClick("/")} 
          className="group flex cursor-pointer items-center justify-between px-2 pt-2"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#191B2E] text-white shadow-md transition group-hover:scale-105">
              <FileText size={18} />
            </div>
            <span className="font-display text-2xl font-semibold tracking-tight text-[#191B2E]">
              DocFlow
            </span>
          </div>
          <span className="font-label rounded-md bg-[#453AA4]/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[#453AA4]">
            v1.0
          </span>
        </div>

        {/* Navigation Group */}
        <nav className="space-y-1.5">
          <p className="font-label mb-3 px-3 text-[10px] uppercase tracking-widest text-[#8A8D9F]">
            Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.path)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#191B2E] text-white shadow-md shadow-[#191B2E]/10"
                    : "text-[#5B5E70] hover:bg-[#F5F6F8] hover:text-[#191B2E]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-white" : "text-[#8A8D9F] group-hover:text-[#191B2E]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FFCB47]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Badge & Logout Button */}
      <div className="space-y-4 border-t border-[#191B2E]/[0.08] pt-5">
        
        {/* User Card */}
        {user.email && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#F5F6F8] p-3 border border-[#191B2E]/[0.05]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#453AA4] text-xs font-semibold text-white">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#191B2E]">
                {user.name || "Active Workspace"}
              </p>
              <p className="truncate text-[11px] text-[#8A8D9F]">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => {
            setMobileOpen(false);
            logout();
          }}
          className="group flex w-full items-center justify-between rounded-xl border border-[#E8664A]/20 bg-[#E8664A]/[0.06] px-3.5 py-2.5 text-xs font-medium text-[#E8664A] transition hover:bg-[#E8664A] hover:text-white"
        >
          <div className="flex items-center gap-2.5">
            <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Sign Out</span>
          </div>
          <ChevronRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
        </button>

      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#191B2E]/[0.08] bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#191B2E] text-white">
            <FileText size={16} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-[#191B2E]">
            DocFlow
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border border-[#191B2E]/10 p-2 text-[#191B2E] hover:bg-[#F5F6F8]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#191B2E]/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Slide-out Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        {sidebarContent}
      </div>

      {/* Desktop Sticky Sidebar */}
      <div className="hidden sticky top-0 h-screen border-r border-[#191B2E]/[0.08] shadow-sm md:block">
        {sidebarContent}
      </div>
    </>
  );
}