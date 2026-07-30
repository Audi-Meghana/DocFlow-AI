import { FileText, Share2, Paperclip, Sparkles, Clock, ArrowRight } from "lucide-react";

export default function DocumentCard({ doc, onClick }) {
  const badge = doc.badge || "Owned";
  const isShared = badge === "Shared";

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const plainContent = stripHtml(doc.content);
  const attachmentCount = doc.attachments?.length || 0;
  const formattedDate = doc.updatedAt
    ? new Date(doc.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Draft";

  return (
    <div onClick={onClick} className="group relative h-full cursor-pointer">
      
      {/* 
        CREATIVE REPLACEMENT: The "Stacked Paper" Effect 
        These two divs sit behind the card and fan out on hover 
      */}
      <div className="absolute inset-0 z-0 rounded-2xl border border-[#453AA4]/20 bg-[#453AA4]/5 transition-all duration-300 ease-out group-hover:translate-x-2 group-hover:translate-y-2 group-hover:rotate-2" />
      <div className="absolute inset-0 z-0 rounded-2xl border border-[#E8664A]/20 bg-[#E8664A]/5 transition-all duration-300 ease-out group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 group-hover:-rotate-1" />

      {/* MAIN CARD SURFACE */}
      <div className="relative z-10 flex h-full flex-col justify-between rounded-2xl border border-[#191B2E]/[0.08] bg-white p-6 shadow-sm transition-all duration-300 group-hover:border-[#453AA4]/30 group-hover:shadow-[0_10px_40px_-10px_rgba(25,27,46,0.1)]">
        
        <div>
          {/* Header Layout */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Minimal Document Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F5F9] text-[#191B2E] transition-colors duration-300 group-hover:bg-[#453AA4] group-hover:text-white">
                <FileText size={18} strokeWidth={2.5} />
              </div>

              <div className="flex flex-col">
                {/* Title moved up next to the icon for a tighter layout */}
                <h3 className="font-display text-base font-bold text-[#191B2E] transition-colors group-hover:text-[#453AA4] line-clamp-1">
                  {doc.title || "Untitled Document"}
                </h3>
                <span className="text-[10px] font-label text-[#8A8D9F] flex items-center gap-1 mt-0.5">
                  <Clock size={10} /> {formattedDate}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold font-label uppercase tracking-widest ${
                isShared
                  ? "bg-[#FFCB47]/10 text-[#B37B00]"
                  : "bg-[#10B981]/10 text-[#059669]"
              }`}
            >
              {isShared ? <Share2 size={10} /> : <Sparkles size={10} />}
              {badge}
            </span>
          </div>

          {/* Clean Text Preview */}
          <p className="line-clamp-2 text-sm leading-relaxed text-[#5B5E70] font-body mt-2">
            {plainContent || "No text content added yet. Click to start editing..."}
          </p>
        </div>

        {/* Action Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-[#191B2E]/5 pt-4">
          
          <div className="flex items-center gap-3">
            {attachmentCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-label font-medium text-[#8A8D9F]">
                <Paperclip size={12} className="text-[#E8664A]" />
                <span>{attachmentCount} Attachments</span>
              </div>
            )}
          </div>

          {/* Animated Arrow that slides right on hover */}
          <div className="flex items-center gap-1 text-xs font-semibold text-[#453AA4] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
            <span>Open</span>
            <ArrowRight size={14} />
          </div>
          
        </div>
      </div>
    </div>
  );
}