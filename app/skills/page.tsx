"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SkillGrid from "@/components/SkillGrid";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const css = `
  @keyframes filterFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .skills-hero {
    text-align: center; padding: 56px 24px 32px; position: relative;
  }
  .skills-hero-glow {
    position: absolute; top: 5%; left: 50%; transform: translateX(-50%);
    width: 500px; height: 280px;
    background: radial-gradient(ellipse, rgba(192,132,252,0.1) 0%, rgba(244,114,182,0.06) 40%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .skills-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(192,132,252,0.08);
    border: 1px solid rgba(192,132,252,0.2);
    border-radius: 999px; padding: 5px 16px; margin-bottom: 20px;
  }
  .skills-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #c084fc; box-shadow: 0 0 8px #c084fc; display: inline-block;
  }
  .skills-eyebrow-text {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
    color: rgba(192,132,252,0.8); text-transform: uppercase;
  }
  .skills-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(2.2rem, 5.5vw, 3.6rem);
    letter-spacing: -0.03em; line-height: 1.05; color: #fff; margin-bottom: 14px;
  }
  .skills-title span {
    background: linear-gradient(135deg, #c084fc, #f472b6, #fb923c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .skills-sub {
    font-size: clamp(0.92rem, 2vw, 1.05rem);
    color: rgba(255,255,255,0.4); max-width: 520px; margin: 0 auto;
    font-family: 'DM Sans', sans-serif; line-height: 1.7;
  }

  /* Level filter */
  .level-filter-wrap {
    max-width: 1400px; margin: 0 auto; padding: 0 16px 28px;
    display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
    animation: filterFadeIn 0.4s ease both;
  }
  .level-pill {
    font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500;
    letter-spacing: 0.05em; padding: 8px 20px; border-radius: 999px;
    border: 1px solid rgba(192,132,252,0.15);
    background: rgba(192,132,252,0.04); color: rgba(255,255,255,0.5);
    cursor: pointer; transition: all 0.2s;
  }
  .level-pill:hover { border-color: rgba(192,132,252,0.4); color: rgba(255,255,255,0.85); }
  .level-pill.active {
    background: rgba(192,132,252,0.14); border-color: rgba(192,132,252,0.5);
    color: #c084fc; font-weight: 700;
  }

  /* Category sections */
  .category-section { margin-bottom: 56px; }
  .category-header {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 20px; padding-bottom: 14px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .category-bar {
    width: 4px; height: 28px; border-radius: 4px;
    background: linear-gradient(180deg, #c084fc, #f472b6);
    box-shadow: 0 0 12px rgba(192,132,252,0.4);
  }
  .category-title {
    font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
    color: #fff; margin: 0; letter-spacing: -0.01em;
  }
  .category-sub {
    font-family: 'DM Mono', monospace; font-size: 11px;
    color: rgba(255,255,255,0.28); margin: 0; letter-spacing: 0.04em;
  }

  .skills-empty {
    text-align: center; padding: 60px 20px;
    font-family: 'Syne', sans-serif; color: rgba(255,255,255,0.25);
  }
`;

export default function SkillsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Fetch distinct categories from approved skills
      let query = supabase.from("skills").select("category").eq("status", "approved");
      if (levelFilter) query = query.eq("level", levelFilter);

      const { data, error } = await query;
      if (error) {
        console.error("Skills categories fetch error:", JSON.stringify(error));
        setLoading(false);
        return;
      }
      const unique = [...new Set((data || []).map((d: any) => d.category).filter(Boolean))];
      setCategories(unique as string[]);
      setLoading(false);
    })();
  }, [levelFilter]);

  return (
    <>
      <style>{css}</style>

      {/* Hero */}
      <section className="skills-hero">
        <div className="skills-hero-glow" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="skills-eyebrow">
            <span className="skills-eyebrow-dot" />
            <span className="skills-eyebrow-text">Community Skill Resources</span>
          </div>
          <h1 className="skills-title">
            Edu<span>Skills</span>
          </h1>
          <p className="skills-sub">
            Tutorials, projects, workshops &amp; references shared by students — organized by category and skill level.
          </p>
        </div>
      </section>

      {/* Level filter */}
      <div className="level-filter-wrap">
        <button
          className={`level-pill ${levelFilter === "" ? "active" : ""}`}
          onClick={() => setLevelFilter("")}
        >
          All Levels
        </button>
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            className={`level-pill ${levelFilter === lvl ? "active" : ""}`}
            onClick={() => setLevelFilter(lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Category sections */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px 80px" }}>
        {loading ? (
          <div className="skills-empty">Loading categories…</div>
        ) : categories.length === 0 ? (
          <div className="skills-empty">No skill resources available yet.</div>
        ) : (
          categories.map((category) => (
            <section key={category} className="category-section">
              <div className="category-header">
                <div className="category-bar" />
                <div>
                  <h2 className="category-title">{category}</h2>
                  <p className="category-sub">
                    {levelFilter ? `${levelFilter} resources` : "All levels"}
                  </p>
                </div>
              </div>
              <SkillGrid category={category} levelFilter={levelFilter} />
            </section>
          ))
        )}
      </div>
    </>
  );
}
