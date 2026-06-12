"use client";

import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Download, X, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

/* ─── helpers ─────────────────────────────────────────────────────── */
function getExtension(url: string, fileType: string): string {
  const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
  if (match) return match[1];
  return fileType === "pdf" ? "pdf" : "png";
}

function sanitizeFilename(title: string, url: string, fileType: string): string {
  const ext = getExtension(url, fileType);
  const safe = title.trim().replace(/[\\/:*?"<>|]+/g, "_") || "download";
  return safe.toLowerCase().endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
}

async function triggerDownload(url: string, filename: string) {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(blobUrl); document.body.removeChild(a); }, 200);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

interface Props {
  fileUrl: string;
  fileType: string;
  title: string;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════════════════
   Root modal — portal on document.body
═══════════════════════════════════════════════════════════════════ */
export default function ImageViewer({ fileUrl, fileType, title, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 220);
  }, [onClose]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      rootRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.fullscreenElement) handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  if (!mounted) return null;

  const downloadName = sanitizeFilename(title, fileUrl, fileType);

  return createPortal(
    <div
      ref={rootRef}
      data-portal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", flexDirection: "column",
        background: "rgba(5,7,13,0.98)",
        opacity: visible ? 1 : 0,
        transition: "opacity 220ms ease",
        isolation: "isolate",
      }}
    >
      {/* Title bar */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px", minHeight: 52,
        background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(79,255,176,0.08)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700,
          letterSpacing: "0.04em", color: "rgba(255,255,255,0.8)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          maxWidth: "calc(100vw - 120px)",
        }}>
          {title}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.6)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(79,255,176,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "#4fffb0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
            }}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.6)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.25)";
              (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)";
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
        {fileType === "pdf"
          ? <PDFViewer fileUrl={fileUrl} title={title} onClose={handleClose} downloadName={downloadName} />
          : <ImageViewerContent fileUrl={fileUrl} title={title} onClose={handleClose} downloadName={downloadName} />
        }
      </div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Custom image viewer — proper pan + zoom, always centered at 1x
