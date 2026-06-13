"use client";

import { Prediction } from "@/types/Prediction";
import { useEffect, useState } from "react";
import QuestionAnswerModal from "./QuestionAnswerModal";
import LoginModal from "./LoginModal";
import { useAuth } from "@/components/AuthContext";

interface PredictionModalProps {
  open: boolean;
  onClose: () => void;
  filters: {
    college: string;
    branch: string;
    semester: string;
    subject: string;
    resourceType: string;
  };
}

export default function PredictionModal({
  open,
  onClose,
  filters,
}: PredictionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [answerModalOpen, setAnswerModalOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setLimitReached(false);
        setErrorMsg("");

        const res = await fetch("/api/gemini/predict-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            college: filters.college,
            branch: filters.branch,
            semester: filters.semester,
            subject: filters.subject,
            userId: user?.id,
          }),
        });

        if (res.status === 429) {
          setLimitReached(true);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!data.success) {
          setErrorMsg(data.error || "Something went wrong.");
          setLoading(false);
          return;
        }

        setPrediction(data.prediction);
      } catch (error) {
        console.error(error);
        setErrorMsg("Failed to fetch prediction. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [open, filters, user?.id]);

  if (!open) return null;

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(10px)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontFamily: "'Syne', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          textAlign: "center",
          padding: 20,
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          border: "3px solid rgba(244,114,182,0.15)",
          borderTopColor: "#f472b6",
          animation: "pred-spin 0.8s linear infinite",
        }} />
        🎯 Analyzing Previous Year Papers...
        <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>
          This may take 10-30 seconds
        </span>
        <style>{`@keyframes pred-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Rate limit reached
  if (limitReached) {
    return (
      <>
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)", zIndex: 9999,
            display: "flex", justifyContent: "center", alignItems: "center", padding: 20,
          }}
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 420, background: "#120b1f",
              border: "1px solid rgba(244,114,182,0.2)", borderRadius: 20,
              padding: 28, textAlign: "center", color: "#fff",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>Daily Limit Reached</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              {user
                ? "You've used all 20 AI requests for today. Try again tomorrow."
                : "You've used your 5 free AI requests for today. Sign in with Google for 20 requests/day."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
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
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)", borderRadius: 10,
                  padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
        {showLogin && <LoginModal reason="limit" onClose={() => setShowLogin(false)} />}
      </>
    );
  }

  // Generic error
  if (errorMsg) {
    return (
      <div
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)", zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "center", padding: 20,
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 420, background: "#120b1f",
            border: "1px solid rgba(248,113,113,0.2)", borderRadius: 20,
            padding: 28, textAlign: "center", color: "#fff",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 20 }}>{errorMsg}</p>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", borderRadius: 10,
              padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Special messages (no papers / not enough papers)
  if (prediction?.message) {
    return (
      <div
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)", zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "center", padding: 20,
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 420, background: "#120b1f",
            border: "1px solid rgba(244,114,182,0.2)", borderRadius: 20,
            padding: 28, textAlign: "center", color: "#fff",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>
            {prediction.paperCount === 0 ? "No Papers Found" : "More Papers Needed"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 20 }}>
            {prediction.message}
          </p>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", borderRadius: 10,
              padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const hasContent =
    (prediction?.highProbabilityTopics?.length ?? 0) > 0 ||
    (prediction?.mediumProbabilityTopics?.length ?? 0) > 0 ||
    (prediction?.repeatedQuestions?.length ?? 0) > 0;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
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
            maxWidth: 950,
            maxHeight: "90vh",
            overflowY: "auto",
            background: "#120b1f",
            border: "1px solid rgba(244,114,182,0.2)",
            borderRadius: 20,
            padding: 24,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h2
              style={{
                color: "#fff",
                margin: 0,
                fontFamily: "'Syne', sans-serif",
              }}
            >
              🎯 AI Topic Prediction
            </h2>

            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 22,
              }}
            >
              ✕
            </button>
          </div>

          {/* Meta info */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24,
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: "rgba(255,255,255,0.4)",
          }}>
            <span>Analyzed {prediction?.analyzedPapers ?? prediction?.paperCount ?? 0} papers</span>
            <span>·</span>
            <span>Confidence: <strong style={{ color: confColor(prediction?.confidence) }}>{prediction?.confidence}</strong></span>
            {typeof prediction?.remaining === "number" && (
              <>
                <span>·</span>
                <span>{prediction.remaining} AI requests left today</span>
              </>
            )}
          </div>

          {!hasContent && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)" }}>
              No clear patterns found across the analyzed papers.
            </div>
          )}

          {/* High Probability Topics */}
          {(prediction?.highProbabilityTopics?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 style={{ color: "#f472b6" }}>🔥 High Probability Topics</h3>

              {prediction!.highProbabilityTopics.map((item) => (
                <div
                  key={item.topic}
                  style={{
                    padding: 14,
                    border: "1px solid rgba(244,114,182,0.15)",
                    borderRadius: 12,
                    marginBottom: 10,
                    color: "#fff",
                  }}
                >
                  <strong>{item.topic}</strong>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>
                    Appeared in {item.count} paper{item.count !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Medium Probability Topics */}
          {(prediction?.mediumProbabilityTopics?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 style={{ color: "#c084fc" }}>⚡ Medium Probability Topics</h3>

              {prediction!.mediumProbabilityTopics.map((item) => (
                <div
                  key={item.topic}
                  style={{
                    padding: 14,
                    border: "1px solid rgba(192,132,252,0.15)",
                    borderRadius: 12,
                    marginBottom: 10,
                    color: "#fff",
                  }}
                >
                  <strong>{item.topic}</strong>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>
                    Appeared in {item.count} paper{item.count !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Repeated Questions */}
          {(prediction?.repeatedQuestions?.length ?? 0) > 0 && (
            <section>
              <h3 style={{ color: "#fb923c" }}>📝 Repeated Questions</h3>

              {prediction!.repeatedQuestions.map((question) => (
                <div
                  key={question.question}
                  style={{
                    padding: 14,
                    border: "1px solid rgba(251,146,60,0.15)",
                    borderRadius: 12,
                    marginBottom: 14,
                    color: "#fff",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{question.question}</div>

                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                    Seen in: {question.years?.join(", ")}
                  </div>

                  <div style={{ marginTop: 6, color: "#fb923c", fontSize: 12 }}>
                    Confidence: {question.confidence}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedQuestion(question.question);
                      setAnswerModalOpen(true);
                    }}
                    style={{
                      marginTop: 12,
                      background: "linear-gradient(135deg,#f472b6,#c084fc)",
                      border: "none",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "8px 14px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    🤖 Ask AI About This Question
                  </button>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      <QuestionAnswerModal
        open={answerModalOpen}
        question={selectedQuestion}
        onClose={() => setAnswerModalOpen(false)}
      />
    </>
  );
}

function confColor(c?: string) {
  switch (c) {
    case "high": return "#4fffb0";
    case "medium": return "#fbbf24";
    case "low": return "#f87171";
    default: return "rgba(255,255,255,0.5)";
  }
}
