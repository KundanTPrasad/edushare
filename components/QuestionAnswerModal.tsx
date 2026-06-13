"use client";

import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import { useAuth } from "@/components/AuthContext";

interface Props {
  open: boolean;
  question: string;
  onClose: () => void;
}

export default function QuestionAnswerModal({ open, question, onClose }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchAnswer = async () => {
      try {
        setLoading(true);
        setLimitReached(false);
        setErrorMsg("");
        setAnswer("");

        const res = await fetch("/api/gemini/question-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, userId: user?.id }),
        });

        if (res.status === 429) {
          setLimitReached(true);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!data.success) {
          setErrorMsg(data.error || "Failed to generate answer.");
          setLoading(false);
          return;
        }

        setAnswer(data.answer);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to generate answer. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswer();
  }, [open, question, user?.id]);

  if (!open) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 10000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 850,
            background: "#120b1f",
            borderRadius: 20,
            padding: 24,
            color: "#fff",
            maxHeight: "90vh",
            overflowY: "auto",
            border: "1px solid rgba(244,114,182,0.15)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontFamily: "'Syne', sans-serif" }}>🤖 AI Answer</h2>

            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 20 }}
            >
              ✕
            </button>
          </div>

          <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: "rgba(244,114,182,0.08)" }}>
            {question}
          </div>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.5)" }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                border: "2.5px solid rgba(244,114,182,0.15)",
                borderTopColor: "#f472b6",
                animation: "qa-spin 0.8s linear infinite",
              }} />
              Generating answer…
              <style>{`@keyframes qa-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {limitReached && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                {user
                  ? "You've used all 20 AI requests for today. Try again tomorrow."
                  : "You've used your 5 free AI requests for today. Sign in with Google for 20 requests/day."}
              </p>
              {!user && (
                <button
                  onClick={() => setShowLogin(true)}
                  style={{
                    background: "linear-gradient(135deg,#f472b6,#c084fc)",
                    border: "none", color: "#fff", borderRadius: 10,
                    padding: "10px 20px", cursor: "pointer", fontWeight: 700,
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(248,113,113,0.8)" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {!loading && !limitReached && !errorMsg && answer && (
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{answer}</div>
          )}
        </div>
      </div>

      {showLogin && <LoginModal reason="limit" onClose={() => setShowLogin(false)} />}
    </>
  );
}
