"use client";

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const SEMESTERS = ["1","2","3","4","5","6","7","8"];

// Resource types per upload mode
const INSTITUTION_RESOURCE_TYPES = ["Notes", "Mid Sem 1", "Mid Sem 2", "End Sem"];
const SKILLS_RESOURCE_TYPES      = ["Tutorial", "Project", "Workshop", "Reference"];

type UploadMode  = "institution" | "skills";
type UploadStage = "idle" | "uploading" | "success" | "error";

function InputField({ placeholder, value, onChange, type = "text", disabled = false, caps = true }: {
  placeholder: string; value: string; onChange: (v: string) => void;
  type?: string; disabled?: boolean; caps?: boolean;
}) {
  return (
    <input
      type={type} placeholder={placeholder} value={value}
      onChange={(e) => onChange(caps && type === "text" ? e.target.value.toUpperCase() : e.target.value)} disabled={disabled}
      style={{
        width: "100%", padding: "0.8rem 1rem", borderRadius: "0.9rem",
        background: "rgba(30,15,38,0.8)",
        border: "1px solid rgba(244,114,182,0.12)",
        color: "#fff", fontSize: "0.875rem",
        fontFamily: "'DM Sans', sans-serif", outline: "none",
        transition: "border-color 0.2s",
        opacity: disabled ? 0.5 : 1,
      }}
      onFocus={(e) => (e.target.style.borderColor = "rgba(244,114,182,0.6)")}
      onBlur={(e)  => (e.target.style.borderColor = "rgba(244,114,182,0.12)")}
    />
  );
}

