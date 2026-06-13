"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Paper = {
  id: string;
  subject: string;
  college: string;
  branch: string;
  semester: number;
  year: number;
  resource_type: string;
  status: "pending" | "approved" | "rejected";
  file_url: string;
  thumbnail_url: string;
  file_type: "pdf" | "image";
  created_at: string;
};

type Skill = {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  resource_type: string;
  status: "pending" | "approved" | "rejected";
  file_url: string;
  thumbnail_url: string;
  file_type: "pdf" | "image";
  created_at: string;
};

type ActionState = { [id: string]: "approving" | "rejecting" | "deleting" | null };
type ContentType = "papers" | "skills";

const RESOURCE_TYPES = ["Notes", "Mid Sem 1", "Mid Sem 2", "End Sem"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SKILL_RESOURCE_TYPES = ["Tutorial", "Project", "Workshop", "Reference"];

export default function AdminPage() {
  const [contentType, setContentType] = useState<ContentType>("papers");

  const [papers, setPapers] = useState<Paper[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [actionState, setActionState] = useState<ActionState>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPapers = useCallback(async () => {
    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPapers(data || []);
    setLoading(false);
  }, []);

  const fetchSkills = useCallback(async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setSkills(data || []);
    setLoading(false);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPapers(), fetchSkills()]);
    setLoading(false);
  }, [fetchPapers, fetchSkills]);

  useEffect(() => {
    if (!localStorage.getItem("admin-auth")) {
      router.push("/kundankp/login");
      return;
    }
    fetchAll();
  }, [router, fetchAll]);

  /* ───── Papers actions ───── */
  const approvePaper = async (id: string) => {
  setActionState((s) => ({
    ...s,
    [id]: "approving",
  }));

  const { error } = await supabase
    .from("papers")
    .update({
      status: "approved",
    })
    .eq("id", id);

  if (error) {
    showToast("Approve failed", "error");

    setActionState((s) => ({
      ...s,
      [id]: null,
    }));

    return;
  }

  try {
    const response = await fetch("/api/process-paper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paperId: id,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Paper processing failed:", result);
    }
  } catch (err) {
    console.error("Process paper error:", err);
  }

  showToast("Paper approved ✓");

  setActionState((s) => ({
    ...s,
    [id]: null,
  }));

  fetchPapers();
};

  const rejectPaper = async (id: string) => {
    setActionState((s) => ({ ...s, [id]: "rejecting" }));
    const { error } = await supabase.from("papers").update({ status: "rejected" }).eq("id", id);
    if (error) showToast("Reject failed", "error");
    else showToast("Paper rejected");
    setActionState((s) => ({ ...s, [id]: null }));
    fetchPapers();
  };

  const deletePaper = async (id: string) => {
    setActionState((s) => ({ ...s, [id]: "deleting" }));
    const { error } = await supabase.from("papers").delete().eq("id", id);
    if (error) showToast("Delete failed", "error");
    else showToast("Paper deleted");
    setActionState((s) => ({ ...s, [id]: null }));
    setDeleteConfirm(null);
    fetchPapers();
  };

  const updatePaper = async () => {
    if (!editingPaper) return;
    setSaving(true);
    const { error } = await supabase.from("papers").update({
      college: editingPaper.college,
      branch: editingPaper.branch,
      semester: editingPaper.semester,
      subject: editingPaper.subject,
      year: editingPaper.year,
      resource_type: editingPaper.resource_type,
    }).eq("id", editingPaper.id);
    setSaving(false);
    if (error) { showToast("Update failed", "error"); return; }
    showToast("Paper updated ✓");
    setEditingPaper(null);
    fetchPapers();
  };

  /* ───── Skills actions ───── */
  const approveSkill = async (id: string) => {
    setActionState((s) => ({ ...s, [id]: "approving" }));
    const { error } = await supabase.from("skills").update({ status: "approved" }).eq("id", id);
    if (error) showToast("Approve failed", "error");
    else showToast("Skill approved ✓");
    setActionState((s) => ({ ...s, [id]: null }));
    fetchSkills();
  };

  const rejectSkill = async (id: string) => {
    setActionState((s) => ({ ...s, [id]: "rejecting" }));
    const { error } = await supabase.from("skills").update({ status: "rejected" }).eq("id", id);
    if (error) showToast("Reject failed", "error");
    else showToast("Skill rejected");
    setActionState((s) => ({ ...s, [id]: null }));
    fetchSkills();
  };

  const deleteSkill = async (id: string) => {
    setActionState((s) => ({ ...s, [id]: "deleting" }));
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) showToast("Delete failed", "error");
    else showToast("Skill deleted");
    setActionState((s) => ({ ...s, [id]: null }));
    setDeleteConfirm(null);
    fetchSkills();
  };

  const updateSkill = async () => {
    if (!editingSkill) return;
    setSaving(true);
    const { error } = await supabase.from("skills").update({
      title: editingSkill.title,
      category: editingSkill.category,
      level: editingSkill.level,
      description: editingSkill.description,
      resource_type: editingSkill.resource_type,
    }).eq("id", editingSkill.id);
    setSaving(false);
    if (error) { showToast("Update failed", "error"); return; }
    showToast("Skill updated ✓");
    setEditingSkill(null);
    fetchSkills();
  };

  const logout = () => {
    localStorage.removeItem("admin-auth");
    router.push("/kundnakp/login");
  };

  /* ───── Filtering ───── */
  const filteredPapers = papers.filter((p) => {
    if (p.status !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.subject?.toLowerCase().includes(q) ||
      p.college?.toLowerCase().includes(q) ||
      p.branch?.toLowerCase().includes(q)
    );
  });

  const filteredSkills = skills.filter((s) => {
    if (s.status !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.level?.toLowerCase().includes(q)
    );
  });

  const paperCounts = {
    pending: papers.filter((p) => p.status === "pending").length,
    approved: papers.filter((p) => p.status === "approved").length,
    rejected: papers.filter((p) => p.status === "rejected").length,
  };

  const skillCounts = {
    pending: skills.filter((s) => s.status === "pending").length,
    approved: skills.filter((s) => s.status === "approved").length,
    rejected: skills.filter((s) => s.status === "rejected").length,
  };

  const counts = contentType === "papers" ? paperCounts : skillCounts;
  const totalCount = contentType === "papers" ? papers.length : skills.length;

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-root {
          min-height: 100vh;
          background: #05070d;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          position: relative;
        }

        .adm-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none; z-index: 0;
        }

        .adm-orb {
          position: fixed; border-radius: 50%;
          filter: blur(100px); pointer-events: none; z-index: 0;
        }
        .orb-a {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(79,255,176,0.05), transparent 70%);
          top: -200px; right: -100px;
        }
        .orb-b {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(56,189,248,0.04), transparent 70%);
          bottom: 0; left: 0;
        }

        .topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(5,7,13,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 2rem;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .topbar-brand {
          font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 800;
          letter-spacing: -0.02em; color: #fff;
          display: flex; align-items: center; gap: 0.5rem;
        }

        .topbar-brand-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4fffb0;
          box-shadow: 0 0 8px #4fffb0;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }

        .topbar-right {
          display: flex; align-items: center; gap: 0.75rem;
        }

        .topbar-tag {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
        }

        .logout-btn {
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          border: 1px solid rgba(239,68,68,0.25);
          background: rgba(239,68,68,0.07);
          color: #f87171;
          font-size: 0.78rem; font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.14);
          border-color: rgba(239,68,68,0.45);
        }

        .adm-body {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* Content type switcher */
        .content-switch {
          display: flex; gap: 0.5rem; margin-bottom: 1.5rem;
        }
        .content-switch-btn {
          padding: 0.55rem 1.5rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.4);
          font-size: 0.85rem; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Syne', sans-serif;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .content-switch-btn:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.15); }
        .content-switch-btn.active-papers {
          background: rgba(244,114,182,0.1);
          border-color: rgba(244,114,182,0.3);
          color: #f472b6;
        }
        .content-switch-btn.active-skills {
          background: rgba(192,132,252,0.1);
          border-color: rgba(192,132,252,0.3);
          color: #c084fc;
        }
        .content-switch-count {
          font-size: 0.68rem; font-weight: 600;
          padding: 1px 7px; border-radius: 999px;
          background: rgba(255,255,255,0.08);
          font-family: 'DM Mono', monospace;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem; margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
        }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.25rem 1.5rem;
          transition: border-color 0.2s;
        }

        .stat-card:hover { border-color: rgba(255,255,255,0.12); }

        .stat-label {
          font-size: 0.7rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          font-family: 'DM Mono', monospace;
          margin-bottom: 0.6rem;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2rem; font-weight: 800;
          line-height: 1; letter-spacing: -0.03em;
        }

        .stat-total .stat-value { color: #fff; }
        .stat-pending .stat-value { color: #fbbf24; }
        .stat-approved .stat-value { color: #4fffb0; }
        .stat-rejected .stat-value { color: #f87171; }

        .stat-pending { border-color: rgba(251,191,36,0.12); }
        .stat-approved { border-color: rgba(79,255,176,0.12); }
        .stat-rejected { border-color: rgba(248,113,113,0.12); }

        .toolbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .tabs { display: flex; gap: 0.35rem; }

        .tab-btn {
          padding: 0.45rem 1rem;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255,255,255,0.35);
          font-size: 0.82rem; font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; gap: 0.4rem;
          font-family: 'DM Sans', sans-serif;
        }

        .tab-btn:hover { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.04); }

        .tab-btn.active-pending {
          background: rgba(251,191,36,0.1);
          border-color: rgba(251,191,36,0.25);
          color: #fbbf24;
        }
        .tab-btn.active-approved {
          background: rgba(79,255,176,0.1);
          border-color: rgba(79,255,176,0.25);
          color: #4fffb0;
        }
        .tab-btn.active-rejected {
          background: rgba(248,113,113,0.1);
          border-color: rgba(248,113,113,0.25);
          color: #f87171;
        }

        .tab-count {
          font-size: 0.68rem; font-weight: 600;
          padding: 1px 6px; border-radius: 999px;
          background: rgba(255,255,255,0.08);
          font-family: 'DM Mono', monospace;
        }

        .search-wrap {
          position: relative;
        }

        .search-wrap svg {
          position: absolute; left: 10px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2); pointer-events: none;
        }

        .search-input {
          padding: 0.45rem 0.9rem 0.45rem 2.2rem;
          border-radius: 9px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff; font-size: 0.82rem;
          font-family: 'DM Sans', sans-serif;
          outline: none; width: 220px;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }
        .search-input:focus { border-color: rgba(79,255,176,0.4); }

        .papers-grid {
          display: flex; flex-direction: column; gap: 0.75rem;
        }

        .paper-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.25rem 1.5rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1rem; align-items: center;
          transition: border-color 0.2s, background 0.2s;
          animation: slide-in 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .paper-card:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
        }

        @media (max-width: 640px) {
          .paper-card { grid-template-columns: 1fr; }
          .paper-thumb { display: none; }
        }

        .paper-thumb {
          width: 56px; height: 72px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
        }

        .paper-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .paper-info { min-width: 0; }

        .paper-subject {
          font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 700;
          color: #fff; margin-bottom: 0.35rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .paper-meta {
          display: flex; flex-wrap: wrap; gap: 0.4rem;
          margin-bottom: 0.5rem;
        }

        .meta-chip {
          font-size: 0.7rem; font-weight: 500;
          padding: 2px 8px; border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.5);
          font-family: 'DM Mono', monospace;
          white-space: nowrap;
        }

        .paper-date {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.2);
          font-family: 'DM Mono', monospace;
        }

        .paper-actions {
          display: flex; flex-direction: column; gap: 0.4rem;
          align-items: flex-end;
        }

        .actions-row {
          display: flex; gap: 0.4rem; flex-wrap: wrap; justify-content: flex-end;
        }

        .action-btn {
          padding: 0.4rem 0.85rem;
          border-radius: 8px; border: 1px solid transparent;
          font-size: 0.75rem; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 0.3rem;
          white-space: nowrap;
        }

        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-approve {
          background: rgba(79,255,176,0.1); border-color: rgba(79,255,176,0.25); color: #4fffb0;
        }
        .btn-approve:hover:not(:disabled) { background: rgba(79,255,176,0.18); border-color: rgba(79,255,176,0.45); }

        .btn-reject {
          background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.2); color: #f87171;
        }
        .btn-reject:hover:not(:disabled) { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.4); }

        .btn-edit {
          background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); color: #38bdf8;
        }
        .btn-edit:hover:not(:disabled) { background: rgba(56,189,248,0.15); border-color: rgba(56,189,248,0.4); }

        .btn-delete {
          background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.18); color: #ef4444;
        }
        .btn-delete:hover:not(:disabled) { background: rgba(239,68,68,0.14); border-color: rgba(239,68,68,0.35); }

        .btn-view {
          background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5);
        }
        .btn-view:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.08); }

        .mini-spinner {
          width: 10px; height: 10px;
          border: 1.5px solid rgba(255,255,255,0.2);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .empty {
          text-align: center; padding: 4rem 2rem;
          color: rgba(255,255,255,0.2);
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .empty-title { font-family: 'Syne', sans-serif; font-size: 1rem; color: rgba(255,255,255,0.3); }

        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px; height: 96px;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: fade-in 0.2s ease;
        }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

        .modal {
          background: #0d1018;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          width: 100%; max-width: 500px;
          padding: 2rem;
          animation: modal-up 0.25s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 40px 80px rgba(0,0,0,0.7);
        }

        @keyframes modal-up {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem; font-weight: 800;
          margin-bottom: 1.5rem; color: #fff;
        }

        .modal-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0.75rem; margin-bottom: 1.5rem;
        }

        .modal-field { display: flex; flex-direction: column; gap: 0.35rem; }

        .modal-field.full { grid-column: span 2; }

        .field-label {
          font-size: 0.65rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          font-family: 'DM Mono', monospace;
        }

        .field-input {
          padding: 0.65rem 0.9rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff; font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        .field-input:focus { border-color: rgba(79,255,176,0.45); }

        .field-textarea {
          padding: 0.65rem 0.9rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff; font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
          resize: vertical; min-height: 70px;
        }
        .field-textarea:focus { border-color: rgba(79,255,176,0.45); }

        .field-select {
          padding: 0.65rem 0.9rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff; font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          outline: none; appearance: none;
          transition: border-color 0.2s; cursor: pointer;
        }
        .field-select:focus { border-color: rgba(79,255,176,0.45); }

        .modal-actions { display: flex; gap: 0.6rem; justify-content: flex-end; }

        .modal-save {
          padding: 0.65rem 1.5rem;
          border-radius: 10px; border: none;
          background: linear-gradient(135deg, #4fffb0, #38bdf8);
          color: #05070d; font-family: 'Syne', sans-serif;
          font-size: 0.875rem; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .modal-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .modal-save:hover:not(:disabled) { opacity: 0.88; }

        .modal-cancel {
          padding: 0.65rem 1.25rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .modal-cancel:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }

        .delete-modal-msg {
          color: rgba(255,255,255,0.5); font-size: 0.875rem;
          line-height: 1.6; margin-bottom: 1.5rem;
        }

        .btn-confirm-delete {
          padding: 0.65rem 1.5rem;
          border-radius: 10px; border: none;
          background: #ef4444; color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 0.875rem; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s;
        }
        .btn-confirm-delete:hover { opacity: 0.85; }

        .toast {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          z-index: 200;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 0.85rem; font-weight: 500;
          display: flex; align-items: center; gap: 0.5rem;
          animation: toast-in 0.3s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }

        @keyframes toast-in {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .toast-success {
          background: rgba(79,255,176,0.1);
          border: 1px solid rgba(79,255,176,0.3);
          color: #4fffb0;
        }

        .toast-error {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.3);
          color: #f87171;
        }

        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      <div className="adm-root">
        <div className="adm-orb orb-a" />
        <div className="adm-orb orb-b" />

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-brand">
            <div className="topbar-brand-dot" />
            EduShare Admin
          </div>
          <div className="topbar-right">
            <span className="topbar-tag">Console v1.0</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        <div className="adm-body">

          {/* Content type switcher */}
          <div className="content-switch">
            <button
              className={`content-switch-btn ${contentType === "papers" ? "active-papers" : ""}`}
              onClick={() => { setContentType("papers"); setSearch(""); }}
            >
              📄 Papers
              <span className="content-switch-count">{papers.length}</span>
            </button>
            <button
              className={`content-switch-btn ${contentType === "skills" ? "active-skills" : ""}`}
              onClick={() => { setContentType("skills"); setSearch(""); }}
            >
              🛠️ Skills
              <span className="content-switch-count">{skills.length}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card stat-total">
              <p className="stat-label">Total {contentType === "papers" ? "Papers" : "Skills"}</p>
              <p className="stat-value">{totalCount}</p>
            </div>
            <div className="stat-card stat-pending">
              <p className="stat-label">Pending</p>
              <p className="stat-value">{counts.pending}</p>
            </div>
            <div className="stat-card stat-approved">
              <p className="stat-label">Approved</p>
              <p className="stat-value">{counts.approved}</p>
            </div>
            <div className="stat-card stat-rejected">
              <p className="stat-label">Rejected</p>
              <p className="stat-value">{counts.rejected}</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="tabs">
              {(["pending", "approved", "rejected"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? `active-${tab}` : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="tab-count">{counts[tab]}</span>
                </button>
              ))}
            </div>
            <div className="search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="search-input"
                placeholder={contentType === "papers" ? "Search papers…" : "Search skills…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="papers-grid">
            {loading ? (
              [1,2,3].map((i) => <div key={i} className="skeleton" style={{ animationDelay: `${i*0.1}s` }} />)
            ) : contentType === "papers" ? (
              filteredPapers.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">
                    {activeTab === "pending" ? "📭" : activeTab === "approved" ? "✅" : "🚫"}
                  </div>
                  <p className="empty-title">No {activeTab} papers{search ? ` matching "${search}"` : "."}</p>
                </div>
              ) : filteredPapers.map((paper, i) => (
                <div key={paper.id} className="paper-card" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="paper-thumb">
                    {paper.thumbnail_url ? (
                      <img src={paper.thumbnail_url} alt="" />
                    ) : paper.file_type === "pdf" ? "📄" : "🖼️"}
                  </div>

                  <div className="paper-info">
                    <p className="paper-subject">{paper.subject}</p>
                    <div className="paper-meta">
                      <span className="meta-chip">{paper.college}</span>
                      <span className="meta-chip">{paper.branch}</span>
                      <span className="meta-chip">Sem {paper.semester}</span>
                      <span className="meta-chip">{paper.resource_type}</span>
                      <span className="meta-chip">{paper.year}</span>
                    </div>
                    <p className="paper-date">{fmtDate(paper.created_at)}</p>
                  </div>

                  <div className="paper-actions">
                    <div className="actions-row">
                      {paper.status === "pending" && (
                        <>
                          <button className="action-btn btn-approve" onClick={() => approvePaper(paper.id)} disabled={!!actionState[paper.id]}>
                            {actionState[paper.id] === "approving" ? <span className="mini-spinner" /> : "✓"} Approve
                          </button>
                          <button className="action-btn btn-reject" onClick={() => rejectPaper(paper.id)} disabled={!!actionState[paper.id]}>
                            {actionState[paper.id] === "rejecting" ? <span className="mini-spinner" /> : "✕"} Reject
                          </button>
                        </>
                      )}
                      {paper.status === "approved" && (
                        <button className="action-btn btn-reject" onClick={() => rejectPaper(paper.id)} disabled={!!actionState[paper.id]}>
                          {actionState[paper.id] === "rejecting" ? <span className="mini-spinner" /> : "✕"} Revoke
                        </button>
                      )}
                      {paper.status === "rejected" && (
                        <button className="action-btn btn-approve" onClick={() => approvePaper(paper.id)} disabled={!!actionState[paper.id]}>
                          {actionState[paper.id] === "approving" ? <span className="mini-spinner" /> : "✓"} Restore
                        </button>
                      )}
                      <button className="action-btn btn-edit" onClick={() => setEditingPaper(paper)}>✎ Edit</button>
                      <button className="action-btn btn-delete" onClick={() => setDeleteConfirm(paper.id)} disabled={!!actionState[paper.id]}>
                        {actionState[paper.id] === "deleting" ? <span className="mini-spinner" /> : "🗑"}
                      </button>
                    </div>
                    <div className="actions-row">
                      <a href={paper.file_url} target="_blank" rel="noopener noreferrer">
                        <button className="action-btn btn-view">↗ View File</button>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Skills list */
              filteredSkills.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">
                    {activeTab === "pending" ? "📭" : activeTab === "approved" ? "✅" : "🚫"}
                  </div>
                  <p className="empty-title">No {activeTab} skills{search ? ` matching "${search}"` : "."}</p>
                </div>
              ) : filteredSkills.map((skill, i) => (
                <div key={skill.id} className="paper-card" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="paper-thumb">
                    {skill.thumbnail_url ? (
                      <img src={skill.thumbnail_url} alt="" />
                    ) : skill.file_type === "pdf" ? "📄" : "🖼️"}
                  </div>

                  <div className="paper-info">
                    <p className="paper-subject">{skill.title}</p>
                    <div className="paper-meta">
                      <span className="meta-chip">{skill.category}</span>
                      <span className="meta-chip">{skill.level}</span>
                      <span className="meta-chip">{skill.resource_type}</span>
                    </div>
                    {skill.description && (
                      <p style={{
                        fontSize: "0.72rem", color: "rgba(255,255,255,0.3)",
                        marginBottom: "0.4rem", maxWidth: 480,
                        overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {skill.description}
                      </p>
                    )}
                    <p className="paper-date">{fmtDate(skill.created_at)}</p>
                  </div>

                  <div className="paper-actions">
                    <div className="actions-row">
                      {skill.status === "pending" && (
                        <>
                          <button className="action-btn btn-approve" onClick={() => approveSkill(skill.id)} disabled={!!actionState[skill.id]}>
                            {actionState[skill.id] === "approving" ? <span className="mini-spinner" /> : "✓"} Approve
                          </button>
                          <button className="action-btn btn-reject" onClick={() => rejectSkill(skill.id)} disabled={!!actionState[skill.id]}>
                            {actionState[skill.id] === "rejecting" ? <span className="mini-spinner" /> : "✕"} Reject
                          </button>
                        </>
                      )}
                      {skill.status === "approved" && (
                        <button className="action-btn btn-reject" onClick={() => rejectSkill(skill.id)} disabled={!!actionState[skill.id]}>
                          {actionState[skill.id] === "rejecting" ? <span className="mini-spinner" /> : "✕"} Revoke
                        </button>
                      )}
                      {skill.status === "rejected" && (
                        <button className="action-btn btn-approve" onClick={() => approveSkill(skill.id)} disabled={!!actionState[skill.id]}>
                          {actionState[skill.id] === "approving" ? <span className="mini-spinner" /> : "✓"} Restore
                        </button>
                      )}
                      <button className="action-btn btn-edit" onClick={() => setEditingSkill(skill)}>✎ Edit</button>
                      <button className="action-btn btn-delete" onClick={() => setDeleteConfirm(skill.id)} disabled={!!actionState[skill.id]}>
                        {actionState[skill.id] === "deleting" ? <span className="mini-spinner" /> : "🗑"}
                      </button>
                    </div>
                    <div className="actions-row">
                      <a href={skill.file_url} target="_blank" rel="noopener noreferrer">
                        <button className="action-btn btn-view">↗ View File</button>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Paper Modal */}
      {editingPaper && (
        <div className="modal-backdrop" onClick={() => setEditingPaper(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Paper</h2>
            <div className="modal-grid">
              <div className="modal-field full">
                <label className="field-label">Subject</label>
                <input className="field-input" value={editingPaper.subject}
                  onChange={(e) => setEditingPaper({ ...editingPaper, subject: e.target.value })} />
              </div>
              <div className="modal-field">
                <label className="field-label">College</label>
                <input className="field-input" value={editingPaper.college}
                  onChange={(e) => setEditingPaper({ ...editingPaper, college: e.target.value })} />
              </div>
              <div className="modal-field">
                <label className="field-label">Branch</label>
                <input className="field-input" value={editingPaper.branch}
                  onChange={(e) => setEditingPaper({ ...editingPaper, branch: e.target.value })} />
              </div>
              <div className="modal-field">
                <label className="field-label">Semester</label>
                <input className="field-input" type="number" value={editingPaper.semester}
                  onChange={(e) => setEditingPaper({ ...editingPaper, semester: Number(e.target.value) })} />
              </div>
              <div className="modal-field">
                <label className="field-label">Year</label>
                <input className="field-input" type="number" value={editingPaper.year}
                  onChange={(e) => setEditingPaper({ ...editingPaper, year: Number(e.target.value) })} />
              </div>
              <div className="modal-field full">
                <label className="field-label">Resource Type</label>
                <select className="field-select" value={editingPaper.resource_type}
                  onChange={(e) => setEditingPaper({ ...editingPaper, resource_type: e.target.value })}>
                  {RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setEditingPaper(null)}>Cancel</button>
              <button className="modal-save" onClick={updatePaper} disabled={saving}>
                {saving ? <><span className="mini-spinner" /> Saving…</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div className="modal-backdrop" onClick={() => setEditingSkill(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Skill</h2>
            <div className="modal-grid">
              <div className="modal-field full">
                <label className="field-label">Title</label>
                <input className="field-input" value={editingSkill.title}
                  onChange={(e) => setEditingSkill({ ...editingSkill, title: e.target.value })} />
              </div>
              <div className="modal-field">
                <label className="field-label">Category</label>
                <input className="field-input" value={editingSkill.category}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })} />
              </div>
              <div className="modal-field">
                <label className="field-label">Level</label>
                <select className="field-select" value={editingSkill.level}
                  onChange={(e) => setEditingSkill({ ...editingSkill, level: e.target.value })}>
                  {SKILL_LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="modal-field full">
                <label className="field-label">Resource Type</label>
                <select className="field-select" value={editingSkill.resource_type}
                  onChange={(e) => setEditingSkill({ ...editingSkill, resource_type: e.target.value })}>
                  {SKILL_RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="modal-field full">
                <label className="field-label">Description</label>
                <textarea className="field-textarea" value={editingSkill.description || ""}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setEditingSkill(null)}>Cancel</button>
              <button className="modal-save" onClick={updateSkill} disabled={saving}>
                {saving ? <><span className="mini-spinner" /> Saving…</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete {contentType === "papers" ? "Paper" : "Skill"}?</h2>
            <p className="delete-modal-msg">
              This action is permanent and cannot be undone. The {contentType === "papers" ? "paper" : "skill"} and all associated data will be removed.
            </p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn-confirm-delete"
                onClick={() => contentType === "papers" ? deletePaper(deleteConfirm) : deleteSkill(deleteConfirm)}
              >
                {actionState[deleteConfirm] === "deleting" ? <><span className="mini-spinner" /> Deleting…</> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}
    </>
  );
}
