/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FileText,
  UploadCloud,
  Share2,
  Edit3,
  BookOpen,
  Trash2,
  X,
  Search,
  Sparkles,
  Clock,
  User,
  Users
} from "lucide-react";
import toast from "react-hot-toast";
import mammoth from "mammoth";

import api from "../services/api";
import Loader from "../components/Loader";
import Sidebar from "../components/Sidebar";

export default function Dashboard({ logout }) {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'own' | 'shared'
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal States
  const [shareModalDoc, setShareModalDoc] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);

  const [renameModalDoc, setRenameModalDoc] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [renaming, setRenaming] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/documents");
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Parse Document Content
  const extractFileContent = async (file) => {
    if (file.name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      return result.value;
    } else {
      const text = await file.text();
      return `<p>${text.replace(/\n/g, "<br/>")}</p>`;
    }
  };

  // Upload and Auto-Save
  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const content = await extractFileContent(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

      const res = await api.post("/documents", {
        title: cleanTitle,
        content: content,
      });

      if (res.data.success) {
        toast.success(`Document "${cleanTitle}" saved!`);
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleCreateNewDoc = async () => {
    try {
      const res = await api.post("/documents", {
        title: "Untitled Document",
        content: "",
      });
      if (res.data.success) {
        const newDocId = res.data.document._id || res.data.document.id;
        navigate(`/editor/${newDocId}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not create new document");
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameModalDoc || !newTitle.trim()) return;

    try {
      setRenaming(true);
      const res = await api.put(`/documents/${renameModalDoc._id || renameModalDoc.id}`, {
        title: newTitle.trim(),
      });

      if (res.data.success) {
        toast.success("Document renamed");
        setRenameModalDoc(null);
        setNewTitle("");
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename document");
    } finally {
      setRenaming(false);
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareModalDoc || !shareEmail.trim()) return;

    try {
      setSharing(true);
      const res = await api.post(`/documents/${shareModalDoc._id || shareModalDoc.id}/share`, {
        email: shareEmail.trim(),
      });

      if (res.data.success) {
        toast.success("Document shared successfully");
        setShareModalDoc(null);
        setShareEmail("");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to share document");
    } finally {
      setSharing(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await api.delete(`/documents/${docId}`);
      if (res.data.success) {
        toast.success("Document deleted");
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete document");
    }
  };

  // Filter calculations
  const ownDocuments = documents.filter((doc) => doc.isOwner !== false); 
  const sharedDocuments = documents.filter((doc) => doc.isOwner === false || (doc.sharedWith && doc.sharedWith.length > 0));

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "own") {
      return matchesSearch && (doc.isOwner !== false);
    }
    if (activeFilter === "shared") {
      return matchesSearch && (doc.isOwner === false || (doc.sharedWith && doc.sharedWith.length > 0));
    }
    return matchesSearch;
  });

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#F4F5F9] font-body text-[#191B2E] md:flex-row">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'IBM Plex Mono', monospace; }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card-in {
          animation: cardFadeIn 0.35s ease-out forwards;
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(69, 58, 164, 0.2); }
          50% { box-shadow: 0 0 0 12px rgba(69, 58, 164, 0); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s infinite;
        }
      `}</style>

      {/* --- SIDEBAR COMPONENT --- */}
      <Sidebar logout={logout} />

      {/* --- MAIN DASHBOARD CONTENT AREA --- */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#191B2E]/[0.08] bg-white/80 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg sm:text-xl font-semibold text-[#191B2E]">
              Workspace Dashboard
            </h1>
          </div>

          <button
            onClick={handleCreateNewDoc}
            className="flex items-center gap-2 rounded-xl bg-[#191B2E] px-3.5 sm:px-4 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-[#453AA4] active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span className="hidden xs:inline">New Document</span>
          </button>
        </header>

        {/* Dashboard Body */}
        <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-6 sm:py-8">
          
          {/* Animated Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative mb-8 overflow-hidden rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-300 ${
              isDragging
                ? "border-[#453AA4] bg-[#453AA4]/10 scale-[0.99] animate-pulse-glow"
                : "border-[#191B2E]/15 bg-white hover:border-[#453AA4]/50 hover:shadow-xl"
            }`}
          >
            <div className="mx-auto flex max-w-md flex-col items-center justify-center">
              <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#453AA4]/10 text-[#453AA4] transition-transform duration-300 group-hover:scale-110">
                <UploadCloud size={24} className={uploading ? "animate-bounce" : "transition-transform group-hover:-translate-y-0.5 sm:w-7 sm:h-7"} />
              </div>
              
              <h2 className="font-display text-base sm:text-lg font-medium text-[#191B2E]">
                {uploading ? "Processing document..." : "Drag & drop files to upload"}
              </h2>
              <p className="mt-1 text-xs text-[#8A8D9F]">
                Supports <span className="font-medium text-[#191B2E]">.docx, .txt, .md</span> files. Automatically parses and saves content.
              </p>

              <label className="mt-4 sm:mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#453AA4] px-4 sm:px-5 py-2.5 text-xs font-medium text-white shadow-md shadow-[#453AA4]/20 hover:bg-[#3A3089] active:scale-95 transition-all">
                <UploadCloud size={15} />
                <span>Browse Local Files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt,.md"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* Creative Filter Tabs & Search Controls */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            
            {/* Filter Pills with Counts */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  activeFilter === "all"
                    ? "bg-[#191B2E] text-white shadow-md shadow-[#191B2E]/10"
                    : "bg-white border border-[#191B2E]/10 text-[#5B5E70] hover:border-[#191B2E]/30"
                }`}
              >
                <Sparkles size={13} className={activeFilter === "all" ? "text-white" : "text-[#453AA4]"} />
                <span>All Documents</span>
                <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-label ${activeFilter === "all" ? "bg-white/20 text-white" : "bg-[#F4F5F9] text-[#8A8D9F]"}`}>
                  {documents.length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("own")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  activeFilter === "own"
                    ? "bg-[#453AA4] text-white shadow-md shadow-[#453AA4]/20"
                    : "bg-white border border-[#191B2E]/10 text-[#5B5E70] hover:border-[#453AA4]/30"
                }`}
              >
                <User size={13} className={activeFilter === "own" ? "text-white" : "text-[#453AA4]"} />
                <span>My Documents</span>
                <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-label ${activeFilter === "own" ? "bg-white/20 text-white" : "bg-[#F4F5F9] text-[#8A8D9F]"}`}>
                  {ownDocuments.length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("shared")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  activeFilter === "shared"
                    ? "bg-[#E8664A] text-white shadow-md shadow-[#E8664A]/20"
                    : "bg-white border border-[#191B2E]/10 text-[#5B5E70] hover:border-[#E8664A]/30"
                }`}
              >
                <Users size={13} className={activeFilter === "shared" ? "text-white" : "text-[#E8664A]"} />
                <span>Shared with Me</span>
                <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[10px] font-label ${activeFilter === "shared" ? "bg-white/20 text-white" : "bg-[#F4F5F9] text-[#8A8D9F]"}`}>
                  {sharedDocuments.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8D9F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full rounded-xl border border-[#191B2E]/10 bg-white py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-[#453AA4]/40 focus:ring-2 focus:ring-[#453AA4]/10"
              />
            </div>
          </div>

          {/* Documents Animated Grid */}
          {loading ? (
            <Loader />
          ) : filteredDocs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#191B2E]/15 bg-white p-8 sm:p-12 text-center text-[#8A8D9F]">
              <FileText size={36} className="mx-auto mb-3 opacity-30 text-[#453AA4]" />
              <p className="text-sm font-medium text-[#191B2E]">No documents match this filter</p>
              <p className="mt-1 text-xs">Try selecting a different view or create a new file.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocs.map((doc, index) => {
                const docId = doc._id || doc.id;
                const isShared = doc.isOwner === false || (doc.sharedWith && doc.sharedWith.length > 0);

                return (
                  <div
                    key={docId}
                    style={{ animationDelay: `${index * 40}ms` }}
                    onClick={() => navigate(`/editor/${docId}`)}
                    className="animate-card-in group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[#191B2E]/10 bg-white p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#453AA4]/30 hover:shadow-xl hover:shadow-[#191B2E]/5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            isShared ? "bg-[#E8664A]/10 text-[#E8664A] group-hover:bg-[#E8664A] group-hover:text-white" : "bg-[#453AA4]/10 text-[#453AA4] group-hover:bg-[#453AA4] group-hover:text-white"
                          }`}>
                            {isShared ? <Users size={17} /> : <FileText size={18} />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display truncate text-sm font-medium text-[#191B2E]">
                              {doc.title || "Untitled Document"}
                            </h3>
                            <span className="inline-block mt-0.5 font-label text-[9px] uppercase tracking-wider text-[#8A8D9F]">
                              {isShared ? "Shared with you" : "Your Document"}
                            </span>
                          </div>
                        </div>

                        {/* Only show delete button if user owns it (prevents 403 Forbidden) */}
                        {!isShared && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDoc(docId);
                            }}
                            title="Delete Document"
                            className="rounded-lg p-1.5 text-[#8A8D9F] hover:bg-[#E8664A]/10 hover:text-[#E8664A] transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div 
                        className="mt-3 line-clamp-2 text-xs text-[#5B5E70] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: doc.content || "Empty document..." }}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#191B2E]/[0.06] pt-3.5 gap-2">
                      <span className="flex items-center gap-1 font-label text-[10px] text-[#8A8D9F]">
                        <Clock size={12} />
                        {new Date(doc.updatedAt || Date.now()).toLocaleDateString()}
                      </span>

                      {/* Action Button Group */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameModalDoc(doc);
                            setNewTitle(doc.title || "");
                          }}
                          title="Rename Document"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#191B2E]/10 bg-[#FAFBFD] text-[#5B5E70] hover:border-[#453AA4]/30 hover:text-[#453AA4] transition active:scale-95"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareModalDoc(doc);
                          }}
                          title="Share Document"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#191B2E]/10 bg-[#FAFBFD] text-[#5B5E70] hover:border-[#E8664A]/30 hover:text-[#E8664A] transition active:scale-95"
                        >
                          <Share2 size={13} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/editor/${docId}`);
                          }}
                          title="Open Document"
                          className="flex items-center gap-1.5 rounded-lg bg-[#191B2E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#453AA4] transition active:scale-95"
                        >
                          <BookOpen size={13} />
                          <span>Read</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* RENAME MODAL */}
      {renameModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191B2E]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#191B2E]/10 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#191B2E]/10 pb-3">
              <h3 className="font-display text-base font-medium text-[#191B2E]">Rename Document</h3>
              <button
                onClick={() => setRenameModalDoc(null)}
                className="rounded-lg p-1 text-[#8A8D9F] hover:bg-[#F4F5F8]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="mt-4 space-y-4">
              <div>
                <label className="font-label text-[10px] uppercase tracking-wider text-[#8A8D9F]">New Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-[#191B2E]/15 bg-[#FAFBFD] px-3.5 py-2 text-xs outline-none focus:border-[#453AA4]/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalDoc(null)}
                  className="rounded-xl border border-[#191B2E]/15 px-4 py-2 text-xs text-[#5B5E70] hover:bg-[#F4F5F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renaming}
                  className="rounded-xl bg-[#453AA4] px-4 py-2 text-xs font-medium text-white hover:bg-[#3A3089]"
                >
                  {renaming ? "Saving..." : "Save Title"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191B2E]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#191B2E]/10 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#191B2E]/10 pb-3">
              <h3 className="font-display text-base font-medium text-[#191B2E]">Share Document</h3>
              <button
                onClick={() => setShareModalDoc(null)}
                className="rounded-lg p-1 text-[#8A8D9F] hover:bg-[#F4F5F8]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="mt-4 space-y-4">
              <div>
                <label className="font-label text-[10px] uppercase tracking-wider text-[#8A8D9F]">Recipient Email</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                  className="mt-1 w-full rounded-xl border border-[#191B2E]/15 bg-[#FAFBFD] px-3.5 py-2 text-xs outline-none focus:border-[#453AA4]/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShareModalDoc(null)}
                  className="rounded-xl border border-[#191B2E]/15 px-4 py-2 text-xs text-[#5B5E70] hover:bg-[#F4F5F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sharing}
                  className="rounded-xl bg-[#453AA4] px-4 py-2 text-xs font-medium text-white hover:bg-[#3A3089]"
                >
                  {sharing ? "Sharing..." : "Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}