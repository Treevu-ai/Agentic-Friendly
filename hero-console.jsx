/* AGENTIC FIRST — Hero with simulated AI consultation
   Renders an animated console showing an AI agent (Claude/GPT/Perplexity/Gemini)
   answering a customer question and citing [YOUR BRAND]. */

const { useState, useEffect, useRef } = React;

// Engine logos as letterforms (placeholders, no real branding)
const ENGINES = [
  { id: "claude", name: "Claude", mark: "C", hue: 28, tone: "warm" },
  { id: "ppx", name: "Perplexity", mark: "P", hue: 195, tone: "cool" },
  { id: "gpt", name: "ChatGPT", mark: "G", hue: 152, tone: "green" },
  { id: "gemini", name: "Gemini", mark: "✦", hue: 240, tone: "blue" },
  { id: "grok", name: "Grok", mark: "X", hue: 0, tone: "neutral" },
  { id: "copilot", name: "Copilot", mark: "◇", hue: 215, tone: "blue" },
];

function EngineMark({ e, size = 22 }) {
  const bg = e.tone === "warm" ? `oklch(0.92 0.04 ${e.hue})`
    : e.tone === "neutral" ? `oklch(0.18 0.02 270)`
    : `oklch(0.94 0.06 ${e.hue})`;
  const fg = e.tone === "neutral" ? `oklch(0.96 0 0)` : `oklch(0.30 0.18 ${e.hue})`;
  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: bg, color: fg,
      display: "grid", placeItems: "center",
      fontFamily: "var(--f-mono)",
      fontSize: size * 0.55, fontWeight: 700,
      flexShrink: 0,
      border: "1px solid oklch(0.30 0.020 270 / 0.4)",
    }}>{e.mark}</div>
  );
}

function useTyping(text, speed = 22) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

