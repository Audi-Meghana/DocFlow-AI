import { Link } from "react-router-dom";
import { Sparkles, FileText, Layers, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#191B2E] text-white font-body">
      {/* Decorative Gradient Line Top Border */}
      <div className="h-1 w-full bg-gradient-to-r from-[#453AA4] via-[#6B5BEE] via-[#FFCB47] to-[#E8664A]" />

      {/* Subtle Background Mesh Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#453AA4]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#E8664A]/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-8">
        <div className="grid gap-10 md:grid-cols-4">
          
          {/* Brand & Abstract */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#453AA4] to-[#E8664A] text-white shadow-md">
                <FileText size={16} />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-white">
                DocFlow <span className="text-[#FFCB47] text-sm font-label uppercase tracking-widest">AI</span>
              </h2>
            </div>

            <p className="text-xs leading-relaxed text-[#8A8D9F]">
              A modern, creative workspace for real-time collaborative document crafting and smart note-taking.
            </p>

            <div className="pt-1 flex items-center gap-2 text-[10px] font-label text-[#453AA4] bg-[#453AA4]/15 px-2.5 py-1 rounded-full w-fit">
              <Sparkles size={11} className="text-[#FFCB47]" />
              <span>Smart Document Engine</span>
            </div>
          </div>

          {/* Core App Navigation */}
          <div>
            <h3 className="font-label text-[11px] uppercase tracking-wider text-[#FFCB47] font-semibold mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-[#8A8D9F]">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/editor" className="hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  Document Canvas
                </Link>
              </li>
              <li>
                <span className="cursor-default hover:text-white transition-colors duration-150">
                  Sharing & Collaboration
                </span>
              </li>
            </ul>
          </div>

          {/* Built With / Tech Stack */}
          <div>
            <h3 className="font-label text-[11px] uppercase tracking-wider text-[#FFCB47] font-semibold mb-3">
              Tech Stack
            </h3>
            <ul className="space-y-2 text-xs text-[#8A8D9F]">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#453AA4]" />
                React & TipTap Editor
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8664A]" />
                Express & Node Backend
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFCB47]" />
                MongoDB Storage
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                Tailwind CSS
              </li>
            </ul>
          </div>

          {/* Quick Info & Security */}
          <div>
            <h3 className="font-label text-[11px] uppercase tracking-wider text-[#FFCB47] font-semibold mb-3">
              Security
            </h3>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8A8D9F]">
                <ShieldCheck size={14} className="text-[#10B981] shrink-0" />
                <span>Encrypted storage & shared link access control</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8A8D9F]">
                <Layers size={14} className="text-[#453AA4] shrink-0" />
                <span>Multi-format doc parser</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-label text-[#8A8D9F]">
          <div>
            © 2026 DocFlow AI • Crafted for seamless productivity
          </div>

          <div className="flex items-center gap-1 text-[10px]">
            <span>Designed with</span>
            <Heart size={10} className="text-[#E8664A] fill-[#E8664A]" />
            <span>for creative editing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}