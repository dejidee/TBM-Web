// components/dashboard/designs/card.jsx
"use client";

import { motion } from "framer-motion";
import {
  Heart,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Wand2,
  Calculator,
  FolderPlus,
  Maximize2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  useToggleFavorite,
  useDeleteDesign,
  useDownloadDesign,
  useShareDesign,
} from "@/hooks/use-designs";
import { showToast } from "@/components/shared/toast";
import DesignLightbox from "./lightbox";
import EstimateModal from "./estimate-modal";
import CreateProjectModal from "./create-project-modal";

const MENU_MARGIN = 8;

/**
 * Anchors the menu to its trigger button, flipping above it when there isn't
 * room below and clamping horizontally so it never runs off either edge of
 * the viewport. A card near the bottom or side of the screen used to open a
 * menu that ran straight off-screen (fixed `top: rect.bottom + 8`, no
 * collision check) — this measures the menu's actual rendered size first
 * (`useLayoutEffect`, before paint, so there's no visible jump) and picks a
 * position that fits.
 */
function useAnchoredPosition(anchorRef, menuRef) {
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!anchorRef.current || !menuRef.current) return;
    const anchor = anchorRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const menuWidth = menuRef.current.offsetWidth;

    const spaceBelow = window.innerHeight - anchor.bottom;
    const spaceAbove = anchor.top;
    const openUpward =
      spaceBelow < menuHeight + MENU_MARGIN && spaceAbove > spaceBelow;
    const top = openUpward
      ? anchor.top - menuHeight - MENU_MARGIN
      : anchor.bottom + MENU_MARGIN;

    let right = window.innerWidth - anchor.right;
    right = Math.min(right, window.innerWidth - menuWidth - MENU_MARGIN);
    right = Math.max(right, MENU_MARGIN);

    setPos({
      top: Math.min(
        Math.max(top, MENU_MARGIN),
        window.innerHeight - menuHeight - MENU_MARGIN,
      ),
      right,
    });
  }, [anchorRef, menuRef]);

  return pos;
}

// Dropdown rendered via portal so it escapes overflow/stacking constraints
function DropdownMenu({ anchorRef, onClose, children }) {
  const menuRef = useRef(null);
  const pos = useAnchoredPosition(anchorRef, menuRef);

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

  return createPortal(
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      style={{
        position: "fixed",
        // Rendered off-screen (but still measurable) until the first layout
        // effect has computed a real position, so nothing flashes at the
        // naive bottom-right spot before flipping.
        top: pos?.top ?? -9999,
        right: pos?.right ?? -9999,
        visibility: pos ? "visible" : "hidden",
        background: "#0d0b08",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        zIndex: 9999,
      }}
      className="w-52 rounded-lg border border-white/10 py-1"
    >
      {children}
    </motion.div>,
    document.body,
  );
}

/**
 * `url` is an image for outputType "Image". A video tour's `url` has not been
 * observed yet, but next/image would choke on an .mp4, so a <video> is the
 * only rendering that cannot break — it falls back to a dark tile if the
 * source fails.
 */
