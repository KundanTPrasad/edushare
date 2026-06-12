"use client";

import { useEffect, useState } from "react";

/* ── Floating paper card ── */
function PaperCard({
  style,
  lines,
  rotation,
  delay,
}: {
  style?: React.CSSProperties;
  lines: number;
  rotation: number;
  delay: number;
}) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width: 52,
        height: 66,
        borderRadius: 8,
        background: "rgba(8,20,50,0.7)",
        border: "1px solid rgba(34,211,238,0.18)",
        backdropFilter: "blur(6px)",
        transform: `rotate(${rotation}deg)`,
        padding: "8px 7px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        animation: `floatCard 4s ${delay}s ease-in-out infinite alternate`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        ...style,
      }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 3,
            borderRadius: 2,
            background:
              i === 0
                ? "rgba(34,211,238,0.5)"
                : `rgba(148,180,210,${0.25 - i * 0.03})`,
            width: i % 3 === 2 ? "60%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

export default function Header() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes floatCard {
          from { transform: rotate(var(--r, -8deg)) translateY(0px); }
          to   { transform: rotate(var(--r, -8deg)) translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes revealUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmerText {
          0%   { background-position: -300% center; }
          100% { background-position:  300% center; }
        }
        @keyframes badgePop {
          from { opacity:0; transform:scale(0.8) translateY(8px); }
          to   { opacity:1; transform:scale(1)   translateY(0); }
        }
        @keyframes glowPulse {
          0%,100% { opacity:0.5; }
          50%      { opacity:1; }
        }

        .header-wordmark {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.03em;
        }
        .header-sub {
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <header
        style={{
          position: "relative",
          textAlign: "center",
          padding: "72px 24px 64px",
          overflow: "visible",
        }}
      >
        {/* ── Ambient background glow ── */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(14,60,120,0.35) 0%, transparent 70%)",
        }} />

        {/* ── Floating paper cards (decorative) ── */}
        <PaperCard lines={6} rotation={-12} delay={0}   style={{ top: "12%",  left:  "6%"  }} />
        <PaperCard lines={5} rotation={10}  delay={0.8} style={{ top: "18%",  right: "5%"  }} />
        <PaperCard lines={7} rotation={-6}  delay={1.6} style={{ bottom:"14%", left:  "10%" }} />
        <PaperCard lines={4} rotation={8}   delay={0.4} style={{ bottom:"18%", right: "8%"  }} />

        {/* ── Wordmark ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            opacity: mounted ? 1 : 0,
            animation: mounted ? "revealUp 600ms 100ms cubic-bezier(0.34,1.2,0.64,1) both" : "none",
          }}
        >
          <h1
            className="header-wordmark"
            style={{
              fontSize: "clamp(2.4rem, 7vw, 4.2rem)",
              color: "#fff",
              marginBottom: 4,
            }}
          >
            EduShare{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #22d3ee 0%, #67e8f9 40%, #0ea5e9 70%, #22d3ee 100%)",
                backgroundSize: "300% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmerText 4s linear infinite",
              }}
            >
            
            </span>
          </h1>

          {/* tagline */}
          <p
            className="header-sub"
            style={{
              color: "rgba(148,180,210,0.75)",
              fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
              marginTop: 10,
              letterSpacing: "0.04em",
              fontStyle: "italic",
              animation: "revealUp 600ms 220ms cubic-bezier(0.34,1.2,0.64,1) both",
            }}
          >
            Your Gateway to Previous Year Question Papers
          </p>

          {/* ── Stats / badge row ── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginTop: 28,
              animation: "revealUp 600ms 340ms cubic-bezier(0.34,1.2,0.64,1) both",
            }}
          >
            {[
              { icon: "📄", text: "1000+ Papers" },
              { icon: "🎓", text: "All Semesters" },
              { icon: "⚡", text: "Free Forever" },
              { icon: "📍", text: "Edushare" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 14px",
                  borderRadius: 999,
                  background: "rgba(14,30,70,0.65)",
                  border: "1px solid rgba(34,211,238,0.16)",
                  backdropFilter: "blur(8px)",
                  color: "rgba(186,220,240,0.85)",
                  fontSize: "0.82rem",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  animation: "badgePop 500ms ease both",
                }}
              >
                <span style={{ fontSize: "0.95rem" }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>

          {/* ── thin divider ── */}
          <div
            aria-hidden
            style={{
              width: 80, height: 2, borderRadius: 2,
              background: "linear-gradient(90deg, transparent, #22d3ee, transparent)",
              margin: "32px auto 0",
              animation: "glowPulse 2.5s ease-in-out infinite",
            }}
          />
        </div>
      </header>
    </>
  );
}
