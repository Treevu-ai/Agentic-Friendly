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
          padding: 22px 0;
          border-top: 1px solid var(--ink-line);
          border-bottom: 1px solid var(--ink-line);
          background: oklch(0.14 0.016 270);
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
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
        .marquee-item { display: inline-flex; align-items: center; gap: 32px; font-size: 32px; }
        .marquee-text { color: var(--ink-fg); font-weight: 500; letter-spacing: -0.02em; }
        .marquee-dot { color: var(--accent); }
        @keyframes marquee { from { transform: none; } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────── Metrics */
function Metrics({ copy }) {
  return (
    <section className="section section--cream" data-screen-label="03 Metrics">
      <span className="section-tag">[ 02 / METRICS ]</span>
      <div className="hud-line"/>
      <div className="container">
        <div className="metrics-head">
          <div className="eyebrow eyebrow-dot">{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ color: "var(--cream-fg)", maxWidth: 14, marginTop: 18, marginBottom: 0 }}>
            {/* 14ch ish width handled below */}
            <span style={{ display: "block", maxWidth: "16ch" }}>
              {copy.title.split(".")[0]}.<br/>
              <span style={{ color: "var(--cream-fg-dim)" }}>{copy.title.split(".")[1]}.</span>
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
          border-top: 1px solid var(--cream-line);
        }
        @media (max-width: 800px) { .metrics-grid { grid-template-columns: 1fr; } }
        .metric {
          padding: 36px 28px 36px 0;
          border-right: 1px solid var(--cream-line);
          position: relative;
        }
        .metric:last-child { border-right: 0; }
        @media (max-width: 800px) {
          .metric { border-right: 0; border-bottom: 1px solid var(--cream-line); padding: 28px 0; }
          .metric:last-child { border-bottom: 0; }
        }
        .metric-tag {
          position: absolute; top: 18px; right: 18px;
          font-size: 10px; color: var(--cream-fg-dim); letter-spacing: .14em;
        }
        .metric-key {
          font-size: clamp(56px, 7vw, 96px);
          font-weight: 500;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--cream-fg);
          margin-bottom: 18px;
          margin-top: 10px;
        }
        .metric-label {
          font-size: 14px;
          color: var(--cream-fg-mute);
          line-height: 1.5;
          max-width: 24ch;
          margin-bottom: 14px;
        }
        .metric-note {
          font-size: 11px;
          color: var(--cream-fg-dim);
          letter-spacing: .04em;
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── Pillars */
function Pillars({ copy }) {
  const [hovered, setHovered] = useStateX(null);
  return (
    <section className="section section--ink" data-screen-label="04 Pillars">
      <span className="section-tag">[ 03 / METHOD ]</span>
      <div className="hud-line"/>
      <div className="container">
        <div className="pillars-head">
          <div className="eyebrow eyebrow-dot">{copy.tag}</div>
          <h2 className="h-display h-display-md" style={{ marginTop: 18, marginBottom: 0, maxWidth: "20ch" }}>
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
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;
        }
        @media (max-width: 900px) { .pillars-grid { grid-template-columns: 1fr; } }
        .pillar {
          position: relative;
          padding: 40px 32px 80px;
          background: var(--ink-1);
          border: 1px solid var(--ink-line);
          border-radius: var(--r-lg);
          min-height: 380px;
          transition: all .4s var(--ease);
          cursor: default;
        }
        .pillar.is-on {
          background: linear-gradient(180deg, oklch(0.21 0.020 270) 0%, oklch(0.16 0.018 270) 100%);
          border-color: oklch(0.68 0.22 var(--accent-h) / 0.5);
          transform: translateY(-4px);
          box-shadow: 0 30px 60px -20px oklch(0 0 0 / 0.5),
                      0 0 0 1px oklch(0.68 0.22 var(--accent-h) / 0.2);
        }
        .pillar.is-off { opacity: .55; }
        .pillar-num {
          font-size: 64px;
          font-weight: 500;
          letter-spacing: -0.04em;
          color: var(--ink-fg-dim);
          line-height: 1;
          margin-bottom: 24px;
          transition: color .3s;
        }
        .pillar.is-on .pillar-num { color: var(--accent); }
        .pillar-tag {
          font-size: 10px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--ink-fg-dim);
          padding: 4px 10px;
          border: 1px solid var(--ink-line);
          border-radius: 999px;
          display: inline-block;
          margin-bottom: 18px;
        }
        .pillar-title {
          font-size: 26px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--ink-fg);
          margin-bottom: 14px;
        }
        .pillar-desc {
          font-size: 14px;
          line-height: 1.55;
          color: var(--ink-fg-mute);
          max-width: 32ch;
        }
        .pillar-arrow {
          position: absolute;
          bottom: 28px; right: 32px;
          font-size: 22px;
          color: var(--ink-fg-dim);
          transition: all .3s var(--ease);
        }
        .pillar.is-on .pillar-arrow { color: var(--accent); transform: translate(4px, -4px) rotate(-45deg); }
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
    <section className="section section--ink-1" data-screen-label="05 Timeline" ref={ref}>
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
          background: var(--ink-line);
          overflow: hidden;
        }
        @media (max-width: 800px) { .timeline-rail { left: 19px; } }
        .timeline-rail-fill {
          position: absolute;
          top: 0; left: 0; right: 0;
          background: linear-gradient(180deg, var(--accent-2), var(--accent));
          transition: height .25s linear;
          box-shadow: 0 0 12px var(--accent-soft);
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
          background: var(--ink-0);
          border: 1px solid var(--ink-line);
          display: grid;
          place-items: center;
          transition: all .4s var(--ease);
        }
        @media (max-width: 800px) {
          .tl-node { left: -56px; width: 40px; height: 40px; }
        }
        .tl-step.is-on .tl-node {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 0 6px var(--accent-soft);
        }
        .tl-node-inner {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-fg-mute);
          letter-spacing: .04em;
          transition: color .3s;
        }
        .tl-step.is-on .tl-node-inner { color: var(--accent-fg); }
        .tl-week {
          font-size: 11px;
          letter-spacing: .14em;
          color: var(--ink-fg-dim);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .tl-step.is-on .tl-week { color: var(--accent); }
        .tl-title {
          font-size: 30px;
          font-weight: 500;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
          color: var(--ink-fg);
        }
        .tl-desc {
          font-size: 15px;
          line-height: 1.55;
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
    <section className="section section--ink" data-screen-label="06 Cases">
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
          border-bottom: 1px solid var(--ink-line);
        }
        .cases-tab {
          padding: 10px 16px;
          border: 1px solid var(--ink-line);
          border-radius: 999px;
          font-size: 13px;
          color: var(--ink-fg-mute);
          display: inline-flex; align-items: center; gap: 8px;
          transition: all .25s var(--ease);
        }
        .cases-tab:hover { color: var(--ink-fg); border-color: var(--ink-fg-dim); }
        .cases-tab.is-on {
          background: var(--ink-fg);
          color: var(--ink-0);
          border-color: var(--ink-fg);
        }
        .cases-tab-count {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          background: oklch(0.22 0.018 270);
          color: var(--ink-fg-mute);
        }
        .cases-tab.is-on .cases-tab-count { background: oklch(0.85 0.005 270); color: var(--ink-0); }

        .cases-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
          border-top: 1px solid var(--ink-line);
        }
        @media (max-width: 800px) { .cases-grid { grid-template-columns: 1fr; } }
        .case-card {
          padding: 32px;
          border-right: 1px solid var(--ink-line);
          border-bottom: 1px solid var(--ink-line);
          position: relative;
          animation: rise .5s var(--ease) both;
          transition: background .3s;
        }
        .case-card:nth-child(2n) { border-right: 0; }
        @media (max-width: 800px) { .case-card { border-right: 0; } }
        .case-card:hover { background: var(--ink-1); }
        .case-card-top { margin-bottom: 32px; }
        .case-cat {
          font-size: 10px;
          letter-spacing: .14em;
          color: var(--ink-fg-dim);
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .case-q {
          font-size: 16px;
          color: var(--ink-fg);
          line-height: 1.4;
          font-style: italic;
          max-width: 32ch;
        }
        .case-result { display: flex; align-items: baseline; gap: 16px; }
        .case-r {
          font-size: 56px;
          font-weight: 500;
          letter-spacing: -0.04em;
          color: var(--accent);
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
    <section className="section section--ink-1" data-screen-label="08 Pricing">
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
                  <span className="plan-price-num display" style={{ fontSize: 56 }}>Custom</span>
                ) : (
                  <>
                    <span className="plan-price-cur mono">USD</span>
                    <span className="plan-price-num display">{p.p}</span>
                    <span className="plan-price-per mono">{p.per}</span>
                  </>
                )}
              </div>
              <button className={`plan-cta ${p.highlight ? "plan-cta--hl" : ""}`}>
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
        .pricing-sub { color: var(--ink-fg-mute); font-size: 16px; }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: stretch;
        }
        @media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr; } }
        .plan {
          background: var(--ink-0);
          border: 1px solid var(--ink-line);
          border-radius: var(--r-lg);
          padding: 36px 30px;
          display: flex; flex-direction: column;
          position: relative;
          transition: all .3s var(--ease);
        }
        .plan:hover { border-color: var(--ink-fg-dim); }
        .plan--hl {
          background: linear-gradient(180deg,
            oklch(0.18 0.020 270) 0%,
            oklch(0.14 0.016 270) 100%);
          border: 1px solid oklch(0.68 0.22 var(--accent-h) / 0.5);
          box-shadow: 0 0 0 1px oklch(0.68 0.22 var(--accent-h) / 0.2),
                      0 30px 60px -20px oklch(0 0 0 / 0.5);
          transform: translateY(-8px);
        }
        .plan-tag {
          position: absolute;
          top: -10px; left: 30px;
          font-size: 10px;
          letter-spacing: .14em;
          padding: 5px 10px;
          background: var(--accent);
          color: var(--accent-fg);
          border-radius: 999px;
          font-weight: 600;
        }
        .plan-name {
          font-size: 22px; font-weight: 500;
          color: var(--ink-fg); margin-bottom: 6px;
        }
        .plan-desc {
          font-size: 13px;
          color: var(--ink-fg-mute);
          margin-bottom: 28px;
        }
        .plan-price {
          display: flex; align-items: baseline; gap: 4px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--ink-line);
        }
        .plan-price-cur { color: var(--accent); font-size: 13px; font-weight: 600; letter-spacing: 0.16em; align-self: flex-start; margin-top: 14px; padding: 3px 7px; border: 1px solid var(--accent); border-radius: 4px; background: var(--accent-soft); }
        .plan-price-num { font-size: 56px; font-weight: 500; letter-spacing: -0.04em; line-height: 1; color: var(--ink-fg); }
        .plan-price-per { color: var(--ink-fg-dim); font-size: 12px; margin-left: 4px; }
        .plan-cta {
          width: 100%;
          padding: 14px 20px;
          border-radius: 999px;
          background: oklch(0.22 0.018 270);
          color: var(--ink-fg);
          font-size: 14px;
          font-weight: 500;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          margin-bottom: 24px;
          transition: all .25s var(--ease);
        }
        .plan-cta:hover { background: oklch(0.28 0.020 270); }
        .plan-cta--hl { background: var(--accent); color: var(--accent-fg); }
        .plan-cta--hl:hover { transform: translateY(-1px); box-shadow: 0 8px 24px var(--accent-soft); background: var(--accent); }
        .plan-cta .arr { transition: transform .25s var(--ease); }
        .plan-cta:hover .arr { transform: translateX(3px); }
        .plan-feats { display: flex; flex-direction: column; gap: 12px; }
        .plan-feat {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; color: var(--ink-fg-mute);
          line-height: 1.4;
        }
        .plan-feat-icon {
          color: var(--accent);
          font-weight: 700;
          flex-shrink: 0;
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────── Final CTA */
function FinalCTA({ copy }) {
  return (
    <section className="section section--lg final-cta" data-screen-label="09 Final CTA">
      <div className="final-cta-bg"/>
      <div className="container container--narrow" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div className="eyebrow eyebrow-dot" style={{ marginBottom: 24 }}>{copy.tag}</div>
        <h2 className="h-display" style={{ fontSize: "clamp(56px, 9vw, 144px)", marginBottom: 32, lineHeight: 0.95 }}>
          {copy.pre} <span className="shimmer" style={{ display: "inline-block" }}>{copy.accent}</span>
        </h2>
        <div className="final-sub">{copy.sub}</div>
        <button className="btn btn--accent" style={{ padding: "20px 36px", fontSize: 16 }}>
          {copy.cta}<span className="arr">→</span>
        </button>
        <div className="final-meta mono">{copy.meta}</div>
      </div>
      <style>{`
        .final-cta { position: relative; overflow: hidden; }
        .final-cta-bg {
          position: absolute; inset: -10%;
          background:
            radial-gradient(ellipse at 50% 70%,
              oklch(0.68 0.22 var(--accent-h) / 0.18) 0%,
              transparent 50%),
            radial-gradient(ellipse at 20% 30%,
              oklch(0.78 0.18 calc(var(--accent-h) - 80) / 0.10) 0%,
              transparent 60%);
          filter: blur(40px);
        }
        .final-sub {
          font-size: 18px;
          line-height: 1.5;
          color: var(--ink-fg-mute);
          max-width: 56ch;
          margin: 0 auto 40px;
        }
        .final-meta {
          font-size: 11px;
          letter-spacing: .14em;
          color: var(--ink-fg-dim);
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
          background: var(--ink-0);
          border-top: 1px solid var(--ink-line);
          padding: 80px 48px 40px;
        }
        @media (max-width: 720px) { .site-footer { padding: 60px 24px 32px; } }
        .footer-top {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 64px;
          padding-bottom: 64px;
          border-bottom: 1px solid var(--ink-line);
        }
        @media (max-width: 900px) { .footer-top { grid-template-columns: 1fr; gap: 32px; } }
        .footer-mark {
          font-size: 36px;
          font-weight: 500;
          letter-spacing: -0.04em;
          line-height: 0.95;
          margin-bottom: 18px;
        }
        .footer-tag {
          font-size: 14px;
          color: var(--ink-fg-mute);
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
          color: var(--ink-fg-dim);
          letter-spacing: .14em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .footer-link {
          color: var(--ink-fg-mute);
          text-decoration: none;
          font-size: 13px;
          transition: color .2s;
        }
        .footer-link:hover { color: var(--accent); }
        .footer-bot {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 32px;
          gap: 24px;
          flex-wrap: wrap;
        }
        .footer-copy { font-size: 11px; color: var(--ink-fg-dim); letter-spacing: .04em; }
        .footer-engines { display: flex; gap: 8px; }
      `}</style>
    </footer>
  );
}

Object.assign(window, { Marquee, Metrics, Pillars, Timeline, Cases, Pricing, FinalCTA, Footer });