function DesignMedia({ url, alt, isVideo, sizes, onExpand }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label="View full screen"
      className="absolute inset-0 h-full w-full cursor-zoom-in"
    >
      {isVideo ? (
        <video
          src={url}
          muted
          playsInline
          preload="metadata"
          aria-label={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes={sizes}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
        <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
      </div>
    </button>
  );
}

export default function DesignCard({ design, index, isList = false }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const menuBtnRef = useRef(null);

  // Fields are the recorded shape of a GET /Designs row (lib/api/types.ts,
  // `Design`): id, projectId, roomType, prompt, url, outputType, createdAt,
  // isFavorite. Nothing else exists — no name/title, no isHighRes.
  const imageUrl = design.url;
  const title = design.prompt || "Untitled design";
  const room = design.roomType ?? "";
  const isFavorite = design.isFavorite;
  // Only "Image" has been observed; the studio can also request a video tour.
  const isVideo = design.outputType?.toLowerCase() === "video";
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
    e?.stopPropagation();
    toggleFavorite.mutate(design.id);
  };
  const handleDownload = (e) => {
    e?.stopPropagation();
    // The endpoint mints a URL; it does not stream the file. The asset lives on
    // a different origin, so `<a download>` would be ignored — open it instead.
    downloadDesign.mutate(
      { designId: design.id },
      {
        onSuccess: (data) => {
          if (data?.downloadUrl) window.open(data.downloadUrl, "_blank", "noopener");
          else showToast.error("No download link was returned.");
        },
      },
    );
    setShowMenu(false);
  };
  const handleShare = () => {
    // The share response has not been recorded (lib/api/designs.js), so read
    // it defensively rather than trusting a field name.
    shareDesign.mutate(design.id, {
      onSuccess: async (data) => {
        const link = data?.shareUrl ?? data?.url ?? data?.data?.shareUrl;
        if (!link) return showToast.error("No share link was returned.");
        await navigator.clipboard.writeText(link);
        showToast.success("Share link copied");
      },
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
  // There's no backend field to edit on a saved design (no rename, no
  // re-prompt) — this opens the studio pre-filled with the same prompt so the
  // user can regenerate a variation. It does not modify the saved design.
  const handleRemix = () => {
    setShowMenu(false);
    router.push(`/ziora/studio?prompt=${encodeURIComponent(design.prompt || "")}`);
  };

  const menuItems = (
    <>
      <button
        onClick={handleRemix}
        className="w-full px-4 py-2.5 text-left text-[14px] text-white/70 hover:bg-white/05 flex items-center gap-3 transition-colors"
      >
        <Wand2 className="w-4 h-4" /> Remix in Studio
      </button>
      <button
        onClick={() => {
          setShowEstimateModal(true);
          setShowMenu(false);
        }}
        className="w-full px-4 py-2.5 text-left text-[14px] text-white/70 hover:bg-white/05 flex items-center gap-3 transition-colors"
      >
        <Calculator className="w-4 h-4" /> Get Estimate
      </button>
      <button
        onClick={() => {
          setShowCreateProjectModal(true);
          setShowMenu(false);
        }}
        className="w-full px-4 py-2.5 text-left text-[14px] text-white/70 hover:bg-white/05 flex items-center gap-3 transition-colors"
      >
        <FolderPlus className="w-4 h-4" /> Make into Project
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

  const modals = (
    <>
      {showLightbox && (
        <DesignLightbox
          design={design}
          onClose={() => setShowLightbox(false)}
          onDownload={handleDownload}
          isDownloading={downloadDesign.isPending}
          onToggleFavorite={handleFavorite}
          isTogglingFavorite={toggleFavorite.isPending}
        />
      )}
      {showEstimateModal && (
        <EstimateModal design={design} onClose={() => setShowEstimateModal(false)} />
      )}
      {showCreateProjectModal && (
        <CreateProjectModal design={design} onClose={() => setShowCreateProjectModal(false)} />
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-6 max-w-sm w-full border border-white/10"
            style={{ background: "#0d0b08" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-semibold text-white mb-2">Delete Design?</h3>
            <p className="text-[14px] text-white/50 mb-6">
              This action cannot be undone. The design will be permanently removed.
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
        className="rounded-xl border border-white/08 p-4 hover:border-white/15 transition-all group"
        style={{ background: "#0d0b08" }}
      >
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-24 shrink-0 bg-[#1a1a1a] rounded-lg overflow-hidden">
            <DesignMedia
              url={imageUrl}
              alt={title}
              isVideo={isVideo}
              sizes="112px"
              onExpand={() => setShowLightbox(true)}
            />
            {isVideo && (
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded pointer-events-none">
                VIDEO
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-white mb-1 truncate">{title}</h3>
            {room && (
              <div className="flex items-center gap-2 text-[13px] text-white/40">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span className="capitalize">{room}</span>
              </div>
            )}
            <p className="text-[12px] text-white/25 mt-1">{createdAt}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleFavorite}
              disabled={toggleFavorite.isPending}
              className="p-2 hover:bg-white/05 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
            >
              {toggleFavorite.isPending ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-[#ef4444] text-[#ef4444]" : "text-white/30"}`} />
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloadDesign.isPending}
              className="p-2 hover:bg-white/05 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Download"
            >
              {downloadDesign.isPending ? (
                <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <Download className="w-5 h-5 text-white/30" />
              )}
            </button>
            <button
              ref={menuBtnRef}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/05 rounded-lg transition-colors"
              aria-label="More actions"
            >
              <MoreVertical className="w-5 h-5 text-white/40" />
            </button>
            {showMenu && (
              <DropdownMenu anchorRef={menuBtnRef} onClose={() => setShowMenu(false)}>
                {menuItems}
              </DropdownMenu>
            )}
          </div>
        </div>

        {modals}
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
      className="rounded-xl border border-white/08 overflow-hidden hover:border-white/15 transition-all group"
      style={{ background: "#0d0b08" }}
    >
      {/* Image */}
      <div className="relative aspect-4/3 bg-[#1a1a1a] overflow-hidden">
        <DesignMedia
          url={imageUrl}
          alt={title}
          isVideo={isVideo}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          onExpand={() => setShowLightbox(true)}
        />
        {isVideo && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md pointer-events-none">
            VIDEO
          </div>
        )}
        <button
          onClick={handleFavorite}
          disabled={toggleFavorite.isPending}
          className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
        >
          {toggleFavorite.isPending ? (
            <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          ) : (
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-[#ef4444] text-[#ef4444]" : "text-white/50"}`} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[15px] font-semibold text-white line-clamp-1 flex-1 pr-2">{title}</h3>

          <button
            ref={menuBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-white/05 rounded-md transition-colors shrink-0"
            aria-label="More actions"
          >
            <MoreVertical className="w-5 h-5 text-white/40" />
          </button>

          {showMenu && (
            <DropdownMenu anchorRef={menuBtnRef} onClose={() => setShowMenu(false)}>
              {menuItems}
            </DropdownMenu>
          )}
        </div>

        {room && (
          <div className="flex items-center gap-2 text-[13px] text-white/40 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="capitalize">{room}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/06">
          <span className="text-[12px] text-white/25">{createdAt}</span>
          <button
            onClick={handleDownload}
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
        </div>
      </div>

      {modals}
    </motion.div>
  );
}
