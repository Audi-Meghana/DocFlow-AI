import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Save,
  Upload,
  Share2,
  X,
  FileText,
  Paperclip,
  Trash2,
  Plus,
  FileUp,
  FileType,
  Underline as UnderlineIcon,
  Sparkles,
  // eslint-disable-next-line no-unused-vars
  Edit3,
  Layers,
  Feather,
  // eslint-disable-next-line no-unused-vars
  CheckCircle2,
  Clock,
  LayoutDashboard
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import toast from "react-hot-toast";
import mammoth from "mammoth";

import api from "../services/api";
import Loader from "../components/Loader";

// Enhanced ToolButton with mobile considerations
function ToolButton({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg text-xs font-medium transition-all duration-150 ${
        active
          ? "bg-[#191B2E] text-white shadow-sm scale-105"
          : "text-[#5B5E70] hover:bg-[#F4F5F8] hover:text-[#191B2E]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolDivider() {
  return <span className="mx-1 h-4 w-px bg-[#191B2E]/10 shrink-0" />;
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [uploading, setUploading] = useState(false);
  const [sharing, setSharing] = useState(false);
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isOwner, setIsOwner] = useState(true);

  const [attachments, setAttachments] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [wordCount, setWordCount] = useState(0);

  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  // Dynamic mouse position listener for cursor lighting - disabled on mobile for performance
  useEffect(() => {
    if (window.innerWidth < 768) return; 

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      Underline,
      Heading.configure({
        levels: [2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose max-w-none min-h-[300px] sm:min-h-[380px] focus:outline-none p-4 sm:p-9 text-sm leading-relaxed text-[#191B2E] prose-headings:font-display prose-headings:text-[#191B2E] prose-strong:text-[#191B2E]",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/documents/${id}`);

        if (res.data.success) {
          const doc = res.data.document;
          setTitle(doc.title || "Untitled Document");
          setAttachments(doc.attachments || []);
          
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const ownerId = typeof doc.owner === "object" ? doc.owner?._id : doc.owner;
          setIsOwner(ownerId?.toString() === (currentUser.id || currentUser._id)?.toString());

          const initialContent = doc.content || "";
          editor.commands.setContent(initialContent);

          const rawText = editor.getText();
          setWordCount(rawText.trim() ? rawText.trim().split(/\s+/).length : 0);
        } else {
          toast.error(res.data.message || "Could not load document");
          navigate("/dashboard");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load document");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [editor, id, navigate]);

  const saveDocument = async () => {
    if (!editor) return;

    try {
      setSaving(true);
      await api.put(`/documents/${id}`, {
        title: title.trim() || "Untitled Document",
        content: editor.getHTML(),
        attachments: attachments,
      });
      toast.success("Document saved successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save document");
    } finally {
      setSaving(false);
    }
  };

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

  const handleInsertContent = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    try {
      setUploading(true);
      const content = await extractFileContent(file);
      const currentContent = editor.getHTML();
      editor.commands.setContent(currentContent + "<br/>" + content);

      toast.success(`Imported content from ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse file content");
    } finally {
      setUploading(false);
      setImportModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateNewFromDoc = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const content = await extractFileContent(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "");

      const res = await api.post("/documents", {
        title: cleanName,
        content: content,
      });

      if (res.data.success) {
        toast.success(`Created new document "${cleanName}"`);
        navigate(`/editor/${res.data.document._id || res.data.document.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create document from file");
    } finally {
      setUploading(false);
      setImportModalOpen(false);
    }
  };

  const handleAddAttachment = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newAttachment = {
      id: Date.now().toString(),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      type: file.type || "file",
      uploadedAt: new Date().toLocaleDateString(),
    };

    setAttachments((prev) => [...prev, newAttachment]);
    toast.success(`Attached ${file.name}`);
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    toast.success("Attachment removed");
  };

  const shareDocument = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim() || !id) return;

    try {
      setSharing(true);
      const res = await api.post(`/documents/${id}/share`, {
        email: shareEmail.trim(),
      });

      if (res.data.success) {
        toast.success("Document shared successfully");
        setShareEmail("");
        setShareModalOpen(false);
      } else {
        toast.error(res.data.message || "Sharing failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Could not share document");
    } finally {
      setSharing(false);
    }
  };

  if (!editor || loading) {
    return <Loader />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F5F9] font-body text-[#191B2E]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'IBM Plex Mono', monospace; }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          50% { transform: translate(45px, -30px) rotate(6deg) scale(1.15); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          50% { transform: translate(-40px, 35px) rotate(-6deg) scale(1.1); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.28; }
        }

        .animate-blob-1 { animation: floatSlow 14s ease-in-out infinite; }
        .animate-blob-2 { animation: floatReverse 18s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulseGlow 6s ease-in-out infinite; }

        .prose ul { list-style-type: disc !important; padding-left: 1rem !important; }
        @media (min-width: 640px) { .prose ul { padding-left: 1.5rem !important; } }
        
        .prose ol { list-style-type: decimal !important; padding-left: 1rem !important; }
        @media (min-width: 640px) { .prose ol { padding-left: 1.5rem !important; } }

        .prose h2 { font-size: 1.15rem !important; font-weight: 600 !important; margin-top: 0.75rem !important; margin-bottom: 0.4rem !important; }
        @media (min-width: 640px) { .prose h2 { font-size: 1.35rem !important; margin-top: 1rem !important; margin-bottom: 0.5rem !important; } }

        .prose h3 { font-size: 1rem !important; font-weight: 600 !important; margin-top: 0.5rem !important; margin-bottom: 0.2rem !important; }
        @media (min-width: 640px) { .prose h3 { font-size: 1.15rem !important; margin-top: 0.75rem !important; margin-bottom: 0.25rem !important; } }
        
        /* Hide scrollbar for toolbar on mobile */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Interactive Cursor Spotlight Glow - Hidden on Mobile */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-300 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(69, 58, 164, 0.08), transparent 80%)`,
        }}
      />

      {/* Blueprint Grid Pattern */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] sm:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23191B2E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Ambient Orbs & Floating Line Art Icons - Simplified for Mobile */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-blob-1 absolute -left-28 -top-28 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-gradient-to-br from-[#453AA4]/20 via-[#6B5BEE]/15 to-transparent blur-3xl" />
        <div className="animate-blob-2 absolute -bottom-28 -right-28 h-80 w-80 sm:h-[26rem] sm:w-[26rem] rounded-full bg-gradient-to-tl from-[#E8664A]/20 via-[#FFCB47]/15 to-transparent blur-3xl" />
        
        {/* Decorative Icons - Hidden on very small screens */}
        <div className="animate-blob-1 absolute left-10 top-28 opacity-[0.03] sm:opacity-10 text-[#453AA4] hidden xs:block">
          <Feather size={window.innerWidth < 640 ? 60 : 90} />
        </div>
        <div className="animate-blob-2 absolute right-12 top-40 opacity-[0.03] sm:opacity-10 text-[#453AA4] hidden xs:block">
          <Layers size={window.innerWidth < 640 ? 70 : 100} />
        </div>
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#191B2E]/[0.08] bg-white/95 backdrop-blur-sm px-3 py-2 sm:px-6 sm:py-2.5">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 sm:gap-3">
          
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Dashboard Link Arrow */}
            <button
              onClick={() => navigate("/dashboard")}
              title="Back to Dashboard"
              className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-[#191B2E]/10 bg-white text-[#453AA4] transition hover:bg-[#453AA4]/10 hover:border-[#453AA4]/20 active:scale-95"
            >
              <LayoutDashboard size={16} className="sm:hidden" />
              <ArrowLeft size={16} className="hidden sm:block" />
            </button>

            <div className="flex flex-col min-w-0">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Document"
                className="font-display truncate bg-transparent text-sm sm:text-base font-medium text-[#191B2E] outline-none placeholder:text-[#8A8D9F]"
              />
              <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                <span className="font-label text-[8px] sm:text-[9px] uppercase tracking-wider text-[#453AA4] bg-[#453AA4]/10 px-1.5 py-0.5 rounded-full font-medium">
                  {isOwner ? "Owner" : "Shared"}
                </span>
                {attachments.length > 0 && (
                  <span className="font-label text-[8px] sm:text-[9px] uppercase tracking-wider text-[#E8664A] bg-[#E8664A]/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                    <Paperclip size={window.innerWidth < 640 ? 8 : 9} /> {attachments.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Compact on Mobile */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => setImportModalOpen(true)}
              title="File Options"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[#191B2E]/15 bg-white p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium text-[#191B2E] shadow-sm hover:bg-[#F4F5F8] active:scale-95"
            >
              <Upload size={14} className="text-[#453AA4]" />
              <span className="hidden xs:inline text-[11px] sm:text-xs">Options</span>
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              title="Share Document"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[#191B2E]/15 bg-white p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium text-[#191B2E] shadow-sm hover:bg-[#F4F5F8] active:scale-95"
            >
              <Share2 size={14} className="text-[#E8664A]" />
              <span className="hidden xs:inline text-[11px] sm:text-xs">Share</span>
            </button>

            <button
              onClick={saveDocument}
              disabled={saving}
              title="Save Changes"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#191B2E] p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#2A2D45] disabled:opacity-50 active:scale-95"
            >
              <Save size={14} className={saving ? "animate-pulse" : ""} />
              <span className="hidden xs:inline text-[11px] sm:text-xs">{saving ? "Saving..." : "Save"}</span>
            </button>
          </div>

        </div>
      </header>

      {/* File Action Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191B2E]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-[#191B2E]/10 bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-[#191B2E]/10">
              <h3 className="font-display text-base font-medium text-[#191B2E]">File Actions</h3>
              <button 
                onClick={() => setImportModalOpen(false)}
                className="rounded-lg p-1 text-[#8A8D9F] hover:bg-[#F4F5F8] hover:text-[#191B2E]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#191B2E]/10 bg-[#FAFBFD] p-3 transition hover:border-[#453AA4]/30 hover:bg-white hover:shadow-sm">
                <FileUp size={18} className="text-[#453AA4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#191B2E]">Import into Draft</p>
                  <p className="text-[10px] text-[#8A8D9F]">Add .txt, .md, or .docx text to current editor.</p>
                </div>
                <input
                  type="file"
                  accept=".txt,.md,.docx"
                  className="hidden"
                  onChange={handleInsertContent}
                />
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#191B2E]/10 bg-[#FAFBFD] p-3 transition hover:border-[#453AA4]/30 hover:bg-white hover:shadow-sm">
                <FileType size={18} className="text-[#453AA4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#191B2E]">New Doc from File</p>
                  <p className="text-[10px] text-[#8A8D9F]">Create a brand new document from file.</p>
                </div>
                <input
                  type="file"
                  accept=".txt,.md,.docx"
                  className="hidden"
                  onChange={handleCreateNewFromDoc}
                />
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#191B2E]/10 bg-[#FAFBFD] p-3 transition hover:border-[#E8664A]/30 hover:bg-white hover:shadow-sm">
                <Paperclip size={18} className="text-[#E8664A] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#191B2E]">Attach Reference File</p>
                  <p className="text-[10px] text-[#8A8D9F]">Keep file as attachment without parsing text.</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    handleAddAttachment(e);
                    setImportModalOpen(false);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191B2E]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-[#191B2E]/10 bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-[#191B2E]/10">
              <h3 className="font-display text-base font-medium text-[#191B2E]">Share Document</h3>
              <button 
                onClick={() => setShareModalOpen(false)}
                className="rounded-lg p-1 text-[#8A8D9F] hover:bg-[#F4F5F8] hover:text-[#191B2E]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={shareDocument} className="mt-3 space-y-3.5">
              <div>
                <label className="font-label text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8A8D9F] font-medium">Recipient Email</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                  className="mt-1 w-full rounded-xl border border-[#191B2E]/15 bg-[#FAFBFD] px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#453AA4]/30 focus:bg-white focus:ring-2 focus:ring-[#453AA4]/5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-[#191B2E]/10">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="rounded-lg border border-[#191B2E]/15 px-3 py-1.5 text-xs font-medium text-[#5B5E70] hover:bg-[#F4F5F8] hover:text-[#191B2E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sharing}
                  className="rounded-lg bg-[#453AA4] px-3.5 py-1.5 text-xs font-medium text-white shadow hover:bg-[#3A3089] disabled:opacity-50 active:scale-95"
                >
                  {sharing ? "Sharing..." : "Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-6">
        
        {/* Floating Toolbar - Scrollable on Mobile */}
        <div className="sticky top-[60px] sm:top-[68px] z-20 mb-4 flex justify-center">
          <div className="flex items-center gap-0.5 rounded-xl border border-[#191B2E]/10 bg-white/95 p-1 shadow-lg backdrop-blur-md ring-1 ring-[#453AA4]/5 max-w-full overflow-x-auto no-scrollbar">
            <ToolButton
              label="Bold"
              active={editor?.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold size={14} />
            </ToolButton>

            <ToolButton
              label="Italic"
              active={editor?.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic size={14} />
            </ToolButton>

            <ToolButton
              label="Underline"
              active={editor?.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon size={14} />
            </ToolButton>

            <ToolDivider />

            <ToolButton
              label="Heading 2"
              active={editor?.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 size={14} />
            </ToolButton>

            <ToolButton
              label="Heading 3"
              active={editor?.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 size={14} />
            </ToolButton>

            <ToolDivider />

            <ToolButton
              label="Bulleted list"
              active={editor?.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List size={14} />
            </ToolButton>

            <ToolButton
              label="Numbered list"
              active={editor?.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered size={14} />
            </ToolButton>
          </div>
        </div>

        {/* --- CREATIVE CARD CANVAS WRAPPER --- */}
        <div className="group relative rounded-2xl sm:rounded-3xl p-[1px] transition-all duration-300 bg-gradient-to-b from-[#453AA4]/20 via-[#191B2E]/5 to-[#E8664A]/20 hover:from-[#453AA4]/40 hover:to-[#E8664A]/40 shadow-xl hover:shadow-2xl">
          
          {/* Card Inner Container */}
          <div className="relative rounded-[15px] sm:rounded-[23px] bg-white/95 backdrop-blur-xl overflow-hidden">
            
            {/* Top Creative Prism Strip */}
            <div className="h-1 w-full bg-gradient-to-r from-[#453AA4] via-[#6B5BEE] via-[#FFCB47] to-[#E8664A] sm:h-1.5" />

            {/* Creative Canvas Header Bar */}
            <div className="flex items-center justify-between border-b border-[#191B2E]/[0.06] bg-[#FAFBFD] px-4 py-2 sm:px-6 sm:py-2.5 text-[#8A8D9F]">
              <div className="flex items-center gap-1.5 sm:gap-2 font-label text-[9px] sm:text-[10px] uppercase tracking-wider font-medium">
                <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[#191B2E]">Canvas Draft</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 font-label text-[9px] sm:text-[10px] font-medium">
                <span className="flex items-center gap-1 text-[#5B5E70]">
                  <Sparkles size={window.innerWidth < 640 ? 10 : 11} className="text-[#453AA4]" />
                  {wordCount} <span className="hidden xs:inline">{wordCount === 1 ? "word" : "words"}</span>
                </span>
                <span className="text-[#191B2E]/10">|</span>
                <span className="flex items-center gap-1 text-[#8A8D9F]">
                  <Clock size={window.innerWidth < 640 ? 10 : 11} /> <span className="hidden xs:inline">Synced</span>
                </span>
              </div>
            </div>

            {/* Notebook Margin Line Detail - Hidden on Mobile */}
            <div className="pointer-events-none absolute top-12 bottom-0 left-10 w-[1px] bg-[#453AA4]/10 hidden md:block" />

            {/* Editor Text Area */}
            <div className="relative z-10 md:pl-2">
              <EditorContent editor={editor} />
            </div>

            {/* Creative Attachment Tray */}
            <div className="relative z-10 border-t border-[#191B2E]/[0.08] bg-gradient-to-b from-[#FAFBFD] to-[#F4F5F9] p-3.5 sm:p-4.5 rounded-b-[15px] sm:rounded-b-[23px]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg bg-[#453AA4]/10 text-[#453AA4]">
                    <Paperclip size={window.innerWidth < 640 ? 11 : 13} />
                  </div>
                  <span className="font-label text-[9px] sm:text-[10px] uppercase tracking-wider text-[#191B2E] font-bold">
                    Attachments ({attachments.length})
                  </span>
                </div>

                <label className="flex cursor-pointer items-center gap-1 rounded-md border border-[#191B2E]/10 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-[#191B2E] shadow-xs hover:border-[#453AA4]/30 hover:text-[#453AA4] hover:shadow transition-all active:scale-95">
                  <Plus size={window.innerWidth < 640 ? 11 : 12} />
                  <span>Attach</span>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleAddAttachment}
                  />
                </label>
              </div>

              {attachments.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg sm:rounded-xl border border-dashed border-[#191B2E]/15 py-3 sm:py-4 text-[10px] sm:text-[11px] text-[#8A8D9F] bg-white/50 font-medium">
                  <span>No reference files attached.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="group/item flex items-center justify-between rounded-lg sm:rounded-xl border border-[#191B2E]/10 bg-white p-2 sm:p-2.5 shadow-2xs hover:border-[#453AA4]/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-[#FAFBFD] text-[#453AA4] border border-[#191B2E]/5">
                          <FileText size={window.innerWidth < 640 ? 11 : 13} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[#191B2E]">{att.name}</p>
                          <p className="text-[9px] text-[#8A8D9F] font-label font-medium">{att.size}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="rounded-lg p-1 text-[#8A8D9F] opacity-70 group-hover/item:opacity-100 hover:bg-[#E8664A]/10 hover:text-[#E8664A] transition-all active:scale-90"
                        title="Remove attachment"
                      >
                        <Trash2 size={window.innerWidth < 640 ? 12 : 13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Creative Subtle Decorative Corner Accent - Hidden on Mobile */}
            <div className="pointer-events-none absolute bottom-3 right-4 font-label text-[9px] uppercase tracking-widest text-[#191B2E]/20 hidden xs:block">
              VMDA • Studio Draft
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}