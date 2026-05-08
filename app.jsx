/* AGENTIC FIRST — main app */

const { useState: useS, useEffect: useE, useRef: useR } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "es",
  "accentHue": 20,
  "density": "regular",
  "showTicker": true,
  "scannerMode": "interactive"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [announceOpen, setAnnounceOpen] = useS(true);
  const lang = t.lang === "en" ? "en" : "es";
  const c = window.COPY[lang];

  // accent hue — shift the coral accent dynamically
  useE(() => {
    const h = t.accentHue;
    const sat = "90%";
    const lit = "60%";
    document.documentElement.style.setProperty("--accent-h", h);
    document.documentElement.style.setProperty("--accent", `hsl(${h}, ${sat}, ${lit})`);
    document.documentElement.style.setProperty("--accent-soft", `hsla(${h}, ${sat}, ${lit}, 0.14)`);
    document.documentElement.style.setProperty("--c-coral", `hsl(${h}, ${sat}, ${lit})`);
  }, [t.accentHue]);

  // density
  useE(() => {
    if (t.density === "compact") {
      document.documentElement.style.setProperty("--pad", "16px");
      document.documentElement.style.setProperty("--pad-lg", "40px");
    } else if (t.density === "comfy") {
      document.documentElement.style.setProperty("--pad", "32px");
      document.documentElement.style.setProperty("--pad-lg", "72px");
    } else {
      document.documentElement.style.setProperty("--pad", "24px");
      document.documentElement.style.setProperty("--pad-lg", "56px");
    }
  }, [t.density]);

  return (
    <div>
      {announceOpen && (
        <div className="announce-bar">
          <span>{lang === "en" ? "🚀 Now supporting 10+ AI engines — fully agentic by 2027." : "🚀 Ahora compatible con 10+ motores IA — 100% agéntico para 2027."}</span>
          <a href="#section-producto">{lang === "en" ? "Learn more" : "Saber más"}</a>
          <button className="announce-bar-close" onClick={() => setAnnounceOpen(false)} aria-label="Close">✕</button>
        </div>
      )}
      <Nav copy={c} lang={lang} setLang={(v) => setTweak("lang", v)} />
      <Hero copy={c.hero} />
      {t.showTicker && <Marquee text={c.ticker} />}
      <Metrics copy={c.metrics} />
      <Pillars copy={c.pillars} />
      <Timeline copy={c.timeline} />
      <Cases copy={c.cases} />
      <ScannerSection copy={c.scanner} />
      <Pricing copy={c.pricing} />
      <FinalCTA copy={c.finalCta} />
      <Footer copy={c.footer} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Language" />
        <TweakRadio
          label="Lang"
          value={t.lang}
          options={["es", "en"]}
          onChange={(v) => setTweak("lang", v)}
        />
        <TweakSection label="Visual" />
        <TweakSlider
          label="Accent hue"
          value={t.accentHue}
          min={0} max={360} step={5} unit="°"
          onChange={(v) => setTweak("accentHue", v)}
        />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakSection label="Sections" />
        <TweakToggle
          label="Marquee ticker"
          value={t.showTicker}
          onChange={(v) => setTweak("showTicker", v)}
        />
      </TweaksPanel>
    </div>
  );
}

// Section IDs — must match id="" attributes in sections.jsx
const NAV_SECTION_IDS = ["section-producto", "section-proceso", "section-planes", "section-faq"];
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function openScanner() { window.openGEOScanner?.(); }

