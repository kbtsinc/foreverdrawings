import { useState, useEffect, useRef } from "react";


const FONT_URL = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap";

const C = {
  bg:      "#FEFCF7",
  paper:   "#FFF8F0",
  ink:     "#2D1B00",
  orange:  "#E8640A",
  orangeL: "#FFF0E5",
  muted:   "#8B6040",
  border:  "#EAD9C0",
  white:   "#FFFFFF",
  green:   "#2A7A2A",
};

const S = {
  ff:      "'Lora', Georgia, serif",
  ffHand:  "'Caveat', cursive",
};

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled || menuOpen ? "rgba(254,252,247,0.97)" : "transparent",
        borderBottom: scrolled || menuOpen ? `1px solid ${C.border}` : "none",
        backdropFilter: "blur(12px)", transition: "all 0.3s", padding: "0 20px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="36" fill={C.orange}/>
              <rect x="18" y="14" width="36" height="44" rx="3" fill="white" opacity="0.92"/>
              <polygon points="41,14 54,14 54,27" fill="#E8D5B0" opacity="0.9"/>
              <line x1="23" y1="32" x2="49" y2="32" stroke="#C8C0B8" strokeWidth="1"/>
              <line x1="23" y1="39" x2="49" y2="39" stroke="#C8C0B8" strokeWidth="1"/>
              <line x1="23" y1="46" x2="49" y2="46" stroke="#C8C0B8" strokeWidth="1"/>
              <g transform="translate(20,15) rotate(18)">
                <rect x="0" y="0" width="8" height="36" rx="2" fill="#2D1B00"/>
                <rect x="0" y="8" width="8" height="10" fill="#1A0F00"/>
                <polygon points="0,36 8,36 4,46" fill="#F4C88C"/>
              </g>
            </svg>
            <span style={{ fontFamily: S.ffHand, fontSize: 20, fontWeight: 700, color: C.ink }}>Forever Drawings</span>
          </div>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28, "@media(max-width:768px)": {display:"none"} }}>
            <style>{`@media(max-width:768px){.nav-links{display:none!important}}`}</style>
            <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {["Features", "How it works", "Pricing"].map(l => (
                <a key={l} href={"#" + l.toLowerCase().replace(/ /g,"-")} style={{ fontFamily: S.ff, fontSize: 15, color: C.muted, textDecoration: "none" }}>{l}</a>
              ))}
              <button onClick={onLogin} style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: 30, padding: "8px 18px", fontFamily: S.ff, fontSize: 14, color: C.ink, cursor: "pointer" }}>Sign in</button>
              <button onClick={onLogin} style={{ background: C.orange, border: "none", borderRadius: 30, padding: "9px 20px", fontFamily: S.ff, fontSize: 14, fontWeight: 600, color: "white", cursor: "pointer", boxShadow: "0 4px 14px rgba(232,100,10,0.3)" }}>Start free →</button>
            </div>

            {/* Mobile: just CTA + hamburger */}
            <div className="nav-mobile" style={{ display: "none", alignItems: "center", gap: 10 }}>
              <style>{`.nav-mobile{display:none!important} @media(max-width:768px){.nav-mobile{display:flex!important}}`}</style>
              <button onClick={onLogin} style={{ background: C.orange, border: "none", borderRadius: 30, padding: "9px 18px", fontFamily: S.ff, fontSize: 14, fontWeight: 600, color: "white", cursor: "pointer" }}>Start free</button>
              <button onClick={() => setMenuOpen(m => !m)} style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 20, height: 2, background: C.ink, borderRadius: 2 }}/>)}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {["Features", "How it works", "Pricing"].map(l => (
              <a key={l} href={"#" + l.toLowerCase().replace(/ /g,"-")} onClick={() => setMenuOpen(false)} style={{ fontFamily: S.ff, fontSize: 16, color: C.ink, textDecoration: "none", padding: "4px 0" }}>{l}</a>
            ))}
            <button onClick={() => { setMenuOpen(false); onLogin(); }} style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: 30, padding: "12px", fontFamily: S.ff, fontSize: 15, color: C.ink, cursor: "pointer" }}>Sign in</button>
            <button onClick={() => { setMenuOpen(false); onLogin(); }} style={{ background: C.orange, border: "none", borderRadius: 30, padding: "14px", fontFamily: S.ff, fontSize: 15, fontWeight: 600, color: "white", cursor: "pointer" }}>Start free →</button>
          </div>
        )}
      </nav>
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onLogin }) {
  return (
    <section style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", paddingTop: 64, overflow: "hidden", position: "relative" }}>
      {/* Ruled lines background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 80 + i * 48, height: 1, background: C.border, opacity: 0.4 }} />
        ))}
        <div style={{ position: "absolute", left: 120, top: 0, bottom: 0, width: 1.5, background: "#F4AAAA", opacity: 0.5 }} />
      </div>

      <style>{`
  @media(max-width:768px){
    .hero-grid{grid-template-columns:1fr!important;gap:40px!important;padding:40px 20px 60px!important;}
    .hero-art{display:none!important;}
    .hero-h1{font-size:48px!important;}
    .hero-p{font-size:16px!important;}
    .hero-btns{flex-direction:column!important;}
    .hero-btns button{width:100%!important;text-align:center!important;}
    .features-grid{grid-template-columns:1fr!important;}
    .how-grid{grid-template-columns:1fr 1fr!important;}
    .email-grid{grid-template-columns:1fr!important;}
    .pricing-grid{grid-template-columns:1fr!important;}
    .testimonials-grid{grid-template-columns:1fr!important;}
    .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
  }
  @media(max-width:480px){
    .how-grid{grid-template-columns:1fr!important;}
  }
`}</style>
<div className="hero-grid" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 1 }}>
        {/* Left — copy */}
        <div>
          <div style={{ display: "inline-block", background: C.orangeL, border: `1px solid ${C.border}`, borderRadius: 30, padding: "6px 16px", marginBottom: 28 }}>
            <span style={{ fontFamily: S.ffHand, fontSize: 15, color: C.orange }}>✏️ For parents who can't throw away a single drawing</span>
          </div>

          <h1 className="hero-h1" style={{ fontFamily: S.ffHand, fontSize: 68, fontWeight: 700, color: C.ink, lineHeight: 1.05, margin: "0 0 12px", letterSpacing: "-1px" }}>
            Preserve every<br/>
            <span style={{ color: C.orange }}>drawing,</span><br/>
            forever.
          </h1>

          {/* Crayon underline */}
          <svg width="320" height="16" viewBox="0 0 320 16" style={{ display: "block", marginBottom: 28 }}>
            <path d="M0,10 Q60,4 120,10 Q180,16 240,8 Q280,4 320,10" fill="none" stroke={C.orange} strokeWidth="4" strokeLinecap="round"/>
          </svg>

          <p className="hero-p" style={{ fontFamily: S.ff, fontSize: 18, color: C.muted, lineHeight: 1.8, margin: "0 0 40px", maxWidth: 440 }}>
            Your child brings home a drawing every week. You love it, you can't throw it away, but you can't keep all of them either. Forever Drawings is your family's art vault — organized, beautiful, and backed up forever.
          </p>

          <div className="hero-btns" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={onLogin} style={{ background: C.orange, border: "none", borderRadius: 30, padding: "16px 36px", fontFamily: S.ff, fontSize: 17, fontWeight: 600, color: "white", cursor: "pointer", boxShadow: "0 6px 20px rgba(232,100,10,0.35)" }}>
              Start your vault — it's free →
            </button>
            <button onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })} style={{ background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 30, padding: "16px 28px", fontFamily: S.ff, fontSize: 16, color: C.muted, cursor: "pointer" }}>
              See how it works
            </button>
          </div>

          <p style={{ fontFamily: S.ff, fontSize: 13, color: C.muted, marginTop: 16, fontStyle: "italic" }}>Free plan: 1 child · 5 drawings/month · No credit card</p>
        </div>

        {/* Right — kid drawing cards */}
        <div className="hero-art" style={{ position: "relative", height: 580 }}>

          {/* Card 1 — Sunshine Dragon */}
          <div style={{ position:"absolute", top:0, left:60, transform:"rotate(-4deg)", background:C.white, borderRadius:8, padding:10, boxShadow:"0 8px 32px rgba(45,27,0,0.14)", animation:"float0 4s ease-in-out infinite" }}>
            <svg width="180" height="220" viewBox="0 0 180 220" style={{ display:"block", borderRadius:4, background:"#FFF9C4" }}>
              {/* Sky */}
              <rect width="180" height="220" fill="#FFF9C4"/>
              {/* Sun */}
              <circle cx="150" cy="35" r="22" fill="#FFDA3D" stroke="#F5A623" strokeWidth="2.5"/>
              <line x1="150" y1="5"  x2="150" y2="0"  stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
              <line x1="170" y1="15" x2="175" y2="10" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
              <line x1="178" y1="35" x2="183" y2="35" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
              <line x1="170" y1="55" x2="175" y2="60" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
              {/* Dragon body */}
              <ellipse cx="90" cy="130" rx="45" ry="35" fill="#7CC8F0" stroke="#4A9EC4" strokeWidth="2.5"/>
              {/* Dragon head */}
              <ellipse cx="55" cy="100" rx="28" ry="22" fill="#7CC8F0" stroke="#4A9EC4" strokeWidth="2.5"/>
              {/* Eye */}
              <circle cx="48" cy="95" r="5" fill="white" stroke="#4A9EC4" strokeWidth="1.5"/>
              <circle cx="48" cy="95" r="2.5" fill="#333"/>
              {/* Nostril */}
              <circle cx="38" cy="102" r="2.5" fill="#4A9EC4"/>
              {/* Mouth smile */}
              <path d="M38,108 Q48,115 58,108" fill="none" stroke="#4A9EC4" strokeWidth="2" strokeLinecap="round"/>
              {/* Horn */}
              <polygon points="60,80 68,62 76,80" fill="#FF8EC4" stroke="#D060A0" strokeWidth="1.5"/>
              {/* Wings */}
              <path d="M100,110 Q140,80 160,100 Q140,115 100,120 Z" fill="#FF8EC4" stroke="#D060A0" strokeWidth="2"/>
              {/* Tail */}
              <path d="M130,150 Q160,160 170,185 Q155,175 145,180" fill="none" stroke="#4A9EC4" strokeWidth="3" strokeLinecap="round"/>
              {/* Legs */}
              <line x1="70"  y1="160" x2="65"  y2="185" stroke="#4A9EC4" strokeWidth="4" strokeLinecap="round"/>
              <line x1="90"  y1="163" x2="88"  y2="190" stroke="#4A9EC4" strokeWidth="4" strokeLinecap="round"/>
              <line x1="110" y1="163" x2="112" y2="190" stroke="#4A9EC4" strokeWidth="4" strokeLinecap="round"/>
              {/* Stars */}
              <text x="15" y="40" fontSize="18" fill="#FFDA3D">★</text>
              <text x="155" y="85" fontSize="12" fill="#FF8EC4">★</text>
              <text x="20" y="80" fontSize="10" fill="#B0D0FF">★</text>
              {/* Grass */}
              <path d="M0,200 Q45,188 90,200 Q135,212 180,200 L180,220 L0,220 Z" fill="#8BC34A"/>
            </svg>
            <div style={{ paddingTop:8 }}>
              <div style={{ fontFamily:S.ffHand, fontSize:14, fontWeight:700, color:C.ink }}>Sunshine Dragon</div>
              <div style={{ fontFamily:S.ff, fontSize:11, color:C.muted }}>Emma, 1st Grade</div>
            </div>
          </div>

          {/* Card 2 — My Family */}
          <div style={{ position:"absolute", top:60, left:250, transform:"rotate(3deg)", background:C.white, borderRadius:8, padding:10, boxShadow:"0 8px 32px rgba(45,27,0,0.14)", animation:"float1 4s ease-in-out infinite", animationDelay:"0.8s" }}>
            <svg width="150" height="180" viewBox="0 0 150 180" style={{ display:"block", borderRadius:4, background:"#E8F5E9" }}>
              <rect width="150" height="180" fill="#E8F5E9"/>
              {/* Sky */}
              <rect width="150" height="100" fill="#B3E5FC"/>
              {/* Sun */}
              <circle cx="125" cy="25" r="16" fill="#FFDA3D"/>
              {/* Ground */}
              <rect y="100" width="150" height="80" fill="#8BC34A"/>
              {/* House */}
              <rect x="45" y="75" width="60" height="55" fill="#FFCCBC" stroke="#E8640A" strokeWidth="2"/>
              <polygon points="35,78 115,78 75,45" fill="#E8640A" stroke="#C85008" strokeWidth="2"/>
              {/* Door */}
              <rect x="62" y="100" width="18" height="30" rx="2" fill="#8B5E3C" stroke="#6B4020" strokeWidth="1.5"/>
              {/* Windows */}
              <rect x="50" y="83" width="14" height="12" rx="1" fill="#B3E5FC" stroke="#4A9EC4" strokeWidth="1.5"/>
              <rect x="88" y="83" width="14" height="12" rx="1" fill="#B3E5FC" stroke="#4A9EC4" strokeWidth="1.5"/>
              {/* Dad */}
              <circle cx="18" cy="75" r="9" fill="#FFCC80" stroke="#E8640A" strokeWidth="1.5"/>
              <rect x="11" y="84" width="14" height="20" rx="3" fill="#1565C0"/>
              <line x1="11" y1="88" x2="5"  y2="100" stroke="#FFCC80" strokeWidth="3" strokeLinecap="round"/>
              <line x1="25" y1="88" x2="31" y2="100" stroke="#FFCC80" strokeWidth="3" strokeLinecap="round"/>
              <line x1="14" y1="104" x2="12" y2="120" stroke="#1565C0" strokeWidth="4" strokeLinecap="round"/>
              <line x1="22" y1="104" x2="24" y2="120" stroke="#1565C0" strokeWidth="4" strokeLinecap="round"/>
              {/* Mom */}
              <circle cx="130" cy="75" r="9" fill="#FFCC80" stroke="#E8640A" strokeWidth="1.5"/>
              <path d="M118,84 Q130,82 142,84 L140,104 Q130,107 120,104 Z" fill="#E91E8C"/>
              <line x1="118" y1="90" x2="112" y2="102" stroke="#FFCC80" strokeWidth="3" strokeLinecap="round"/>
              <line x1="142" y1="90" x2="148" y2="102" stroke="#FFCC80" strokeWidth="3" strokeLinecap="round"/>
              <line x1="124" y1="104" x2="122" y2="120" stroke="#E91E8C" strokeWidth="4" strokeLinecap="round"/>
              <line x1="136" y1="104" x2="138" y2="120" stroke="#E91E8C" strokeWidth="4" strokeLinecap="round"/>
              {/* Cloud */}
              <ellipse cx="50" cy="22" rx="18" ry="10" fill="white" opacity="0.9"/>
              <ellipse cx="38" cy="26" rx="12" ry="8"  fill="white" opacity="0.9"/>
              <ellipse cx="62" cy="26" rx="12" ry="8"  fill="white" opacity="0.9"/>
              {/* Flowers */}
              <circle cx="10"  cy="118" r="5" fill="#FFDA3D"/>
              <circle cx="10"  cy="110" r="4" fill="#FF8EC4"/>
              <circle cx="10"  cy="126" r="4" fill="#FF8EC4"/>
              <circle cx="4"   cy="118" r="4" fill="#FF8EC4"/>
              <circle cx="16"  cy="118" r="4" fill="#FF8EC4"/>
              <circle cx="140" cy="118" r="5" fill="#FFDA3D"/>
              <circle cx="140" cy="110" r="4" fill="#C8A0F5"/>
              <circle cx="140" cy="126" r="4" fill="#C8A0F5"/>
              <circle cx="134" cy="118" r="4" fill="#C8A0F5"/>
              <circle cx="146" cy="118" r="4" fill="#C8A0F5"/>
            </svg>
            <div style={{ paddingTop:8 }}>
              <div style={{ fontFamily:S.ffHand, fontSize:14, fontWeight:700, color:C.ink }}>My Family</div>
              <div style={{ fontFamily:S.ff, fontSize:11, color:C.muted }}>Emma, 1st Grade</div>
            </div>
          </div>

          {/* Card 3 — Space Rocket */}
          <div style={{ position:"absolute", top:230, left:20, transform:"rotate(-2deg)", background:C.white, borderRadius:8, padding:10, boxShadow:"0 8px 32px rgba(45,27,0,0.14)", animation:"float2 4s ease-in-out infinite", animationDelay:"1.6s" }}>
            <svg width="155" height="185" viewBox="0 0 155 185" style={{ display:"block", borderRadius:4, background:"#1A237E" }}>
              <rect width="155" height="185" fill="#1A237E"/>
              {/* Stars */}
              {[[15,15],[45,8],[80,20],[120,12],[140,30],[10,50],[55,45],[100,38],[135,55],[25,75],[70,68],[115,72],[140,85],[8,100],[50,95],[90,105],[130,98],[20,130],[60,125],[100,118],[140,130],[30,155],[75,148],[115,155]].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r={Math.random()>0.5?1.5:1} fill="white" opacity={0.6+Math.random()*0.4}/>
              ))}
              {/* Rocket body */}
              <rect x="60" y="60" width="35" height="75" rx="5" fill="#EF5350" stroke="#B71C1C" strokeWidth="2"/>
              {/* Rocket nose */}
              <polygon points="60,60 95,60 77,25" fill="#FF8A65" stroke="#E64A19" strokeWidth="2"/>
              {/* Window */}
              <circle cx="77" cy="85" r="12" fill="#B3E5FC" stroke="white" strokeWidth="2.5"/>
              <circle cx="77" cy="85" r="7"  fill="#0288D1"/>
              <circle cx="73" cy="81" r="2.5" fill="white" opacity="0.8"/>
              {/* Fins */}
              <polygon points="60,110 45,145 60,135" fill="#FF8A65" stroke="#E64A19" strokeWidth="1.5"/>
              <polygon points="95,110 110,145 95,135" fill="#FF8A65" stroke="#E64A19" strokeWidth="1.5"/>
              {/* Flames */}
              <ellipse cx="70" cy="142" rx="7"  ry="14" fill="#FFDA3D" opacity="0.9"/>
              <ellipse cx="84" cy="142" rx="7"  ry="14" fill="#FFDA3D" opacity="0.9"/>
              <ellipse cx="77" cy="145" rx="8"  ry="18" fill="#FF8A65" opacity="0.8"/>
              <ellipse cx="77" cy="150" rx="5"  ry="12" fill="white"   opacity="0.6"/>
              {/* Planet */}
              <circle cx="25" cy="155" r="18" fill="#CE93D8" stroke="#9C27B0" strokeWidth="2"/>
              <ellipse cx="25" cy="155" rx="26" ry="7" fill="none" stroke="#E1BEE7" strokeWidth="2.5"/>
              {/* Small moon */}
              <circle cx="130" cy="150" r="10" fill="#BDBDBD" stroke="#9E9E9E" strokeWidth="1.5"/>
              <circle cx="126" cy="147" r="2.5" fill="#9E9E9E"/>
              <circle cx="133" cy="153" r="2"   fill="#9E9E9E"/>
            </svg>
            <div style={{ paddingTop:8 }}>
              <div style={{ fontFamily:S.ffHand, fontSize:14, fontWeight:700, color:C.ink }}>Space Rocket</div>
              <div style={{ fontFamily:S.ff, fontSize:11, color:C.muted }}>Liam, K</div>
            </div>
          </div>

          {/* Card 4 — Spring Flowers */}
          <div style={{ position:"absolute", top:295, left:210, transform:"rotate(5deg)", background:C.white, borderRadius:8, padding:10, boxShadow:"0 8px 32px rgba(45,27,0,0.14)", animation:"float3 4s ease-in-out infinite", animationDelay:"2.4s" }}>
            <svg width="145" height="170" viewBox="0 0 145 170" style={{ display:"block", borderRadius:4, background:"#F3E5F5" }}>
              <rect width="145" height="170" fill="#F3E5F5"/>
              {/* Sky */}
              <rect width="145" height="100" fill="#E1F5FE"/>
              {/* Sun */}
              <circle cx="22" cy="22" r="14" fill="#FFDA3D"/>
              {/* Clouds */}
              <ellipse cx="85" cy="20" rx="20" ry="10" fill="white" opacity="0.9"/>
              <ellipse cx="72" cy="24" rx="14" ry="8"  fill="white" opacity="0.9"/>
              <ellipse cx="98" cy="24" rx="14" ry="8"  fill="white" opacity="0.9"/>
              {/* Ground */}
              <rect y="100" width="145" height="70" fill="#A5D6A7"/>
              {/* Flower 1 - big pink */}
              <line x1="40" y1="100" x2="40" y2="148" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"/>
              <path d="M33,120 Q28,112 35,108 Q40,106 40,112" fill="#8BC34A"/>
              <circle cx="40" cy="78" r="10" fill="#FFDA3D" stroke="#F5A623" strokeWidth="2"/>
              <ellipse cx="40" cy="63" rx="7"  ry="11" fill="#FF8EC4" stroke="#E91E8C" strokeWidth="1.5"/>
              <ellipse cx="40" cy="93" rx="7"  ry="11" fill="#FF8EC4" stroke="#E91E8C" strokeWidth="1.5"/>
              <ellipse cx="25" cy="78" rx="11" ry="7"  fill="#FF8EC4" stroke="#E91E8C" strokeWidth="1.5"/>
              <ellipse cx="55" cy="78" rx="11" ry="7"  fill="#FF8EC4" stroke="#E91E8C" strokeWidth="1.5"/>
              <ellipse cx="29" cy="67" rx="7"  ry="11" fill="#C8A0F5" stroke="#9C27B0" strokeWidth="1.5" transform="rotate(45 29 67)"/>
              <ellipse cx="51" cy="67" rx="7"  ry="11" fill="#C8A0F5" stroke="#9C27B0" strokeWidth="1.5" transform="rotate(-45 51 67)"/>
              <ellipse cx="29" cy="89" rx="7"  ry="11" fill="#C8A0F5" stroke="#9C27B0" strokeWidth="1.5" transform="rotate(-45 29 89)"/>
              <ellipse cx="51" cy="89" rx="7"  ry="11" fill="#C8A0F5" stroke="#9C27B0" strokeWidth="1.5" transform="rotate(45 51 89)"/>
              {/* Flower 2 - purple */}
              <line x1="90" y1="100" x2="90" y2="140" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="90" cy="72" r="8"   fill="#FFDA3D" stroke="#F5A623" strokeWidth="1.5"/>
              <ellipse cx="90" cy="59" rx="6"  ry="9"  fill="#CE93D8" stroke="#9C27B0" strokeWidth="1.5"/>
              <ellipse cx="90" cy="85" rx="6"  ry="9"  fill="#CE93D8" stroke="#9C27B0" strokeWidth="1.5"/>
              <ellipse cx="77" cy="72" rx="9"  ry="6"  fill="#CE93D8" stroke="#9C27B0" strokeWidth="1.5"/>
              <ellipse cx="103" cy="72" rx="9" ry="6"  fill="#CE93D8" stroke="#9C27B0" strokeWidth="1.5"/>
              {/* Flower 3 - small yellow */}
              <line x1="120" y1="100" x2="120" y2="130" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="120" cy="88" r="7"  fill="#FFDA3D" stroke="#F5A623" strokeWidth="1.5"/>
              <ellipse cx="120" cy="77" rx="5" ry="8"  fill="#FF8EC4" stroke="#E91E8C" strokeWidth="1.5"/>
              <ellipse cx="120" cy="99" rx="5" ry="8"  fill="#FF8EC4" stroke="#E91E8C" strokeWidth="1.5"/>
              <ellipse cx="109" cy="88" rx="8" ry="5"  fill="#FF8EC4" stroke="#E91E8C" strokeWidth="1.5"/>
              <ellipse cx="131" cy="88" rx="8" ry="5"  fill="#FF8EC4" stroke="#E91E8C" strokeWidth="1.5"/>
              {/* Butterfly */}
              <ellipse cx="108" cy="55" rx="10" ry="14" fill="#FFB74D" stroke="#F57C00" strokeWidth="1.5" transform="rotate(-20 108 55)"/>
              <ellipse cx="118" cy="55" rx="10" ry="14" fill="#FFB74D" stroke="#F57C00" strokeWidth="1.5" transform="rotate(20 118 55)"/>
              <ellipse cx="108" cy="65" rx="7"  ry="10" fill="#FF8A65" stroke="#E64A19" strokeWidth="1.5" transform="rotate(20 108 65)"/>
              <ellipse cx="118" cy="65" rx="7"  ry="10" fill="#FF8A65" stroke="#E64A19" strokeWidth="1.5" transform="rotate(-20 118 65)"/>
              <ellipse cx="113" cy="60" rx="2"  ry="10" fill="#333"/>
              {/* Grass blades */}
              <path d="M5,100 Q8,88 11,100"   fill="none" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M15,100 Q18,85 21,100"  fill="none" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M130,100 Q133,90 136,100" fill="none" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <div style={{ paddingTop:8 }}>
              <div style={{ fontFamily:S.ffHand, fontSize:14, fontWeight:700, color:C.ink }}>Spring Flowers</div>
              <div style={{ fontFamily:S.ff, fontSize:11, color:C.muted }}>Sofia, Pre-K</div>
            </div>
          </div>

          <style>{`
            @keyframes float0 { 0%,100%{transform:rotate(-4deg) translateY(0)} 50%{transform:rotate(-4deg) translateY(-8px)} }
            @keyframes float1 { 0%,100%{transform:rotate(3deg) translateY(0)} 50%{transform:rotate(3deg) translateY(-6px)} }
            @keyframes float2 { 0%,100%{transform:rotate(-2deg) translateY(0)} 50%{transform:rotate(-2deg) translateY(-10px)} }
            @keyframes float3 { 0%,100%{transform:rotate(5deg) translateY(0)} 50%{transform:rotate(5deg) translateY(-7px)} }
          `}</style>
        </div>
      </div>
    </section>
  );
}

