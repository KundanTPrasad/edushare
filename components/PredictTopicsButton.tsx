"use client";

import { useState } from "react";
import PredictionModal from "./PredictionModal";

interface Props {
  filters: {
    college: string;
    branch: string;
    semester: string;
    subject: string;
    resourceType: string;
  };
}

export default function PredictTopicsButton({
  filters,
}: Props) {
  const [open, setOpen] = useState(false);

  if (
    !filters.subject ||
    filters.resourceType === "Notes"
  ) {
    return null;
  }

  return (
    <>
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto 24px",
          padding: "0 16px",
        }}
      >
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%",
            background:
              "linear-gradient(135deg, rgba(244,114,182,0.12), rgba(192,132,252,0.12))",
            border: "1px solid rgba(244,114,182,0.2)",
            borderRadius: 16,
            padding: "16px 20px",
            cursor: "pointer",
            color: "#fff",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 6,
            }}
          >
            🎯 Predict Important Topics
          </div>

          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Analyze previous year papers and identify
            recurring topics & repeated questions.
          </div>
        </button>
      </div>

      <PredictionModal
        open={open}
        onClose={() => setOpen(false)}
        filters={filters}
      />
    </>
  );
}
