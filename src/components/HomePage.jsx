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
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(254,252,247,0.95)" : "transparent",
      borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      transition: "all 0.3s", padding: "0 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="36" height="36" viewBox="0 0 72 72">
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
          <span style={{ fontFamily: S.ffHand, fontSize: 22, fontWeight: 700, color: C.ink }}>Forever Drawings</span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "How it works", "Pricing"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{ fontFamily: S.ff, fontSize: 15, color: C.muted, textDecoration: "none" }}>{l}</a>
          ))}
          <button onClick={onLogin} style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: 30, padding: "8px 20px", fontFamily: S.ff, fontSize: 14, color: C.ink, cursor: "pointer" }}>Sign in</button>
          <button onClick={onLogin} style={{ background: C.orange, border: "none", borderRadius: 30, padding: "9px 22px", fontFamily: S.ff, fontSize: 14, fontWeight: 600, color: "white", cursor: "pointer", boxShadow: "0 4px 14px rgba(232,100,10,0.3)" }}>
            Start free →
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onLogin }) {
  return (
    <section style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", paddingTop: 68, overflow: "hidden", position: "relative" }}>
      {/* Ruled lines background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 80 + i * 48, height: 1, background: C.border, opacity: 0.4 }} />
        ))}
        <div style={{ position: "absolute", left: 120, top: 0, bottom: 0, width: 1.5, background: "#F4AAAA", opacity: 0.5 }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 1 }}>
        {/* Left — copy */}
        <div>
          <div style={{ display: "inline-block", background: C.orangeL, border: `1px solid ${C.border}`, borderRadius: 30, padding: "6px 16px", marginBottom: 28 }}>
            <span style={{ fontFamily: S.ffHand, fontSize: 15, color: C.orange }}>✏️ For parents who can't throw away a single drawing</span>
          </div>

          <h1 style={{ fontFamily: S.ffHand, fontSize: 68, fontWeight: 700, color: C.ink, lineHeight: 1.05, margin: "0 0 12px", letterSpacing: "-1px" }}>
            Preserve every<br/>
            <span style={{ color: C.orange }}>drawing,</span><br/>
            forever.
          </h1>

          {/* Crayon underline */}
          <svg width="320" height="16" viewBox="0 0 320 16" style={{ display: "block", marginBottom: 28 }}>
            <path d="M0,10 Q60,4 120,10 Q180,16 240,8 Q280,4 320,10" fill="none" stroke={C.orange} strokeWidth="4" strokeLinecap="round"/>
          </svg>

          <p style={{ fontFamily: S.ff, fontSize: 18, color: C.muted, lineHeight: 1.8, margin: "0 0 40px", maxWidth: 440 }}>
            Your child brings home a drawing every week. You love it, you can't throw it away, but you can't keep all of them either. Forever Drawings is your family's art vault — organized, beautiful, and backed up forever.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={onLogin} style={{ background: C.orange, border: "none", borderRadius: 30, padding: "16px 36px", fontFamily: S.ff, fontSize: 17, fontWeight: 600, color: "white", cursor: "pointer", boxShadow: "0 6px 20px rgba(232,100,10,0.35)" }}>
              Start your vault — it's free →
            </button>
            <button onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })} style={{ background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 30, padding: "16px 28px", fontFamily: S.ff, fontSize: 16, color: C.muted, cursor: "pointer" }}>
              See how it works
            </button>
          </div>

          <p style={{ fontFamily: S.ff, fontSize: 13, color: C.muted, marginTop: 16, fontStyle: "italic" }}>No credit card required · Free forever for families</p>
        </div>

        {/* Right — artwork mosaic */}
        <div style={{ position: "relative", height: 580 }}>
          {[
            { src:"https://picsum.photos/seed/draw1/280/340", top:0,   left:60,  rotate:-4, label:"Sunshine Dragon", child:"Emma, 1st Grade" },
            { src:"https://picsum.photos/seed/draw2/240/300", top:60,  left:240, rotate:3,  label:"My Family",      child:"Emma, 1st Grade" },
            { src:"https://picsum.photos/seed/draw3/220/280", top:220, left:20,  rotate:-2, label:"Space Rocket",   child:"Liam, K" },
            { src:"https://picsum.photos/seed/draw4/200/260", top:280, left:200, rotate:5,  label:"Spring Flowers", child:"Sofia, Pre-K" },
          ].map((card, i) => (
            <div key={i} style={{
              position: "absolute", top: card.top, left: card.left,
              transform: `rotate(${card.rotate}deg)`,
              background: C.white, borderRadius: 8, padding: 10,
              boxShadow: "0 8px 32px rgba(45,27,0,0.14)",
              animation: `float${i} 4s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}>
              <img src={card.src} alt={card.label} style={{ width: card.src.includes("280") ? 180 : 150, height: card.src.includes("340") ? 220 : 180, objectFit: "cover", borderRadius: 4, display: "block" }} />
              <div style={{ paddingTop: 8 }}>
                <div style={{ fontFamily: S.ffHand, fontSize: 15, fontWeight: 700, color: C.ink }}>{card.label}</div>
                <div style={{ fontFamily: S.ff, fontSize: 11, color: C.muted }}>{card.child}</div>
              </div>
            </div>
          ))}
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
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, position: "relative" }}>
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
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
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
      name: "Family",
      price: "Free",
      sub: "Forever, no credit card",
      color: C.orange,
      features: ["Unlimited children", "Unlimited drawings", "Albums & smart albums", "Tags & filtering", "Share links", "Email-to-vault", "PWA — install on phone", "1 cloud storage connection"],
      cta: "Start free →",
      featured: false,
    },
    {
      name: "Family Pro",
      price: "$4.99",
      sub: "per month",
      color: C.ink,
      features: ["Everything in Free", "All 3 cloud connections", "Google Drive + OneDrive + Dropbox", "Nightly automatic backups", "30-day backup retention", "Priority support", "Early access to new features"],
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
            <p style={{ fontFamily: S.ff, fontSize: 18, color: C.muted }}>Start free. Upgrade when you want more cloud connections and backups.</p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
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

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: C.orange, flexShrink: 0, fontSize: 14 }}>✓</span>
                      <span style={{ fontFamily: S.ff, fontSize: 14, color: plan.featured ? "rgba(255,255,255,0.75)" : C.muted, lineHeight: 1.5 }}>{f}</span>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
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
export default function HomePage({ onLogin }) {
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
