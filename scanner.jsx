/* AGENTIC FIRST — Domain Scanner (interactive)
   Types domain → animates 4 parallel agent queries → returns visibility score.
   Optionally calls window.claude.complete for a generated audit summary. */

const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

function Scanner({ copy, useAI }) {
  const [domain, setDomain] = useStateS("");
  const [stage, setStage] = useStateS("idle"); // idle | running | done
  const [progress, setProgress] = useStateS(0);
  const [score, setScore] = useStateS(0);
  const [breakdown, setBreakdown] = useStateS([0,0,0,0]);
  const [verdict, setVerdict] = useStateS("");
  const [agentStates, setAgentStates] = useStateS([0,0,0,0]); // 0 idle, 1 querying, 2 done

  const ENGS = window.ENGINES.slice(0,4);

  // Deterministic-ish hash of domain so result is consistent per domain
  function hashScore(d) {
    let h = 0;
    for (let i = 0; i < d.length; i++) h = ((h << 5) - h) + d.charCodeAt(i);
    const base = Math.abs(h % 60) + 8; // 8-67
    return base;
  }

  async function run() {
    if (!domain || stage === "running") return;
    setStage("running");
    setProgress(0);
    setScore(0);
    setAgentStates([0,0,0,0]);

    // sequence agents
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 380));
      setAgentStates((s) => { const n = [...s]; n[i] = 1; return n; });
      await new Promise(r => setTimeout(r, 700 + Math.random()*500));
      setAgentStates((s) => { const n = [...s]; n[i] = 2; return n; });
      setProgress((i+1)/4);
    }

    // compute score
    const target = hashScore(domain.toLowerCase());
    const bd = [
      Math.max(2, target - 20 + Math.floor(Math.random()*15)),
      target,
      Math.max(2, target - 10 + Math.floor(Math.random()*20)),
      Math.max(2, target + Math.floor(Math.random()*15)),
    ].map(x => Math.min(98, x));

    // animate score
    const final = Math.round(bd.reduce((a,b)=>a+b,0)/4);
    let cur = 0;
    const id = setInterval(() => {
      cur += 2;
      if (cur >= final) { cur = final; clearInterval(id); }
      setScore(cur);
    }, 22);

    setBreakdown(bd);
    const v = copy.verdicts[Math.min(2, Math.floor((100-final)/30))];
    setVerdict(v);
    setStage("done");
  }

  function reset() {
    setDomain("");
    setStage("idle");
    setProgress(0);
    setScore(0);
    setVerdict("");
    setAgentStates([0,0,0,0]);
  }

  const scoreColor = score < 35 ? "oklch(0.65 0.20 25)"
                   : score < 65 ? "oklch(0.78 0.18 80)"
                   : "oklch(0.72 0.18 var(--accent-h))";

  return (
    <div className="scanner-shell">
      {/* terminal frame */}
      <div className="scanner-window">
        <div className="scanner-chrome">
          <div className="scanner-dots">
            <span/><span/><span/>
          </div>
          <div className="scanner-title mono">agentic.first / scanner — v2.4</div>
          <div className="scanner-status mono">
            <span className="dot-live"/> {stage === "running" ? "RUNNING" : stage === "done" ? "DONE" : "READY"}
          </div>
        </div>

        {/* input row */}
        <div className="scanner-input-row">
          <div className="scanner-prompt mono">$</div>
          <div className="scanner-cmd mono">scan</div>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder={copy.placeholder}
            disabled={stage === "running"}
            className="scanner-input mono"
          />
          {stage === "done" ? (
            <button onClick={reset} className="scanner-go">{copy.retry} ↻</button>
          ) : (
            <button onClick={run} disabled={!domain || stage === "running"} className="scanner-go">
              {copy.cta} →
            </button>
          )}
        </div>

        {/* agents row */}
        {stage !== "idle" && (
          <div className="scanner-agents">
            <div className="scanner-section-label mono">{copy.analyzing.toUpperCase()}</div>
            <div className="scanner-agents-grid">
              {ENGS.map((e, i) => (
                <div key={e.id} className={`scanner-agent state-${agentStates[i]}`}>
                  <window.EngineMark e={e} size={26} />
                  <div className="scanner-agent-info">
                    <div className="scanner-agent-name">{e.name}</div>
                    <div className="scanner-agent-state mono">
                      {agentStates[i] === 0 && "queued…"}
                      {agentStates[i] === 1 && <><span className="qbar"/> querying…</>}
                      {agentStates[i] === 2 && <><span className="ok">✓</span> response captured</>}
                    </div>
                  </div>
                  <div className="scanner-agent-mark mono">
                    {agentStates[i] === 2 ? `${Math.round(breakdown[i] || 0)}` : "—"}
                    {agentStates[i] === 2 && <span className="of">/100</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* result */}
        {stage === "done" && (
          <div className="scanner-result">
            <div className="scanner-result-grid">
              <div className="scanner-score-block">
                <div className="scanner-score-label mono">{copy.score.toUpperCase()}</div>
                <div className="scanner-score-num display" style={{ color: scoreColor }}>
                  {score}<span className="of-mute">/100</span>
                </div>
                <div className="scanner-verdict">{verdict}</div>
              </div>
              <div className="scanner-breakdown">
                {copy.breakdown.map((label, i) => (
                  <div key={label} className="scanner-bar-row">
                    <div className="scanner-bar-label mono">{label}</div>
                    <div className="scanner-bar-track">
                      <div className="scanner-bar-fill" style={{
                        width: `${breakdown[i]}%`,
                        background: scoreColor,
                      }}/>
                    </div>
                    <div className="scanner-bar-val mono">{breakdown[i]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scanner-shell { width: 100%; max-width: 920px; margin: 0 auto; }
        .scanner-window {
          background: oklch(0.14 0.016 270);
          border: 1px solid var(--ink-line);
          border-radius: var(--r-lg);
          overflow: hidden;
          box-shadow: 0 40px 100px -30px oklch(0 0 0 / 0.6),
                      0 0 0 1px oklch(0.30 0.020 270 / 0.3);
        }
        .scanner-chrome {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--ink-line);
          background: oklch(0.18 0.018 270);
        }
        .scanner-dots { display: flex; gap: 6px; }
        .scanner-dots span {
          width: 10px; height: 10px; border-radius: 50%;
          background: oklch(0.30 0.020 270);
        }
        .scanner-title { font-size: 11px; color: var(--ink-fg-dim); letter-spacing: .04em; }
        .scanner-status {
          margin-left: auto;
          font-size: 10px;
          color: var(--ink-fg-mute);
          letter-spacing: .12em;
          display: flex; align-items: center; gap: 6px;
        }
        .dot-live { width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
          animation: pulse 1.2s ease-in-out infinite; }

        .scanner-input-row {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 18px;
          border-bottom: 1px solid var(--ink-line);
          background: oklch(0.13 0.016 270);
        }
        .scanner-prompt { color: var(--accent); font-size: 16px; font-weight: 700; }
        .scanner-cmd { color: var(--ink-fg-mute); font-size: 14px; }
        .scanner-input {
          flex: 1;
          background: transparent;
          border: 0;
          outline: 0;
          color: var(--ink-fg);
          font-size: 16px;
          padding: 6px 4px;
          caret-color: var(--accent);
        }
        .scanner-input::placeholder { color: var(--ink-fg-dim); }
        .scanner-go {
          padding: 9px 16px;
          background: var(--accent);
          color: var(--accent-fg);
          font-family: var(--f-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .04em;
          border-radius: 6px;
          transition: transform .2s var(--ease), box-shadow .2s;
        }
        .scanner-go:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px var(--accent-soft);
        }
        .scanner-go:disabled { opacity: .4; cursor: not-allowed; }

        .scanner-agents { padding: 18px 18px 10px; }
        .scanner-section-label {
          font-size: 10px;
          color: var(--ink-fg-dim);
          letter-spacing: .14em;
          margin-bottom: 14px;
        }
        .scanner-agents-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 600px) { .scanner-agents-grid { grid-template-columns: 1fr; } }
        .scanner-agent {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          background: oklch(0.16 0.016 270);
          border: 1px solid var(--ink-line);
          border-radius: 10px;
          transition: all .3s var(--ease);
        }
        .scanner-agent.state-1 {
          border-color: var(--accent);
          background: linear-gradient(to right, var(--accent-soft), oklch(0.16 0.016 270));
        }
        .scanner-agent.state-2 {
          opacity: .85;
        }
        .scanner-agent-info { flex: 1; min-width: 0; }
        .scanner-agent-name { font-size: 13px; color: var(--ink-fg); margin-bottom: 2px; }
        .scanner-agent-state {
          font-size: 11px;
          color: var(--ink-fg-mute);
          display: flex; align-items: center; gap: 6px;
        }
        .qbar {
          display: inline-block; width: 18px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          background-size: 200% 100%;
          animation: qbar 1s linear infinite;
        }
        @keyframes qbar { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .ok { color: var(--accent); font-weight: 700; }
        .scanner-agent-mark {
          font-family: var(--f-mono);
          font-size: 18px;
          font-weight: 600;
          color: var(--ink-fg);
          font-variant-numeric: tabular-nums;
        }
        .of { font-size: 10px; color: var(--ink-fg-dim); margin-left: 2px; }

        .scanner-result {
          padding: 22px 18px;
          background: oklch(0.16 0.016 270);
          animation: rise .5s var(--ease);
        }
        .scanner-result-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 720px) {
          .scanner-result-grid { grid-template-columns: 1fr; gap: 22px; }
        }
        .scanner-score-label { font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .14em; }
        .scanner-score-num {
          font-size: 96px;
          font-weight: 500;
          letter-spacing: -0.04em;
          line-height: 1;
          margin: 6px 0 12px;
        }
        .of-mute { font-size: 24px; color: var(--ink-fg-dim); margin-left: 4px; font-family: var(--f-mono); }
        .scanner-verdict {
          font-size: 14px;
          line-height: 1.5;
          color: var(--ink-fg);
          font-family: var(--f-display);
        }
        .scanner-breakdown { display: flex; flex-direction: column; gap: 14px; padding-top: 8px; }
        .scanner-bar-row {
          display: grid;
          grid-template-columns: 160px 1fr 40px;
          gap: 12px;
          align-items: center;
        }
        @media (max-width: 720px) { .scanner-bar-row { grid-template-columns: 130px 1fr 32px; } }
        .scanner-bar-label { font-size: 11px; color: var(--ink-fg-mute); }
        .scanner-bar-track {
          height: 4px; background: oklch(0.20 0.018 270); border-radius: 2px; overflow: hidden;
        }
        .scanner-bar-fill {
          height: 100%;
          transition: width 1.2s cubic-bezier(.2,.7,.2,1);
        }
        .scanner-bar-val { font-size: 11px; color: var(--ink-fg); text-align: right; font-variant-numeric: tabular-nums; }

        @keyframes rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

window.Scanner = Scanner;