/* ────────────────────── Nav */
function Nav({ copy, lang, setLang }) {
  const [open, setOpen] = useS(false);
  return (
    <nav className="nav">
      <div className="nav-brand">
        <div className="nav-mark">A</div>
        AGENTIC FIRST
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-fg-dim)", letterSpacing: ".14em", marginLeft: 6, fontWeight: 400 }}>
          v.2026
        </span>
      </div>
      <div className="nav-links">
        {copy.nav.links.map((l, i) => (
          <a key={i} href={`#${NAV_SECTION_IDS[i]}`}
            onClick={e => { e.preventDefault(); scrollTo(NAV_SECTION_IDS[i]); }}>
            {l}
          </a>
        ))}
      </div>
      <div className="nav-right">
        <div className="nav-toggle">
          <button onClick={() => setLang("es")} className={lang === "es" ? "is-on" : ""}>ES</button>
          <button onClick={() => setLang("en")} className={lang === "en" ? "is-on" : ""}>EN</button>
        </div>
        <button className="btn btn--accent" style={{ padding: "10px 20px", fontSize: 13 }} onClick={openScanner}>
          {copy.nav.cta} <span className="arr">→</span>
        </button>
        <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div className="nav-mobile-menu">
          {copy.nav.links.map((l, i) => (
            <a key={i} href={`#${NAV_SECTION_IDS[i]}`}
              onClick={e => { e.preventDefault(); scrollTo(NAV_SECTION_IDS[i]); setOpen(false); }}>
              {l}
            </a>
          ))}
          <div className="nav-mobile-bottom">
            <div className="nav-toggle">
              <button onClick={() => { setLang("es"); }} className={lang === "es" ? "is-on" : ""}>ES</button>
              <button onClick={() => { setLang("en"); }} className={lang === "en" ? "is-on" : ""}>EN</button>
            </div>
            <button className="btn btn--accent" style={{ padding: "10px 16px", fontSize: 13, width: "100%" }}
              onClick={() => { openScanner(); setOpen(false); }}>
              {copy.nav.cta} <span className="arr">→</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ────────────────────── Hero */
function Hero({ copy }) {
  const videoRef = useR(null);
  useE(() => {
    if (videoRef.current) videoRef.current.playbackRate = 1.0;
  }, []);
  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="hero-bg">
        <video
          ref={videoRef}
          className="hero-video"
          src={(window.__resources && window.__resources.heroVideo) || "assets/hero.mp4"}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="hero-video-overlay"/>
        <div className="hero-grid"/>
        <div className="hero-glow"/>
        <div className="hero-glow hero-glow-2"/>
      </div>
      <div className="hero-inner container">
        <div className="hero-left">
          <div className="pill">
            <span className="dot"/>{copy.pill}
          </div>
          <h1 className="h-display h-display-lg hero-h">
            {copy.headline_pre}{" "}
            <span className="hero-accent">
              {copy.headline_accent}
              <svg className="hero-underline" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M2,8 Q50,2 100,6 T198,7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            {copy.headline_post}
          </h1>
          <p className="hero-sub">{copy.subhead}</p>
          <div className="hero-ctas">
            <button className="btn btn--accent" onClick={openScanner}>
              {copy.cta1}<span className="arr">→</span>
            </button>
            <button className="btn btn--ghost hero-btn-ghost" onClick={() => scrollTo("section-proceso")}>
              ▶ &nbsp;{copy.cta2}
            </button>
          </div>
          <div className="hero-engines-row">
            <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: ".14em" }}>
              {copy.ticker}
            </div>
            <div className="hero-engines-list">
              {window.ENGINES.map((e) => (
                <div key={e.id} className="hero-engine-chip">
                  <window.EngineMark e={e} size={16} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{e.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-right">
          <HeroConsole copy={copy.console} />
          <div className="hero-console-tag mono">
            <span className="tag-line"/>
            LIVE.SIMULATION
          </div>
        </div>
      </div>
      <div className="hero-scroll mono">
        <span>SCROLL</span>
        <div className="hero-scroll-line"/>
      </div>
      <style>{`
        .hero {
          position: relative;
          min-height: calc(100vh - 96px);
          padding: 80px 48px 60px;
          overflow: hidden;
          isolation: isolate;
          background: var(--c-deep-green);
          color: #ffffff;
        }
        @media (max-width: 720px) { .hero { padding: 60px 24px 80px; min-height: 0; } }
        .hero-bg { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
        .hero-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          opacity: 0.28;
          filter: saturate(0.6) contrast(1.1);
          transform: scale(1.04);
          animation: heroVideoBreathe 16s ease-in-out infinite;
        }
        @keyframes heroVideoBreathe {
          0%, 100% { transform: scale(1.04); opacity: 0.28; }
          50% { transform: scale(1.07); opacity: 0.32; }
        }
        .hero-video-overlay {
          position: absolute; inset: 0;
          background:
            rgba(0,60,51,0.72),
            radial-gradient(ellipse at 50% 30%, rgba(0,40,35,0.45) 0%, transparent 72%),
            linear-gradient(180deg, rgba(0,60,51,0.9) 0%, transparent 25%, transparent 75%, rgba(0,60,51,0.95) 100%);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse at 50% 30%, black, transparent 70%);
        }
        .hero-glow {
          position: absolute;
          width: 600px; height: 600px;
          left: -5%; top: -15%;
          background: radial-gradient(circle, rgba(255,119,89,0.14) 0%, transparent 65%);
          filter: blur(60px);
        }
        .hero-glow-2 {
          left: auto; right: -10%; top: 35%;
          background: radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 65%);
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 64px;
          align-items: center;
          min-height: 70vh;
        }
        @media (max-width: 1000px) {
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
        }
        .hero-h {
          margin: 28px 0 24px;
          color: #ffffff;
          letter-spacing: -0.03em;
        }
        .hero-accent {
          position: relative;
          color: var(--c-coral);
          display: inline-block;
        }
        .hero-underline {
          position: absolute;
          left: 0; right: 0; bottom: -10px;
          width: 100%;
          height: 12px;
          color: var(--c-coral);
          opacity: 0.7;
        }
        .hero-sub {
          font-size: clamp(16px, 1.4vw, 18px);
          line-height: 1.55;
          color: rgba(255,255,255,0.68);
          max-width: 52ch;
          margin: 0 0 36px;
        }
        .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 56px; }
        .hero-btn-ghost {
          border-color: rgba(255,255,255,0.24) !important;
          color: rgba(255,255,255,0.85) !important;
          background: transparent !important;
        }
        .hero-btn-ghost:hover {
          border-color: rgba(255,255,255,0.6) !important;
          background: rgba(255,255,255,0.08) !important;
          color: #ffffff !important;
        }
        .hero-engines-row {
          display: flex; align-items: center; gap: 24px;
          padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        @media (max-width: 600px) { .hero-engines-row { flex-direction: column; align-items: flex-start; gap: 12px; } }
        .hero-engines-list {
          display: flex; gap: 16px; flex-wrap: wrap;
        }
        .hero-engine-chip { display: flex; align-items: center; gap: 6px; }
        .hero .pill {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.7);
        }

        .hero-right { position: relative; display: flex; justify-content: center; }
        .hero-console-tag {
          position: absolute;
          top: -24px; right: 0;
          font-size: 10px;
          letter-spacing: .18em;
          color: var(--c-coral);
          display: flex; align-items: center; gap: 8px;
        }
        .tag-line { width: 22px; height: 1px; background: var(--c-coral); }

        .hero-scroll {
          position: absolute;
          bottom: 30px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          font-size: 9px;
          letter-spacing: .24em;
          color: rgba(255,255,255,0.35);
        }
        .hero-scroll-line {
          width: 1px; height: 30px;
          background: linear-gradient(180deg, var(--c-coral), transparent);
          animation: scrollLine 2s ease-in-out infinite;
        }
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}</style>
    </section>
  );
}

/* ────────────────────── Scanner section wrapper */
function ScannerSection({ copy }) {
  return (
    <section id="section-scanner" className="section section--lg section--ink scanner-section" data-screen-label="07 Scanner">
      <span className="section-tag">[ 06 / TOOL ]</span>
      <div className="hud-line"/>
      <div className="container" style={{ position: "relative" }}>
        <div className="scanner-head">
          <div className="eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ marginTop: 18, marginBottom: 14, color: "#ffffff" }}>
            {copy.title}<br/>
            <span style={{ color: "var(--c-coral)" }}>{copy.titleAccent}</span>
          </h2>
          <div className="scanner-sub">{copy.sub}</div>
        </div>
        <Scanner copy={copy} />
      </div>
      <div className="scanner-bgglow"/>
      <style>{`
        .scanner-section { position: relative; overflow: hidden; }
        .scanner-bgglow {
          position: absolute;
          left: 50%; top: 60%;
          transform: translate(-50%, -50%);
          width: 800px; height: 500px;
          background: radial-gradient(ellipse, rgba(255,119,89,0.14) 0%, transparent 60%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }
        .scanner-head {
          text-align: center;
          margin: 0 auto 56px;
          max-width: 720px;
        }
        .scanner-head h2 { margin-left: auto; margin-right: auto; }
        .scanner-sub {
          color: rgba(255,255,255,0.58);
          font-size: 16px;
        }
      `}</style>
    </section>
  );
}

window.AGENTIC_FIRST_App = App;