// ── Social Proof ──────────────────────────────────────────────────────────────
function SocialProof() {
  const stats = [
    { val: "∞", label: "Drawings stored" },
    { val: "3", label: "Cloud providers" },
    { val: "0", label: "Drawings lost" },
    { val: "100%", label: "Private & secure" },
  ];
  return (
    <section style={{ background: C.ink, padding: "48px 24px" }}>
      <div className="stats-grid" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: S.ffHand, fontSize: 48, fontWeight: 700, color: C.orange }}>{s.val}</div>
            <div style={{ fontFamily: S.ff, fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon:"👨‍👩‍👧‍👦", title:"Multiple children",       body:"Create a separate vault for each child. Emma's drawings stay with Emma's vault. Liam's with Liam's. Filter and browse by child instantly." },
    { icon:"📁", title:"Albums & smart albums",    body:"Create albums manually or let smart albums auto-fill based on tags. A '1st Grade' album fills itself. A 'Christmas' album fills itself." },
    { icon:"🏷️", title:"Tags that make sense",     body:"Tag by grade, holiday, season, or medium. 16 default tags pre-loaded — Christmas, Halloween, Watercolor, Self Portrait, and more. Create your own." },
    { icon:"☁️", title:"Sync to your cloud",        body:"Connect your personal Google Drive, OneDrive, or Dropbox. Drawings sync automatically. Each parent connects their own account — completely private." },
    { icon:"📧", title:"Email-to-vault",            body:"Get a unique vault email address. Forward school emails with photo attachments — drawings appear in your vault automatically within 30 seconds." },
    { icon:"📱", title:"Install on your phone",     body:"Add to your iPhone or Android home screen. Opens like a native app — no App Store needed. Upload drawings straight from your camera roll." },
    { icon:"🔗", title:"Share up to 5 drawings",   body:"Select up to 5 drawings and generate a shareable link. Perfect for sending to grandparents. View-only, expires in 30 days, no account needed." },
    { icon:"🛡️", title:"Backed up nightly",        body:"Your vault is backed up every night. 30-day retention. Your drawings are safer here than on your phone or in a shoebox." },
  ];

  return (
    <section id="features" style={{ background: C.paper, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: S.ffHand, fontSize: 52, fontWeight: 700, color: C.ink, margin: "0 0 16px" }}>Everything a drawing deserves</h2>
            <p style={{ fontFamily: S.ff, fontSize: 18, color: C.muted, maxWidth: 520, margin: "0 auto" }}>Built specifically for school art — not a generic photo app retrofitted for kids.</p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.border}`, height: "100%", boxSizing: "border-box" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: S.ff, fontSize: 17, fontWeight: 600, color: C.ink, margin: "0 0 10px" }}>{f.title}</h3>
                <p style={{ fontFamily: S.ff, fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{f.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num:"1", title:"Create your vault",      body:"Sign up free. Add your children. Each child gets their own section.",               icon:"🎨" },
    { num:"2", title:"Upload drawings",         body:"Take a photo, drag and drop, or forward school emails. Drawings save instantly.",    icon:"📸" },
    { num:"3", title:"Organize automatically", body:"Tag drawings by grade and holiday. Smart albums fill themselves.",                   icon:"🏷️" },
    { num:"4", title:"Access anywhere",        body:"Install on your phone. Sync to your cloud. Share with family. Safe forever.",        icon:"☁️" },
  ];

  return (
    <section id="how-it-works" style={{ background: C.bg, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: S.ffHand, fontSize: 52, fontWeight: 700, color: C.ink, margin: "0 0 16px" }}>Up and running in minutes</h2>
            <p style={{ fontFamily: S.ff, fontSize: 18, color: C.muted }}>No technical setup. No complicated settings.</p>
          </div>
        </FadeIn>

        <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, position: "relative" }}>
          {/* Connecting line */}
          <div style={{ position: "absolute", top: 40, left: "12.5%", right: "12.5%", height: 2, background: `linear-gradient(to right, ${C.orange}, ${C.orange})`, opacity: 0.2, zIndex: 0 }} />

          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.1}>
              <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.orangeL, border: `2px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily: S.ffHand, fontSize: 13, color: C.orange, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>STEP {s.num}</div>
                <h3 style={{ fontFamily: S.ff, fontSize: 17, fontWeight: 600, color: C.ink, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontFamily: S.ff, fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{s.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Email to Vault highlight ──────────────────────────────────────────────────
function EmailFeature() {
  return (
    <section style={{ background: C.ink, padding: "100px 24px", overflow: "hidden" }}>
      <div className="email-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <FadeIn>
          <div>
            <div style={{ fontFamily: S.ffHand, fontSize: 16, color: C.orange, marginBottom: 16, letterSpacing: 1 }}>✉️ YOUR VAULT EMAIL</div>
            <h2 style={{ fontFamily: S.ffHand, fontSize: 48, fontWeight: 700, color: "white", margin: "0 0 20px", lineHeight: 1.1 }}>
              School emailed you<br/>artwork photos?<br/><span style={{ color: C.orange }}>Just forward it.</span>
            </h2>
            <p style={{ fontFamily: S.ff, fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, margin: "0 0 32px" }}>
              Every Forever Drawings account comes with a unique vault email address. Forward any email with photo attachments — drawings appear in your vault automatically within 30 seconds.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {["Forward from any email client — Gmail, Outlook, Apple Mail", "Email subject becomes the drawing title automatically", "Grandparents can email drawings directly to your vault", "Confirmation email sent when drawings are saved"].map(t => (
                <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: C.orange, fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: S.ff, fontSize: 15, color: "rgba(255,255,255,0.7)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          {/* Email mockup */}
          <div style={{ background: "#1A1008", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: S.ff, fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>FROM</div>
              <div style={{ fontFamily: S.ff, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>mrs.johnson@mapleschool.edu</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: S.ff, fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>TO</div>
              <div style={{ fontFamily: S.ffHand, fontSize: 14, color: C.orange }}>vault-e4a9f12b@mail.foreverdrawings.com</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: S.ff, fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>SUBJECT</div>
              <div style={{ fontFamily: S.ff, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Emma's Self Portrait — Art Class</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: C.orangeL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🖼️</div>
                <div>
                  <div style={{ fontFamily: S.ff, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>self_portrait.jpg</div>
                  <div style={{ fontFamily: S.ff, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>2.4 MB · image/jpeg</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(46,122,42,0.15)", border: "1px solid rgba(46,122,42,0.3)", borderRadius: 8 }}>
              <div style={{ fontFamily: S.ff, fontSize: 13, color: "#6EDA6A" }}>✓ Saved to Emma's vault · Just now</div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing({ onLogin }) {
  const plans = [
    {
      name: "Family Free",
      price: "Free",
      sub: "Forever, no credit card",
      included: ["1 child", "5 drawings per month", "Albums & smart albums", "Tags & filtering", "Install on phone (PWA)"],
      excluded: ["Share links", "Email-to-vault", "Cloud storage sync", "Nightly backups"],
      cta: "Start free →",
      featured: false,
    },
    {
      name: "Family Pro",
      price: "$4.99",
      sub: "per month",
      included: ["Unlimited children", "Unlimited drawings", "Albums & smart albums", "Tags & filtering", "Install on phone (PWA)", "Share links (up to 5 drawings)", "Email-to-vault", "Google Drive, OneDrive & Dropbox sync", "Nightly automatic backups", "30-day backup retention"],
      excluded: [],
      cta: "Start free trial →",
      featured: true,
    },
  ];

  return (
    <section id="pricing" style={{ background: C.paper, padding: "100px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: S.ffHand, fontSize: 52, fontWeight: 700, color: C.ink, margin: "0 0 16px" }}>Simple, honest pricing</h2>
            <p style={{ fontFamily: S.ff, fontSize: 18, color: C.muted }}>Start free with 1 child and 5 drawings a month. Upgrade for unlimited everything.</p>
          </div>
        </FadeIn>

        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div style={{
                background: plan.featured ? C.ink : C.white,
                borderRadius: 20,
                padding: "36px 32px",
                border: plan.featured ? "none" : `1px solid ${C.border}`,
                boxShadow: plan.featured ? "0 20px 60px rgba(45,27,0,0.25)" : "none",
                position: "relative",
              }}>
                {plan.featured && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: C.orange, borderRadius: 20, padding: "5px 18px", fontFamily: S.ff, fontSize: 12, fontWeight: 600, color: "white", whiteSpace: "nowrap" }}>
                    Most popular
                  </div>
                )}
                <div style={{ fontFamily: S.ff, fontSize: 15, fontWeight: 600, color: plan.featured ? "rgba(255,255,255,0.6)" : C.muted, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontFamily: S.ffHand, fontSize: 48, fontWeight: 700, color: plan.featured ? "white" : C.ink, lineHeight: 1 }}>{plan.price}</div>
                <div style={{ fontFamily: S.ff, fontSize: 13, color: plan.featured ? "rgba(255,255,255,0.4)" : C.muted, marginBottom: 28 }}>{plan.sub}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {plan.included.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: C.orange, flexShrink: 0, fontSize: 14 }}>✓</span>
                      <span style={{ fontFamily: S.ff, fontSize: 14, color: plan.featured ? "rgba(255,255,255,0.75)" : C.muted, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                  {plan.excluded.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: 0.4 }}>
                      <span style={{ color: plan.featured ? "rgba(255,255,255,0.4)" : C.muted, flexShrink: 0, fontSize: 14 }}>✗</span>
                      <span style={{ fontFamily: S.ff, fontSize: 14, color: plan.featured ? "rgba(255,255,255,0.5)" : C.muted, lineHeight: 1.5, textDecoration: "line-through" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button onClick={onLogin} style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: plan.featured ? C.orange : C.ink,
                  color: "white", fontFamily: S.ff, fontSize: 15, fontWeight: 600, cursor: "pointer",
                  boxShadow: plan.featured ? "0 4px 16px rgba(232,100,10,0.4)" : "none",
                }}>
                  {plan.cta}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    { text: "I used to feel so guilty throwing away Emma's drawings. Now I take a photo, forward the email, and everything is saved. I don't think about it anymore.", name: "Sarah M.", role: "Mom of 2, Connecticut" },
    { text: "The smart albums are genius. I tagged everything '1st Grade' and suddenly I have a perfect album of Liam's entire first grade year without doing anything extra.", name: "Kevin B.", role: "Dad of 3, New York" },
    { text: "My mom lives across the country. I gave her the vault email address and now she emails drawings from whenever she visits. It all just shows up.", name: "Jessica T.", role: "Mom of 1, California" },
  ];

  return (
    <section style={{ background: C.bg, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <h2 style={{ fontFamily: S.ffHand, fontSize: 48, fontWeight: 700, color: C.ink, textAlign: "center", margin: "0 0 56px" }}>
            Parents love it
          </h2>
        </FadeIn>
        <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {quotes.map((q, i) => (
            <FadeIn key={q.name} delay={i * 0.1}>
              <div style={{ background: C.white, borderRadius: 16, padding: "28px 24px", border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: S.ffHand, fontSize: 48, color: C.orange, lineHeight: 1, marginBottom: 8 }}>"</div>
                <p style={{ fontFamily: S.ff, fontSize: 15, color: C.ink, lineHeight: 1.8, margin: "0 0 20px", fontStyle: "italic" }}>{q.text}</p>
                <div>
                  <div style={{ fontFamily: S.ff, fontSize: 14, fontWeight: 600, color: C.ink }}>{q.name}</div>
                  <div style={{ fontFamily: S.ff, fontSize: 12, color: C.muted }}>{q.role}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA({ onLogin }) {
  return (
    <section style={{ background: C.orange, padding: "100px 24px", position: "relative", overflow: "hidden" }}>
      {/* Ruled lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 40 + i * 52, height: 1, background: "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎨</div>
          <h2 style={{ fontFamily: S.ffHand, fontSize: 56, fontWeight: 700, color: "white", margin: "0 0 16px", lineHeight: 1.1 }}>
            Start preserving drawings today
          </h2>
          <p style={{ fontFamily: S.ff, fontSize: 18, color: "rgba(255,255,255,0.8)", margin: "0 0 40px", lineHeight: 1.7 }}>
            Free forever for families. Your first drawing is one photo away.
          </p>
          <button onClick={onLogin} style={{ background: C.ink, border: "none", borderRadius: 30, padding: "18px 44px", fontFamily: S.ff, fontSize: 18, fontWeight: 600, color: "white", cursor: "pointer", boxShadow: "0 8px 24px rgba(45,27,0,0.3)" }}>
            Create your free vault →
          </button>
          <p style={{ fontFamily: S.ff, fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 16, fontStyle: "italic" }}>No credit card · Takes 60 seconds</p>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.ink, padding: "48px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="36" fill={C.orange}/>
            <rect x="18" y="14" width="36" height="44" rx="3" fill="white" opacity="0.9"/>
            <polygon points="41,14 54,14 54,27" fill="#E8D5B0"/>
            <g transform="translate(20,15) rotate(18)">
              <rect x="0" y="0" width="8" height="36" rx="2" fill="#2D1B00"/>
              <polygon points="0,36 8,36 4,46" fill="#F4C88C"/>
            </g>
          </svg>
          <span style={{ fontFamily: S.ffHand, fontSize: 18, color: "white" }}>Forever Drawings</span>
        </div>
        <div style={{ fontFamily: S.ff, fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
          Preserve every drawing, forever.
        </div>
        <div style={{ fontFamily: S.ff, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} Forever Drawings · foreverdrawings.com
        </div>
      </div>
    </footer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function HomePage({ onLogin }) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ background: C.bg }}>
      <Nav onLogin={onLogin} />
      <Hero onLogin={onLogin} />
      <SocialProof />
      <Features />
      <HowItWorks />
      <EmailFeature />
      <Testimonials />
      <Pricing onLogin={onLogin} />
      <CTA onLogin={onLogin} />
      <Footer />
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, onBack }) {
  const [mode, setMode]       = useState("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function submit() {
    setError(""); setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      onLogin({ id: "demo", email, user_metadata: { full_name: name || "Parent" } });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const ff = "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif";
  const orange = "#E8640A";
  const ink = "#2D1B00";
  const muted = "#8B6040";
  const border = "#E8D5C0";

  return (
    <div style={{ minHeight:"100vh", background:"#FFF8F0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", fontFamily:ff }}>
      {onBack && (
        <button onClick={onBack} style={{ position:"fixed", top:20, left:20, background:"none", border:"none", color:orange, cursor:"pointer", fontSize:15, fontFamily:ff, fontWeight:700 }}>
          ← Back
        </button>
      )}
      <div style={{ textAlign:"center", marginBottom:"44px" }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ marginBottom:"16px" }}>
          <circle cx="36" cy="36" r="36" fill={orange}/>
          <rect x="18" y="14" width="36" height="44" rx="3" fill="white" opacity="0.92"/>
          <polygon points="41,14 54,14 54,27" fill="#E8D5B0" opacity="0.9"/>
          <line x1="23" y1="32" x2="49" y2="32" stroke="#C8C0B8" strokeWidth="1"/>
          <line x1="23" y1="39" x2="49" y2="39" stroke="#C8C0B8" strokeWidth="1"/>
          <line x1="23" y1="46" x2="49" y2="46" stroke="#C8C0B8" strokeWidth="1"/>
          <g transform="translate(20,15) rotate(18)">
            <rect x="0" y="0" width="8" height="36" rx="2" fill="#2D1B00"/>
            <rect x="0" y="8" width="8" height="10" fill="#1A0F00"/>
            <polygon points="0,36 8,36 4,46" fill="#F4C88C"/>
          </g>
        </svg>
        <h1 style={{ fontSize:"38px", fontWeight:"900", color:ink, margin:"0 0 8px", letterSpacing:"-1.5px", lineHeight:1 }}>Forever Drawings</h1>
        <p style={{ color:muted, margin:0, fontSize:"16px", fontStyle:"italic" }}>Preserve every drawing, forever.</p>
      </div>
      <div style={{ background:"white", borderRadius:"20px", padding:"36px", width:"100%", maxWidth:"400px", boxShadow:"0 8px 40px rgba(45,27,0,0.12)" }}>
        <div style={{ display:"flex", background:"#FFF8F0", borderRadius:"10px", padding:"4px", marginBottom:"28px" }}>
          {[["login","Sign In"],["signup","Create Vault"]].map(([m,label]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"10px", border:"none", borderRadius:"8px", cursor:"pointer", background:mode===m?"white":"transparent", color:mode===m?ink:muted, fontWeight:mode===m?700:400, fontFamily:ff, fontSize:"14px", boxShadow:mode===m?"0 2px 8px rgba(45,27,0,0.1)":"none", transition:"all .2s" }}>{label}</button>
          ))}
        </div>
        {mode==="signup" && (
          <div style={{ marginBottom:"14px" }}>
            <label style={{ display:"block", fontSize:"11px", fontWeight:700, color:muted, marginBottom:"5px", fontFamily:ff, textTransform:"uppercase", letterSpacing:"0.4px" }}>Your name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Alex Johnson" style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${border}`, borderRadius:"10px", fontSize:"15px", fontFamily:ff, background:"#FFFDF9", color:ink, outline:"none", boxSizing:"border-box" }}/>
          </div>
        )}
        <div style={{ marginBottom:"14px" }}>
          <label style={{ display:"block", fontSize:"11px", fontWeight:700, color:muted, marginBottom:"5px", fontFamily:ff, textTransform:"uppercase", letterSpacing:"0.4px" }}>Email address</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" type="email" style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${border}`, borderRadius:"10px", fontSize:"15px", fontFamily:ff, background:"#FFFDF9", color:ink, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div style={{ marginBottom:"14px" }}>
          <label style={{ display:"block", fontSize:"11px", fontWeight:700, color:muted, marginBottom:"5px", fontFamily:ff, textTransform:"uppercase", letterSpacing:"0.4px" }}>Password</label>
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${border}`, borderRadius:"10px", fontSize:"15px", fontFamily:ff, background:"#FFFDF9", color:ink, outline:"none", boxSizing:"border-box" }}/>
        </div>
        {error && <p style={{ color:"#B91C1C", fontSize:"13px", margin:"0 0 12px" }}>{error}</p>}
        <button onClick={submit} disabled={loading} style={{ width:"100%", padding:"14px", background:loading?"#F0E0D0":orange, color:"white", border:"none", borderRadius:"12px", fontSize:"16px", fontWeight:700, cursor:loading?"default":"pointer", fontFamily:ff, boxShadow:"0 4px 16px rgba(232,100,10,0.3)" }}>
          {loading ? "Please wait…" : mode==="login" ? "Sign In →" : "Create Your Vault →"}
        </button>
        <p style={{ textAlign:"center", color:muted, fontSize:"12px", marginTop:"20px" }}>
          {mode==="login" ? "New here? Switch to Create Vault above." : "Already have a vault? Switch to Sign In above."}
        </p>
      </div>
      <p style={{ marginTop:"32px", color:muted, fontSize:"12px", textAlign:"center", fontFamily:ff }}>© {new Date().getFullYear()} Forever Drawings · foreverdrawings.com</p>
    </div>
  );
}


const CHILDREN = [
  { id:"c1", name:"Emma",  avatar_color:"#E8640A", avatar_emoji:"🎨", school_name:"Maple Street Elementary" },
  { id:"c2", name:"Liam",  avatar_color:"#2563EB", avatar_emoji:"🚀", school_name:"Maple Street Elementary" },
  { id:"c3", name:"Sofia", avatar_color:"#7C3AED", avatar_emoji:"🦋", school_name:"Riverside Pre-K" },
];
const TAGS = [
  { id:"t1",  name:"Kindergarten",  slug:"kindergarten",  color:"#7C3AED", icon:"⭐" },
  { id:"t2",  name:"1st Grade",     slug:"1st-grade",     color:"#2563EB", icon:"📚" },
  { id:"t3",  name:"2nd Grade",     slug:"2nd-grade",     color:"#0891B2", icon:"📚" },
  { id:"t4",  name:"Christmas",     slug:"christmas",     color:"#16A34A", icon:"🎄" },
  { id:"t5",  name:"Halloween",     slug:"halloween",     color:"#EA580C", icon:"🎃" },
  { id:"t6",  name:"Valentine",     slug:"valentine",     color:"#DB2777", icon:"❤️" },
  { id:"t7",  name:"Self Portrait", slug:"self-portrait", color:"#9333EA", icon:"🪞" },
  { id:"t8",  name:"Favorite",      slug:"favorite",      color:"#E8640A", icon:"⭐" },
  { id:"t9",  name:"Watercolor",    slug:"watercolor",    color:"#0284C7", icon:"🎨" },
  { id:"t10", name:"Spring",        slug:"spring",        color:"#65A30D", icon:"🌸" },
  { id:"t11", name:"Summer",        slug:"summer",        color:"#CA8A04", icon:"☀️" },
  { id:"t12", name:"Crayon",        slug:"crayon",        color:"#D97706", icon:"🖍️" },
];
const ALBUMS = [
  { id:"a1", child_id:"c1", name:"Best of Emma",   icon:"⭐", color:"#E8640A", count:6,  is_smart:false, cover:"https://picsum.photos/seed/art1/300/300" },
  { id:"a2", child_id:"c1", name:"1st Grade",      icon:"📚", color:"#2563EB", count:8,  is_smart:true,  cover:"https://picsum.photos/seed/art3/300/300", smart_rules:{tags:["1st-grade"]} },
  { id:"a3", child_id:"c1", name:"Christmas Art",  icon:"🎄", color:"#16A34A", count:3,  is_smart:true,  cover:"https://picsum.photos/seed/art5/300/300", smart_rules:{tags:["christmas"]} },
  { id:"a4", child_id:"c2", name:"Liam's Rockets", icon:"🚀", color:"#2563EB", count:4,  is_smart:false, cover:"https://picsum.photos/seed/art7/300/300" },
  { id:"a5", child_id:"c2", name:"Kindergarten",   icon:"⭐", color:"#7C3AED", count:5,  is_smart:true,  cover:"https://picsum.photos/seed/art9/300/300", smart_rules:{tags:["kindergarten"]} },
  { id:"a6", child_id:"c3", name:"Sofia Gallery",  icon:"🦋", color:"#7C3AED", count:3,  is_smart:false, cover:"https://picsum.photos/seed/art11/300/300" },
];
const mkA = (id,cid,title,tids,date,s) => ({ id, child_id:cid, title, tags:TAGS.filter(t=>tids.includes(t.id)), artwork_date:date, is_favorite:Math.random()>.6, url:`https://picsum.photos/seed/${s}/400/500` });
const ALL_ARTWORKS = [
  mkA("w1","c1","Sunshine Dragon",  ["t2","t8"],"2026-03-15","aa1"),
  mkA("w2","c1","Blue Horse",       ["t2"],     "2026-03-10","aa2"),
  mkA("w3","c1","My Family",        ["t2","t7"],"2026-02-28","aa3"),
  mkA("w4","c1","Christmas Tree",   ["t4","t2"],"2025-12-10","aa4"),
  mkA("w5","c1","Halloween Witch",  ["t5","t1"],"2025-10-30","aa5"),
  mkA("w6","c1","Valentine Heart",  ["t6","t1"],"2025-02-14","aa6"),
  mkA("w7","c1","Rainbow Cat",      ["t1","t9"],"2025-11-08","aa7"),
  mkA("w8","c1","Butterfly Garden", ["t10","t9"],"2026-01-18","aa8"),
  mkA("w9","c2","Space Rocket",     ["t1","t8"],"2026-03-05","aa9"),
  mkA("w10","c2","Big Red Truck",   ["t1"],     "2025-12-05","aa10"),
  mkA("w11","c2","Astronaut",       ["t1","t7"],"2025-11-22","aa11"),
  mkA("w12","c2","Christmas Star",  ["t4","t1"],"2025-12-20","aa12"),
  mkA("w13","c3","Purple Butterfly",["t12"],    "2026-02-10","aa13"),
  mkA("w14","c3","Mommy and Me",    ["t7","t12"],"2026-01-05","aa14"),
  mkA("w15","c3","Spring Flowers",  ["t10","t12"],"2025-04-15","aa15"),
];

const T = { bg:"#FAFAF8", white:"#FFFFFF", ink:"#1C1410", muted:"#7A6655", border:"#EAE0D8", orange:"#E8640A", shadow:"0 2px 14px rgba(28,20,16,0.07)", shadowMd:"0 6px 28px rgba(28,20,16,0.12)", ff:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif" };
const CHILD_COLORS=["#E8640A","#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#DB2777","#0F766E","#9333EA"];
const CHILD_EMOJIS=["🎨","🚀","🦋","🌟","🎭","🦄","🌈","🎸","⚽","🎯"];
const TAG_COLORS=["#E8640A","#2563EB","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#DB2777","#16A34A","#EA580C"];
const ICONS_LIST=["📁","⭐","🎨","📚","🎄","🎃","❤️","🌸","🚀","🦋","🏆","🌈"];
const TAG_ICONS=["⭐","📚","🎄","🎃","❤️","🌸","☀️","🦃","🪞","🎨","🖍️","🚀","🦋","🎭","⚽","🎸"];
const delay = ms => new Promise(r=>setTimeout(r,ms));

function Btn({children,onClick,variant="primary",small,disabled,style={}}) {
  const v={primary:{bg:T.orange,color:"#fff",shadow:"0 3px 12px rgba(232,100,10,0.28)"},secondary:{bg:T.ink,color:"#fff",shadow:"none"},outline:{bg:"transparent",color:T.muted,shadow:"none",border:`1.5px solid ${T.border}`},ghost:{bg:"transparent",color:T.orange,shadow:"none"}}[variant];
  return <button onClick={disabled?undefined:onClick} style={{fontFamily:T.ff,fontWeight:700,border:v.border||"none",cursor:disabled?"default":"pointer",borderRadius:30,padding:small?"7px 15px":"11px 20px",fontSize:small?12:14,opacity:disabled?.5:1,background:v.bg,color:v.color,boxShadow:v.shadow,transition:"all .15s",...style}}>{children}</button>;
}
function Modal({children,onClose,title,wide}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(28,20,16,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:32,width:"100%",maxWidth:wide?680:480,maxHeight:"90vh",overflowY:"auto",boxShadow:T.shadowMd}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{margin:0,fontSize:20,color:T.ink,fontFamily:T.ff,fontWeight:900}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.muted}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Input({label,value,onChange,placeholder,type="text"}) {
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:5,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>{label}</label>}
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,fontFamily:T.ff,background:T.bg,color:T.ink,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}
function ChildAvatar({child,size=40,active}) {
  return <div style={{width:size,height:size,borderRadius:"50%",background:child.avatar_color+"22",border:`2.5px solid ${active?child.avatar_color:"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.44,flexShrink:0,transition:"all .2s",boxShadow:active?`0 0 0 3px ${child.avatar_color}33`:"none"}}>{child.avatar_emoji}</div>;
}
function TagPill({tag,onRemove,small,onClick}) {
  return <span onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:4,background:tag.color+"18",color:tag.color,borderRadius:20,padding:small?"3px 9px":"4px 11px",fontSize:small?11:12,fontWeight:700,fontFamily:T.ff,cursor:onClick?"pointer":"default",border:`1px solid ${tag.color}30`}}>{tag.icon&&<span style={{fontSize:small?10:11}}>{tag.icon}</span>}{tag.name}{onRemove&&<span onClick={e=>{e.stopPropagation();onRemove();}} style={{marginLeft:2,opacity:.6,cursor:"pointer",fontSize:11}}>✕</span>}</span>;
}

function AddChildModal({onClose,onAdd}) {
  const [name,setName]=useState(""); const [emoji,setEmoji]=useState("🎨"); const [color,setColor]=useState(CHILD_COLORS[0]); const [school,setSchool]=useState(""); const [dob,setDob]=useState(""); const [saving,setSaving]=useState(false);
  async function save(){if(!name.trim())return;setSaving(true);await delay(400);onAdd({id:`c${Date.now()}`,name:name.trim(),avatar_color:color,avatar_emoji:emoji,school_name:school,date_of_birth:dob});onClose();}
  return (
    <Modal onClose={onClose} title="Add a Child">
      <div style={{display:"flex",alignItems:"center",gap:14,background:T.bg,borderRadius:14,padding:"14px 18px",marginBottom:22}}>
        <div style={{width:54,height:54,borderRadius:"50%",background:color+"22",border:`3px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{emoji}</div>
        <div><div style={{fontWeight:900,fontSize:18,color:T.ink,fontFamily:T.ff}}>{name||"Child's name"}</div>{school&&<div style={{fontSize:12,color:T.muted,fontFamily:T.ff}}>{school}</div>}</div>
      </div>
      <Input label="Name" value={name} onChange={setName} placeholder="e.g. Emma"/>
      <Input label="School (optional)" value={school} onChange={setSchool} placeholder="e.g. Maple Street Elementary"/>
      <Input label="Date of birth (optional)" value={dob} onChange={setDob} type="date"/>
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Avatar</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{CHILD_EMOJIS.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:38,height:38,borderRadius:10,border:`2px solid ${emoji===e?color:T.border}`,background:emoji===e?color+"18":T.white,fontSize:20,cursor:"pointer"}}>{e}</button>)}</div>
      </div>
      <div style={{marginBottom:22}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Color</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{CHILD_COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:30,height:30,borderRadius:"50%",background:c,border:`3px solid ${color===c?T.ink:"transparent"}`,cursor:"pointer"}}/>)}</div>
      </div>
      <Btn onClick={save} disabled={!name.trim()||saving} style={{width:"100%",borderRadius:12}}>{saving?"Adding…":"Add Child"}</Btn>
    </Modal>
  );
}

function TagManagerModal({tags,onClose,onChange}) {
  const [local,setLocal]=useState(tags); const [newName,setNewName]=useState(""); const [newColor,setNewColor]=useState(TAG_COLORS[0]); const [newIcon,setNewIcon]=useState("");
  function addTag(){if(!newName.trim())return;setLocal(p=>[...p,{id:`t${Date.now()}`,name:newName.trim(),slug:newName.toLowerCase().replace(/[^a-z0-9]+/g,"-"),color:newColor,icon:newIcon||null}]);setNewName("");setNewIcon("");}
  return (
    <Modal onClose={()=>{onChange(local);onClose();}} title="Manage Tags" wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div>
          <p style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.4px",margin:"0 0 12px",fontFamily:T.ff}}>Your Tags ({local.length})</p>
          <div style={{maxHeight:380,overflowY:"auto"}}>
            {local.map(tag=>(
              <div key={tag.id} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:tag.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{tag.icon||"🏷️"}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:T.ink,fontFamily:T.ff}}>{tag.name}</div></div>
                <div style={{display:"flex",gap:4}}>{TAG_COLORS.slice(0,5).map(c=><div key={c} onClick={()=>setLocal(p=>p.map(t=>t.id===tag.id?{...t,color:c}:t))} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${tag.color===c?T.ink:"transparent"}`}}/>)}</div>
                <button onClick={()=>setLocal(p=>p.filter(t=>t.id!==tag.id))} style={{background:"none",border:"none",color:"#DC2626",cursor:"pointer",fontSize:15}}>🗑</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.4px",margin:"0 0 12px",fontFamily:T.ff}}>Create New Tag</p>
          <Input label="Tag name" value={newName} onChange={setNewName} placeholder='"3rd Grade" or "Easter"'/>
          <div style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Icon</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TAG_ICONS.map(ic=><button key={ic} onClick={()=>setNewIcon(newIcon===ic?"":ic)} style={{width:34,height:34,borderRadius:8,border:`2px solid ${newIcon===ic?newColor:T.border}`,background:newIcon===ic?newColor+"18":T.white,fontSize:18,cursor:"pointer"}}>{ic}</button>)}</div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Color</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{TAG_COLORS.map(c=><button key={c} onClick={()=>setNewColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${newColor===c?T.ink:"transparent"}`,cursor:"pointer"}}/>)}</div>
          </div>
          {newName&&<div style={{marginBottom:14}}><TagPill tag={{name:newName,color:newColor,icon:newIcon}}/></div>}
          <Btn onClick={addTag} disabled={!newName.trim()} style={{width:"100%",borderRadius:12}}>+ Create Tag</Btn>
        </div>
      </div>
      <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={()=>{onChange(local);onClose();}} style={{borderRadius:12}}>Save Changes</Btn>
      </div>
    </Modal>
  );
}

function CreateAlbumModal({children,tags,childId,onClose,onCreate}) {
  const [name,setName]=useState(""); const [icon,setIcon]=useState("📁"); const [color,setColor]=useState(T.orange); const [selChild,setSelChild]=useState(childId||""); const [isSmart,setIsSmart]=useState(false); const [smartTags,setSmartTags]=useState([]);
  function toggleST(id){setSmartTags(p=>p.includes(id)?p.filter(t=>t!==id):[...p,id]);}
  function save(){if(!name.trim())return;onCreate({id:`a${Date.now()}`,name:name.trim(),icon,color,child_id:selChild||null,is_smart:isSmart,smart_rules:isSmart?{tags:smartTags}:null,count:0,cover:null});onClose();}
  return (
    <Modal onClose={onClose} title="New Album">
      <div style={{display:"flex",alignItems:"center",gap:14,background:color+"14",borderRadius:14,padding:"14px 18px",marginBottom:22,border:`1.5px solid ${color}30`}}>
        <div style={{width:48,height:48,borderRadius:12,background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{icon}</div>
        <div><div style={{fontWeight:900,fontSize:17,color:T.ink,fontFamily:T.ff}}>{name||"Album name"}</div><div style={{fontSize:12,color:T.muted,fontFamily:T.ff}}>{selChild?children.find(c=>c.id===selChild)?.name:"All children"}{isSmart?" · Smart Album":""}</div></div>
      </div>
      <Input label="Album name" value={name} onChange={setName} placeholder='"Best of 2026"'/>
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>For child</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <button onClick={()=>setSelChild("")} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${!selChild?T.orange:T.border}`,background:!selChild?"#FFF5EE":T.white,color:!selChild?T.orange:T.muted,cursor:"pointer",fontSize:12,fontFamily:T.ff,fontWeight:700}}>All Children</button>
          {children.map(c=><button key={c.id} onClick={()=>setSelChild(c.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,border:`1.5px solid ${selChild===c.id?c.avatar_color:T.border}`,background:selChild===c.id?c.avatar_color+"18":T.white,color:selChild===c.id?c.avatar_color:T.muted,cursor:"pointer",fontSize:12,fontFamily:T.ff,fontWeight:700}}>{c.avatar_emoji} {c.name}</button>)}
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Icon</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{ICONS_LIST.map(ic=><button key={ic} onClick={()=>setIcon(ic)} style={{width:36,height:36,borderRadius:9,border:`2px solid ${icon===ic?color:T.border}`,background:icon===ic?color+"18":T.white,fontSize:18,cursor:"pointer"}}>{ic}</button>)}</div>
      </div>
      <div style={{marginBottom:18}}>
        <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Color</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{TAG_COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:`3px solid ${color===c?T.ink:"transparent"}`,cursor:"pointer"}}/>)}</div>
      </div>
      <div style={{background:T.bg,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:isSmart?14:0}}>
          <div><div style={{fontWeight:700,color:T.ink,fontSize:13,fontFamily:T.ff}}>✨ Smart Album</div><div style={{color:T.muted,fontSize:11,fontFamily:T.ff}}>Auto-fills based on tags</div></div>
          <button onClick={()=>setIsSmart(s=>!s)} style={{width:44,height:24,borderRadius:12,background:isSmart?T.orange:T.border,border:"none",cursor:"pointer",position:"relative",transition:"all .2s"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:isSmart?23:3,transition:"all .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
          </button>
        </div>
        {isSmart&&<div style={{marginTop:4}}>
          <p style={{fontSize:11,color:T.muted,margin:"0 0 10px",fontFamily:T.ff}}>Auto-include artworks with any of these tags:</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{tags.map(tag=><button key={tag.id} onClick={()=>toggleST(tag.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,border:`1.5px solid ${smartTags.includes(tag.id)?tag.color:T.border}`,background:smartTags.includes(tag.id)?tag.color+"18":T.white,color:smartTags.includes(tag.id)?tag.color:T.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.ff}}>{tag.icon} {tag.name}</button>)}</div>
        </div>}
      </div>
      <Btn onClick={save} disabled={!name.trim()} style={{width:"100%",borderRadius:12}}>Create Album</Btn>
    </Modal>
  );
}

function ArtworkTagEditor({artwork,tags,onSave,onClose}) {
  const [sel,setSel]=useState(new Set(artwork.tags?.map(t=>t.id)||[]));
  function toggle(id){setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});}
  return (
    <Modal onClose={onClose} title={`Tags — "${artwork.title}"`}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>
        {tags.map(tag=>(
          <button key={tag.id} onClick={()=>toggle(tag.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:20,border:`1.5px solid ${sel.has(tag.id)?tag.color:T.border}`,background:sel.has(tag.id)?tag.color+"18":T.white,color:sel.has(tag.id)?tag.color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.ff,transition:"all .15s"}}>
            {tag.icon&&<span>{tag.icon}</span>}{tag.name}{sel.has(tag.id)&&<span style={{fontSize:10}}>✓</span>}
          </button>
        ))}
      </div>
      <Btn onClick={()=>{onSave(artwork.id,[...sel]);onClose();}} style={{width:"100%",borderRadius:12}}>Save Tags</Btn>
    </Modal>
  );
}

function AlbumsGrid({albums,children,onOpen,onCreate,onDelete}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(165px, 1fr))",gap:14}}>
      {albums.map(album=>{
        const child=children.find(c=>c.id===album.child_id);
        return (
          <div key={album.id} onClick={()=>onOpen(album)} style={{cursor:"pointer",borderRadius:16,overflow:"hidden",background:T.white,boxShadow:T.shadow,transition:"transform .2s",position:"relative"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{height:115,background:album.color+"22",position:"relative",overflow:"hidden"}}>
              {album.cover?<img src={album.cover} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42}}>{album.icon}</div>}
              {album.is_smart&&<div style={{position:"absolute",top:7,right:7,background:"rgba(255,255,255,0.92)",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,color:T.ink,fontFamily:T.ff}}>✨ Smart</div>}
              <button onClick={e=>{e.stopPropagation();onDelete(album.id);}} style={{position:"absolute",top:7,left:7,width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.88)",border:"none",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .15s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}>🗑</button>
            </div>
            <div style={{padding:"10px 12px"}}>
              <div style={{fontWeight:700,fontSize:13,color:T.ink,fontFamily:T.ff,marginBottom:3}}>{album.name}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:T.muted,fontFamily:T.ff}}>{album.count} artwork{album.count!==1?"s":""}</span>
                {child&&<span style={{fontSize:11,color:child.avatar_color,fontWeight:700,fontFamily:T.ff}}>{child.avatar_emoji} {child.name}</span>}
              </div>
            </div>
            <div style={{height:3,background:album.color}}/>
          </div>
        );
      })}
      <div onClick={onCreate} style={{cursor:"pointer",borderRadius:16,border:`2.5px dashed ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:160,transition:"all .2s",color:T.muted}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=T.orange;e.currentTarget.style.color=T.orange;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}>
        <div style={{fontSize:28,marginBottom:6}}>+</div>
        <div style={{fontSize:12,fontWeight:700,fontFamily:T.ff}}>New Album</div>
      </div>
    </div>
  );
}


// ─── Carousel Modal ───────────────────────────────────────────────────────────
function CarouselModal({artworks, startIndex, onClose, onToggleFavorite}) {
  const [idx,setIdx]=useState(startIndex);
  const art=artworks[idx];
  useEffect(()=>{
    const h=e=>{
      if(e.key==="ArrowLeft") setIdx(i=>Math.max(0,i-1));
      if(e.key==="ArrowRight") setIdx(i=>Math.min(artworks.length-1,i+1));
      if(e.key==="Escape") onClose();
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[artworks.length,onClose]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,7,0,0.94)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:1000,fontFamily:T.ff}}>
      <div style={{position:"absolute",top:16,right:16,display:"flex",gap:10}}>
        <button onClick={()=>onToggleFavorite(art.id)} style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,0.12)",border:"none",cursor:"pointer",fontSize:20}}>
          {art.is_favorite?"❤️":"🤍"}
        </button>
        <button onClick={onClose} style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,0.12)",border:"none",color:"white",fontSize:20,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:16,padding:"0 20px",width:"100%",maxWidth:820}}>
        <button onClick={()=>setIdx(i=>i-1)} disabled={idx===0} style={{width:50,height:50,borderRadius:"50%",border:"none",background:"rgba(255,255,255,0.12)",color:"white",fontSize:26,cursor:idx>0?"pointer":"default",flexShrink:0,opacity:idx===0?0.2:1}}>‹</button>
        <div style={{flex:1,textAlign:"center"}}>
          <img src={art.url} alt={art.title} style={{maxHeight:"62vh",maxWidth:"100%",borderRadius:12,boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}/>
          <div style={{marginTop:20}}>
            <h2 style={{color:"white",margin:"0 0 8px",fontSize:22,fontFamily:T.ff}}>{art.title}</h2>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              {art.tags?.map(tag=><span key={tag.id} style={{background:tag.color,color:"white",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:T.ff}}>{tag.icon} {tag.name}</span>)}
            </div>
          </div>
        </div>
        <button onClick={()=>setIdx(i=>i+1)} disabled={idx===artworks.length-1} style={{width:50,height:50,borderRadius:"50%",border:"none",background:"rgba(255,255,255,0.12)",color:"white",fontSize:26,cursor:idx<artworks.length-1?"pointer":"default",flexShrink:0,opacity:idx===artworks.length-1?0.2:1}}>›</button>
      </div>
      <div style={{display:"flex",gap:6,marginTop:20,overflowX:"auto",maxWidth:"90vw",padding:"0 10px 10px"}}>
        {artworks.map((a,i)=>(
          <img key={a.id} src={a.url} alt={a.title} onClick={()=>setIdx(i)} style={{width:50,height:50,objectFit:"cover",borderRadius:8,cursor:"pointer",opacity:i===idx?1:0.4,border:i===idx?`2.5px solid ${T.orange}`:"2.5px solid transparent",flexShrink:0,transition:"all .2s"}}/>
        ))}
      </div>
    </div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({selectedIds,artworks,onClose}) {
  const selected=artworks.filter(a=>selectedIds.has(a.id));
  const [copied,setCopied]=useState(false);
  const [shareUrl,setShareUrl]=useState("");
  const [generating,setGenerating]=useState(false);

  async function generateLink(){
    setGenerating(true);
    await new Promise(r=>setTimeout(r,700));
    const token=Math.random().toString(36).slice(2,12);
    setShareUrl(`${window.location.origin}/share/${token}`);
    setGenerating(false);
  }
  function copy(){
    navigator.clipboard.writeText(shareUrl||window.location.href);
    setCopied(true);
    setTimeout(()=>setCopied(false),2500);
  }
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(45,27,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:20,padding:32,width:"100%",maxWidth:480,boxShadow:T.shadowMd,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{margin:0,fontSize:20,color:T.ink,fontFamily:T.ff,fontWeight:900}}>Share {selected.length} Drawing{selected.length!==1?"s":""}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.muted}}>✕</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap"}}>
          {selected.map(a=>(
            <div key={a.id} style={{position:"relative"}}>
              <img src={a.url} style={{width:70,height:70,objectFit:"cover",borderRadius:10}} alt={a.title}/>
              <div style={{position:"absolute",bottom:4,left:4,right:4,background:"rgba(0,0,0,0.55)",borderRadius:4,padding:"2px 4px"}}>
                <span style={{color:"white",fontSize:9,fontFamily:T.ff}}>{a.title}</span>
              </div>
            </div>
          ))}
        </div>
        {!shareUrl?(
          <button onClick={generateLink} disabled={generating} style={{width:"100%",padding:"13px",background:generating?"#F0E0D0":T.orange,color:"white",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:generating?"default":"pointer",fontFamily:T.ff,marginBottom:14}}>
            {generating?"Creating link…":"✨ Create Share Link"}
          </button>
        ):(
          <div style={{background:T.bg,borderRadius:12,padding:"12px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
            <input readOnly value={shareUrl} style={{flex:1,border:"none",background:"none",fontSize:12,color:T.ink,fontFamily:T.ff,outline:"none"}}/>
            <button onClick={copy} style={{background:copied?"#2A7A2A":T.orange,color:"white",border:"none",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:T.ff,whiteSpace:"nowrap"}}>
              {copied?"✓ Copied":"Copy"}
            </button>
          </div>
        )}
        <p style={{color:T.muted,fontSize:12,margin:"0 0 14px",textAlign:"center",fontFamily:T.ff}}>Link expires in 30 days · View-only · No account needed</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{icon:"📧",label:"Email"},{icon:"💬",label:"Text Message"}].map(opt=>(
            <button key={opt.label} style={{padding:"13px",border:`1.5px solid ${T.border}`,borderRadius:12,background:T.white,cursor:"pointer",fontFamily:T.ff,fontSize:13,fontWeight:600,color:T.ink,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span style={{fontSize:18}}>{opt.icon}</span>{opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ArtworkGrid with carousel + select + share ───────────────────────────────
function ArtworkGrid({artworks,tags,onTagEdit,isFree,onUpgrade}) {
  const [active,setActive]=useState([]);
  const [selected,setSelected]=useState(new Set());
  const [carousel,setCarousel]=useState(null);
  const [showShare,setShowShare]=useState(false);

  const filtered=active.length===0?artworks:artworks.filter(a=>active.every(slug=>a.tags?.some(t=>t.slug===slug)));
  const relevant=tags.filter(tag=>artworks.some(a=>a.tags?.some(t=>t.id===tag.id)));

  function toggleSelect(id){
    setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):(n.size<5&&n.add(id));return n;});
  }

  return (
    <div>
      {/* Tag filters */}
      {relevant.length>0&&(
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:18}}>
          {relevant.map(tag=>(
            <button key={tag.id} onClick={()=>setActive(p=>p.includes(tag.slug)?p.filter(s=>s!==tag.slug):[...p,tag.slug])} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,border:`1.5px solid ${active.includes(tag.slug)?tag.color:T.border}`,background:active.includes(tag.slug)?tag.color+"18":T.white,color:active.includes(tag.slug)?tag.color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.ff,transition:"all .15s"}}>
              {tag.icon} {tag.name}
            </button>
          ))}
          {active.length>0&&<button onClick={()=>setActive([])} style={{padding:"5px 12px",borderRadius:20,border:"none",background:"none",color:T.muted,fontSize:12,cursor:"pointer",fontFamily:T.ff}}>Clear ✕</button>}
        </div>
      )}

      {/* Select/Share toolbar */}
      {selected.size>0&&(
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,padding:"12px 16px",background:"#FFF5EE",borderRadius:12,border:`1.5px solid ${T.border}`}}>
          <span style={{fontFamily:T.ff,fontSize:13,color:T.muted,flex:1}}>{selected.size} of 5 selected</span>
          <button onClick={()=>{ if(isFree){onUpgrade("share");return;} setShowShare(true); }} style={{background:T.orange,color:"white",border:"none",borderRadius:20,padding:"8px 18px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.ff}}>Share Selected</button>
          <button onClick={()=>setSelected(new Set())} style={{background:"none",border:`1.5px solid ${T.border}`,borderRadius:20,padding:"7px 14px",color:T.muted,fontSize:12,cursor:"pointer",fontFamily:T.ff}}>Clear</button>
        </div>
      )}

      {/* Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(148px, 1fr))",gap:13}}>
        {filtered.map((art,i)=>(
          <div key={art.id} style={{borderRadius:16,overflow:"hidden",background:T.white,boxShadow:selected.has(art.id)?`0 0 0 3px ${T.orange}, ${T.shadow}`:T.shadow,cursor:"pointer",transition:"box-shadow .15s"}}>
            <div style={{aspectRatio:"4/5",position:"relative",overflow:"hidden"}} onClick={()=>setCarousel(i)}>
              <img src={art.url} alt={art.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 55%, rgba(20,12,8,0.75))",pointerEvents:"none"}}/>
              <div style={{position:"absolute",bottom:8,left:8,right:8}}>
                <div style={{color:"white",fontSize:11,fontWeight:700,fontFamily:T.ff,marginBottom:4}}>{art.title}</div>
                <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                  {art.tags?.slice(0,2).map(tag=><span key={tag.id} style={{background:tag.color,color:"white",borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:700,fontFamily:T.ff}}>{tag.icon} {tag.name}</span>)}
                </div>
              </div>
              {art.is_favorite&&<div style={{position:"absolute",top:8,left:8,fontSize:14}}>❤️</div>}
              {/* Select button */}
              <button onClick={e=>{e.stopPropagation();toggleSelect(art.id);}} style={{position:"absolute",top:8,right:8,width:26,height:26,borderRadius:"50%",background:selected.has(art.id)?T.orange:"rgba(255,255,255,0.88)",border:selected.has(art.id)?"none":"1.5px solid rgba(255,255,255,0.5)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white",fontWeight:700,boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}>
                {selected.has(art.id)?"✓":""}
              </button>
              {/* Tag button — more tap-friendly */}
              <button onClick={e=>{e.stopPropagation();onTagEdit(art);}} style={{position:"absolute",bottom:8,right:8,background:"rgba(255,255,255,0.92)",border:"none",borderRadius:20,padding:"5px 10px",fontSize:12,cursor:"pointer",fontFamily:T.ff,fontWeight:700,display:"flex",alignItems:"center",gap:4,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                <span>🏷</span><span style={{fontSize:10}}>Tag</span>
              </button>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 20px",color:T.muted,fontFamily:T.ff}}><div style={{fontSize:44,marginBottom:12}}>🔍</div><p>No artworks match these tags.</p></div>}
      </div>

      {carousel!==null&&(
        <CarouselModal
          artworks={filtered}
          startIndex={carousel}
          onClose={()=>setCarousel(null)}
          onToggleFavorite={()=>{}}
        />
      )}
      {showShare&&<ShareModal selectedIds={selected} artworks={artworks} onClose={()=>setShowShare(false)}/>}
    </div>
  );
}


// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUpload, children }) {
  const [files, setFiles]         = useState([]);
  const [previews, setPreviews]   = useState([]);
  const [title, setTitle]         = useState("");
  const [childId, setChildId]     = useState(children[0]?.id || "");
  const [grade, setGrade]         = useState("1st");
  const [artDate, setArtDate]     = useState(new Date().toISOString().split("T")[0]);
  const [dragging, setDragging]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const inputRef = useRef(null);

  function addFiles(incoming) {
    const imgs = Array.from(incoming).filter(f => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setFiles(prev => [...prev, ...imgs]);
    imgs.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(f);
    });
    // Auto-fill title from filename if empty
    if (!title && imgs[0]) {
      const name = imgs[0].name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }

  async function save() {
    if (!files.length) return;
    setSaving(true);
    try {
      // In production this calls supabase uploadArtwork()
      // For now create a local preview URL and add to state
      await new Promise(r => setTimeout(r, 800)); // simulate upload
      const newArtworks = files.map((file, i) => ({
        id:           String(Date.now() + i),
        child_id:     childId,
        title:        title || "Untitled",
        grade,
        school_year:  "2025-2026",
        artwork_date: artDate,
        storage_path: `demo/${Date.now()}`,
        url:          previews[i],
        tags:         [],
        is_favorite:  false,
      }));
      onUpload(newArtworks);
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(45,27,0,0.55)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,padding:0}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.white,borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(45,27,0,0.18)"}}>
        {/* Handle bar */}
        <div style={{width:40,height:4,borderRadius:2,background:T.border,margin:"0 auto 20px"}}/>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:20,color:T.ink,fontFamily:T.ff,fontWeight:900}}>Add a Drawing</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.muted}}>✕</button>
        </div>

        {/* Drop zone / preview */}
        <div
          onDragOver={e=>{e.preventDefault();setDragging(true);}}
          onDragLeave={()=>setDragging(false)}
          onDrop={e=>{e.preventDefault();setDragging(false);addFiles(e.dataTransfer.files);}}
          onClick={()=>inputRef.current?.click()}
          style={{border:`2.5px dashed ${dragging?T.orange:T.border}`,borderRadius:14,padding:previews.length?"12px":"32px 20px",textAlign:"center",background:dragging?"#FFF5EE":"#FFFDF9",cursor:"pointer",marginBottom:18,transition:"all .2s"}}>
          {previews.length > 0 ? (
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              {previews.map((p,i)=>(
                <div key={i} style={{position:"relative"}}>
                  <img src={p} style={{width:80,height:80,objectFit:"cover",borderRadius:8}} alt=""/>
                  <button onClick={e=>{e.stopPropagation();setFiles(f=>f.filter((_,j)=>j!==i));setPreviews(p=>p.filter((_,j)=>j!==i));}} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",background:"#DC2626",color:"white",border:"none",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
                </div>
              ))}
              <div onClick={()=>inputRef.current?.click()} style={{width:80,height:80,border:`2px dashed ${T.border}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:T.muted,cursor:"pointer"}}>+</div>
            </div>
          ) : (
            <>
              <div style={{fontSize:40,marginBottom:10}}>📸</div>
              <div style={{fontFamily:T.ff,fontSize:15,color:T.muted,marginBottom:4}}>Tap to take a photo or browse</div>
              <div style={{fontFamily:T.ff,fontSize:12,color:T.border}}>JPG, PNG, HEIC supported</div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            style={{display:"none"}}
            onChange={e=>addFiles(e.target.files)}
          />
        </div>

        {/* Form fields */}
        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:20}}>
          <div>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:5,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Drawing title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Sunshine Dragon" style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:15,fontFamily:T.ff,background:"#FFFDF9",color:T.ink,outline:"none",boxSizing:"border-box"}}/>
          </div>

          {children.length > 1 && (
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:5,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Child</label>
              <select value={childId} onChange={e=>setChildId(e.target.value)} style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:15,fontFamily:T.ff,background:"#FFFDF9",color:T.ink,outline:"none",boxSizing:"border-box"}}>
                {children.map(c=><option key={c.id} value={c.id}>{c.avatar_emoji} {c.name}</option>)}
              </select>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:5,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Grade</label>
              <select value={grade} onChange={e=>setGrade(e.target.value)} style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,fontFamily:T.ff,background:"#FFFDF9",color:T.ink,outline:"none",boxSizing:"border-box"}}>
                {["Pre-K","Kindergarten","1st","2nd","3rd","4th","5th","6th"].map(g=><option key={g} value={g}>{g} Grade</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:T.muted,marginBottom:5,fontFamily:T.ff,textTransform:"uppercase",letterSpacing:"0.4px"}}>Date</label>
              <input type="date" value={artDate} onChange={e=>setArtDate(e.target.value)} style={{width:"100%",padding:"11px 13px",border:`1.5px solid ${T.border}`,borderRadius:10,fontSize:14,fontFamily:T.ff,background:"#FFFDF9",color:T.ink,outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>
        </div>

        <button onClick={save} disabled={!files.length || saving} style={{width:"100%",padding:"15px",background:files.length&&!saving?T.orange:"#F0E0D0",color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:files.length&&!saving?"pointer":"default",fontFamily:T.ff,boxShadow:files.length?"0 4px 16px rgba(232,100,10,0.3)":"none",transition:"all .2s"}}>
          {saving ? "Saving…" : files.length ? `Save ${files.length} Drawing${files.length!==1?"s":""}` : "Choose a photo first"}
        </button>
      </div>
    </div>
  );
}


// ─── Plan limits ─────────────────────────────────────────────────────────────
const FREE_LIMITS = {
  maxChildren:        1,
  maxDrawingsPerMonth: 5,
  canShare:           false,
  canEmailVault:      false,
  canCloudSync:       false,
};

function getPlanInfo(user) {
  // In production: check user.app_metadata.plan or a profiles table field
  // For now everyone starts on free — set user.plan = "pro" to unlock
  return user?.plan === "pro" ? "pro" : "free";
}

function getDrawingsThisMonth(artworks) {
  const now = new Date();
  return artworks.filter(a => {
    const d = new Date(a.artwork_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
function UpgradeModal({ reason, onClose, onUpgrade }) {
  const reasons = {
    children:  { icon: "👨‍👩‍👧‍👦", title: "Add more children",    body: "The free plan supports 1 child. Upgrade to Family Pro for unlimited children." },
    drawings:  { icon: "🖼️",        title: "Drawing limit reached", body: "You've used your 5 free drawings this month. Upgrade to Family Pro for unlimited drawings." },
    share:     { icon: "🔗",        title: "Share links",           body: "Sharing drawings is a Family Pro feature. Upgrade to send links to grandparents and family." },
    email:     { icon: "📧",        title: "Email-to-vault",        body: "Forwarding school emails to your vault is a Family Pro feature." },
    cloud:     { icon: "☁️",        title: "Cloud storage sync",    body: "Syncing to Google Drive, OneDrive, and Dropbox is a Family Pro feature." },
  };
  const r = reasons[reason] || reasons.drawings;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(45,27,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#2D1B00",borderRadius:24,padding:40,width:"100%",maxWidth:420,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
        <div style={{fontSize:52,marginBottom:16}}>{r.icon}</div>
        <h2 style={{fontFamily:T.ff,fontSize:24,fontWeight:900,color:"white",margin:"0 0 12px"}}>{r.title}</h2>
        <p style={{fontFamily:T.ff,fontSize:15,color:"rgba(255,255,255,0.7)",lineHeight:1.7,margin:"0 0 28px"}}>{r.body}</p>
        <div style={{background:"rgba(255,255,255,0.06)",borderRadius:14,padding:"16px 20px",marginBottom:28}}>
          <div style={{fontFamily:T.ff,fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:8}}>Family Pro includes:</div>
          {["Unlimited children & drawings","Share links with family","Email-to-vault","Google Drive, OneDrive & Dropbox","Nightly backups"].map(f=>(
            <div key={f} style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
              <span style={{color:T.orange,fontSize:13}}>✓</span>
              <span style={{fontFamily:T.ff,fontSize:13,color:"rgba(255,255,255,0.75)"}}>{f}</span>
            </div>
          ))}
        </div>
        <button onClick={onUpgrade} style={{width:"100%",padding:"15px",background:T.orange,color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:T.ff,boxShadow:"0 4px 16px rgba(232,100,10,0.4)",marginBottom:12}}>
          Upgrade to Pro — $4.99/mo
        </button>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer",fontFamily:T.ff}}>
          Maybe later
        </button>
      </div>
    </div>
  );
}


// ─── Gallery (main app screen) ────────────────────────────────────────────────
function Gallery({user, onLogout}) {
  const [children,setChildren]=useState(CHILDREN);
  const [tags,setTags]=useState(TAGS);
  const [albums,setAlbums]=useState(ALBUMS);
  const [artworks,setArtworks]=useState(ALL_ARTWORKS);
  const [activeChild,setActiveChild]=useState("all");
  const [activeTab,setActiveTab]=useState("gallery");
  const [showAddChild,setShowAddChild]=useState(false);
  const [showTagMgr,setShowTagMgr]=useState(false);
  const [showNewAlbum,setShowNewAlbum]=useState(false);
  const [tagEditArt,setTagEditArt]=useState(null);
  const [openAlbum,setOpenAlbum]=useState(null);
  const [upgradeReason,setUpgradeReason]=useState(null);
  const [showUpload,setShowUpload]=useState(false);

  const plan = getPlanInfo(user);
  const isFree = plan === "free";
  const drawingsThisMonth = getDrawingsThisMonth(artworks);

  const visibleArtworks=activeChild==="all"?artworks:artworks.filter(a=>a.child_id===activeChild);
  const visibleAlbums=activeChild==="all"?albums:albums.filter(a=>a.child_id===activeChild||!a.child_id);
  const activeChildObj=children.find(c=>c.id===activeChild);

  function handleTagSave(artworkId,tagIds){setArtworks(p=>p.map(a=>a.id===artworkId?{...a,tags:tags.filter(t=>tagIds.includes(t.id))}:a));}

  function tryAddChild() {
    if (isFree && children.length >= FREE_LIMITS.maxChildren) {
      setUpgradeReason("children"); return;
    }
    setShowAddChild(true);
  }

  function tryShare() {
    if (isFree) { setUpgradeReason("share"); return; }
    // share logic handled inside ArtworkGrid
  }

  function handleAlbumOpen(album){
    let arts=[];
    if(album.is_smart&&album.smart_rules?.tags){
      const slugs=album.smart_rules.tags;
      arts=artworks.filter(a=>(album.child_id?a.child_id===album.child_id:true)&&a.tags?.some(t=>slugs.includes(t.slug)));
    } else {
      arts=artworks.filter(a=>album.child_id?a.child_id===album.child_id:true).slice(0,album.count||6);
    }
    setOpenAlbum({...album,artworks:arts});
  }

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(
    () => localStorage.getItem("pwa-install-dismissed") === "true"
  );

  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone;
    if (isIOS && !isStandalone && !installDismissed) setShowIOSBanner(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismissInstall() {
    localStorage.setItem("pwa-install-dismissed", "true");
    setInstallDismissed(true);
    setInstallPrompt(null);
    setShowIOSBanner(false);
  }

  async function doInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    dismissInstall();
  }

  return (
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:T.ff}}>
      {/* Header */}
      <div style={{background:T.white,boxShadow:T.shadow,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
          <svg width="28" height="28" viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" fill={T.orange}/><rect x="18" y="14" width="36" height="44" rx="3" fill="white" opacity="0.92"/><g transform="translate(20,15) rotate(18)"><rect x="0" y="0" width="8" height="36" rx="2" fill="#2D1B00"/><polygon points="0,36 8,36 4,46" fill="#F4C88C"/></g></svg>
          <span style={{fontSize:17,fontWeight:900,color:T.ink,letterSpacing:"-0.5px"}}>Forever Drawings</span>
          <div style={{flex:1}}/>
          {isFree&&(
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#FFF0E5",borderRadius:20,padding:"6px 14px",border:`1px solid ${T.border}`}}>
              <span style={{fontFamily:T.ff,fontSize:11,color:T.orange,fontWeight:700}}>{drawingsThisMonth}/5 drawings this month</span>
              <button onClick={()=>setUpgradeReason("drawings")} style={{background:T.orange,color:"white",border:"none",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.ff}}>Upgrade</button>
            </div>
          )}
          <button onClick={()=>setShowTagMgr(true)} style={{background:"none",border:`1.5px solid ${T.border}`,borderRadius:20,padding:"7px 14px",color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.ff}}>🏷 Tags</button>
          <button onClick={onLogout} style={{background:"none",border:`1.5px solid ${T.border}`,borderRadius:20,padding:"7px 14px",color:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.ff}}>Sign Out</button>
        </div>
        {/* Children tabs */}
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px 14px",display:"flex",gap:8,alignItems:"center",overflowX:"auto"}}>
          <button onClick={()=>setActiveChild("all")} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:20,border:`1.5px solid ${activeChild==="all"?T.orange:T.border}`,background:activeChild==="all"?"#FFF5EE":T.white,color:activeChild==="all"?T.orange:T.muted,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.ff,whiteSpace:"nowrap",flexShrink:0}}>
            👨‍👩‍👧‍👦 All
            <span style={{background:T.orange+"22",color:T.orange,borderRadius:10,padding:"1px 7px",fontSize:11}}>{artworks.length}</span>
          </button>
          {children.map(child=>{
            const count=artworks.filter(a=>a.child_id===child.id).length;
            const active=activeChild===child.id;
            return (
              <button key={child.id} onClick={()=>setActiveChild(child.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 16px 7px 10px",borderRadius:20,border:`1.5px solid ${active?child.avatar_color:T.border}`,background:active?child.avatar_color+"14":T.white,color:active?child.avatar_color:T.muted,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:T.ff,whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>
                <ChildAvatar child={child} size={26} active={active}/>
                {child.name}
                <span style={{background:active?child.avatar_color+"22":T.border,color:active?child.avatar_color:T.muted,borderRadius:10,padding:"1px 7px",fontSize:11}}>{count}</span>
              </button>
            );
          })}
          <button onClick={tryAddChild} style={{width:36,height:36,borderRadius:"50%",border:`2px dashed ${T.border}`,background:"none",cursor:"pointer",fontSize:18,color:T.muted,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}} title={isFree?"Free plan: 1 child only":"Add child"}>+</button>
        </div>
        {/* Tabs */}
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px",display:"flex",borderTop:`1px solid ${T.border}`}}>
          {[["gallery","🖼️ Gallery"],["albums","📁 Albums"]].map(([tab,label])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"11px 20px",border:"none",background:"none",color:activeTab===tab?T.orange:T.muted,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.ff,borderBottom:`2.5px solid ${activeTab===tab?T.orange:"transparent"}`,transition:"all .15s"}}>{label}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{maxWidth:960,margin:"0 auto",padding:20}}>
        {activeChildObj&&(
          <div style={{display:"flex",alignItems:"center",gap:16,background:T.white,borderRadius:16,padding:"18px 22px",marginBottom:22,boxShadow:T.shadow,borderLeft:`5px solid ${activeChildObj.avatar_color}`}}>
            <ChildAvatar child={activeChildObj} size={52}/>
            <div style={{flex:1}}>
              <div style={{fontSize:22,fontWeight:900,color:T.ink,fontFamily:T.ff}}>{activeChildObj.name}</div>
              {activeChildObj.school_name&&<div style={{fontSize:13,color:T.muted,fontFamily:T.ff}}>{activeChildObj.school_name}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:26,fontWeight:900,color:activeChildObj.avatar_color,fontFamily:T.ff}}>{visibleArtworks.length}</div>
              <div style={{fontSize:11,color:T.muted,fontFamily:T.ff}}>drawings</div>
            </div>
          </div>
        )}
        {/* Upload button + limit notice */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button
            onClick={()=>{ if(isFree && drawingsThisMonth >= FREE_LIMITS.maxDrawingsPerMonth){ setUpgradeReason("drawings"); return; } setShowUpload(true); }}
            style={{background:T.orange,color:"white",border:"none",borderRadius:30,padding:"11px 22px",fontFamily:T.ff,fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(232,100,10,0.28)"}}>
            + Add Drawing
          </button>
          {isFree&&drawingsThisMonth>=FREE_LIMITS.maxDrawingsPerMonth&&(
            <span style={{fontFamily:T.ff,fontSize:12,color:T.orange}}>Monthly limit reached · <button onClick={()=>setUpgradeReason("drawings")} style={{background:"none",border:"none",color:T.orange,cursor:"pointer",fontWeight:700,fontFamily:T.ff,fontSize:12,textDecoration:"underline"}}>Upgrade to Pro</button></span>
          )}
          {isFree&&drawingsThisMonth<FREE_LIMITS.maxDrawingsPerMonth&&(
            <span style={{fontFamily:T.ff,fontSize:12,color:T.muted}}>{FREE_LIMITS.maxDrawingsPerMonth - drawingsThisMonth} drawing{FREE_LIMITS.maxDrawingsPerMonth - drawingsThisMonth!==1?"s":""} left this month · <button onClick={()=>setUpgradeReason("drawings")} style={{background:"none",border:"none",color:T.orange,cursor:"pointer",fontFamily:T.ff,fontSize:12,textDecoration:"underline"}}>Upgrade for unlimited</button></span>
          )}
        </div>

        {activeTab==="gallery"&&<ArtworkGrid artworks={visibleArtworks} tags={tags} onTagEdit={setTagEditArt} isFree={isFree} onUpgrade={setUpgradeReason}/>}
        {activeTab==="albums"&&<AlbumsGrid albums={visibleAlbums} children={children} onOpen={handleAlbumOpen} onCreate={()=>setShowNewAlbum(true)} onDelete={id=>setAlbums(p=>p.filter(a=>a.id!==id))}/>}
      </div>

      {showAddChild&&<AddChildModal onClose={()=>setShowAddChild(false)} onAdd={c=>{setChildren(p=>[...p,c]);setShowAddChild(false);}}/>}
      {showUpload&&(
        <UploadModal
          onClose={()=>setShowUpload(false)}
          children={children}
          onUpload={newArtworks=>{
            setArtworks(prev=>[...newArtworks,...prev]);
            setShowUpload(false);
          }}
        />
      )}
      {upgradeReason&&<UpgradeModal reason={upgradeReason} onClose={()=>setUpgradeReason(null)} onUpgrade={()=>setUpgradeReason(null)}/>}

      {/* Android/Desktop install prompt */}
      {installPrompt && !installDismissed && (
        <div style={{position:"fixed",bottom:80,left:16,right:16,background:T.white,borderRadius:16,padding:16,boxShadow:"0 8px 32px rgba(45,27,0,0.18)",display:"flex",gap:14,alignItems:"center",zIndex:900,border:`1.5px solid ${T.border}`}}>
          <svg width="40" height="40" viewBox="0 0 72 72" style={{flexShrink:0}}>
            <circle cx="36" cy="36" r="36" fill={T.orange}/>
            <rect x="18" y="14" width="36" height="44" rx="3" fill="white" opacity="0.92"/>
            <g transform="translate(20,15) rotate(18)">
              <rect x="0" y="0" width="8" height="36" rx="2" fill="#2D1B00"/>
              <polygon points="0,36 8,36 4,46" fill="#F4C88C"/>
            </g>
          </svg>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,color:T.ink,fontSize:14,fontFamily:T.ff}}>Add to Home Screen</div>
            <div style={{color:T.muted,fontSize:12,marginTop:2,fontFamily:T.ff}}>Upload drawings straight from your camera roll</div>
          </div>
          <button onClick={dismissInstall} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20,padding:4,flexShrink:0}}>✕</button>
          <button onClick={doInstall} style={{background:T.orange,color:"white",border:"none",borderRadius:20,padding:"9px 16px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.ff,whiteSpace:"nowrap",flexShrink:0}}>Install</button>
        </div>
      )}

      {/* Mobile floating upload button */}
      <style>{`@media(min-width:769px){.mobile-fab{display:none!important}}`}</style>
      <button
        className="mobile-fab"
        onClick={()=>{ if(isFree && drawingsThisMonth >= FREE_LIMITS.maxDrawingsPerMonth){ setUpgradeReason("drawings"); return; } setShowUpload(true); }}
        style={{position:"fixed",bottom:24,right:24,width:64,height:64,borderRadius:"50%",background:T.orange,color:"white",border:"none",fontSize:28,cursor:"pointer",boxShadow:"0 6px 20px rgba(232,100,10,0.45)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
        +
      </button>

      {/* iOS install instructions */}
      {showIOSBanner && !installDismissed && (
        <div style={{position:"fixed",bottom:80,left:16,right:16,background:T.white,borderRadius:16,padding:18,boxShadow:"0 8px 32px rgba(45,27,0,0.18)",zIndex:900,border:`1.5px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <svg width="32" height="32" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="36" fill={T.orange}/>
                <rect x="18" y="14" width="36" height="44" rx="3" fill="white" opacity="0.92"/>
                <g transform="translate(20,15) rotate(18)"><rect x="0" y="0" width="8" height="36" rx="2" fill="#2D1B00"/><polygon points="0,36 8,36 4,46" fill="#F4C88C"/></g>
              </svg>
              <div>
                <div style={{fontWeight:700,color:T.ink,fontSize:14,fontFamily:T.ff}}>Install Forever Drawings</div>
                <div style={{color:T.muted,fontSize:12,fontFamily:T.ff}}>Add to your iPhone home screen</div>
              </div>
            </div>
            <button onClick={dismissInstall} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20}}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{icon:"⬆️",text:'Tap the Share button at the bottom of Safari'},{icon:"➕",text:'Tap "Add to Home Screen"'},{icon:"✓",text:'Tap "Add" — the app appears on your home screen'}].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"#FFF5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{s.icon}</div>
                <span style={{fontSize:13,color:T.ink,fontFamily:T.ff}}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {showTagMgr&&<TagManagerModal tags={tags} onClose={()=>setShowTagMgr(false)} onChange={setTags}/>}
      {showNewAlbum&&<CreateAlbumModal children={children} tags={tags} childId={activeChild!=="all"?activeChild:""} onClose={()=>setShowNewAlbum(false)} onCreate={a=>{setAlbums(p=>[...p,a]);setShowNewAlbum(false);}}/>}
      {tagEditArt&&<ArtworkTagEditor artwork={tagEditArt} tags={tags} onSave={handleTagSave} onClose={()=>setTagEditArt(null)}/>}

      {openAlbum&&(
        <div style={{position:"fixed",inset:0,background:T.bg,zIndex:500,overflowY:"auto"}}>
          <div style={{maxWidth:960,margin:"0 auto",padding:20}}>
            <button onClick={()=>setOpenAlbum(null)} style={{background:"none",border:"none",color:T.orange,cursor:"pointer",fontSize:15,fontFamily:T.ff,fontWeight:700,marginBottom:20}}>← Back to Albums</button>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:26}}>
              <div style={{width:56,height:56,borderRadius:14,background:openAlbum.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{openAlbum.icon}</div>
              <div>
                <div style={{fontSize:24,fontWeight:900,color:T.ink,fontFamily:T.ff}}>{openAlbum.name}</div>
                <div style={{fontSize:13,color:T.muted,fontFamily:T.ff}}>{openAlbum.artworks?.length||0} drawings{openAlbum.is_smart?" · Smart Album":""}</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(148px, 1fr))",gap:13}}>
              {(openAlbum.artworks||[]).map((art,i)=>(
                <div key={art.id} style={{borderRadius:16,overflow:"hidden",boxShadow:T.shadow,aspectRatio:"4/5",position:"relative",cursor:"pointer"}}>
                  <img src={art.url} alt={art.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(20,12,8,0.75))",padding:"20px 10px 10px"}}>
                    <div style={{color:"white",fontSize:11,fontWeight:700,fontFamily:T.ff}}>{art.title}</div>
                  </div>
                </div>
              ))}
              {openAlbum.artworks?.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 20px",color:T.muted,fontFamily:T.ff}}><div style={{fontSize:44,marginBottom:12}}>📂</div><p>No drawings match this album's rules yet.</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root App with routing ────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [user,   setUser]   = useState(null);

  function handleLogin(loggedInUser) { setUser(loggedInUser); setScreen("app"); }
  function handleLogout() { setUser(null); setScreen("home"); }

  if (screen === "home") return <HomePage onLogin={() => setScreen("auth")} />;
  if (screen === "auth") return <AuthScreen onLogin={handleLogin} onBack={() => setScreen("home")} />;
  return <Gallery user={user} onLogout={handleLogout} />;
}
