"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageViewer from "./ImageViewer";

const css = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .skill-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
  }
  @media (max-width: 1280px) { .skill-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (max-width: 1024px) { .skill-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 640px)  { .skill-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  @media (max-width: 380px)  { .skill-grid { grid-template-columns: 1fr; } }

  .skill-card {
    position: relative; border-radius: 16px; overflow: hidden; cursor: pointer;
    background: rgba(20,12,28,0.85); border: 1px solid rgba(192,132,252,0.12);
    transition: transform 0.45s cubic-bezier(0.23,1,0.32,1), border-color 0.3s, box-shadow 0.4s;
    animation: fadeInUp 0.4s ease both; font-family: 'DM Sans', sans-serif;
  }
  .skill-card:hover {
    transform: translateY(-5px) scale(1.02);
    border-color: rgba(192,132,252,0.45);
    box-shadow: 0 0 32px rgba(192,132,252,0.12);
  }
  .skill-card:hover .glow-border  { opacity: 1; }
  .skill-card:hover .corner-tr    { opacity: 1; }
  .skill-card:hover .corner-bl    { opacity: 1; }
  .skill-card:hover .thumb-img    { transform: scale(1.08); filter: brightness(0.8) saturate(0.95); }
  .skill-card:hover .badge        { background: rgba(192,132,252,0.22); }
  .skill-card:hover .view-btn     { opacity: 1; transform: translateY(0); }

  .glow-border {
    position: absolute; inset: -1px; border-radius: 16px;
    background: linear-gradient(135deg, rgba(192,132,252,0.35), rgba(244,114,182,0.25), transparent 65%);
    opacity: 0; transition: opacity 0.4s; pointer-events: none; z-index: 0;
  }

  .corner-tr {
    position: absolute; top: 8px; right: 8px; width: 14px; height: 14px;
    border-top: 1.5px solid #c084fc; border-right: 1.5px solid #c084fc;
    border-radius: 0 3px 0 0; z-index: 10; opacity: 0; transition: opacity 0.3s;
  }
  .corner-bl {
    position: absolute; bottom: 8px; left: 8px; width: 14px; height: 14px;
    border-bottom: 1.5px solid #c084fc; border-left: 1.5px solid #c084fc;
    border-radius: 0 0 0 3px; z-index: 10; opacity: 0; transition: opacity 0.3s;
  }

  .thumb-wrap { position: relative; height: 150px; overflow: hidden; background: #1a0e24; }
  .thumb-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    filter: brightness(0.72) saturate(0.85);
    transition: transform 0.65s cubic-bezier(0.23,1,0.32,1), filter 0.4s;
  }
  .thumb-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 30%, rgba(20,12,28,1) 100%); z-index: 2;
  }

  .badge {
    position: absolute; top: 8px; left: 8px; z-index: 6;
    font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #c084fc; background: rgba(192,132,252,0.1);
    border: 1px solid rgba(192,132,252,0.28); border-radius: 5px;
    padding: 2px 7px; transition: background 0.3s;
  }

  .view-count {
    position: absolute; top: 8px; right: 8px; z-index: 6;
    font-family: 'DM Mono', monospace; font-size: 9px;
    color: rgba(255,255,255,0.5); background: rgba(0,0,0,0.45);
    border-radius: 5px; padding: 2px 7px;
    display: flex; align-items: center; gap: 4px;
  }

  .subject-label {
    position: absolute; bottom: 10px; left: 10px; right: 10px; z-index: 6;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
    color: #fff; line-height: 1.3; text-shadow: 0 2px 12px rgba(0,0,0,0.8);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  .view-btn {
    position: absolute; inset: 0; z-index: 7;
    display: flex; align-items: center; justify-content: center;
    background: rgba(20,12,28,0.55);
    opacity: 0; transform: translateY(6px); transition: opacity 0.3s, transform 0.3s;
  }
  .view-btn span {
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #1a0a20; background: #c084fc; border-radius: 7px; padding: 6px 14px;
  }

  .card-body { position: relative; z-index: 2; padding: 10px 12px 12px; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }

  .chip {
    font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.04em;
    color: rgba(192,132,252,0.75); background: rgba(192,132,252,0.08);
    border: 1px solid rgba(192,132,252,0.18); border-radius: 999px; padding: 2px 8px;
  }
  .chip-accent { color: #f472b6; background: rgba(244,114,182,0.1); border-color: rgba(244,114,182,0.28); }

  .star-row { display: flex; align-items: center; gap: 2px; margin-bottom: 7px; }
  .star { font-size: 12px; cursor: pointer; background: none; border: none; padding: 0; line-height: 1; transition: transform 0.1s; }
  .star:hover { transform: scale(1.25); }

  .card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.055);
  }
  .level-tag { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.05em; color: rgba(255,255,255,0.28); }
  .rt-tag { font-family: 'DM Mono', monospace; font-size: 9px; color: rgba(192,132,252,0.6); letter-spacing: 0.04em; }

  .skeleton {
    background: linear-gradient(90deg, rgba(192,132,252,0.04) 25%, rgba(192,132,252,0.08) 50%, rgba(192,132,252,0.04) 75%);
    background-size: 400px 100%; animation: shimmer 1.4s infinite;
    border-radius: 16px; height: 220px; border: 1px solid rgba(192,132,252,0.07);
  }
  @keyframes shimmer { to { background-position: -400px 0; } }

  .empty-state {
    grid-column: 1 / -1; text-align: center;
    padding: 40px 20px; font-family: 'Syne', sans-serif; color: rgba(255,255,255,0.2);
  }
  .empty-state svg { margin: 0 auto 12px; display: block; opacity: 0.2; }
  .empty-state p { font-size: 13px; margin: 0; }

  .load-more-wrap { display: flex; justify-content: center; margin-top: 20px; }
  .load-more-btn {
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(192,132,252,0.75); background: rgba(192,132,252,0.06);
    border: 1px solid rgba(192,132,252,0.18); border-radius: 8px;
    padding: 8px 24px; cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .load-more-btn:hover { background: rgba(192,132,252,0.12); border-color: rgba(192,132,252,0.35); color: #c084fc; }
`;

interface SkillGridProps {
  category: string;
  levelFilter: string; // "" = all levels
}

export default function SkillGrid({ category, levelFilter }: SkillGridProps) {
  const [skills, setSkills]               = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [visibleCount, setVisibleCount]   = useState(0);
  const [ratings, setRatings]             = useState<Record<string, number>>({});

  const getPageSize = () => (typeof window !== "undefined" && window.innerWidth <= 640 ? 5 : 10);

  useEffect(() => {
    setVisibleCount(getPageSize());
    fetchSkills();
  }, [category, levelFilter]);

  const fetchSkills = async () => {
    setLoading(true);
    let query = supabase.from("skills").select("*").eq("status", "approved").eq("category", category);

    if (levelFilter) query = query.eq("level", levelFilter);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      console.error("SkillGrid fetch error:", JSON.stringify(error));
      setLoading(false);
      return;
    }
    setSkills(data || []);
    setLoading(false);
  };

  const handleRate = async (skillId: string, star: number) => {
    setRatings((prev) => ({ ...prev, [skillId]: star }));
    await supabase.from("skills").update({ rating: star }).eq("id", skillId);
  };

  const handleView = async (skill: any) => {
    setSelectedSkill(skill);
    const newViews = (skill.views ?? 0) + 1;
    setSkills((prev) =>
      prev.map((s) => s.id === skill.id ? { ...s, views: newViews } : s)
    );
    await supabase.from("skills").update({ views: newViews }).eq("id", skill.id);
  };

  const visibleSkills = skills.slice(0, visibleCount);
  const hasMore = visibleCount < skills.length;

  return (
    <>
      <style>{css}</style>

      <div className="skill-grid">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ animationDelay: `${i * 0.06}s` }} />
            ))
          : skills.length === 0
          ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M9 12h6m-3-3v6M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12z" strokeLinecap="round"/>
              </svg>
              <p>No skill resources found</p>
            </div>
          )
          : visibleSkills.map((skill, i) => {
            const rating = ratings[skill.id] ?? skill.rating ?? 0;
            const views  = skill.views ?? 0;
            return (
              <div
                key={skill.id}
                className="skill-card"
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => handleView(skill)}
              >
                <div className="glow-border" />
                <div className="corner-tr" />
                <div className="corner-bl" />

                <div className="thumb-wrap">
                  <img src={skill.thumbnail_url} alt={skill.title} className="thumb-img" />
                  <div className="thumb-overlay" />
                  <span className="badge">{skill.file_type}</span>
                  <span className="view-count">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    {views}
                  </span>
                  <div className="subject-label">{skill.title}</div>
                  <div className="view-btn"><span>View</span></div>
                </div>

                <div className="card-body">
                  <div className="meta-row">
                    <span className="chip">{skill.category}</span>
                    <span className="chip chip-accent">{skill.level}</span>
                  </div>

                  <div className="star-row" onClick={(e) => e.stopPropagation()}>
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        className="star"
                        onClick={() => handleRate(skill.id, star)}
                        style={{ color: star <= rating ? "#c084fc" : "rgba(255,255,255,0.18)" }}
                      >
                        ★
                      </button>
                    ))}
                    {rating > 0 && (
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>
                        {rating}/5
                      </span>
                    )}
                  </div>

                  <div className="card-footer">
                    <span className="level-tag">{skill.level}</span>
                    <span className="rt-tag">{skill.resource_type}</span>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>

      {!loading && hasMore && (
        <div className="load-more-wrap">
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((c) => c + getPageSize())}
          >
            Load more ({skills.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {selectedSkill && (
        <ImageViewer
          fileUrl={selectedSkill.file_url}
          fileType={selectedSkill.file_type}
          title={selectedSkill.title}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </>
  );
}
