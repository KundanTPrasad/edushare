"use client";

import { X } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
  reason?: "limit" | "manual";
}

export default function LoginModal({ onClose, reason = "manual" }: Props) {
  const { signInWithGoogle } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(5,7,13,0.75)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 220ms ease",
        padding: 16,
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%", maxWidth: 400,
          background: "rgba(20,10,28,0.95)",
          border: "1px solid rgba(244,114,182,0.15)",
          borderRadius: 24,
          padding: "2.25rem",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          backdropFilter: "blur(24px)",
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          transition: "transform 220ms cubic-bezier(0.16,1,0.3,1)",
          textAlign: "center",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 30, height: 30, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>

        {/* Logo / icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 1.25rem",
          background: "linear-gradient(135deg, #f472b6, #c084fc)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, boxShadow: "0 0 28px rgba(244,114,182,0.35)",
        }}>
          ✨
        </div>

        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: "1.4rem", color: "#fff", marginBottom: 8,
          letterSpacing: "-0.01em",
        }}>
          {reason === "limit" ? "Daily AI Limit Reached" : "Sign in to EduShare"}
        </h2>

        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem",
          color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 24,
          maxWidth: 320, margin: "0 auto 24px",
        }}>
          {reason === "limit"
            ? "You've used your 5 free AI requests for today. Sign in with Google to get 20 requests per day, plus save your ratings and history."
            : "Sign in with Google to unlock more AI requests per day and personalize your experience."}
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, padding: "0.85rem 1.5rem", borderRadius: 14,
            background: "#fff", color: "#1a0a20",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", fontWeight: 700,
            transition: "opacity 0.2s, transform 0.15s",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
        >
          {loading ? (
            <span style={{
              width: 16, height: 16, border: "2px solid rgba(26,10,32,0.2)",
              borderTopColor: "#1a0a20", borderRadius: "50%",
              animation: "login-spin 0.7s linear infinite",
            }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
          )}
          {loading ? "Signing in…" : "Continue with Google"}
        </button>

        <p style={{
          marginTop: 16, fontFamily: "'DM Mono', monospace",
          fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em",
        }}>
          5 free AI requests/day · 20/day when signed in
        </p>

        <style>{`@keyframes login-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
