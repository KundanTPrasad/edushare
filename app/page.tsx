"use client";
import PredictTopicsButton from "@/components/PredictTopicsButton";
import Hero from "@/components/Hero";
import Filters from "@/components/Filters";
import UploadPopup from "@/components/UploadPopup";
import PaperGrid from "@/components/PaperGrid";
import { useState } from "react";

const SECTIONS = [
  {
    key: "Notes",
    label: "📝 Notes",
    subtitle: "Study notes shared by students",
    resourceTypes: ["Notes"],
    color: "#f472b6",
  },
  {
    key: "PYQ",
    label: "📄 PYQ",
    subtitle: "Previous Year Question Papers (End Semester)",
    resourceTypes: ["End Sem"],
    color: "#c084fc",
  },
  {
    key: "Mid Sem",
    label: "📚 Mid Sem",
    subtitle: "Mid Semester exam papers",
    resourceTypes: ["Mid Sem 1", "Mid Sem 2"],
    color: "#fb923c",
  },
];

export default function Home() {
  const [filters, setFilters] = useState({
    college: "",
    branch: "",
    semester: "",
    subject: "",
    year: "",
    resourceType: "",
  });

  return (
    <>
    <Hero />
        <Filters filters={filters} setFilters={setFilters} />
        <PredictTopicsButton filters={filters} />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px 80px" }}>
        {SECTIONS.map((section) => {
          const activeRT = filters.resourceType;

          const isFiltered =
            activeRT &&
            !section.resourceTypes.includes(activeRT);

          if (isFiltered) return null;

          const sectionFilters = {
            ...filters,
            resourceType: activeRT || section.resourceTypes[0],
            _resourceTypes: section.resourceTypes,
          };

          return (
            <section key={section.key} style={{ marginBottom: 56 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 20,
                  paddingBottom: 14,
                  borderBottom: `1px solid rgba(255,255,255,0.06)`,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 28,
                    borderRadius: 4,
                    background: section.color,
                    boxShadow: `0 0 12px ${section.color}66`,
                  }}
                />

                <div>
                  <h2
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#fff",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {section.label}
                  </h2>

                  <p
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.28)",
                      margin: 0,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {section.subtitle}
                  </p>
                </div>
              </div>

              <PaperGrid
                filters={{
                  ...filters,
                  _sectionResourceTypes: section.resourceTypes,
                  resourceType:
                    activeRT &&
                    section.resourceTypes.includes(activeRT)
                      ? activeRT
                      : "",
                }}
                sectionResourceTypes={section.resourceTypes}
                accentColor={section.color}
              />
            </section>
          );
        })}
      </div>

      <UploadPopup />
    </>
  );
}
