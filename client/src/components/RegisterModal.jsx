import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  User,
  Mail,
  Lock,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);

  const handleChange = (e) => {
    if (authStatus) setAuthStatus(null);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthStatus(null);

    try {
      setLoading(true);
      const res = await api.post("/auth/register", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setAuthStatus({
        type: "success",
        message: "Account created! Preparing workspace...",
      });
      toast.success("Account created!");

      setTimeout(() => {
        onClose();
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed.";
      setAuthStatus({ type: "error", message: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setAuthStatus(null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 font-body" onClose={handleModalClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#191B2E]/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <Dialog.Panel className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-5 shadow-xl border border-[#191B2E]/10">
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#453AA4] via-[#6B5BEE] via-[#FFCB47] to-[#E8664A]" />

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#453AA4] to-[#E8664A] text-white shadow-xs">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[#191B2E]">Create Account</h2>
                    <p className="text-[10px] text-[#5B5E70]">Join DocFlow AI workspace</p>
                  </div>
                </div>
                <button
                  onClick={handleModalClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#8A8D9F] transition-colors hover:bg-[#191B2E]/5 hover:text-[#191B2E]"
                >
                  <X size={16} />
                </button>
              </div>

              {authStatus && (
                <div
                  className={`mb-3 flex items-center gap-2 rounded-lg p-2.5 text-[11px] font-medium animate-in fade-in slide-in-from-top-1 duration-150 ${
                    authStatus.type === "error"
                      ? "border border-[#E8664A]/30 bg-[#E8664A]/10 text-[#E8664A]"
                      : "border border-[#10B981]/30 bg-[#10B981]/10 text-[#059669]"
                  }`}
                >
                  {authStatus.type === "error" ? (
                    <AlertCircle size={14} className="shrink-0" />
                  ) : (
                    <CheckCircle2 size={14} className="shrink-0" />
                  )}
                  <span>{authStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#191B2E]">
                    Full Name
                  </label>
                  <div className="group relative flex items-center rounded-lg border border-[#191B2E]/15 bg-[#FAFBFD] focus-within:border-[#453AA4] focus-within:bg-white">
                    <User className="absolute left-2.5 text-[#8A8D9F] group-focus-within:text-[#453AA4]" size={14} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Alex Morgan"
                      className="w-full bg-transparent py-1.5 pl-8 pr-3 text-xs text-[#191B2E] outline-none placeholder:text-[#8A8D9F]"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#191B2E]">
                    Email Address
                  </label>
                  <div className="group relative flex items-center rounded-lg border border-[#191B2E]/15 bg-[#FAFBFD] focus-within:border-[#453AA4] focus-within:bg-white">
                    <Mail className="absolute left-2.5 text-[#8A8D9F] group-focus-within:text-[#453AA4]" size={14} />
                    <input
                      type="email"
                      name="email"
                      placeholder="alex@company.com"
                      className="w-full bg-transparent py-1.5 pl-8 pr-3 text-xs text-[#191B2E] outline-none placeholder:text-[#8A8D9F]"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#191B2E]">
                    Password
                  </label>
                  <div className="group relative flex items-center rounded-lg border border-[#191B2E]/15 bg-[#FAFBFD] focus-within:border-[#453AA4] focus-within:bg-white">
                    <Lock className="absolute left-2.5 text-[#8A8D9F] group-focus-within:text-[#453AA4]" size={14} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      className="w-full bg-transparent py-1.5 pl-8 pr-8 text-xs text-[#191B2E] outline-none placeholder:text-[#8A8D9F]"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-[#8A8D9F] hover:text-[#191B2E]"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#191B2E] py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#2A2D45] active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[#FFCB47]" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>Get Started</span>
                      <ArrowRight size={13} />
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-3 border-t border-[#191B2E]/5 pt-2.5 text-center text-[11px] text-[#5B5E70]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    handleModalClose();
                    onSwitchToLogin();
                  }}
                  className="font-bold text-[#453AA4] hover:underline"
                >
                  Log in
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}