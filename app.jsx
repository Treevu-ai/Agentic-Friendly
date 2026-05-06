/* AGENTIC FIRST — main app */

const { useState: useS, useEffect: useE, useRef: useR } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "es",
  "accentHue": 285,
  "density": "regular",
  "showTicker": true,
  "scannerMode": "interactive"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const lang = t.lang === "en" ? "en" : "es";
  const c = window.COPY[lang];

  // accent hue
  useE(() => {
    document.documentElement.style.setProperty("--accent-h", t.accentHue);
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
          <a key={i} href="#">{l}</a>
        ))}
      </div>
      <div className="nav-right">
        <div className="nav-toggle">
          <button onClick={() => setLang("es")} className={lang === "es" ? "is-on" : ""}>ES</button>
          <button onClick={() => setLang("en")} className={lang === "en" ? "is-on" : ""}>EN</button>
        </div>
        <button className="btn btn--accent" style={{ padding: "8px 14px", fontSize: 12 }}>
          {copy.nav.cta} <span className="arr">→</span>
        </button>
        <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div className="nav-mobile-menu">
          {copy.nav.links.map((l, i) => (
            <a key={i} href="#" onClick={() => setOpen(false)}>{l}</a>
          ))}
          <div className="nav-mobile-bottom">
            <div className="nav-toggle">
              <button onClick={() => { setLang("es"); }} className={lang === "es" ? "is-on" : ""}>ES</button>
              <button onClick={() => { setLang("en"); }} className={lang === "en" ? "is-on" : ""}>EN</button>
            </div>
            <button className="btn btn--accent" style={{ padding: "10px 16px", fontSize: 13, width: "100%" }}>
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
    if (videoRef.current) videoRef.current.playbackRate = 1.8;
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
            <button className="btn btn--accent">
              {copy.cta1}<span className="arr">→</span>
            </button>
            <button className="btn btn--ghost">
              ▶ &nbsp;{copy.cta2}
            </button>
          </div>
          <div className="hero-engines-row">
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-fg-dim)", letterSpacing: ".14em" }}>
              {copy.ticker}
            </div>
            <div className="hero-engines-list">
              {window.ENGINES.map((e) => (
                <div key={e.id} className="hero-engine-chip">
                  <window.EngineMark e={e} size={16} />
                  <span style={{ fontSize: 12, color: "var(--ink-fg-mute)" }}>{e.name}</span>
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
          min-height: calc(100vh - 60px);
          padding: 80px 48px 60px;
          overflow: hidden;
          isolation: isolate;
        }
        @media (max-width: 720px) { .hero { padding: 60px 24px 80px; min-height: 0; } }
        .hero-bg { position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
        .hero-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          opacity: 0.5;
          filter: saturate(0.85) contrast(1.05);
          transform: scale(1.04);
          animation: heroVideoBreathe 16s ease-in-out infinite;
        }
        @keyframes heroVideoBreathe {
          0%, 100% { transform: scale(1.04); filter: saturate(0.85) contrast(1.05); }
          50% { transform: scale(1.08); filter: saturate(1) contrast(1.1); }
        }
        .hero-video-overlay {
          position: absolute; inset: 0;
          background:
            oklch(0.09 0.014 270 / 0.52),
            radial-gradient(ellipse at 50% 30%, oklch(0.08 0.014 270 / 0.30) 0%, var(--ink-0) 82%),
            linear-gradient(180deg, var(--ink-0) 0%, transparent 18%, transparent 72%, var(--ink-0) 100%);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(oklch(0.30 0.020 270 / 0.18) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.30 0.020 270 / 0.18) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse at 50% 30%, black, transparent 70%);
        }
        .hero-glow {
          position: absolute;
          width: 700px; height: 700px;
          left: -10%; top: -20%;
          background: radial-gradient(circle, var(--accent-soft) 0%, transparent 60%);
          filter: blur(60px);
        }
        .hero-glow-2 {
          left: auto; right: -15%; top: 30%;
          background: radial-gradient(circle, oklch(0.78 0.18 calc(var(--accent-h) - 80) / 0.18) 0%, transparent 60%);
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
          margin: 24px 0 24px;
          color: var(--ink-fg);
        }
        .hero-accent {
          position: relative;
          color: var(--accent);
          display: inline-block;
        }
        .hero-underline {
          position: absolute;
          left: 0; right: 0; bottom: -10px;
          width: 100%;
          height: 12px;
          color: var(--accent);
          opacity: 0.7;
        }
        .hero-sub {
          font-size: clamp(15px, 1.4vw, 19px);
          line-height: 1.55;
          color: var(--ink-fg-mute);
          max-width: 52ch;
          margin: 0 0 32px;
        }
        .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 64px; }
        .hero-engines-row {
          display: flex; align-items: center; gap: 24px;
          padding-top: 28px;
          border-top: 1px dashed var(--ink-line);
        }
        @media (max-width: 600px) { .hero-engines-row { flex-direction: column; align-items: flex-start; gap: 12px; } }
        .hero-engines-list {
          display: flex; gap: 16px; flex-wrap: wrap;
        }
        .hero-engine-chip { display: flex; align-items: center; gap: 6px; }

        .hero-right { position: relative; display: flex; justify-content: center; }
        .hero-console-tag {
          position: absolute;
          top: -24px; right: 0;
          font-size: 10px;
          letter-spacing: .18em;
          color: var(--accent);
          display: flex; align-items: center; gap: 8px;
        }
        .tag-line { width: 22px; height: 1px; background: var(--accent); }

        .hero-scroll {
          position: absolute;
          bottom: 30px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          font-size: 9px;
          letter-spacing: .24em;
          color: var(--ink-fg-dim);
        }
        .hero-scroll-line {
          width: 1px; height: 30px;
          background: linear-gradient(180deg, var(--accent), transparent);
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
    <section className="section section--lg section--ink scanner-section" data-screen-label="07 Scanner">
      <span className="section-tag">[ 06 / TOOL ]</span>
      <div className="hud-line"/>
      <div className="container" style={{ position: "relative" }}>
        <div className="scanner-head">
          <div className="eyebrow eyebrow-dot">{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ marginTop: 18, marginBottom: 14 }}>
            {copy.title}<br/>
            <span style={{ color: "var(--accent)" }}>{copy.titleAccent}</span>
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
          width: 1000px; height: 600px;
          background: radial-gradient(ellipse, var(--accent-soft) 0%, transparent 60%);
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
          color: var(--ink-fg-mute);
          font-size: 16px;
        }
      `}</style>
    </section>
  );
}

window.AGENTIC_FIRST_App = App;
