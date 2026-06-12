"use client";

import { useState } from "react";
import Image from "next/image";
import { Paper } from "@/types/Paper";
import ImageViewer from "./ImageViewer";

interface Props {
  paper: Paper;
}

// Star Rating component
function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }} onClick={(e) => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRate(star)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 0, fontSize: 13, lineHeight: 1,
            color: star <= (hoverRating || rating) ? "#f472b6" : "rgba(255,255,255,0.18)",
            transition: "color 0.15s, transform 0.1s",
            transform: star <= hoverRating ? "scale(1.2)" : "scale(1)",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function PaperCard({ paper }: Props) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  // Local rating and view state (replace with real DB fields when ready)
  const [userRating, setUserRating] = useState<number>(paper.rating ?? 0);
  const [views] = useState<number>(paper.views ?? Math.floor(Math.random() * 300 + 10));

  const handleOpen = () => {
    setOpen(true);
    // Increment view count in DB here when ready:
    // supabase.from("papers").update({ views: views + 1 }).eq("id", paper.id)
  };

  return (
    <>
      <div
        onClick={handleOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          cursor: "pointer",
          background: "rgba(15,10,35,0.85)",
          border: `1px solid ${hovered ? "rgba(192,132,252,0.45)" : "rgba(192,132,252,0.12)"}`,
          transition: "transform 0.45s cubic-bezier(0.23,1,0.32,1), border-color 0.3s, box-shadow 0.4s",
          transform: hovered ? "translateY(-6px) scale(1.015)" : "none",
          boxShadow: hovered
            ? "0 0 40px rgba(192,132,252,0.12), 0 20px 60px rgba(0,0,0,0.4)"
            : "0 4px 24px rgba(0,0,0,0.3)",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        {/* Glow border on hover */}
        <div style={{
          position: "absolute", inset: "-1px", borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(192,132,252,0.35), rgba(129,140,248,0.25), transparent 65%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Corner accents */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          width: 18, height: 18,
          borderTop: "2px solid #c084fc", borderRight: "2px solid #c084fc",
          borderRadius: "0 4px 0 0", zIndex: 10,
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        }} />
        <div style={{
          position: "absolute", bottom: 12, left: 12,
          width: 18, height: 18,
          borderBottom: "2px solid #c084fc", borderLeft: "2px solid #c084fc",
          borderRadius: "0 0 0 4px", zIndex: 10,
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        }} />

        {/* Thumbnail */}
        <div style={{ position: "relative", height: 210, overflow: "hidden", background: "#100d28" }}>
          <Image
            src={paper.thumbnail}
            alt={paper.subject}
            fill
            style={{
              objectFit: "cover",
              filter: "brightness(0.75) saturate(0.85)",
              transform: hovered ? "scale(1.07)" : "scale(1)",
              transition: "transform 0.7s cubic-bezier(0.23,1,0.32,1)",
            }}
          />

          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 35%, rgba(15,10,35,0.95) 100%)",
            zIndex: 2,
          }} />

          {/* File type badge */}
          <span style={{
            position: "absolute", top: 12, left: 12, zIndex: 6,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, fontWeight: 500,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "#c084fc",
            background: hovered ? "rgba(192,132,252,0.18)" : "rgba(192,132,252,0.08)",
            border: "1px solid rgba(192,132,252,0.3)",
            borderRadius: 6, padding: "3px 9px",
            transition: "background 0.3s",
          }}>
            {paper.fileType?.toUpperCase()}
          </span>

          {/* View count badge */}
          <span style={{
            position: "absolute", top: 12, right: 36, zIndex: 6,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.55)",
            background: "rgba(0,0,0,0.4)",
            borderRadius: 6, padding: "3px 8px",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {/* Eye icon */}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {views}
          </span>

          {/* Subject label */}
          <div style={{
            position: "absolute", bottom: 12, left: 12, right: 12,
            zIndex: 6, fontSize: 17, fontWeight: 700,
            color: "#fff", lineHeight: 1.25,
            textShadow: "0 2px 14px rgba(0,0,0,0.7)",
          }}>
            {paper.subject}
          </div>
        </div>

        {/* Card body */}
        <div style={{ position: "relative", zIndex: 2, padding: "14px 16px 16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {[paper.college, paper.branch, paper.resourceType].map((tag) => tag && (
              <span key={tag} style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10, letterSpacing: "0.04em",
                color: "rgba(192,132,252,0.8)",
                background: "rgba(192,132,252,0.08)",
                border: "1px solid rgba(192,132,252,0.18)",
                borderRadius: 999, padding: "3px 10px",
              }}>
                {tag}
              </span>
            ))}
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: "0.04em",
              color: "#a5b4fc",
              background: "rgba(129,140,248,0.1)",
              border: "1px solid rgba(129,140,248,0.25)",
              borderRadius: 999, padding: "3px 10px",
            }}>
              Sem {paper.semester}
            </span>
          </div>

          {/* Rating row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 10,
          }}>
            <StarRating rating={userRating} onRate={setUserRating} />
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, color: "rgba(255,255,255,0.25)",
            }}>
              {userRating > 0 ? `${userRating}/5` : "Rate"}
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11, letterSpacing: "0.05em",
              color: "rgba(255,255,255,0.28)",
            }}>
              {paper.year}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); handleOpen(); }}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.05em", textTransform: "uppercase",
                color: "#0d0a1a",
                background: btnHovered
                  ? "linear-gradient(135deg, #d8a0ff, #a5b4fc)"
                  : "linear-gradient(135deg, #c084fc, #818cf8)",
                border: "none", borderRadius: 8,
                padding: "6px 14px", cursor: "pointer",
                transition: "background 0.2s, transform 0.15s",
                transform: btnHovered ? "scale(1.05)" : "scale(1)",
              }}
            >
              View
            </button>
          </div>
        </div>
      </div>

      {open && (
        <ImageViewer
          fileUrl={paper.fileUrl}
          fileType={paper.fileType}
          title={paper.subject}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
