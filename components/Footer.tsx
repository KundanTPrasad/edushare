const css = `
  .ft {
    border-top: 1px solid rgba(244,114,182,0.1);
    padding: 16px 32px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    position: relative;
    overflow: hidden;
  }
  @keyframes ftScan {
    0%   { left: -50%; }
    100% { left: 110%; }
  }
  .ft-scan {
    position: absolute; top: 0; left: -50%;
    width: 50%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(244,114,182,0.4), transparent);
    animation: ftScan 5s ease-in-out infinite;
    pointer-events: none;
  }
  .ft-left { display: flex; flex-direction: column; gap: 3px; }
  .ft-brand { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; color: #fff; }
  .ft-brand span { background: linear-gradient(90deg,#f472b6,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .ft-copy { font-size: 10px; color: rgba(255,255,255,0.2); }
  .ft-cta {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 8px;
    background: rgba(244,114,182,0.08);
    border: 1px solid rgba(244,114,182,0.2);
    color: #f472b6; font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, transform 0.15s; white-space: nowrap;
  }
  .ft-cta:hover { background: rgba(244,114,182,0.15); border-color: rgba(244,114,182,0.4); transform: translateY(-1px); }
  .ft-cta svg { width: 13px; height: 13px; stroke: #f472b6; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .ft-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .ft-email { font-size: 10px; color: rgba(244,114,182,0.4); text-decoration: none; transition: color 0.2s; }
  .ft-email:hover { color: #f472b6; }
  .ft-tagline { font-size: 10px; color: rgba(255,255,255,0.15); }
  @media (max-width: 640px) {
    .ft { grid-template-columns: 1fr; justify-items: center; text-align: center; padding: 20px 16px; gap: 12px; }
    .ft-right { align-items: center; }
  }
`;

export default function Footer() {
  return (
    <>
      <style>{css}</style>
      <footer className="ft" spellCheck={false}>
        <div className="ft-scan" />
        <div className="ft-left">
          <span className="ft-brand">EduShare</span>
          <span className="ft-copy">© 2026 All rights reserved.</span>
        </div>
        <a href="/upload" className="ft-cta">
          <svg viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload a Paper
        </a>
        <div className="ft-right">
          <a href="mailto:contact@edushare.in" className="ft-email">contact@edushare.in</a>
          <span className="ft-tagline">Helping students since 2026</span>
        </div>
      </footer>
    </>
  );
}
