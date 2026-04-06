// src/components/AuthScreen.jsx
// Forever Drawings — branded sign in / sign up screen

import { useState } from "react";

const T = {
  bg: "#FFF8F0", white: "#FFFFFF", ink: "#2D1B00", muted: "#8B6040",
  border: "#E8D5C0", orange: "#E8640A",
  ff: "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",
};

export function AuthScreen({ onLogin }) {
  const [mode, setMode]       = useState("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function submit() {
    setError(""); setLoading(true);
    try {
      // Swap for real Supabase auth:
      // mode === 'signup'
      //   ? await signUp({ email, password: pass, fullName: name })
      //   : await signIn({ email, password: pass });
      await new Promise(r => setTimeout(r, 600));
      onLogin({ id: "demo", email, user_metadata: { full_name: name || "Parent" } });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: T.ff }}>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "44px" }}>
        {/* Logo mark — inline SVG */}
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ marginBottom: "16px" }}>
          <circle cx="36" cy="36" r="36" fill="#E8640A"/>
          {/* Paper */}
          <rect x="18" y="14" width="36" height="44" rx="3" fill="white" opacity="0.92"/>
          {/* Folded corner */}
          <polygon points="41,14 54,14 54,27" fill="#E8D5B0" opacity="0.9"/>
          {/* Ruled lines */}
          <line x1="23" y1="32" x2="49" y2="32" stroke="#C8C0B8" stroke-width="1"/>
          <line x1="23" y1="39" x2="49" y2="39" stroke="#C8C0B8" stroke-width="1"/>
          <line x1="23" y1="46" x2="49" y2="46" stroke="#C8C0B8" stroke-width="1"/>
          {/* Crayon diagonal */}
          <g transform="translate(20,15) rotate(18)">
            <rect x="0" y="0" width="8" height="36" rx="2" fill="#2D1B00"/>
            <rect x="0" y="8" width="8" height="10" fill="#1A0F00"/>
            <polygon points="0,36 8,36 4,46" fill="#F4C88C"/>
            <rect x="0" y="-3" width="8" height="5" rx="1" fill="#1A0F00"/>
          </g>
        </svg>

        <h1 style={{ fontSize: "38px", fontWeight: "900", color: T.ink, margin: "0 0 8px", letterSpacing: "-1.5px", lineHeight: 1 }}>
          Forever Drawings
        </h1>
        <p style={{ color: T.muted, margin: 0, fontSize: "16px", fontStyle: "italic" }}>
          Every drawing, kept forever.
        </p>
      </div>

      {/* Card */}
      <div style={{ background: T.white, borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "400px", boxShadow: "0 8px 40px rgba(45,27,0,0.12)" }}>

        {/* Tab toggle */}
        <div style={{ display: "flex", background: T.bg, borderRadius: "10px", padding: "4px", marginBottom: "28px" }}>
          {[["login", "Sign In"], ["signup", "Create Vault"]].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", background: mode === m ? "white" : "transparent", color: mode === m ? T.ink : T.muted, fontWeight: mode === m ? "700" : "400", fontFamily: T.ff, fontSize: "14px", boxShadow: mode === m ? "0 2px 8px rgba(45,27,0,0.1)" : "none", transition: "all .2s" }}>
              {label}
            </button>
          ))}
        </div>

        {mode === "signup" && (
          <Field label="Your name" value={name} onChange={setName} placeholder="e.g. Alex Johnson" />
        )}
        <Field label="Email address" value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
        <Field label="Password" value={pass} onChange={setPass} placeholder="••••••••" type="password" />

        {error && <p style={{ color: "#B91C1C", fontSize: "13px", margin: "0 0 12px" }}>{error}</p>}

        <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "#F0E0D0" : T.orange, color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: loading ? "default" : "pointer", fontFamily: T.ff, boxShadow: "0 4px 16px rgba(232,100,10,0.3)" }}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Your Vault →"}
        </button>

        <p style={{ textAlign: "center", color: T.muted, fontSize: "12px", marginTop: "20px" }}>
          {mode === "login"
            ? "New here? Switch to Create Vault above."
            : "Already have a vault? Switch to Sign In above."
          }
        </p>
      </div>

      {/* Footer line */}
      <p style={{ marginTop: "32px", color: T.muted, fontSize: "12px", textAlign: "center", fontFamily: T.ff }}>
        © {new Date().getFullYear()} Forever Drawings · foreverdrawings.com
      </p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#8B6040", marginBottom: "5px", fontFamily: "'Palatino Linotype',Georgia,serif", textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8D5C0", borderRadius: "10px", fontSize: "15px", fontFamily: "'Palatino Linotype',Georgia,serif", background: "#FFFDF9", color: "#2D1B00", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}
