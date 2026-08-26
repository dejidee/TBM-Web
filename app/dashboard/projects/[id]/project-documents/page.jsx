"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Download, Cloud, Bell, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/shared/dashboard/layout";
import {
  useProjectDocuments,
  useUploadProjectDocument,
} from "@/hooks/use-project";

const FILE_TABS = [
  "All Files",
  "Contracts",
  "Floor Plans",
  "Material Specs",
  "Permits",
];

const CATEGORY_COLORS = {
  Legal: "text-orange-400 bg-orange-500/10",
  Blueprint: "text-blue-400 bg-blue-500/10",
  Specifications: "text-green-400 bg-green-500/10",
  Permits: "text-purple-400 bg-purple-500/10",
  Media: "text-yellow-400 bg-yellow-500/10",
  Contracts: "text-red-400 bg-red-500/10",
  General: "text-white/40 bg-white/05",
};

function categoryColor(cat) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.General;
}

function FileIcon({ ext }) {
  const colors = {
    pdf: { bg: "bg-orange-500/15", color: "#f97316" },
    dwg: { bg: "bg-blue-500/15", color: "#60a5fa" },
    xlsx: { bg: "bg-green-500/15", color: "#4ade80" },
    zip: { bg: "bg-yellow-500/15", color: "#facc15" },
    docx: { bg: "bg-blue-400/15", color: "#93c5fd" },
  };
  const c = colors[ext?.toLowerCase()] ?? {
    bg: "bg-white/10",
    color: "rgba(255,255,255,0.40)",
  };
  return (
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}
    >
      <span
        className="text-[9px] font-black uppercase"
        style={{ color: c.color }}
      >
        {ext ?? "FILE"}
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center animate-pulse border-b border-white/04">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/06 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-white/06 rounded w-3/4" />
          <div className="h-2.5 bg-white/06 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-white/06 rounded w-16" />
      <div className="h-3 bg-white/06 rounded w-20" />
      <div className="h-3 bg-white/06 rounded w-12" />
      <div className="w-5 h-5 bg-white/06 rounded" />
    </div>
  );
}

export default function ProjectDocumentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All Files");
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  const { data: docs = [], isLoading } = useProjectDocuments(id);
  const upload = useUploadProjectDocument();

  // Flexible field mapping — shape confirmed once API logs appear
  const mapped = docs.map((doc) => ({
    id: doc?.id ?? Math.random(),
    name: doc?.fileName ?? doc?.name ?? doc?.title ?? "Document",
    type: doc?.fileType ?? doc?.type ?? doc?.mimeType ?? "File",
    ext: (doc?.fileName ?? doc?.name ?? "").split(".").pop() || "file",
    category: doc?.category ?? doc?.documentType ?? "General",
    date: doc?.uploadedAt ?? doc?.createdAt ?? doc?.date ?? "",
    size: doc?.fileSize ?? doc?.size ?? "",
    downloadUrl: doc?.downloadUrl ?? doc?.url ?? doc?.fileUrl ?? "#",
  }));

  const filtered = mapped.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "All Files" ||
      f.category === activeTab ||
      f.type?.includes(activeTab);
    return matchesSearch && matchesTab;
  });

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (file) upload.mutate({ projectId: id, file });
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 w-full max-w-[720px]">
        {/* Back */}
        <button
          onClick={() => router.push(`/dashboard/projects/${id}`)}
          className="inline-flex items-center gap-2 text-white/35 hover:text-white transition-colors text-[13px] font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div>
            <h1 className="text-[26px] font-bold text-white leading-tight">
              Project Documents
            </h1>
            <p className="text-[13px] text-white/35 mt-1">
              Manage and access all essential architectural and legal files.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 mt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="text-[12.5px] pl-8 pr-4 py-2 border border-white/10 rounded-lg outline-none focus:border-[#D4AF37]/50 transition-colors w-44 text-white/70 placeholder:text-white/25"
                style={{ background: "#0d0b08" }}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={upload.isPending}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-black px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)",
              }}
            >
              {upload.isPending ? "Uploading…" : "↑ Upload New File"}
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex items-center gap-0 border-b border-white/08"
        >
          {FILE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-[13px] font-semibold px-4 py-2.5 border-b-2 transition-all whitespace-nowrap"
              style={{
                borderBottomColor:
                  activeTab === tab ? "#D4AF37" : "transparent",
                color: activeTab === tab ? "#D4AF37" : "rgba(255,255,255,0.35)",
              }}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-white/08 overflow-hidden"
          style={{ background: "#0d0b08" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/06"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            {["FILE NAME", "CATEGORY", "UPLOAD DATE", "SIZE", ""].map((h) => (
              <span
                key={h}
                className="text-[16px] font-bold tracking-wider text-white/25 uppercase"
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/04">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <p className="text-center text-white/25 text-[13px] py-10">
                No documents found.
              </p>
            ) : (
              filtered.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.2 + index * 0.05 }}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-white/02 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileIcon ext={file.ext} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-white/30">{file.type}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md inline-block ${categoryColor(file.category)}`}
                  >
                    {file.category}
                  </span>
                  <span className="text-[12.5px] text-white/40">
                    {file.date
                      ? new Date(file.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  <span className="text-[12.5px] text-white/40">
                    {file.size || "—"}
                  </span>
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-white/30 hover:text-[#D4AF37] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          {!isLoading && filtered.length > 0 && (
            <div
              className="flex items-center justify-between px-5 py-3 border-t border-white/06"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <span className="text-[12px] text-white/25">
                Showing {filtered.length} file{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </motion.div>

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="grid grid-cols-2 gap-4"
        >
          <div
            className="rounded-xl border border-white/08 p-4 flex items-start gap-3"
            style={{ background: "#0d0b08" }}
          >
            <div className="w-9 h-9 rounded-full bg-white/06 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white">
                Documents Updated
              </p>
              <p className="text-[11.5px] text-white/35 mt-0.5 leading-relaxed">
                New files will appear here as TBM uploads them.
              </p>
            </div>
          </div>
          <div
            className="rounded-xl border border-white/08 p-4 flex items-center gap-3"
            style={{
              background: "rgba(212,175,55,0.06)",
              borderColor: "rgba(212,175,55,0.15)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(212,175,55,0.12)" }}
            >
              <Cloud className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">Secure Storage</p>
              <p className="text-[11.5px] text-white/40 mt-0.5">
                All files are encrypted and backed up.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
