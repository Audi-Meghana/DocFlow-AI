/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
  UploadCloud,
  Share2,
  CheckCircle2,
  Zap,
  MousePointer2,
  Layers,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFD] font-body text-[#191B2E] selection:bg-[#453AA4]/15 selection:text-[#453AA4] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'IBM Plex Mono', monospace; }

        @keyframes blink-caret { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes float-badge { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes soft-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.92); } }
        
        .hero-grid-pattern {
          background-size: 32px 32px;
          background-image: radial-gradient(circle, rgba(25, 27, 46, 0.05) 1px, transparent 1px);
        }

        .caret { animation: blink-caret 1.1s step-end infinite; }
        .badge-float-1 { animation: float-badge 4.5s ease-in-out infinite; }
        .badge-float-2 { animation: float-badge 5.2s ease-in-out infinite 0.7s; }
        .pulse-dot { animation: soft-pulse 2s ease-in-out infinite; }

        .load-in { opacity: 0; transform: translateY(14px); transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .load-in.in { opacity: 1; transform: translateY(0); }

        .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          .caret, .badge-float-1, .badge-float-2, .pulse-dot { animation: none; }
          .load-in, .reveal { transition: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* Navbar */}
      <Navbar
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        setShowLogin={setShowLogin}
        setShowRegister={setShowRegister}
      />

      {/* ------------------------------------------------------------ */}
      {/* Hero Section — Tighter Spacing & Dynamic Layout               */}
      {/* ------------------------------------------------------------ */}
      <section className="relative hero-grid-pattern mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-16 lg:px-8 lg:pt-8 lg:pb-20">
        
        {/* Glow Spheres */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#453AA4]/15 via-[#FFCB47]/15 to-transparent blur-3xl sm:h-[400px] sm:w-[400px]" />

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          
          {/* Left Text */}
          <div className={`load-in ${loaded ? "in" : ""} flex-1 text-center lg:pt-4 lg:text-left`}>
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#453AA4]/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#453AA4] shadow-sm backdrop-blur-md">
              <span className="pulse-dot h-2 w-2 rounded-full bg-[#3E8E5B]" />
              <span className="font-label uppercase tracking-wider text-[11px]">DocFlow v2.0 Live</span>
              <span className="text-[#191B2E]/20">&middot;</span>
              <span className="text-[#5B5E70]">Collaborative Workspace</span>
            </div>

            <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.08] text-[#191B2E] sm:text-5xl md:text-6xl lg:text-[3.8rem]">
              Every document, <br />
              written{" "}
              <span className="relative inline-block italic text-[#453AA4]">
                together.
                <svg className="absolute -bottom-1 left-0 w-full text-[#FFCB47]" viewBox="0 0 100 12" fill="none">
                  <path d="M0,9 Q50,1 100,9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#5B5E70] sm:text-lg lg:mx-0">
              Draft, review, and collaborate on rich documents in real time. Bring in Markdown or Word files, manage granular team access, and never lose track of updates.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start gap-3">
              <button
                onClick={() => setShowRegister(true)}
                className="group flex items-center justify-center gap-2 rounded-xl bg-[#191B2E] px-6 py-3.5 font-medium text-white shadow-md transition-all duration-200 hover:bg-[#2A2D45] hover:shadow-lg active:scale-[0.98]"
              >
                Start writing free
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center justify-center rounded-xl border border-[#191B2E]/15 bg-white/70 backdrop-blur-sm px-6 py-3.5 font-medium text-[#191B2E] transition-all duration-200 hover:border-[#191B2E]/30 hover:bg-white active:scale-[0.98]"
              >
                Sign in to workspace
              </button>
            </div>

            {/* Micro Feature Highlights */}
            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-[#8A8D9F] font-label">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#3E8E5B]" /> Free during beta
              </span>
              <span>&middot;</span>
              <span className="flex items-center gap-1.5">
                <Zap size={13} className="text-[#FFCB47]" /> No setup needed
              </span>
            </div>
          </div>

          {/* Right — Layered Live Mockup */}
          <div
            className={`load-in ${loaded ? "in" : ""} relative flex flex-1 justify-center w-full max-w-md lg:max-w-none lg:pt-2`}
            style={{ transitionDelay: "120ms" }}
          >
            <div className="relative w-full max-w-lg">
              
              {/* Backing Card Layer (Depth Effect) */}
              <div className="absolute -inset-1.5 rotate-2 rounded-3xl bg-gradient-to-tr from-[#453AA4]/20 via-transparent to-[#FFCB47]/30 blur-lg opacity-70" />
              <div className="absolute -bottom-3 left-4 right-4 h-full rounded-2xl border border-[#191B2E]/5 bg-white/40 shadow-sm" />

              {/* Main Document Mockup */}
              <div className="relative rounded-2xl border border-[#191B2E]/[0.08] bg-white p-5 sm:p-6 shadow-[0_20px_40px_-15px_rgba(25,27,46,0.15)]">
                
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-[#191B2E]/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#453AA4]/10 text-[#453AA4]">
                      <FileText size={15} />
                    </span>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-[#191B2E]">
                        Q3 Product Roadmap.docx
                      </h3>
                      <p className="font-label text-[10px] text-[#8A8D9F]">Saved to Cloud &middot; 4 active</p>
                    </div>
                  </div>
                  <span className="font-label rounded-md bg-[#3E8E5B]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3E8E5B]">
                    AUTOSAVED
                  </span>
                </div>

                {/* Simulated Floating Tool Palette */}
                <div className="mb-4 flex items-center justify-between rounded-lg bg-[#FAFBFD] px-3 py-1.5 border border-[#191B2E]/5 text-[11px] text-[#5B5E70] font-label">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#191B2E]">B</span>
                    <span className="italic">I</span>
                    <span className="underline">U</span>
                    <span className="h-3 w-[1px] bg-[#191B2E]/10" />
                    <span className="text-[#453AA4] font-semibold">Heading 1</span>
                  </div>
                  <span className="text-[10px] text-[#8A8D9F]">1,240 words</span>
                </div>

                {/* Content Area */}
                <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed text-[#3A3C4E]">
                  <p className="font-display text-sm font-semibold text-[#191B2E]">
                    1. Executive Summary
                  </p>
                  <p className="relative">
                    Our focus for Q3 is launching the live editor to open beta. High priority items include{" "}
                    <span className="rounded bg-[#FFCB47]/40 px-1 py-0.5 font-medium text-[#191B2E]">
                      multi-user cursor tracking
                    </span>{" "}
                    and real-time socket connections.
                    <span className="caret ml-0.5 inline-block h-3.5 w-[2px] bg-[#453AA4] align-middle" />
                  </p>

                  <div className="mt-3 rounded-lg bg-[#F5F6F8] p-2.5 text-[11px] text-[#5B5E70]">
                    <p className="font-medium text-[#191B2E] mb-1">Key Milestones:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>JWT Auth Guard &amp; Session Context</li>
                      <li>File imports (.md, .docx, .txt)</li>
                    </ul>
                  </div>
                </div>

                {/* Live Floating Cursor Badge 1 */}
                <div className="badge-float-1 absolute -right-3 top-10 sm:-right-5 flex items-center gap-1.5 rounded-full border border-[#191B2E]/10 bg-white py-1 pl-1 pr-2.5 shadow-md">
                  <MousePointer2 size={12} className="text-[#453AA4] fill-[#453AA4]" />
                  <span className="text-[10px] font-semibold text-[#191B2E]">Priya</span>
                </div>

                {/* Live Floating Cursor Badge 2 */}
                <div className="badge-float-2 absolute -left-3 bottom-12 sm:-left-5 flex items-center gap-1.5 rounded-full border border-[#191B2E]/10 bg-white py-1 pl-1 pr-2.5 shadow-md">
                  <MousePointer2 size={12} className="text-[#E8664A] fill-[#E8664A]" />
                  <span className="text-[10px] font-semibold text-[#191B2E]">Sam</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Features Grid                                                */}
      {/* ------------------------------------------------------------ */}
      <section id="features" className="bg-white py-16 sm:py-20 border-t border-[#191B2E]/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="font-label text-xs uppercase tracking-[0.14em] text-[#453AA4] font-semibold">
              Features
            </span>
            <h2 className="font-display mt-2 text-3xl font-medium text-[#191B2E] sm:text-4xl">
              Engineered for seamless document creation
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal delay={0}>
              <FeatureCard
                icon={<FileText size={20} className="text-[#453AA4]" />}
                title="Rich Text Editor"
                desc="Bold, italic, headings, and lists — simple, intuitive formatting options."
              />
            </Reveal>
            <Reveal delay={80}>
              <FeatureCard
                icon={<UploadCloud size={20} className="text-[#3E8E5B]" />}
                title="Universal Import"
                desc="Import existing .txt, .md, or .docx files and edit without friction."
              />
            </Reveal>
            <Reveal delay={160}>
              <FeatureCard
                icon={<Share2 size={20} className="text-[#E8664A]" />}
                title="Controlled Sharing"
                desc="Manage access rights and view shared documents side by side."
              />
            </Reveal>
            <Reveal delay={240}>
              <FeatureCard
                icon={<ShieldCheck size={20} className="text-[#453AA4]" />}
                title="JWT Security"
                desc="Secure token authentication keeps all documents private and protected."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Stats Section                                                */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-[#191B2E] py-16 text-white">
        <Reveal className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 text-center md:grid-cols-4 sm:px-6">
          <Stat title="Real-time" subtitle="Collaborative Editing" />
          <Stat title="3 File Formats" subtitle="Import Ready" />
          <Stat title="Owned & Shared" subtitle="Access Visibility" />
          <Stat title="JWT Auth" subtitle="Protected Sessions" />
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* CTA Banner                                                   */}
      {/* ------------------------------------------------------------ */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-6">
        <Reveal className="mx-auto max-w-5xl rounded-3xl bg-[#453AA4] px-6 py-14 text-center text-white shadow-[0_25px_60px_-15px_rgba(69,58,164,0.4)] sm:px-12">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">
            Ready to write together?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-white/80">
            Create your first document in less than a minute. Free during open beta.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => setShowRegister(true)}
              className="rounded-xl bg-white px-8 py-3.5 font-semibold text-[#453AA4] shadow transition-all hover:bg-opacity-90 active:scale-[0.98]"
            >
              Get started free
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="rounded-xl border border-white/30 px-8 py-3.5 font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
            >
              Sign in
            </button>
          </div>
        </Reveal>
      </section>

      <Footer />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="h-full rounded-2xl border border-[#191B2E]/[0.07] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#453AA4]/30 hover:shadow-[0_15px_30px_-15px_rgba(25,27,46,0.15)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAFBFD] border border-[#191B2E]/5">
        {icon}
      </div>
      <h3 className="font-display text-base sm:text-lg font-semibold text-[#191B2E]">
        {title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#5B5E70]">{desc}</p>
    </div>
  );
}

function Stat({ title, subtitle }) {
  return (
    <div>
      <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h3>
      <p className="font-label mt-1 text-[11px] sm:text-xs uppercase tracking-[0.12em] text-white/60">
        {subtitle}
      </p>
    </div>
  );
}