function HeroConsole({ copy }) {
  const [engineIdx, setEngineIdx] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing | thinking | answer
  const engine = ENGINES[engineIdx];
  const prompt = copy.prompts[promptIdx];

  const typed = useTyping(phase === "typing" ? prompt : prompt, 32);

  useEffect(() => {
    if (phase === "typing") {
      if (typed === prompt) {
        const t = setTimeout(() => setPhase("thinking"), 600);
        return () => clearTimeout(t);
      }
    } else if (phase === "thinking") {
      const t = setTimeout(() => setPhase("answer"), 1500);
      return () => clearTimeout(t);
    } else if (phase === "answer") {
      const t = setTimeout(() => {
        // cycle to next prompt + engine
        setPromptIdx((i) => (i + 1) % copy.prompts.length);
        setEngineIdx((i) => (i + 1) % 4);
        setPhase("typing");
      }, 4200);
      return () => clearTimeout(t);
    }
  }, [phase, typed, prompt, copy.prompts.length]);

  return (
    <div className="hero-console" style={{
      background: "linear-gradient(180deg, oklch(0.19 0.02 270 / 0.96), oklch(0.13 0.018 270 / 0.98))",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      "--ink-fg": "rgba(255,255,255,0.98)",
      "--ink-fg-mute": "rgba(255,255,255,0.9)",
      "--ink-fg-dim": "rgba(255,255,255,0.72)",
      "--ink-line": "rgba(255,255,255,0.24)",
      border: "1px solid var(--ink-line)",
      borderRadius: "var(--r-lg)",
      overflow: "hidden",
      fontFamily: "var(--f-mono)",
      fontSize: 13,
      width: "100%",
      maxWidth: 540,
      boxShadow: "0 30px 80px -20px oklch(0 0 0 / 0.55), 0 0 0 1px oklch(0.42 0.03 270 / 0.32)",
    }}>
      {/* console chrome */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px",
        borderBottom: "1px solid var(--ink-line)",
        background: "oklch(0.22 0.022 270 / 0.96)",
      }}>
        <EngineMark e={engine} size={20} />
        <div style={{ fontSize: 12, color: "var(--ink-fg-mute)" }}>
          {engine.name} <span style={{ color: "var(--ink-fg-dim)" }}>· chat session</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "oklch(0.30 0.020 270)",
            }}/>
          ))}
        </div>
      </div>

      {/* user message */}
      <div style={{
        padding: "20px 18px 10px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
      }}>
        <div style={{ fontSize: 10, color: "var(--ink-fg-dim)", letterSpacing: ".1em", marginBottom: 6 }}>
          USER
        </div>
        <div style={{ color: "var(--ink-fg)", lineHeight: 1.5, minHeight: 22 }}>
          {typed}
          {phase === "typing" && <span style={{
            display: "inline-block", width: 8, height: 14, marginLeft: 2,
            background: "var(--accent)", verticalAlign: "middle",
            animation: "blink 1s step-end infinite",
          }}/>}
        </div>
      </div>

      {/* response area */}
        <div style={{
          padding: "12px 18px 22px",
          borderTop: "1px solid var(--ink-line)",
          background: "linear-gradient(180deg, oklch(0.17 0.018 270 / 0.98), oklch(0.14 0.018 270 / 0.99))",
          minHeight: 140,
        }}>
        <div style={{
          fontSize: 10, color: "var(--ink-fg-dim)", letterSpacing: ".1em",
          marginBottom: 8, display: "flex", alignItems: "center", gap: 8,
        }}>
          <EngineMark e={engine} size={14} />
          {engine.name.toUpperCase()}
        </div>

        {phase === "thinking" && (
          <div style={{ color: "var(--ink-fg-mute)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent)",
              animation: "pulse-fade 1.2s ease-in-out infinite",
            }}/>
            {copy.thinking}
            <span className="dot-anim">···</span>
          </div>
        )}

        {phase === "answer" && (
          <AnswerBlock engine={engine} copy={copy} />
        )}

        {phase === "typing" && (
          <div style={{ color: "var(--ink-fg-dim)", fontStyle: "italic" }}>—</div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        @keyframes pulse-fade { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        .dot-anim { animation: dots 1.2s steps(4, end) infinite; display: inline-block; min-width: 18px; }
        @keyframes dots {
          0%, 20% { content: ""; }
          40% { content: "·"; }
          60% { content: "··"; }
          80%, 100% { content: "···"; }
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

function AnswerBlock({ engine, copy }) {
  // Split copy.citation around the [YOUR BRAND] token (works in both ES and EN)
  const cite = copy.citation || "";
  const parts = cite.split("[YOUR BRAND]");
  const pre = parts[0] || "";
  const post = parts[1] || "";

  return (
    <div style={{ animation: "rise .4s var(--ease)" }}>
      <div style={{ color: "var(--ink-fg)", lineHeight: 1.55, marginBottom: 14 }}>
        <span style={{ color: "var(--ink-fg-mute)" }}>{pre}</span>
        <span className="brand-cite" style={{
          background: "color-mix(in srgb, var(--accent-soft) 75%, white 25%)",
          color: "var(--ink-fg)",
          padding: "2px 8px",
          borderRadius: 4,
          fontWeight: 600,
          boxShadow: "0 0 0 1px oklch(0.76 0.24 var(--accent-h) / 0.55)",
          position: "relative",
        }}>
          [YOUR BRAND]
          <sup style={{
            color: "var(--accent)",
            marginLeft: 3, fontSize: 9, fontWeight: 700,
          }}>1,2</sup>
        </span>
        {post && <span style={{ color: "var(--ink-fg-mute)" }}>{post}</span>}
      </div>

      {/* sources */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6,
        paddingTop: 10, borderTop: "1px dashed var(--ink-line)",
      }}>
        <div style={{ fontSize: 10, color: "var(--ink-fg-dim)", letterSpacing: ".1em", marginRight: 4, alignSelf: "center" }}>
          {copy.sources}
        </div>
        {["yourbrand.com", "wikipedia.org", "reddit.com/r/saas", "techcrunch.com"].map((s, i) => (
          <span key={s} style={{
            fontSize: 10, padding: "3px 7px",
            border: "1px solid var(--ink-line)",
            borderRadius: 4,
            color: i === 0 ? "var(--accent)" : "var(--ink-fg-mute)",
            background: i === 0 ? "color-mix(in srgb, var(--accent-soft) 72%, white 28%)" : "rgba(255,255,255,0.04)",
          }}>
            <span style={{ marginRight: 4, opacity: .6 }}>{i+1}</span>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

window.HeroConsole = HeroConsole;
window.ENGINES = ENGINES;
window.EngineMark = EngineMark;
