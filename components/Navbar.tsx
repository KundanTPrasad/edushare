"use client";

import { FaHome, FaUpload, FaInfoCircle, FaTools, FaUserCircle } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import UploadPopup from "@/components/UploadPopup";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, signOut } = useAuth();
  const isActive = (href: string) => pathname === href;

  return (
    <>
      <style>{`
        @keyframes navSlideDown {
          from { opacity:0; transform:translateY(-12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes navBarIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 12px rgba(244,114,182,0.3); }
          50%      { box-shadow: 0 0 28px rgba(244,114,182,0.6); }
        }

        .nav-link-pill {
          position: relative;
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px;
          font-weight: 500; font-size: 0.95rem; letter-spacing: 0.02em;
          color: rgba(255,210,230,0.65);
          transition: color 200ms;
          text-decoration: none;
        }
        .nav-link-pill:hover { color: #fff; }
        .nav-link-pill.active { color: #f472b6; }
        .nav-link-pill.active::after {
          content: '';
          position: absolute; bottom: -2px; left: 50%;
          transform: translateX(-50%);
          width: 5px; height: 5px; border-radius: 50%;
          background: #f472b6; box-shadow: 0 0 6px #f472b6;
        }

        .skills-pill {
          position: relative;
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px;
          font-weight: 500; font-size: 0.95rem; letter-spacing: 0.02em;
          color: rgba(255,210,230,0.65);
          transition: color 200ms;
          text-decoration: none;
        }
        .skills-pill:hover { color: #c084fc; }
        .skills-pill.active { color: #c084fc; }
        .skills-pill.active::after {
          content: '';
          position: absolute; bottom: -2px; left: 50%;
          transform: translateX(-50%);
          width: 5px; height: 5px; border-radius: 50%;
          background: #c084fc; box-shadow: 0 0 6px #c084fc;
        }
        .skills-pill .skills-badge {
          font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
          background: rgba(192,132,252,0.2); color: #c084fc;
          border-radius: 4px; padding: 1px 5px; margin-left: 2px;
          text-transform: uppercase;
        }

        .about-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px;
          font-weight: 500; font-size: 0.95rem;
          color: rgba(255,210,230,0.65);
          background: none; border: none; cursor: pointer;
          transition: color 200ms; letter-spacing: 0.02em;
        }
        .about-btn:hover { color: #fff; }

        .upload-cta {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 22px; border-radius: 999px;
          font-weight: 700; font-size: 0.9rem; letter-spacing: 0.03em;
          color: #1a0a20;
          background: linear-gradient(135deg, #f472b6, #c084fc);
          box-shadow: 0 0 20px rgba(244,114,182,0.35);
          border: none; cursor: pointer;
          transition: transform 180ms, box-shadow 180ms;
          text-decoration: none;
        }
        .upload-cta:hover { transform: translateY(-1px) scale(1.02); box-shadow: 0 0 36px rgba(244,114,182,0.55); }
        .upload-cta:active { transform: scale(0.97); }
        .login-pill {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 999px;
          font-weight: 500; font-size: 0.9rem; letter-spacing: 0.02em;
          color: rgba(255,210,230,0.65);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: color 200ms, background 200ms, border-color 200ms;
        }
        .login-pill:hover { color: #fff; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }
        .user-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 6px; border-radius: 999px;
          background: rgba(79,255,176,0.08);
          border: 1px solid rgba(79,255,176,0.2);
          cursor: pointer; transition: background 200ms, border-color 200ms;
        }
        .user-pill:hover { background: rgba(79,255,176,0.14); border-color: rgba(79,255,176,0.35); }
        .user-pill img {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid rgba(79,255,176,0.3);
        }
        .user-pill span {
          font-size: 0.82rem; font-weight: 500; color: rgba(79,255,176,0.9);
          letter-spacing: 0.02em; max-width: 90px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .mob-tab {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 4px; padding: 6px 0; flex: 1;
          color: rgba(255,210,230,0.35); text-decoration: none;
          transition: color 200ms; font-size: 0.65rem;
          letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600;
        }
        .mob-tab.active { color: #f472b6; }
        .mob-tab.active .mob-tab-icon-wrap {
          background: rgba(244,114,182,0.15);
          border-color: rgba(244,114,182,0.3);
        }
        .mob-skills-tab {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 4px; padding: 6px 0; flex: 1;
          color: rgba(255,210,230,0.35); text-decoration: none;
          transition: color 200ms; font-size: 0.65rem;
          letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600;
        }
        .mob-skills-tab.active { color: #c084fc; }
        .mob-skills-tab.active .mob-tab-icon-wrap {
          background: rgba(192,132,252,0.15);
          border-color: rgba(192,132,252,0.3);
        }
        .mob-tab-icon-wrap {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid transparent;
          transition: background 200ms, border-color 200ms;
        }
        .mob-about-btn {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 4px; padding: 6px 0; flex: 1;
          color: rgba(255,210,230,0.35); background: none; border: none;
          cursor: pointer; font-size: 0.65rem; letter-spacing: 0.05em;
          text-transform: uppercase; font-weight: 600; transition: color 200ms;
        }
        .mob-about-btn:hover { color: #f472b6; }
      `}</style>

      {/* NAV — floats over the page, no background block, no border line */}
      <nav style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 40, width: "100%",
        background: "transparent",
        animation: "navSlideDown 400ms cubic-bezier(0.34,1.2,0.64,1) both",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* LOGO */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div style={{
              width: 70, height: 70, borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(244,114,182,0.3)",
              animation: "glowPulse 3s ease-in-out infinite", flexShrink: 0,
            }}>
              <img
                src="/logo.png"
                alt="EduShare Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.05rem,3vw,1.35rem)", color: "#fff", letterSpacing: "-0.01em" }}>
              EduShare
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 4 }}>
            <Link href="/" className={`nav-link-pill ${isActive("/") ? "active" : ""}`}>
              <FaHome size={14} /> Home
            </Link>
            {/* Skills — opens in a new tab */}
            <Link href="/skills" target="_blank" rel="noopener noreferrer" className={`skills-pill ${isActive("/skills") ? "active" : ""}`}>
              <FaTools size={13} /> Skills
              <span className="skills-badge">New</span>
            </Link>
            <button className="about-btn" onClick={() => setShowPopup(true)}>
              <FaInfoCircle size={14} /> About
            </button>
            <Link href="/upload" className="upload-cta" style={{ marginLeft: 8 }}>
              <FaUpload size={13} /> Upload
            </Link>

            {/* Auth */}
            {user ? (
              <button className="user-pill" onClick={() => signOut()} style={{ marginLeft: 8 }} title="Click to sign out">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" />
                ) : (
                  <FaUserCircle size={22} style={{ color: "rgba(79,255,176,0.8)" }} />
                )}
                <span>{user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}</span>
              </button>
            ) : (
              <button className="login-pill" onClick={() => setShowLogin(true)} style={{ marginLeft: 8 }}>
                <FaUserCircle size={14} /> Login
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* MOBILE BOTTOM BAR — unchanged, kept as floating too */}
      <div className="md:hidden" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(15,10,20,0.92)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(244,114,182,0.12)",
        paddingBottom: "env(safe-area-inset-bottom)",
        animation: "navBarIn 400ms 100ms cubic-bezier(0.34,1.2,0.64,1) both",
      }}>
        <div style={{ display: "flex", alignItems: "stretch", padding: "6px 8px" }}>
          <Link href="/" className={`mob-tab ${isActive("/") ? "active" : ""}`}>
            <div className="mob-tab-icon-wrap"><FaHome size={17} /></div>
            Home
          </Link>
          <Link href="/skills" target="_blank" rel="noopener noreferrer" className={`mob-skills-tab ${isActive("/skills") ? "active" : ""}`}>
            <div className="mob-tab-icon-wrap"><FaTools size={16} /></div>
            Skills
          </Link>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Link href="/upload" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 18,
                background: "linear-gradient(135deg, #f472b6, #c084fc)",
                boxShadow: "0 0 24px rgba(244,114,182,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#1a0a20", marginTop: -12,
                border: "2px solid rgba(255,255,255,0.15)",
              }}>
                <FaUpload size={18} />
              </div>
              <span style={{ fontSize: "0.62rem", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700, color: "#f472b6" }}>
                Upload
              </span>
            </Link>
          </div>
          <button className="mob-about-btn" onClick={() => setShowPopup(true)}>
            <div className="mob-tab-icon-wrap"><FaInfoCircle size={17} /></div>
            About
          </button>
          {user ? (
            <button className="mob-about-btn" onClick={() => signOut()} style={{ color: "rgba(79,255,176,0.8)" }}>
              <div className="mob-tab-icon-wrap">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" style={{ width: 22, height: 22, borderRadius: "50%" }} />
                ) : (
                  <FaUserCircle size={17} />
                )}
              </div>
              Account
            </button>
          ) : (
            <button className="mob-about-btn" onClick={() => setShowLogin(true)}>
              <div className="mob-tab-icon-wrap"><FaUserCircle size={17} /></div>
              Login
            </button>
          )}
        </div>
      </div>

      {showPopup && <UploadPopup forceOpen onClose={() => setShowPopup(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
