"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [showPass, setShowPass] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const login = async () => {
    if (!password) return;
    setStatus("loading");

    await new Promise((r) => setTimeout(r, 700));

    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setStatus("success");
      localStorage.setItem("admin-auth", "true");
      await new Promise((r) => setTimeout(r, 600));
      router.push("/kundankp");
    } else {
      setStatus("error");
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setStatus("idle");
        setPassword("");
      }, 1000);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #05070d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Grid background */
        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* Glow orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(79,255,176,0.07), transparent 70%);
          top: -120px; left: 50%;
          transform: translateX(-50%);
          animation: pulse-orb 6s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(239,68,68,0.05), transparent 70%);
          bottom: -80px; right: 10%;
        }

        @keyframes pulse-orb {
          from { opacity: 0.6; transform: translateX(-50%) scale(1); }
          to   { opacity: 1;   transform: translateX(-50%) scale(1.1); }
        }

        /* Card */
        .card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          margin: 1rem;
          background: rgba(12, 15, 22, 0.9);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow:
            0 0 0 1px rgba(79,255,176,0.04),
            0 40px 80px rgba(0,0,0,0.6);
          opacity: 0;
          transform: translateY(20px);
          animation: card-in 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @keyframes card-in {
          to { opacity: 1; transform: translateY(0); }
        }

        .card.shake {
          animation: card-shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97);
        }

        @keyframes card-shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(7px); }
          45%      { transform: translateX(-6px); }
          60%      { transform: translateX(5px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(2px); }
        }

        /* Lock icon */
        .lock-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: rgba(79,255,176,0.08);
          border: 1px solid rgba(79,255,176,0.15);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 1.4rem;
          transition: background 0.3s, border-color 0.3s;
        }

        .lock-wrap.error {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.25);
        }

        .lock-wrap.success {
          background: rgba(79,255,176,0.12);
          border-color: rgba(79,255,176,0.35);
        }

        /* Title */
        .title {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 0.4rem;
        }

        .subtitle {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 2rem;
          font-family: 'DM Mono', monospace;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin-bottom: 1.75rem;
        }

        /* Input group */
        .input-group {
          position: relative;
          margin-bottom: 1rem;
        }

        .input-label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 0.5rem;
          display: block;
          font-family: 'DM Mono', monospace;
        }

        .input-wrap {
          position: relative;
        }

        .pass-input {
          width: 100%;
          padding: 0.85rem 3rem 0.85rem 1rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-text-security: disc;
        }

        .pass-input[data-show="true"] {
          -webkit-text-security: none;
          letter-spacing: 0.04em;
        }

        .pass-input::placeholder {
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.04em;
          font-family: 'DM Sans', sans-serif;
        }

        .pass-input:focus {
          border-color: rgba(79,255,176,0.45);
          background: rgba(79,255,176,0.03);
          box-shadow: 0 0 0 3px rgba(79,255,176,0.07);
        }

        .pass-input.has-error {
          border-color: rgba(239,68,68,0.45) !important;
          background: rgba(239,68,68,0.04) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.07) !important;
        }

        .toggle-btn {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.25);
          font-size: 1rem;
          padding: 4px;
          transition: color 0.15s;
          display: flex; align-items: center;
        }

        .toggle-btn:hover { color: rgba(255,255,255,0.55); }

        /* Error message */
        .error-msg {
          font-size: 0.75rem;
          color: #f87171;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: 'DM Sans', sans-serif;
          animation: fade-in 0.2s ease;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Login button */
        .login-btn {
          width: 100%;
          padding: 0.9rem;
          margin-top: 1.25rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
          background: linear-gradient(135deg, #4fffb0 0%, #38bdf8 100%);
          color: #05070d;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .login-btn.success-btn {
          background: linear-gradient(135deg, #4fffb0, #4fffb0);
        }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 15px; height: 15px;
          border: 2px solid rgba(5,7,13,0.25);
          border-top-color: #05070d;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          vertical-align: middle;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer tag */
        .footer-tag {
          margin-top: 1.75rem;
          text-align: center;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.12);
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.08em;
        }

        .footer-tag span {
          color: rgba(79,255,176,0.35);
        }
      `}</style>

      <div className="login-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className={`card${shake ? " shake" : ""}`} style={{ animationName: shake ? "card-shake" : "card-in" }}>

          {/* Lock icon */}
          <div className={`lock-wrap ${status === "error" ? "error" : status === "success" ? "success" : ""}`}>
            {status === "error" ? "🔴" : status === "success" ? "✅" : "🔐"}
          </div>

          <h1 className="title">Admin Access</h1>
          <p className="subtitle">Restricted · Authorized only</p>

          <div className="divider" />

          {/* Password input */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrap">
              <input
                type="text"
                data-show={showPass ? "true" : "false"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
                disabled={status === "loading" || status === "success"}
                className={`pass-input${status === "error" ? " has-error" : ""}`}
                autoComplete="current-password"
                spellCheck={false}
                style={{ WebkitTextSecurity: showPass ? "none" : "disc" } as React.CSSProperties}
              />
              <button
                className="toggle-btn"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
                type="button"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {status === "error" && (
              <p className="error-msg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" stroke="#05070d" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                </svg>
                Incorrect password. Access denied.
              </p>
            )}
          </div>

          {/* Button */}
          <button
            className={`login-btn${status === "success" ? " success-btn" : ""}`}
            onClick={login}
            disabled={status === "loading" || status === "success" || !password}
          >
            {status === "loading" ? (
              <><span className="spinner" />Verifying…</>
            ) : status === "success" ? (
              "✓ Access Granted"
            ) : (
              "Enter Dashboard →"
            )}
          </button>

          <p className="footer-tag">
            PAPERVAULT <span>·</span> ADMIN CONSOLE <span>·</span> v1.0
          </p>
        </div>
      </div>
    </>
  );
}
