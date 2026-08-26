// components/dashboard/designs/DesignsFilters.jsx
"use client";

import { motion } from "framer-motion";
import { Grid3x3, List } from "lucide-react";

// `value` is sent as GET /Designs?roomType= and matched (case-insensitively,
// but exactly) against the backend-derived room, which is lower-case free text
// with spaces — "living room", never "living-room". See lib/api/schemas/designs.ts.
const roomTypes = [
  { value: "all", label: "All Designs" },
  { value: "living room", label: "Living Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "alphabetical", label: "A-Z" },
  { value: "favorites", label: "Favorites First" },
];

export default function DesignsFilters({ filters, setFilters }) {
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex flex-col gap-3">
        {/* Row 1: Room Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {roomTypes.map((room) => (
            <button
              key={room.value}
              onClick={() => handleFilterChange("roomType", room.value)}
              className="whitespace-nowrap transition-all px-4 py-2 rounded-full text-[14px] font-medium"
              style={
                filters.roomType === room.value
                  ? { background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 100%)", color: "#000" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.50)" }
              }
            >
              {room.label}
            </button>
          ))}
        </div>

        {/* Row 2: Sort + View Toggle */}
        <div className="flex items-center justify-between gap-3">
          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="flex-1 sm:flex-none pl-3 pr-8 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-[14px] text-white/60 focus:outline-none focus:border-[#D4AF37]/50 cursor-pointer appearance-none transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23999999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
                Sort: {option.label}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1 shrink-0" style={{ background: "#0d0b08" }}>
            <button
              onClick={() => handleFilterChange("view", "grid")}
              className={`p-1.5 rounded transition-all ${filters.view === "grid" ? "bg-white/08" : "hover:bg-white/05"}`}
              aria-label="Grid view"
            >
              <Grid3x3
                className="w-4.5 h-4.5"
                style={{ color: filters.view === "grid" ? "#D4AF37" : "rgba(255,255,255,0.40)" }}
              />
            </button>
            <button
              onClick={() => handleFilterChange("view", "list")}
              className={`p-1.5 rounded transition-all ${filters.view === "list" ? "bg-white/08" : "hover:bg-white/05"}`}
              aria-label="List view"
            >
              <List
                className="w-4.5 h-4.5"
                style={{ color: filters.view === "list" ? "#D4AF37" : "rgba(255,255,255,0.40)" }}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