export default function UploadPage() {
  const [uploadMode, setUploadMode]   = useState<UploadMode>("institution");

  // Institution fields
  const [college,  setCollege]  = useState("");
  const [branch,   setBranch]   = useState("");
  const [semester, setSemester] = useState("");
  const [year,     setYear]     = useState("");
  const [subject,  setSubject]  = useState("");
  const [resourceType, setResourceType] = useState("Notes");

  // Skills fields
  const [skillTitle,    setSkillTitle]    = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [skillLevel,    setSkillLevel]    = useState("Beginner");
  const [skillDesc,     setSkillDesc]     = useState("");
  const [skillRT,       setSkillRT]       = useState("Tutorial");

  // Shared
  const [file,      setFile]      = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [stage,    setStage]    = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver,      setDragOver]      = useState(false);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const isUploading = stage === "uploading";
  const isPdf = file?.type === "application/pdf";

  const handleDrop = useCallback((e: React.DragEvent, type: "file" | "thumb") => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    if (type === "file") { setFile(dropped); setDragOver(false); }
    else { setThumbnail(dropped); setThumbDragOver(false); }
  }, []);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => { if (p >= 90) { clearInterval(interval); return p; } return p + Math.random() * 12; });
    }, 200);
    return interval;
  };

  const showError = (msg: string) => { setErrorMsg(msg); setStage("error"); };

  const resetForm = () => {
    setCollege(""); setBranch(""); setSemester(""); setYear("");
    setSubject(""); setResourceType("Notes"); setFile(null); setThumbnail(null);
    setSkillTitle(""); setSkillCategory(""); setSkillLevel("Beginner");
    setSkillDesc(""); setSkillRT("Tutorial");
    setTimeout(() => setStage("idle"), 3000);
  };

  const uploadPaper = async () => {
    if (!file) return showError("Please select a file to upload.");
    if (isPdf && !thumbnail) return showError("A thumbnail image is required for PDF uploads.");

    if (uploadMode === "institution") {
      if (!college || !branch || !semester || !year || !subject)
        return showError("Please fill in all institution fields.");
    } else {
      if (!skillTitle || !skillCategory)
        return showError("Please fill in skill title and category.");
    }

    setStage("uploading"); setErrorMsg("");
    const progressInterval = simulateProgress();

    try {
      const extension = file.name.split(".").pop();
      const fileName  = `${Date.now()}.${extension}`;
      const bucket    = uploadMode === "institution" ? "papers" : "skills";

      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
      if (uploadError) throw new Error("File upload failed.");
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const fileUrl  = data.publicUrl;
      let thumbnailUrl = fileUrl;

      if (isPdf && thumbnail) {
        const thumbExt  = thumbnail.name.split(".").pop();
        const thumbName = `thumb-${Date.now()}.${thumbExt}`;
        const { error: thumbError } = await supabase.storage.from(bucket).upload(thumbName, thumbnail);
        if (thumbError) throw new Error("Thumbnail upload failed.");
        const { data: thumbData } = supabase.storage.from(bucket).getPublicUrl(thumbName);
        thumbnailUrl = thumbData.publicUrl;
      }

      if (uploadMode === "institution") {
        const { error: dbError } = await supabase.from("papers").insert([{
          college, branch, semester: Number(semester), subject,
          year: Number(year), resource_type: resourceType,
          file_url: fileUrl, thumbnail_url: thumbnailUrl,
          file_type: isPdf ? "pdf" : "image", status: "pending",
        }]);
        if (dbError) throw new Error("Failed to save paper metadata.");
      } else {
        const { error: dbError } = await supabase.from("skills").insert([{
          title: skillTitle, category: skillCategory, level: skillLevel,
          description: skillDesc, resource_type: skillRT,
          file_url: fileUrl, thumbnail_url: thumbnailUrl,
          file_type: isPdf ? "pdf" : "image", status: "pending",
        }]);
        if (dbError) throw new Error("Failed to save skill metadata.");
      }

      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => { setStage("success"); resetForm(); }, 400);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setProgress(0); setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  const activeRT    = uploadMode === "institution" ? resourceType    : skillRT;
  const setActiveRT = uploadMode === "institution" ? setResourceType : setSkillRT;
  const rtOptions   = uploadMode === "institution" ? INSTITUTION_RESOURCE_TYPES : SKILLS_RESOURCE_TYPES;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }

        .upload-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 2rem 1rem; position: relative; overflow: hidden;
        }
        .bg-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .orb-1 { width:500px;height:500px;background:radial-gradient(circle,rgba(244,114,182,0.08) 0%,transparent 70%);top:-150px;right:-100px;animation:drift 12s ease-in-out infinite alternate; }
        .orb-2 { width:400px;height:400px;background:radial-gradient(circle,rgba(192,132,252,0.06) 0%,transparent 70%);bottom:-100px;left:-80px;animation:drift 15s ease-in-out infinite alternate-reverse; }
        .orb-3 { width:300px;height:300px;background:radial-gradient(circle,rgba(251,146,60,0.05) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);animation:drift 18s ease-in-out infinite alternate; }
        @keyframes drift { from{transform:translate(0,0);}to{transform:translate(30px,20px);} }

        .card {
          position:relative;z-index:1;width:100%;max-width:680px;
          background:rgba(20,10,28,0.85);backdrop-filter:blur(24px);
          border:1px solid rgba(244,114,182,0.12);border-radius:28px;padding:2.5rem;
          box-shadow:0 0 0 1px rgba(244,114,182,0.04),0 32px 80px rgba(0,0,0,0.5);
        }

        .eyebrow {
          font-family:'DM Sans',sans-serif;font-size:0.7rem;font-weight:500;
          letter-spacing:0.18em;text-transform:uppercase;color:#f472b6;opacity:0.7;margin-bottom:0.5rem;
        }
        .card-title {
          font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;
          color:#fff;line-height:1.1;letter-spacing:-0.02em;margin-bottom:1.5rem;
        }
        .card-title span { background:linear-gradient(135deg,#f472b6,#c084fc,#fb923c);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }

        /* Mode toggle */
        .mode-toggle { display:flex;gap:8px;margin-bottom:1.75rem; }
        .mode-btn {
          flex:1;padding:0.7rem 1rem;border-radius:12px;border:1px solid rgba(244,114,182,0.15);
          background:rgba(30,15,38,0.6);color:rgba(255,255,255,0.4);
          font-family:'DM Sans',sans-serif;font-size:0.85rem;font-weight:500;
          cursor:pointer;transition:all 0.2s;
        }
        .mode-btn:hover { border-color:rgba(244,114,182,0.35);color:rgba(255,255,255,0.7); }
        .mode-btn.active {
          background:rgba(244,114,182,0.1);border-color:rgba(244,114,182,0.45);
          color:#f472b6;font-weight:600;
        }
        .mode-btn.skills-active {
          background:rgba(192,132,252,0.1);border-color:rgba(192,132,252,0.45);
          color:#c084fc;font-weight:600;
        }

        .section-label {
          font-family:'DM Sans',sans-serif;font-size:0.7rem;font-weight:500;
          letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.25);
          margin-bottom:0.75rem;margin-top:0.25rem;
        }

        .grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:0.75rem; }
        @media(max-width:560px){.grid-2{grid-template-columns:1fr;}.card{padding:1.5rem;}}

        .select-wrapper { position:relative; }
        .select-wrapper select {
          width:100%;padding:0.875rem 1rem;padding-right:2.5rem;border-radius:1rem;
          background:rgba(30,15,38,0.8);border:1px solid rgba(244,114,182,0.12);
          color:#fff;font-family:'DM Sans',sans-serif;font-size:0.875rem;
          outline:none;appearance:none;cursor:pointer;transition:border-color 0.2s;
        }
        .select-wrapper select:focus { border-color:rgba(244,114,182,0.6); }
        .select-wrapper::after {
          content:'';position:absolute;right:14px;top:50%;transform:translateY(-50%);
          width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;
          border-top:5px solid rgba(244,114,182,0.4);pointer-events:none;
        }

        .semester-pills { display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.25rem; }
        .pill {
          padding:0.45rem 0.9rem;border-radius:999px;border:1px solid rgba(244,114,182,0.12);
          background:rgba(30,15,38,0.8);color:rgba(255,255,255,0.45);
          font-size:0.8rem;font-family:'DM Sans',sans-serif;
          cursor:pointer;transition:all 0.15s;
        }
        .pill:hover { border-color:rgba(244,114,182,0.4);color:rgba(244,114,182,0.8); }
        .pill.active { background:rgba(244,114,182,0.1);border-color:rgba(244,114,182,0.5);color:#f472b6;font-weight:500; }

        /* Resource type pills */
        .rt-pills { display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.25rem; }
        .rt-pill {
          padding:0.4rem 0.85rem;border-radius:999px;border:1px solid rgba(244,114,182,0.12);
          background:rgba(30,15,38,0.8);color:rgba(255,255,255,0.4);
          font-size:0.78rem;font-family:'DM Sans',sans-serif;
          cursor:pointer;transition:all 0.15s;
        }
        .rt-pill:hover { border-color:rgba(244,114,182,0.35);color:rgba(244,114,182,0.8); }
        .rt-pill.active { background:rgba(244,114,182,0.1);border-color:rgba(244,114,182,0.5);color:#f472b6;font-weight:500; }
        .rt-pill.skills-mode.active { background:rgba(192,132,252,0.1);border-color:rgba(192,132,252,0.5);color:#c084fc; }

        .divider { height:1px;background:rgba(244,114,182,0.07);margin:1.5rem 0; }

        .drop-zone {
          border:1.5px dashed rgba(244,114,182,0.18);border-radius:1.25rem;
          padding:2rem 1.5rem;text-align:center;cursor:pointer;
          transition:all 0.2s;background:rgba(244,114,182,0.02);
        }
        .drop-zone:hover,.drop-zone.over { border-color:rgba(244,114,182,0.45);background:rgba(244,114,182,0.04); }
        .drop-zone.has-file { border-color:rgba(244,114,182,0.4);background:rgba(244,114,182,0.05); }
        .drop-zone-icon { width:40px;height:40px;margin:0 auto 0.75rem;background:rgba(244,114,182,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem; }
        .drop-zone-title { font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:500;color:rgba(255,255,255,0.65);margin-bottom:0.25rem; }
        .drop-zone-sub { font-size:0.75rem;color:rgba(255,255,255,0.22); }

        .file-badge {
          display:inline-flex;align-items:center;gap:0.4rem;
          background:rgba(244,114,182,0.1);border:1px solid rgba(244,114,182,0.25);
          padding:0.3rem 0.75rem;border-radius:999px;font-size:0.75rem;color:#f472b6;
          margin-top:0.5rem;max-width:100%;overflow:hidden;
        }
        .file-badge-name { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px; }
        .file-badge-remove { cursor:pointer;opacity:0.6;transition:opacity 0.15s;flex-shrink:0; }
        .file-badge-remove:hover { opacity:1; }

        .upload-btn {
          width:100%;padding:1rem;margin-top:1.75rem;border-radius:1rem;
          background:linear-gradient(135deg,#f472b6,#c084fc,#fb923c);
          color:#1a0a20;font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;
          letter-spacing:0.02em;border:none;cursor:pointer;
          transition:opacity 0.2s,transform 0.15s;box-shadow:0 0 24px rgba(244,114,182,0.3);
        }
        .upload-btn:hover:not(:disabled) { opacity:0.92;transform:translateY(-1px);box-shadow:0 0 36px rgba(244,114,182,0.45); }
        .upload-btn:active:not(:disabled) { transform:translateY(0); }
        .upload-btn:disabled { cursor:not-allowed;opacity:0.5; }

        .progress-bar-wrap { width:100%;height:3px;background:rgba(244,114,182,0.08);border-radius:999px;margin-top:1rem;overflow:hidden; }
        .progress-bar-fill { height:100%;background:linear-gradient(90deg,#f472b6,#c084fc,#fb923c);border-radius:999px;transition:width 0.3s ease; }

        .status-message { margin-top:1rem;padding:0.75rem 1rem;border-radius:1rem;font-size:0.85rem;font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:0.6rem; }
        .status-success { background:rgba(244,114,182,0.08);border:1px solid rgba(244,114,182,0.2);color:#f472b6; }
        .status-error   { background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);color:#f87171; }

        .hidden-input { display:none; }
        .spinner { width:16px;height:16px;border:2px solid rgba(26,10,32,0.3);border-top-color:#1a0a20;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;vertical-align:middle;margin-right:0.5rem; }
        @keyframes spin { to{transform:rotate(360deg);} }

        textarea {
          width:100%;padding:0.8rem 1rem;border-radius:0.9rem;
          background:rgba(30,15,38,0.8);border:1px solid rgba(244,114,182,0.12);
          color:#fff;font-size:0.875rem;font-family:'DM Sans',sans-serif;
          outline:none;resize:vertical;min-height:80px;transition:border-color 0.2s;
        }
        textarea:focus { border-color:rgba(244,114,182,0.6); }
      `}</style>

      <div className="upload-page">
        <div className="bg-orb orb-1" /><div className="bg-orb orb-2" /><div className="bg-orb orb-3" />

        <div className="card">
          <p className="eyebrow">EduShare Resource Repository</p>
          <h1 className="card-title">
            Upload a <span>{uploadMode === "institution" ? "Resource" : "Skill"}</span>
          </h1>

          {/* Mode toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${uploadMode === "institution" ? "active" : ""}`}
              onClick={() => setUploadMode("institution")}
            >
              🏫 Institution Resource
            </button>
            <button
              className={`mode-btn ${uploadMode === "skills" ? "skills-active" : ""}`}
              onClick={() => setUploadMode("skills")}
            >
              🛠️ Skills
            </button>
          </div>

          {/* ── INSTITUTION MODE ── */}
          {uploadMode === "institution" && (
            <>
              <p className="section-label">Institution Details</p>
              <div className="grid-2">
                <InputField placeholder="College / University" value={college} onChange={setCollege} disabled={isUploading} />
                <InputField placeholder="Branch / Department"  value={branch}  onChange={setBranch}  disabled={isUploading} />
                <InputField placeholder="Year (e.g. 2024)"    value={year}    onChange={setYear}    type="number" disabled={isUploading} />
                <InputField placeholder="Subject"             value={subject} onChange={setSubject} disabled={isUploading} />
              </div>

              <div style={{ marginTop: "1rem" }}>
                <p className="section-label">Semester</p>
                <div className="semester-pills">
                  {SEMESTERS.map((s) => (
                    <button key={s} className={`pill ${semester === s ? "active" : ""}`}
                      onClick={() => setSemester(s)} disabled={isUploading}>
                      Sem {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1.25rem" }}>
                <p className="section-label">Resource Type</p>
                <div className="rt-pills">
                  {INSTITUTION_RESOURCE_TYPES.map((t) => (
                    <button key={t} className={`rt-pill ${resourceType === t ? "active" : ""}`}
                      onClick={() => setResourceType(t)} disabled={isUploading}>
                      {t === "Notes" ? "📝 " : t === "End Sem" ? "📄 " : "📚 "}{t === "End Sem" ? "End Sem (PYQ)" : t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── SKILLS MODE ── */}
          {uploadMode === "skills" && (
            <>
              <p className="section-label">Skill Details</p>
              <div className="grid-2">
                <InputField placeholder="Skill Title"    value={skillTitle}    onChange={setSkillTitle}    disabled={isUploading} />
                <InputField placeholder="Category (e.g. Web Dev, DSA)" value={skillCategory} onChange={setSkillCategory} disabled={isUploading} />
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <p className="section-label">Level</p>
                <div className="semester-pills">
                  {["Beginner", "Intermediate", "Advanced"].map((l) => (
                    <button key={l} className={`pill ${skillLevel === l ? "active" : ""}`}
                      onClick={() => setSkillLevel(l)} disabled={isUploading}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <p className="section-label">Description</p>
                <textarea
                  placeholder="Brief description of this skill resource…"
                  value={skillDesc}
                  onChange={(e) => setSkillDesc(e.target.value.toUpperCase())}
                  disabled={isUploading}
                />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <p className="section-label">Resource Type</p>
                <div className="rt-pills">
                  {SKILLS_RESOURCE_TYPES.map((t) => (
                    <button key={t} className={`rt-pill ${skillRT === t ? "skills-mode active" : ""}`}
                      onClick={() => setSkillRT(t)} disabled={isUploading}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="divider" />

          <p className="section-label">
            {uploadMode === "institution" ? "Question Paper / Notes File" : "Skill Resource File"}
          </p>
          <div
            className={`drop-zone ${dragOver ? "over" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => handleDrop(e, "file")}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden-input"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="drop-zone-icon">{file ? "📄" : "⬆️"}</div>
            {file ? (
              <>
                <p className="drop-zone-title">File selected</p>
                <div className="file-badge">
                  <span className="file-badge-name">{file.name}</span>
                  <span className="file-badge-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>✕</span>
                </div>
              </>
            ) : (
              <>
                <p className="drop-zone-title">Drop your file here or click to browse</p>
                <p className="drop-zone-sub">PDF or Image · Max 20MB</p>
              </>
            )}
          </div>

          {isPdf && (
            <div style={{ marginTop: "1rem" }}>
              <p className="section-label">Thumbnail Image</p>
              <div
                className={`drop-zone ${thumbDragOver ? "over" : ""} ${thumbnail ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setThumbDragOver(true); }}
                onDragLeave={() => setThumbDragOver(false)}
                onDrop={(e) => handleDrop(e, "thumb")}
                onClick={() => thumbInputRef.current?.click()}
              >
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden-input"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
                <div className="drop-zone-icon">🖼️</div>
                {thumbnail ? (
                  <>
                    <p className="drop-zone-title">Thumbnail selected</p>
                    <div className="file-badge">
                      <span className="file-badge-name">{thumbnail.name}</span>
                      <span className="file-badge-remove" onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}>✕</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="drop-zone-title">Drop thumbnail or click to browse</p>
                    <p className="drop-zone-sub">PNG, JPG, WEBP recommended</p>
                  </>
                )}
              </div>
            </div>
          )}

          <button className="upload-btn" onClick={uploadPaper} disabled={isUploading}>
            {isUploading ? <><span className="spinner" />Uploading…</> : `Submit ${uploadMode === "institution" ? "Resource" : "Skill"} →`}
          </button>

          {isUploading && (
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          {stage === "success" && (
            <div className="status-message status-success">
              ✓ {uploadMode === "institution" ? "Resource" : "Skill"} uploaded successfully — pending review.
            </div>
          )}
          {stage === "error" && errorMsg && (
            <div className="status-message status-error">✕ {errorMsg}</div>
          )}
        </div>
      </div>
    </>
  );
}
