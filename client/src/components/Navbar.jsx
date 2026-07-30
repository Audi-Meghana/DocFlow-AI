import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  FileText,
  User,
  LayoutDashboard,
  Edit3,
  LogOut,
  Sparkles,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

export default function Navbar({
  mobileMenu,
  setMobileMenu,
  setShowLogin,
  setShowRegister,
  user, // Pass the user object if logged in (or retrieve from state/localStorage)
  onLogout, // Pass your logout handler function
}) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fallback to check localStorage if user prop isn't passed directly
  const currentUser =
    user || JSON.parse(localStorage.getItem("user") || "null");

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setProfileOpen(false);
    setMobileMenu(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#191B2E]/[0.08] bg-white/80 backdrop-blur-md font-body text-[#191B2E]">
      {/* Top Gradient Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#453AA4] via-[#6B5BEE] via-[#FFCB47] to-[#E8664A]" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#453AA4] to-[#E8664A] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <FileText size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-[#191B2E]">
              DocFlow <span className="text-[#453AA4] font-label text-xs uppercase tracking-widest font-semibold">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-xs font-medium text-[#5B5E70] transition hover:text-[#453AA4]"
          >
            Features
          </a>

          <a
            href="#about"
            className="text-xs font-medium text-[#5B5E70] transition hover:text-[#453AA4]"
          >
            About
          </a>

          {/* Conditional Auth Rendering */}
          {currentUser ? (
            /* Logged In: Creative Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2.5 rounded-full border p-1 pr-3 transition-all duration-200 ${
                  profileOpen
                    ? "border-[#453AA4] bg-[#453AA4]/5 shadow-sm"
                    : "border-[#191B2E]/15 bg-white hover:border-[#453AA4]/40 hover:bg-[#F8F9FB]"
                }`}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[#453AA4]/20"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#453AA4] to-[#6B5BEE] text-xs font-bold text-white shadow-xs">
                    {(currentUser.name || currentUser.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#191B2E] max-w-[100px] truncate">
                  {currentUser.name || "My Account"}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-[#8A8D9F] transition-transform duration-200 ${
                    profileOpen ? "rotate-180 text-[#453AA4]" : ""
                  }`}
                />
              </button>

              {/* Creative Dropdown Popup Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-[#191B2E]/10 bg-white/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  
                  {/* User Header Info Card */}
                  <div className="mb-1.5 rounded-xl bg-gradient-to-br from-[#FAFBFD] to-[#F4F5F9] p-3 border border-[#191B2E]/[0.05]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#453AA4]/10 text-[#453AA4]">
                        <User size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#191B2E]">
                          {currentUser.name || "Active User"}
                        </p>
                        <p className="truncate text-[10px] text-[#8A8D9F]">
                          {currentUser.email || "user@docflow.ai"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[9px] font-label text-[#453AA4]">
                      <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#191B2E]/5">
                        <ShieldCheck size={10} className="text-[#10B981]" /> Pro Plan
                      </span>
                      <span className="text-[#8A8D9F]">Workspace Active</span>
                    </div>
                  </div>

                  <div className="h-px bg-[#191B2E]/10 my-1" />

                  {/* Options */}
                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/dashboard");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#191B2E] transition hover:bg-[#453AA4]/10 hover:text-[#453AA4]"
                    >
                      <LayoutDashboard size={14} className="text-[#453AA4]" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/editor");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#191B2E] transition hover:bg-[#453AA4]/10 hover:text-[#453AA4]"
                    >
                      <Edit3 size={14} className="text-[#E8664A]" />
                      <span>Open Canvas Editor</span>
                    </button>
                  </div>

                  <div className="h-px bg-[#191B2E]/10 my-1" />

                  <button
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#E8664A] transition hover:bg-[#E8664A]/10"
                  >
                    <LogOut size={14} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out State */
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="text-xs font-medium text-[#191B2E] transition hover:text-[#453AA4]"
              >
                Login
              </button>

              <button
                onClick={() => setShowRegister(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#191B2E] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#2A2D45] active:scale-95"
              >
                <Sparkles size={12} className="text-[#FFCB47]" />
                <span>Get Started</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#191B2E]/10 bg-white text-[#191B2E] md:hidden"
        >
          {mobileMenu ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenu && (
        <div className="border-t border-[#191B2E]/10 bg-white p-5 md:hidden space-y-3 animate-in slide-in-from-top-2 duration-150">
          <a
            href="#features"
            onClick={() => setMobileMenu(false)}
            className="block text-xs font-medium text-[#5B5E70] hover:text-[#191B2E]"
          >
            Features
          </a>

          <a
            href="#about"
            onClick={() => setMobileMenu(false)}
            className="block text-xs font-medium text-[#5B5E70] hover:text-[#191B2E]"
          >
            About
          </a>

          <div className="h-px bg-[#191B2E]/10 my-2" />

          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAFBFD] border border-[#191B2E]/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#453AA4] text-xs font-bold text-white">
                  {(currentUser.name || currentUser.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#191B2E]">
                    {currentUser.name || "User"}
                  </p>
                  <p className="truncate text-[10px] text-[#8A8D9F]">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenu(false);
                  navigate("/dashboard");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#191B2E]/15 py-2.5 text-xs font-medium text-[#191B2E]"
              >
                <LayoutDashboard size={14} className="text-[#453AA4]" />
                Dashboard
              </button>

              <button
                onClick={() => {
                  setMobileMenu(false);
                  navigate("/editor");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#453AA4] py-2.5 text-xs font-medium text-white shadow-xs"
              >
                <Edit3 size={14} />
                Open Canvas Editor
              </button>

              <button
                onClick={handleLogoutClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8664A]/10 py-2.5 text-xs font-medium text-[#E8664A]"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setMobileMenu(false);
                  setShowLogin(true);
                }}
                className="w-full rounded-xl border border-[#191B2E]/15 py-2.5 text-xs font-medium text-[#191B2E]"
              >
                Login
              </button>

              <button
                onClick={() => {
                  setMobileMenu(false);
                  setShowRegister(true);
                }}
                className="w-full rounded-xl bg-[#191B2E] py-2.5 text-xs font-medium text-white"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}