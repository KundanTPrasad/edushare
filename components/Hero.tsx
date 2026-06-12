export default function Hero() {
  return (
    <section style={{ textAlign: "center", padding: "72px 24px 40px", position: "relative" }}>
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 300,
        background: "radial-gradient(ellipse, rgba(244,114,182,0.1) 0%, rgba(192,132,252,0.07) 40%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Eyebrow badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(244,114,182,0.08)",
          border: "1px solid rgba(244,114,182,0.2)",
          borderRadius: 999, padding: "5px 16px",
          marginBottom: 20,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#f472b6",
            boxShadow: "0 0 8px #f472b6",
            display: "inline-block",
          }} />
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, letterSpacing: "0.1em",
            color: "rgba(244,114,182,0.8)", textTransform: "uppercase",
          }}>
            Open Resource Platform
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: "clamp(2.4rem, 6vw, 4rem)",
          letterSpacing: "-0.03em", lineHeight: 1.05,
          color: "#fff", marginBottom: 16,
        }}>
          Edu
          <span style={{
            background: "linear-gradient(135deg, #f472b6, #c084fc, #fb923c)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Share</span>
        </h1>

        <p style={{
          fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
          color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto 12px",
          fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7,
        }}>
          Your one-stop hub for question papers, notes &amp; study resources — shared by students, for students.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 20 }}>
          {[["📄", "PYQs"], ["📝", "Notes"], ["📚", "Mid Sem"]].map(([icon, label]) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em",
            }}>
              <span>{icon}</span> {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
