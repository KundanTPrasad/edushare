"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function Dot({ i }: { i: number }) {
  const top   = `${seededRandom(i * 3)     * 100}%`;
  const left  = `${seededRandom(i * 3 + 1) * 100}%`;
  const size  = 2 + seededRandom(i * 3 + 2) * 3;
  const delay = seededRandom(i * 7) * 3;
  const dur   = 2.5 + seededRandom(i * 5) * 2;
  return (
    <span aria-hidden style={{
      position: "absolute", top, left,
      width: size, height: size,
      borderRadius: "50%",
      background: `rgba(${i % 2 === 0 ? "244,114,182" : "192,132,252"},0.3)`,
      animation: `floatDot ${dur}s ${delay}s ease-in-out infinite alternate`,
      pointerEvents: "none",
    }} />
  );
}

interface Props {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function UploadPopup({ forceOpen = false, onClose }: Props) {
  const [open,    setOpen]    = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (forceOpen) return;
    const lastSeen  = localStorage.getItem("uploadPopupSeen");
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (!lastSeen || Date.now() - Number(lastSeen) > sevenDays) {
      const t = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(t);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const closePopup = () => {
    if (!forceOpen) localStorage.setItem("uploadPopupSeen", Date.now().toString());
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); onClose?.(); }, 380);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePopup(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes floatDot {
          from { transform: translateY(0) scale(1);      opacity: 0.3; }
          to   { transform: translateY(-8px) scale(1.4); opacity: 0.8; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes popOut {
          from { opacity: 1; transform: scale(1)    translateY(0); }
          to   { opacity: 0; transform: scale(0.92) translateY(16px); }
        }
        @keyframes backdropIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes backdropOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0;   }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        aria-modal
        role="dialog"
        onClick={closePopup}
        style={{
          position: "fixed", inset: 0, zIndex: 60,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 16px",
          background: "rgba(15,10,20,0.85)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: closing ? "backdropOut 380ms ease forwards" : "backdropIn 300ms ease forwards",
        }}
      >
        {/* Card */}
        <div
          role="document"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            maxWidth: 560, width: "100%",
            borderRadius: 28, overflow: "hidden",
            background: "linear-gradient(145deg, #1c0d24 0%, #230f2e 55%, #150920 100%)",
            border: "1px solid rgba(244,114,182,0.2)",
            boxShadow: "0 0 0 1px rgba(244,114,182,0.07), 0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
            animation: closing
              ? "popOut 360ms cubic-bezier(0.4,0,0.6,1) forwards"
              : "popIn 420ms cubic-bezier(0.34,1.3,0.64,1) forwards",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {Array.from({ length: 18 }, (_, i) => <Dot key={i} i={i} />)}

          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, transparent, #f472b6, #c084fc, #fb923c, transparent)",
          }} />

          {/* Close button */}
          <button
            onClick={closePopup}
            aria-label="Close"
            style={{
              position: "absolute", top: 16, right: 16,
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16,
              transition: "background 200ms, color 200ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,114,182,0.15)"; e.currentTarget.style.color = "#f472b6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >✕</button>

          {/* Body */}
          <div style={{ padding: "48px 40px 40px", textAlign: "center" }}>

            {/* Icon + rings */}
            <div style={{
              position: "relative", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              marginBottom: 28, animation: "fadeUp 500ms 100ms ease both",
            }}>
              <span style={{
                position: "absolute", width: 72, height: 72, borderRadius: "50%",
                border: "2px solid rgba(244,114,182,0.45)",
                animation: "pulseRing 2s ease-out infinite",
              }} />
              <span style={{
                position: "absolute", width: 72, height: 72, borderRadius: "50%",
                border: "2px solid rgba(192,132,252,0.25)",
                animation: "pulseRing 2s 0.7s ease-out infinite",
              }} />
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(244,114,182,0.18), rgba(192,132,252,0.1))",
                border: "1px solid rgba(244,114,182,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32,
              }}>📄</div>
            </div>

            {/* Heading */}
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "clamp(1.6rem, 5vw, 2.1rem)", lineHeight: 1.1,
              color: "#fff", marginBottom: 6,
              animation: "fadeUp 500ms 180ms ease both",
            }}>
              Just finished your exam?
            </h2>

            {/* Shimmer subheading */}
            <p style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: "clamp(1rem, 3vw, 1.2rem)",
              background: "linear-gradient(90deg, #f472b6, #c084fc, #fb923c, #f472b6)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite, fadeUp 500ms 260ms ease both",
              marginBottom: 18,
            }}>
              Your paper can change someone's future.
            </p>

            {/* Description */}
            <p style={{
              color: "rgba(255,210,230,0.65)",
              fontSize: "clamp(0.88rem, 2.5vw, 1rem)", lineHeight: 1.75,
              maxWidth: 400, margin: "0 auto 32px",
              animation: "fadeUp 500ms 340ms ease both",
            }}>
              Upload your question paper and help thousands of students
              study smarter, prepare faster, and walk into their exams
              with confidence.
            </p>

            {/* Stats */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 24, marginBottom: 32,
              animation: "fadeUp 500ms 400ms ease both",
            }}>
              {[
                { val: "10k+", label: "Students helped"  },
                { val: "Free", label: "Always & forever" },
                { val: "2 min", label: "To upload"       },
              ].map(({ val, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 800,
                    fontSize: "1.1rem", color: "#f472b6",
                  }}>{val}</div>
                  <div style={{
                    fontSize: "0.7rem", color: "rgba(255,255,255,0.35)",
                    marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{label}</div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div style={{ animation: "fadeUp 500ms 460ms ease both" }}>
              <Link href="/upload" style={{ display: "block" }}>
                <button
                  onClick={closePopup}
                  style={{
                    width: "100%", padding: "16px 24px", borderRadius: 16,
                    border: "none", cursor: "pointer",
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: "1.05rem", letterSpacing: "0.02em",
                    color: "#1a0a20",
                    background: "linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #fb923c 100%)",
                    boxShadow: "0 0 32px rgba(244,114,182,0.4), 0 4px 16px rgba(0,0,0,0.3)",
                    transition: "transform 180ms ease, box-shadow 180ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
                    e.currentTarget.style.boxShadow = "0 0 48px rgba(244,114,182,0.6), 0 8px 24px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 0 32px rgba(244,114,182,0.4), 0 4px 16px rgba(0,0,0,0.3)";
                  }}
                >
                  Upload My Paper →
                </button>
              </Link>
            </div>

            {/* Maybe later */}
            <button
              onClick={closePopup}
              style={{
                marginTop: 16, background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.28)", fontSize: "0.85rem",
                letterSpacing: "0.03em", padding: "8px 16px",
                transition: "color 200ms",
                animation: "fadeUp 500ms 520ms ease both",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.28)"; }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
