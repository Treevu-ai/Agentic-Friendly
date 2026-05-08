/* AGENTIC FIRST — section components */

const { useState: useStateX, useEffect: useEffectX, useRef: useRefX } = React;

/* ─────────────────────────────────────────── Marquee */
function Marquee({ text, engines }) {
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[0,1].map((rep) => (
          <div key={rep} className="marquee-group">
            {Array.from({length: 4}).map((_, j) => (
              <span key={j} className="marquee-item">
                <span className="display marquee-text">{text}</span>
                <span className="marquee-dot">●</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .marquee {
          overflow: hidden;
          padding: 20px 0;
          border-top: 1px solid var(--c-hairline);
          border-bottom: 1px solid var(--c-hairline);
          background: var(--cream-0);
          mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 45s linear infinite;
        }
        .marquee-group {
          display: flex;
          align-items: center;
          gap: 32px;
          padding-right: 32px;
        }
        .marquee-item { display: inline-flex; align-items: center; gap: 32px; font-size: 28px; }
        .marquee-text { color: var(--c-ink, #212121); font-weight: 400; letter-spacing: -0.02em; }
        .marquee-dot { color: var(--c-coral); }
        @keyframes marquee { from { transform: none; } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────── Metrics */
function Metrics({ copy }) {
  return (
    <section className="section" data-screen-label="03 Metrics">
      <span className="section-tag">[ 02 / METRICS ]</span>
      <div className="hud-line"/>
      <div className="container">
        <div className="metrics-head">
          <div className="eyebrow eyebrow-dot">{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ color: "var(--ink-fg)", maxWidth: 14, marginTop: 18, marginBottom: 0 }}>
            <span style={{ display: "block", maxWidth: "16ch" }}>
              {copy.title.split(".")[0]}.<br/>
              <span style={{ color: "var(--ink-fg-mute)" }}>{copy.title.split(".")[1]}.</span>
            </span>
          </h2>
        </div>
        <div className="metrics-grid">
          {copy.items.map((m, i) => (
            <div key={i} className="metric">
              <div className="metric-tag mono">{String(i+1).padStart(2,"0")}</div>
              <div className="metric-key display">{m.k}</div>
              <div className="metric-label">{m.l.split("\n").map((s,j)=>(<span key={j} style={{display:"block"}}>{s}</span>))}</div>
              <div className="metric-note mono">↗ {m.n}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .metrics-head {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 40px;
          align-items: end;
          margin-bottom: 80px;
        }
        @media (max-width: 800px) { .metrics-head { grid-template-columns: 1fr; gap: 18px; margin-bottom: 48px;} }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 1px solid var(--c-hairline);
        }
        @media (max-width: 800px) { .metrics-grid { grid-template-columns: 1fr; } }
        .metric {
          padding: 40px 32px 40px 0;
          border-right: 1px solid var(--c-hairline);
          position: relative;
        }
        .metric:last-child { border-right: 0; }
        @media (max-width: 800px) {
          .metric { border-right: 0; border-bottom: 1px solid var(--c-hairline); padding: 28px 0; }
          .metric:last-child { border-bottom: 0; }
        }
        .metric-tag {
          position: absolute; top: 18px; right: 18px;
          font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .14em;
        }
        .metric-key {
          font-size: clamp(56px, 7vw, 96px);
          font-weight: 400;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--ink-fg);
          margin-bottom: 16px;
          margin-top: 10px;
        }
        .metric-label {
          font-size: 15px;
          color: var(--ink-fg-mute);
          line-height: 1.5;
          max-width: 24ch;
          margin-bottom: 14px;
        }
        .metric-note {
          font-size: 11px;
          color: var(--accent);
          letter-spacing: .06em;
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── Pillars */
function Pillars({ copy }) {
  const [hovered, setHovered] = useStateX(null);
  return (
    <section id="section-producto" className="section section--ink" data-screen-label="04 Pillars">
      <span className="section-tag">[ 03 / METHOD ]</span>
      <div className="hud-line"/>
      <div className="container">
        <div className="pillars-head">
          <div className="eyebrow eyebrow-dot" style={{ color: "rgba(255,255,255,0.5)" }}>{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ marginTop: 18, marginBottom: 0, maxWidth: "20ch", color: "#ffffff" }}>
            {copy.title}
          </h2>
        </div>
        <div className="pillars-grid">
          {copy.items.map((p, i) => (
            <div
              key={i}
              className={`pillar ${hovered === i ? "is-on" : hovered != null ? "is-off" : ""}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="pillar-num display">{p.n}</div>
              <div className="pillar-tag mono">{p.tag}</div>
              <div className="pillar-title display">{p.t}</div>
              <div className="pillar-desc">{p.d}</div>
              <div className="pillar-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pillars-head {
          display: grid; grid-template-columns: 1fr 2fr; gap: 40px; align-items: end;
          margin-bottom: 80px;
        }
        @media (max-width: 800px) { .pillars-head { grid-template-columns: 1fr; gap: 18px; margin-bottom: 48px; } }
        .pillars-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        @media (max-width: 900px) { .pillars-grid { grid-template-columns: 1fr; } }
        .pillar {
          position: relative;
          padding: 40px 32px 80px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: var(--r-lg);
          min-height: 360px;
          transition: all .4s var(--ease);
          cursor: default;
        }
        .pillar.is-on {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,119,89,0.45);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.24);
        }
        .pillar.is-off { opacity: .5; }
        .pillar-num {
          font-size: 56px;
          font-weight: 400;
          letter-spacing: -0.04em;
          color: rgba(255,255,255,0.25);
          line-height: 1;
          margin-bottom: 20px;
          transition: color .3s;
        }
        .pillar.is-on .pillar-num { color: var(--c-coral); }
        .pillar-tag {
          font-size: 10px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: var(--r-pill);
          display: inline-block;
          margin-bottom: 18px;
        }
        .pillar.is-on .pillar-tag { border-color: rgba(255,119,89,0.35); color: var(--c-coral-soft); }
        .pillar-title {
          font-size: 24px;
          font-weight: 400;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .pillar-desc {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.58);
          max-width: 32ch;
        }
        .pillar-arrow {
          position: absolute;
          bottom: 28px; right: 32px;
          font-size: 20px;
          color: rgba(255,255,255,0.25);
          transition: all .3s var(--ease);
        }
        .pillar.is-on .pillar-arrow { color: var(--c-coral); transform: translate(4px, -4px) rotate(-45deg); }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── Timeline */
function Timeline({ copy }) {
  const ref = useRefX(null);
  const [progress, setProgress] = useStateX(0);

  useEffectX(() => {
    function onScroll() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when section top hits middle, 1 when bottom hits middle
      const total = rect.height + vh * 0.4;
      const scrolled = vh * 0.7 - rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="section-proceso" className="section" data-screen-label="05 Timeline" ref={ref}>
      <span className="section-tag">[ 04 / PROCESS ]</span>
      <div className="hud-line"/>
      <div className="container">
        <div className="timeline-head">
          <div className="eyebrow eyebrow-dot">{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ marginTop: 18, marginBottom: 0, maxWidth: "16ch" }}>
            {copy.title}
          </h2>
        </div>
        <div className="timeline-track">
          <div className="timeline-rail">
            <div className="timeline-rail-fill" style={{ height: `${progress * 100}%` }}/>
          </div>
          {copy.steps.map((s, i) => {
            const reached = progress * copy.steps.length > i + 0.5;
            return (
              <div key={i} className={`tl-step ${reached ? "is-on" : ""}`}>
                <div className="tl-node">
                  <div className="tl-node-inner mono">{s.n}</div>
                </div>
                <div className="tl-card">
                  <div className="tl-week mono">{s.w}</div>
                  <div className="tl-title display">{s.t}</div>
                  <div className="tl-desc">{s.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .timeline-head {
          display: grid; grid-template-columns: 1fr 2fr; gap: 40px; align-items: end;
          margin-bottom: 64px;
        }
        @media (max-width: 800px) { .timeline-head { grid-template-columns: 1fr; gap: 18px; margin-bottom: 36px; } }
        .timeline-track { position: relative; padding-left: 76px; }
        @media (max-width: 800px) { .timeline-track { padding-left: 56px; } }
        .timeline-rail {
          position: absolute;
          left: 27px;
          top: 14px; bottom: 14px;
          width: 2px;
          background: var(--c-hairline);
          overflow: hidden;
        }
        @media (max-width: 800px) { .timeline-rail { left: 19px; } }
        .timeline-rail-fill {
          position: absolute;
          top: 0; left: 0; right: 0;
          background: linear-gradient(180deg, var(--accent), var(--c-coral-soft));
          transition: height .25s linear;
        }
        .tl-step {
          position: relative;
          padding-bottom: 64px;
        }
        .tl-step:last-child { padding-bottom: 0; }
        .tl-node {
          position: absolute;
          left: -76px;
          top: 0;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--c-hairline);
          display: grid;
          place-items: center;
          transition: all .4s var(--ease);
        }
        @media (max-width: 800px) {
          .tl-node { left: -56px; width: 40px; height: 40px; }
        }
        .tl-step.is-on .tl-node {
          background: var(--ink-fg);
          border-color: var(--ink-fg);
          box-shadow: 0 0 0 4px rgba(23,23,28,0.10);
        }
        .tl-node-inner {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-fg-mute);
          letter-spacing: .04em;
          transition: color .3s;
        }
        .tl-step.is-on .tl-node-inner { color: #ffffff; }
        .tl-week {
          font-size: 11px;
          letter-spacing: .14em;
          color: var(--ink-fg-dim);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .tl-step.is-on .tl-week { color: var(--accent); }
        .tl-title {
          font-size: 28px;
          font-weight: 400;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
          color: var(--ink-fg);
        }
        .tl-desc {
          font-size: 15px;
          line-height: 1.6;
          color: var(--ink-fg-mute);
          max-width: 56ch;
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── Cases / Tabs */
function Cases({ copy }) {
  const tabs = copy.tabs;
  const [active, setActive] = useStateX(tabs[0]);
  const items = copy.items[active] || [];

  return (
    <section id="section-faq" className="section section--ink-1" data-screen-label="06 Cases">
      <span className="section-tag">[ 05 / CASES ]</span>
      <div className="hud-line"/>
      <div className="container">
        <div className="cases-head">
          <div className="eyebrow eyebrow-dot">{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ marginTop: 18, marginBottom: 0, maxWidth: "18ch" }}>
            {copy.title}
          </h2>
        </div>
        <div className="cases-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t}
              className={`cases-tab ${active === t ? "is-on" : ""}`}
              onClick={() => setActive(t)}
              role="tab"
              aria-selected={active === t}
            >
              {t}
              <span className="cases-tab-count mono">{(copy.items[t] || []).length}</span>
            </button>
          ))}
        </div>
        <div className="cases-grid">
          {items.map((it, i) => (
            <div key={`${active}-${i}`} className="case-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="case-card-top">
                <div className="case-cat mono">{active}</div>
                <div className="case-q">{it.q}</div>
              </div>
              <div className="case-result">
                <div className="case-r display">{it.r}</div>
                <div className="case-k">{it.k}</div>
              </div>
              <div className="case-line"/>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .cases-head {
          display: grid; grid-template-columns: 1fr 2fr; gap: 40px; align-items: end;
          margin-bottom: 56px;
        }
        @media (max-width: 800px) { .cases-head { grid-template-columns: 1fr; gap: 18px; margin-bottom: 36px; } }
        .cases-tabs {
          display: flex; flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
          padding-bottom: 28px;
          border-bottom: 1px solid var(--c-hairline);
        }
        .cases-tab {
          padding: 8px 16px;
          border: 1px solid var(--c-coral-soft);
          border-radius: var(--r-pill);
          font-size: 13px;
          color: var(--c-coral);
          display: inline-flex; align-items: center; gap: 8px;
          transition: all .25s var(--ease);
          background: transparent;
        }
        .cases-tab:hover { background: rgba(255,119,89,0.06); border-color: var(--c-coral); }
        .cases-tab.is-on {
          background: var(--c-coral);
          color: #ffffff;
          border-color: var(--c-coral);
        }
        .cases-tab-count {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: var(--r-xs);
          background: rgba(255,119,89,0.12);
          color: var(--c-coral);
        }
        .cases-tab.is-on .cases-tab-count { background: rgba(255,255,255,0.24); color: #ffffff; }

        .cases-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
          border-top: 1px solid var(--c-hairline);
        }
        @media (max-width: 800px) { .cases-grid { grid-template-columns: 1fr; } }
        .case-card {
          padding: 32px;
          border-right: 1px solid var(--c-hairline);
          border-bottom: 1px solid var(--c-hairline);
          position: relative;
          animation: rise .5s var(--ease) both;
          transition: background .3s;
          background: #ffffff;
        }
        .case-card:nth-child(2n) { border-right: 0; }
        @media (max-width: 800px) { .case-card { border-right: 0; } }
        .case-card:hover { background: var(--cream-0); }
        .case-card-top { margin-bottom: 32px; }
        .case-cat {
          font-size: 10px;
          letter-spacing: .16em;
          color: var(--c-coral);
          text-transform: uppercase;
          margin-bottom: 12px;
          font-family: var(--f-mono);
        }
        .case-q {
          font-size: 16px;
          color: var(--ink-fg);
          line-height: 1.45;
          font-style: italic;
          max-width: 32ch;
        }
        .case-result { display: flex; align-items: baseline; gap: 16px; }
        .case-r {
          font-size: 52px;
          font-weight: 400;
          letter-spacing: -0.04em;
          color: var(--ink-fg);
          line-height: 1;
        }
        .case-k {
          font-size: 13px;
          color: var(--ink-fg-mute);
          max-width: 18ch;
          line-height: 1.4;
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── Pricing */
function Pricing({ copy }) {
  return (
    <section id="section-planes" className="section" data-screen-label="08 Pricing">
      <span className="section-tag">[ 07 / PRICING ]</span>
      <div className="hud-line"/>
      <div className="container">
        <div className="pricing-head">
          <div className="eyebrow eyebrow-dot">{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ marginTop: 18, marginBottom: 14, maxWidth: "18ch" }}>
            {copy.title}
          </h2>
          <div className="pricing-sub">{copy.sub}</div>
        </div>
        <div className="pricing-grid">
          {copy.plans.map((p, i) => (
            <div key={i} className={`plan ${p.highlight ? "plan--hl" : ""}`}>
              {p.tag && <div className="plan-tag mono">{p.tag}</div>}
              <div className="plan-name display">{p.n}</div>
              <div className="plan-desc">{p.d}</div>
              <div className="plan-price">
                {p.p === "Custom" ? (
                  <span className="plan-price-num display" style={{ fontSize: 48 }}>Custom</span>
                ) : (
                  <>
                    <span className="plan-price-cur mono">USD</span>
                    <span className="plan-price-num display">{p.p}</span>
                    <span className="plan-price-per mono">{p.per}</span>
                  </>
                )}
              </div>
              <button className="plan-cta"
                onClick={() => window.openGEOScanner?.()}>
                {p.cta}<span className="arr">→</span>
              </button>
              <div className="plan-feats">
                {p.feats.map((f, j) => (
                  <div key={j} className="plan-feat">
                    <span className="plan-feat-icon">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pricing-head { text-align: center; margin: 0 auto 64px; max-width: 720px; }
        .pricing-head h2 { margin-left: auto; margin-right: auto; }
        .pricing-sub { color: var(--ink-fg-mute); font-size: 16px; margin-top: 12px; }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr; } }
        .plan {
          background: var(--cream-0);
          border: 1px solid var(--c-card-border);
          border-radius: var(--r-sm);
          padding: 36px 30px;
          display: flex; flex-direction: column;
          position: relative;
          transition: all .3s var(--ease);
        }
        .plan:hover { border-color: var(--c-hairline); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .plan--hl {
          background: var(--ink-fg);
          border: 1px solid var(--ink-fg);
          color: #ffffff;
          transform: translateY(-8px);
          box-shadow: 0 8px 32px rgba(23,23,28,0.18);
        }
        .plan-tag {
          position: absolute;
          top: -12px; left: 24px;
          font-size: 10px;
          letter-spacing: .14em;
          padding: 5px 12px;
          background: var(--c-coral);
          color: #ffffff;
          border-radius: var(--r-pill);
          font-weight: 600;
          font-family: var(--f-mono);
        }
        .plan-name {
          font-size: 22px; font-weight: 400;
          color: var(--ink-fg); margin-bottom: 6px;
        }
        .plan--hl .plan-name { color: #ffffff; }
        .plan-desc {
          font-size: 13px;
          color: var(--ink-fg-mute);
          margin-bottom: 28px;
        }
        .plan--hl .plan-desc { color: rgba(255,255,255,0.6); }
        .plan-price {
          display: flex; align-items: baseline; gap: 4px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--c-hairline);
        }
        .plan--hl .plan-price { border-bottom-color: rgba(255,255,255,0.14); }
        .plan-price-cur { color: var(--c-coral); font-size: 12px; font-weight: 600; letter-spacing: 0.14em; font-family: var(--f-mono); align-self: flex-start; margin-top: 14px; }
        .plan-price-num { font-size: 52px; font-weight: 400; letter-spacing: -0.04em; line-height: 1; color: var(--ink-fg); }
        .plan--hl .plan-price-num { color: #ffffff; }
        .plan-price-per { color: var(--ink-fg-dim); font-size: 12px; margin-left: 4px; font-family: var(--f-mono); }
        .plan--hl .plan-price-per { color: rgba(255,255,255,0.45); }
        .plan-cta {
          width: 100%;
          padding: 12px 20px;
          border-radius: var(--r-pill);
          background: var(--ink-fg);
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 24px;
          transition: all .25s var(--ease);
          cursor: pointer;
          border: 0;
        }
        .plan-cta:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(23,23,28,0.18); }
        .plan--hl .plan-cta { background: #ffffff; color: var(--ink-fg); }
        .plan--hl .plan-cta:hover { background: var(--cream-0); }
        .plan-cta .arr { transition: transform .25s var(--ease); }
        .plan-cta:hover .arr { transform: translateX(3px); }
        .plan-feats { display: flex; flex-direction: column; gap: 10px; }
        .plan-feat {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; color: var(--ink-fg-mute);
          line-height: 1.4;
        }
        .plan--hl .plan-feat { color: rgba(255,255,255,0.65); }
        .plan-feat-icon {
          color: var(--c-coral);
          font-weight: 700;
          flex-shrink: 0;
        }
        .plan--hl .plan-feat-icon { color: var(--c-coral-soft); }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── Final CTA */
function FinalCTA({ copy }) {
  return (
    <section className="section section--ink section--lg final-cta" data-screen-label="09 Final CTA">
      <div className="final-cta-bg"/>
      <div className="container container--narrow" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--c-coral)", marginBottom: 24, letterSpacing: ".18em" }}>{copy.tag}</div>
        <h2 className="h-display" style={{ fontSize: "clamp(52px, 8vw, 120px)", marginBottom: 32, lineHeight: 1.0, color: "#ffffff" }}>
          {copy.pre} <span className="shimmer" style={{ display: "inline-block" }}>{copy.accent}</span>
        </h2>
        <div className="final-sub">{copy.sub}</div>
        <button className="final-cta-btn" onClick={() => window.openGEOScanner?.()}>
          {copy.cta}<span className="arr">→</span>
        </button>
        <div className="final-meta mono">{copy.meta}</div>
      </div>
      <style>{`
        .final-cta { position: relative; overflow: hidden; }
        .final-cta-bg {
          position: absolute; inset: -10%;
          background:
            radial-gradient(ellipse at 60% 80%,
              rgba(255,119,89,0.14) 0%,
              transparent 55%),
            radial-gradient(ellipse at 20% 20%,
              rgba(0,200,150,0.08) 0%,
              transparent 60%);
          filter: blur(40px);
          pointer-events: none;
        }
        .final-sub {
          font-size: 18px;
          line-height: 1.5;
          color: rgba(255,255,255,0.65);
          max-width: 56ch;
          margin: 0 auto 40px;
        }
        .final-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 36px;
          border-radius: var(--r-pill);
          background: #ffffff;
          color: var(--c-deep-green);
          font-size: 15px;
          font-weight: 500;
          font-family: var(--f-text);
          cursor: pointer;
          border: 0;
          transition: transform .2s var(--ease), box-shadow .2s;
        }
        .final-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .final-cta-btn .arr { display: inline-block; transition: transform .25s var(--ease); }
        .final-cta-btn:hover .arr { transform: translateX(3px); }
        .final-meta {
          font-size: 11px;
          letter-spacing: .14em;
          color: rgba(255,255,255,0.35);
          margin-top: 22px;
          text-transform: uppercase;
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── Footer */
function Footer({ copy }) {
  return (
    <footer className="site-footer" data-screen-label="10 Footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-mark display">AGENTIC<br/>FIRST.</div>
            <div className="footer-tag">{copy.tagline}</div>
          </div>
          <div className="footer-cols">
            {copy.cols.map((c, i) => (
              <div key={i} className="footer-col">
                <div className="footer-col-h mono">{c.h}</div>
                {c.l.map((l, j) => (
                  <a key={j} href="#" className="footer-link">{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bot">
          <div className="footer-copy mono">{copy.copy}</div>
          <div className="footer-engines">
            {window.ENGINES.slice(0,4).map((e) => (
              <window.EngineMark key={e.id} e={e} size={18} />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .site-footer {
          background: #17171c;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 80px 48px 40px;
          color: #ffffff;
        }
        @media (max-width: 720px) { .site-footer { padding: 60px 24px 32px; } }
        .footer-top {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 64px;
          padding-bottom: 64px;
          border-bottom: 1px solid rgba(255,255,255,0.10);
        }
        @media (max-width: 900px) { .footer-top { grid-template-columns: 1fr; gap: 32px; } }
        .footer-mark {
          font-size: 34px;
          font-weight: 400;
          letter-spacing: -0.03em;
          line-height: 1.0;
          margin-bottom: 18px;
          color: #ffffff;
        }
        .footer-tag {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
          max-width: 32ch;
        }
        .footer-cols {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 720px) { .footer-cols { grid-template-columns: repeat(2, 1fr); } }
        .footer-col { display: flex; flex-direction: column; gap: 10px; }
        .footer-col-h {
          font-size: 10px;
          color: #ffffff;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .footer-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 13px;
          transition: color .2s;
        }
        .footer-link:hover { color: var(--c-coral); }
        .footer-bot {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 32px;
          gap: 24px;
          flex-wrap: wrap;
        }
        .footer-copy { font-size: 11px; color: rgba(255,255,255,0.28); letter-spacing: .04em; }
        .footer-engines { display: flex; gap: 8px; }
      `}</style>
    </footer>
  );
}

Object.assign(window, { Marquee, Metrics, Pillars, Timeline, Cases, Pricing, FinalCTA, Footer });
