// components/dashboard/designs/card.jsx
"use client";

import { motion } from "framer-motion";
import {
  Heart,
  MoreVertical,
  Download,
  Share2,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useToggleFavorite,
  useDeleteDesign,
  useDownloadDesign,
  useShareDesign,
} from "@/hooks/use-designs";

// Dropdown rendered via portal so it escapes overflow/stacking constraints
function DropdownMenu({ anchorRef, onClose, children }) {
  const [pos, setPos] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [anchorRef]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [anchorRef, onClose]);

  if (!pos) return null;

  return createPortal(
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      style={{
        position: "fixed",
        top: pos.top,
        right: pos.right,
        background: "#0d0b08",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        zIndex: 9999,
      }}
      className="w-48 rounded-lg border border-white/10 py-1"
    >
      {children}
    </motion.div>,
    document.body,
  );
}

export default function DesignCard({ design, index, isList = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuBtnRef = useRef(null);

  const imageUrl = design.url ?? "/placeholder-design.jpg";
  const title =
    design.projectName ??
    design.name ??
    design.title ??
    design.prompt ??
    "Untitled";
  const room = design.roomType ?? design.room ?? "";
  const isFavorite = design.isFavorited ?? design.isFavorite ?? false;
  const isHighRes = design.isHighRes ?? false;
  const createdAt = design.createdAt
    ? new Date(design.createdAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const toggleFavorite = useToggleFavorite();
  const deleteDesign = useDeleteDesign();
  const downloadDesign = useDownloadDesign();
  const shareDesign = useShareDesign();

  const handleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite.mutate(design.id);
  };
  const handleDownload = () => {
    downloadDesign.mutate({
      designId: design.id,
      quality: design.isHighRes ? "high" : "standard",
    });
    setShowMenu(false);
  };
  const handleShare = () => {
    shareDesign.mutate(design.id, {
      onSuccess: (data) => navigator.clipboard.writeText(data.shareUrl),
    });
    setShowMenu(false);
  };
  const handleDelete = () => {
    // The confirm dialog stays open until the mutation settles — closing it
    // immediately made a failed delete look like a success, then the design
    // would silently reappear on the next fetch with no explanation.
    deleteDesign.mutate(design.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
    setShowMenu(false);
  };

  const menuItems = (
    <>
      <button
        onClick={() => setShowMenu(false)}
        className="w-full px-4 py-2.5 text-left text-[14px] text-white/70 hover:bg-white/05 flex items-center gap-3 transition-colors"
      >
        <Pencil className="w-4 h-4" /> Edit
      </button>
      <button
        onClick={handleDownload}
        disabled={downloadDesign.isPending}
        className="w-full px-4 py-2.5 text-left text-[14px] text-white/70 hover:bg-white/05 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloadDesign.isPending ? (
          <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {downloadDesign.isPending ? "Downloading…" : "Download"}
      </button>
      <button
        onClick={handleShare}
        disabled={shareDesign.isPending}
        className="w-full px-4 py-2.5 text-left text-[14px] text-white/70 hover:bg-white/05 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {shareDesign.isPending ? (
          <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {shareDesign.isPending ? "Sharing…" : "Share"}
      </button>
      <div className="h-px bg-white/06 my-1" />
      <button
        onClick={() => {
          setShowDeleteConfirm(true);
          setShowMenu(false);
        }}
        className="w-full px-4 py-2.5 text-left text-[14px] text-[#ef4444] hover:bg-red-900/20 flex items-center gap-3 transition-colors"
      >
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </>
  );

  if (isList) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="rounded-xl border border-white/08 p-4 hover:border-white/15 transition-all cursor-pointer group"
        style={{ background: "#0d0b08" }}
      >
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-24 shrink-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="112px"
            />
            {isHighRes && (
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[16px] font-medium px-2 py-0.5 rounded">
                HIGH RES
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-white mb-1 truncate">
              {title}
            </h3>
            {room && (
              <div className="flex items-center gap-2 text-[13px] text-white/40">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>{room}</span>
              </div>
            )}
            <p className="text-[12px] text-white/25 mt-1">{createdAt}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              disabled={toggleFavorite.isPending}
              className="p-2 hover:bg-white/05 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {toggleFavorite.isPending ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-[#ef4444] text-[#ef4444]" : "text-white/30"}`}
                />
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloadDesign.isPending}
              className="p-2 hover:bg-white/05 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadDesign.isPending ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <Download className="w-5 h-5 text-white/30" />
              )}
            </button>
            <button
              onClick={handleShare}
              disabled={shareDesign.isPending}
              className="p-2 hover:bg-white/05 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shareDesign.isPending ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <Share2 className="w-5 h-5 text-white/30" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl border border-white/08 overflow-hidden hover:border-white/15 transition-all cursor-pointer group"
      style={{ background: "#0d0b08" }}
    >
      {/* Image */}
      <div className="relative aspect-4/3 bg-[#1a1a1a] overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        {isHighRes && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
            HIGH RES
          </div>
        )}
        <button
          onClick={handleFavorite}
          disabled={toggleFavorite.isPending}
          className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {toggleFavorite.isPending ? (
            <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          ) : (
            <Heart
              className={`w-5 h-5 ${isFavorite ? "fill-[#ef4444] text-[#ef4444]" : "text-white/50"}`}
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[15px] font-semibold text-white line-clamp-1 flex-1 pr-2">
            {title}
          </h3>

          <button
            ref={menuBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-white/05 rounded-md transition-colors shrink-0"
          >
            <MoreVertical className="w-5 h-5 text-white/40" />
          </button>

          {showMenu && (
            <DropdownMenu
              anchorRef={menuBtnRef}
              onClose={() => setShowMenu(false)}
            >
              {menuItems}
            </DropdownMenu>
          )}
        </div>

        {room && (
          <div className="flex items-center gap-2 text-[13px] text-white/40 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>{room}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/06">
          <span className="text-[12px] text-white/25">{createdAt}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={downloadDesign.isPending}
              className="p-1.5 hover:bg-white/05 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Download"
            >
              {downloadDesign.isPending ? (
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <Download className="w-4 h-4 text-white/40" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              disabled={shareDesign.isPending}
              className="p-1.5 hover:bg-white/05 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Share"
            >
              {shareDesign.isPending ? (
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <Share2 className="w-4 h-4 text-white/40" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-6 max-w-sm w-full border border-white/10"
            style={{ background: "#0d0b08" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-semibold text-white mb-2">
              Delete Design?
            </h3>
            <p className="text-[14px] text-white/50 mb-6">
              This action cannot be undone. The design will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteDesign.isPending}
                className="flex-1 px-4 py-2.5 bg-white/06 text-white rounded-lg text-[14px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteDesign.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-[14px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteDesign.isPending && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {deleteDesign.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