═══════════════════════════════════════════════════════════════════ */
function ImageViewerContent({ fileUrl, title, onClose, downloadName }: {
  fileUrl: string; title: string; onClose: () => void; downloadName: string;
}) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 8;

  const clampOffset = useCallback((ox: number, oy: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 };
    return { x: ox, y: oy };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;

    const delta = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * delta));
      const factor = next / prev - 1;
      setOffset((o) => clampOffset(o.x - mx * factor, o.y - my * factor, next));
      return next;
    });
  }, [clampOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [scale, offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Touch pinch-zoom + drag — now zooms toward the pinch midpoint (was unused before)
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchMid  = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
      lastTouchMid.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && scale > 1) {
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: offset.x, oy: offset.y };
    }
  }, [scale, offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastTouchDist.current !== null && lastTouchMid.current !== null && containerRef.current) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = dist / lastTouchDist.current;
      lastTouchDist.current = dist;

      const rect = containerRef.current.getBoundingClientRect();
      const mx = lastTouchMid.current.x - rect.left - rect.width / 2;
      const my = lastTouchMid.current.y - rect.top - rect.height / 2;

      setScale((prev) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * delta));
        const factor = next / prev - 1;
        setOffset((o) => clampOffset(o.x - mx * factor, o.y - my * factor, next));
        return next;
      });
    } else if (e.touches.length === 1 && dragStart.current) {
      const ddx = e.touches[0].clientX - dragStart.current.x;
      const ddy = e.touches[0].clientY - dragStart.current.y;
      setOffset({ x: dragStart.current.ox + ddx, y: dragStart.current.oy + ddy });
    }
  }, [clampOffset]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
    lastTouchMid.current = null;
    dragStart.current = null;
    if (scale <= 1) setOffset({ x: 0, y: 0 });
  }, [scale]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    } else {
      const rect = containerRef.current!.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height / 2;
      const next = 2.5;
      const factor = next - 1;
      setScale(next);
      setOffset({ x: -mx * factor, y: -my * factor });
    }
  }, [scale]);

  const zoomBy = (factor: number) => {
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * factor));
      if (next <= 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const reset = () => { setScale(1); setOffset({ x: 0, y: 0 }); setRotation(0); };

  const cursor = scale > 1 ? (isDragging ? "grabbing" : "grab") : "default";

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        style={{
          flex: 1, minHeight: 0, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor,
          userSelect: "none", WebkitUserSelect: "none",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!loaded && (
          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.3)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(79,255,176,0.15)", borderTopColor: "#4fffb0", animation: "iv-spin 0.8s linear infinite" }} />
          </div>
        )}
        <img
          src={fileUrl}
          alt={title}
          draggable={false}
          onLoad={() => setLoaded(true)}
          style={{
            maxWidth: "100%", maxHeight: "100%",
            objectFit: "contain",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s cubic-bezier(0.25,0.46,0.45,0.94)",
            opacity: loaded ? 1 : 0,
            willChange: "transform",
            pointerEvents: "none",
          }}
        />
      </div>

      {scale <= 1 && loaded && (
        <div style={{
          position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
          fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "DM Mono, monospace",
          letterSpacing: "0.06em", pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          scroll to zoom · double-click to zoom in
        </div>
      )}

      <style>{`@keyframes iv-spin { to { transform: rotate(360deg); } }`}</style>

      <Toolbar>
        <TBtn onClick={() => zoomBy(1.3)} label="Zoom in"><ZoomIn size={17} /></TBtn>
        <span style={{ ...counterStyle, color: "#4fffb0", minWidth: 44 }}>{Math.round(scale * 100)}%</span>
        <TBtn onClick={() => zoomBy(1 / 1.3)} label="Zoom out"><ZoomOut size={17} /></TBtn>
        <Sep />
        <TBtn onClick={() => setRotation(r => r - 90)} label="Rotate left"><RotateCcw size={17} /></TBtn>
        <TBtn onClick={() => setRotation(r => r + 90)} label="Rotate right"><RotateCw size={17} /></TBtn>
        <Sep />
        <TBtn onClick={reset} label="Reset" text="Reset" />
        <Sep />
        <TBtn onClick={() => triggerDownload(fileUrl, downloadName)} label="Download"><Download size={17} /></TBtn>
        <TBtn onClick={onClose} label="Close" danger><X size={17} /></TBtn>
      </Toolbar>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PDF Viewer
═══════════════════════════════════════════════════════════════════ */
function PDFViewer({ fileUrl, title, onClose, downloadName }: {
  fileUrl: string; title: string; onClose: () => void; downloadName: string;
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef       = useRef<any>(null);
  const pageRef      = useRef(1);
  const scaleRef     = useRef(1);
  const renderingRef = useRef(false);
  const pendingRef   = useRef(false);

  const [displayPage,  setDisplayPage]  = useState(1);
  const [displayScale, setDisplayScale] = useState(1);
  const [totalPages,   setTotalPages]   = useState(0);
  const [phase,        setPhase]        = useState<"loading"|"ready"|"error">("loading");
  const [errorMsg,     setErrorMsg]     = useState("");
  const [rendering,    setRendering]    = useState(false);

  const computeFitScale = useCallback(async (pdf: any) => {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const container = containerRef.current;
    if (!container) return 1;

    const availableW = container.clientWidth - 48;
    // Fallback if clientHeight isn't settled yet (common on first mount in flex containers)
    const availableH = (container.clientHeight || window.innerHeight - 160) - 48;

    const scaleW = availableW / viewport.width;
    const scaleH = availableH / viewport.height;
    // Fit entire page within viewport (like object-fit: contain) — works for portrait & landscape
    return Math.min(2, Math.max(0.2, Math.min(scaleW, scaleH)));
  }, []);

  const renderPage = useCallback(async () => {
    if (!pdfRef.current || !canvasRef.current) return;
    if (renderingRef.current) { pendingRef.current = true; return; }

    renderingRef.current = true;
    setRendering(true);
    try {
      const page     = await pdfRef.current.getPage(pageRef.current);
      const viewport = page.getViewport({ scale: scaleRef.current });
      const canvas   = canvasRef.current;
      const ctx      = canvas.getContext("2d")!;
      const dpr      = window.devicePixelRatio || 1;

      canvas.width        = viewport.width  * dpr;
      canvas.height       = viewport.height * dpr;
      canvas.style.width  = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      await page.render({ canvasContext: ctx, viewport }).promise;
      setDisplayPage(pageRef.current);
      setDisplayScale(scaleRef.current);
      setPhase("ready");
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      if (e?.name !== "RenderingCancelledException") {
        setPhase("error"); setErrorMsg(e?.message || "Render failed");
      }
    } finally {
      renderingRef.current = false;
      setRendering(false);
      if (pendingRef.current) { pendingRef.current = false; renderPage(); }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            s.onload = () => res(); s.onerror = () => rej(new Error("Failed to load PDF.js"));
            document.head.appendChild(s);
          });
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        if (cancelled) return;
        const pdf = await (window as any).pdfjsLib
          .getDocument({ url: fileUrl, withCredentials: false }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        scaleRef.current = await computeFitScale(pdf);
        renderPage();
      } catch (e: any) {
        if (!cancelled) { setPhase("error"); setErrorMsg(e?.message || "Failed to load PDF"); }
      }
    })();
    return () => { cancelled = true; };
  }, [fileUrl, renderPage, computeFitScale]);

  // Re-fit the page whenever the viewer container is resized (e.g. orientation change,
  // entering/exiting fullscreen, window resize) — only if user hasn't manually zoomed
  const userZoomedRef = useRef(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timeout: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      if (!pdfRef.current || userZoomedRef.current) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        computeFitScale(pdfRef.current).then((fit) => {
          scaleRef.current = fit;
          renderPage();
        });
      }, 150);
    });
    ro.observe(container);
    return () => { ro.disconnect(); clearTimeout(timeout); };
  }, [computeFitScale, renderPage]);

  const goTo = (p: number) => {
    if (!pdfRef.current || p < 1 || p > totalPages) return;
    pageRef.current = p; renderPage();
  };

  const zoom = (delta: number) => {
    userZoomedRef.current = true;
    const next = Math.min(4, Math.max(0.4, +(scaleRef.current + delta).toFixed(2)));
    scaleRef.current = next; renderPage();
  };

  const resetZoom = useCallback(async () => {
    if (!pdfRef.current) return;
    userZoomedRef.current = false;
    scaleRef.current = await computeFitScale(pdfRef.current);
    renderPage();
  }, [computeFitScale, renderPage]);

  // Double-click canvas: zoom to 1.5x more, or back to fit
  const handleCanvasDoubleClick = useCallback(() => {
    if (scaleRef.current > 1.4) {
      resetZoom();
    } else {
      userZoomedRef.current = true;
      scaleRef.current = Math.min(4, scaleRef.current + 0.6);
      renderPage();
    }
  }, [resetZoom, renderPage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(pageRef.current + 1);
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goTo(pageRef.current - 1);
      if (e.key === "+" || e.key === "=") zoom(+0.2);
      if (e.key === "-") zoom(-0.2);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalPages]);

  const pct = Math.round(displayScale * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <style>{`
        @keyframes pdf-spin { to { transform: rotate(360deg); } }
        @keyframes pdf-fade { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <div
        ref={containerRef}
        style={{
          flex: 1, overflowY: "auto", overflowX: "auto",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-start",
          padding: "28px 20px", minHeight: 0,
        }}
      >
        {phase === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.4)", marginTop: 100 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(79,255,176,0.12)", borderTopColor: "#4fffb0", animation: "pdf-spin 0.85s linear infinite" }} />
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 12, letterSpacing: "0.08em" }}>Loading PDF…</span>
          </div>
        )}
        {phase === "error" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 100, textAlign: "center" }}>
            <span style={{ fontSize: 40 }}>⚠️</span>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 700, color: "rgba(255,100,100,0.9)" }}>Could not load PDF</span>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", maxWidth: 300 }}>{errorMsg}</span>
            <button onClick={() => window.open(fileUrl, "_blank")}
              style={{ marginTop: 8, padding: "8px 20px", borderRadius: 8, background: "#4fffb0", color: "#05070d", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>
              Open in Browser
            </button>
          </div>
        )}

        <div
          style={{ position: "relative", display: phase === "loading" ? "none" : "block", animation: "pdf-fade 0.2s ease" }}
          onDoubleClick={handleCanvasDoubleClick}
        >
          {rendering && (
            <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,7,13,0.5)", borderRadius: 6, pointerEvents: "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid rgba(79,255,176,0.12)", borderTopColor: "#4fffb0", animation: "pdf-spin 0.85s linear infinite" }} />
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "block", borderRadius: 6, background: "#fff", boxShadow: "0 12px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(79,255,176,0.07)", maxWidth: "100%", maxHeight: "100%", height: "auto", width: "auto", cursor: "zoom-in" }} />
        </div>
      </div>

      <Toolbar>
        <TBtn onClick={() => goTo(pageRef.current - 1)} label="Prev" disabled={displayPage <= 1 || phase !== "ready"}>
          <ChevronLeft size={17} />
        </TBtn>
        <span style={counterStyle}>{totalPages > 0 ? `${displayPage} / ${totalPages}` : "—"}</span>
        <TBtn onClick={() => goTo(pageRef.current + 1)} label="Next" disabled={displayPage >= totalPages || phase !== "ready"}>
          <ChevronRight size={17} />
        </TBtn>
        <Sep />
        <TBtn onClick={() => zoom(-0.2)} label="Zoom out" disabled={displayScale <= 0.4 || phase !== "ready"}><ZoomOut size={17} /></TBtn>
        <span style={{ ...counterStyle, color: "#4fffb0", minWidth: 44 }}>{pct}%</span>
        <TBtn onClick={() => zoom(+0.2)} label="Zoom in" disabled={displayScale >= 4 || phase !== "ready"}><ZoomIn size={17} /></TBtn>
        <TBtn onClick={resetZoom} label="Fit" text="Fit" disabled={phase !== "ready"} />
        <Sep />
        <TBtn onClick={() => triggerDownload(fileUrl, downloadName)} label="Download"><Download size={17} /></TBtn>
        <TBtn onClick={onClose} label="Close" danger><X size={17} /></TBtn>
      </Toolbar>
    </div>
  );
}

/* ─── Shared atoms ───────────────────────────────────────────────── */
function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", padding: "10px 16px 18px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 2, padding: "4px 8px",
        background: "rgba(10,13,20,0.97)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderRadius: 999, border: "1px solid rgba(79,255,176,0.13)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(79,255,176,0.04)",
        flexWrap: "wrap", justifyContent: "center",
      }}>
        {children}
      </div>
    </div>
  );
}

const counterStyle: React.CSSProperties = {
  fontFamily: "DM Mono, monospace", fontSize: 11,
  color: "rgba(255,255,255,0.5)", minWidth: 58,
  textAlign: "center", letterSpacing: "0.04em",
  padding: "0 2px", userSelect: "none",
};

function Sep() {
  return <div style={{ width: 1, height: 18, margin: "0 3px", background: "rgba(255,255,255,0.09)", borderRadius: 1, flexShrink: 0 }} />;
}

function TBtn({ children, onClick, label, text, danger = false, disabled = false }: {
  children?: React.ReactNode; onClick?: () => void; label: string;
  text?: string; danger?: boolean; disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} aria-label={label} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minWidth: 34, minHeight: 34,
        paddingLeft: text ? 10 : 0, paddingRight: text ? 10 : 0,
        background: danger
          ? (hov ? "rgba(239,68,68,0.85)" : "rgba(220,50,50,0.65)")
          : (hov && !disabled ? "rgba(79,255,176,0.1)" : "transparent"),
        color: disabled ? "rgba(255,255,255,0.18)"
          : danger ? "#fff"
          : hov ? "#4fffb0" : "rgba(255,255,255,0.65)",
        border: "none", borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 11, fontWeight: 600, gap: 4,
        transition: "background 0.12s, color 0.12s",
        fontFamily: "DM Mono, monospace",
        letterSpacing: "0.04em", flexShrink: 0,
      }}
    >
      {children}
      {text && <span style={{ whiteSpace: "nowrap", fontSize: 11 }}>{text}</span>}
    </button>
  );
}
