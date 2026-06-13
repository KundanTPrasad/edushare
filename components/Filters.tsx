"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const css = `
  @keyframes filterFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .filters-wrap {
    padding: 0 16px 28px;
    max-width: 1400px;
    margin: 0 auto;
    animation: filterFadeIn 0.4s ease both;
  }
  .filters-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(244,114,182,0.45);
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .filters-label::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(244,114,182,0.1);
  }
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  }
  @media (max-width: 1024px) { .filters-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 600px)  { .filters-grid { grid-template-columns: repeat(2, 1fr); } }
  .filter-item { position: relative; }
  .filter-select {
    width: 100%; appearance: none; -webkit-appearance: none;
    background: rgba(244,114,182,0.04);
    border: 1px solid rgba(244,114,182,0.12);
    border-radius: 10px; padding: 10px 32px 10px 12px;
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
    color: rgba(255,255,255,0.7); letter-spacing: 0.03em;
    cursor: pointer; outline: none;
    transition: border-color 0.2s, background 0.2s, color 0.2s;
  }
  .filter-select:hover { border-color: rgba(244,114,182,0.3); background: rgba(244,114,182,0.07); }
  .filter-select:focus { border-color: rgba(244,114,182,0.55); background: rgba(244,114,182,0.08); color: #fff; box-shadow: 0 0 0 3px rgba(244,114,182,0.07); }
  .filter-select.active { border-color: rgba(244,114,182,0.5); background: rgba(244,114,182,0.1); color: #f472b6; }
  .filter-select option { background: #0f0a14; color: #fff; }
  .filter-arrow {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: rgba(244,114,182,0.4);
    display: flex; align-items: center;
  }
  .filter-arrow svg { width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .filters-actions { display: flex; align-items: center; justify-content: flex-end; margin-top: 10px; gap: 8px; }
  .filter-active-count { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(244,114,182,0.6); letter-spacing: 0.05em; opacity: 0; transition: opacity 0.2s; }
  .filter-active-count.visible { opacity: 1; }
  .filter-reset {
    font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: rgba(255,100,100,0.55); background: rgba(255,80,80,0.06);
    border: 1px solid rgba(255,80,80,0.15); border-radius: 6px;
    padding: 5px 12px; cursor: pointer; transition: all 0.2s;
    opacity: 0; pointer-events: none;
  }
  .filter-reset.visible { opacity: 1; pointer-events: all; }
  .filter-reset:hover { background: rgba(255,80,80,0.12); border-color: rgba(255,80,80,0.35); color: rgba(255,100,100,0.9); }
`;

const EMPTY = { college: "", branch: "", semester: "", subject: "", year: "", resourceType: "" };

const FIELDS = [
  { key: "college",      label: "College"       },
  { key: "resourceType", label: "Resource Type" },
  { key: "branch",       label: "Branch"        },
  { key: "semester",     label: "Semester"      },
  { key: "subject",      label: "Subject"       },
  { key: "year",         label: "Year"          },
] as const;

export default function Filters({ filters, setFilters }: { filters: any; setFilters: any }) {
  const [colleges, setColleges] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [years,    setYears]    = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("papers").select("college, branch, subject, year");
      if (error) return;
      setColleges([...new Set(data.map((p) => p.college))]);
      setBranches([...new Set(data.map((p) => p.branch))]);
      setSubjects([...new Set(data.map((p) => p.subject))]);
      setYears(([...new Set(data.map((p) => p.year))] as number[]).sort().reverse());
    })();
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const optionsFor = (key: string) => {
    if (key === "college")  return colleges.map((c) => ({ value: c, label: c }));
    if (key === "branch")   return branches.map((b) => ({ value: b, label: b }));
    if (key === "semester") return [1,2,3,4,5,6,7,8].map((s) => ({ value: s, label: `Sem ${s}` }));
    if (key === "subject")  return subjects.map((s) => ({ value: s, label: s }));
    if (key === "year")     return years.map((y) => ({ value: y, label: String(y) }));
    if (key === "resourceType") return [
      { value: "Notes",     label: "📝 Notes"     },
      { value: "End Sem",   label: "📄 End Sem"   },
      { value: "Mid Sem 1", label: "📚 Mid Sem 1" },
      { value: "Mid Sem 2", label: "📚 Mid Sem 2" },
    ];
    return [];
  };

  return (
    <>
      <style>{css}</style>
      <section className="filters-wrap">
        <div className="filters-label">Filter Resources</div>
        <div className="filters-grid">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="filter-item">
              <select
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className={`filter-select${filters[key] ? " active" : ""}`}
              >
                <option value="">{label}</option>
                {optionsFor(key).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span className="filter-arrow">
                <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </div>
          ))}
        </div>
        <div className="filters-actions">
          <span className={`filter-active-count${activeCount > 0 ? " visible" : ""}`}>
            {activeCount} filter{activeCount !== 1 ? "s" : ""} active
          </span>
          <button
            className={`filter-reset${activeCount > 0 ? " visible" : ""}`}
            onClick={() => setFilters(EMPTY)}
          >
            ✕ Clear
          </button>
        </div>
      </section>
    </>
  );
}
