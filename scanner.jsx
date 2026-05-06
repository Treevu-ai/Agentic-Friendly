/* AGENTIC FIRST — GEO Score Quiz v3
   5-question diagnostic → score calculation → jsPDF download
   Bilingual via copy.scanner.questions */

const { useState: useQ, useEffect: useQE } = React;

function Scanner({ copy }) {
  const [company, setCompany] = useQ("");
  const [stage, setStage] = useQ("intro"); // intro | quiz | calculating | done
  const [qIdx, setQIdx] = useQ(0);
  const [answers, setAnswers] = useQ([]);   // numeric scores per question
  const [selected, setSelected] = useQ(null); // option index for current Q
  const [scores, setScores] = useQ(null);
  const [pdfBusy, setPdfBusy] = useQ(false);

  const questions = copy.questions || [];
  const total = questions.length;

  // ─── score model ───────────────────────────────────────────
  function computeScores(a) {
    const technical  = Math.round((a[0] + a[4]) / 2);
    const content    = a[1];
    const authority  = a[2];
    const agentic    = a[3];
    const overall    = Math.round((technical + content + authority + agentic) / 4);
    return { technical, content, authority, agentic, overall,
             dims: [technical, content, authority, agentic] };
  }

  // ─── flow ──────────────────────────────────────────────────
  function startQuiz() {
    if (!company.trim()) return;
    setStage("quiz"); setQIdx(0); setAnswers([]); setSelected(null);
  }

  function handleNext() {
    if (selected === null) return;
    const val = questions[qIdx].opts[selected].v;
    const newAns = [...answers, val];
    setAnswers(newAns);
    setSelected(null);
    if (qIdx + 1 >= total) {
      setStage("calculating");
      setTimeout(() => { setScores(computeScores(newAns)); setStage("done"); }, 2600);
    } else {
      setQIdx(qIdx + 1);
    }
  }

  function reset() {
    setCompany(""); setStage("intro"); setQIdx(0);
    setAnswers([]); setSelected(null); setScores(null);
  }

  // ─── PDF generation ────────────────────────────────────────
  function downloadPDF() {
    if (!window.jspdf || !scores) return;
    setPdfBusy(true);
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210, M = 20, CW = 170;

      function rgb(hex) {
        return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
      }
      const INK    = rgb("#0d0e14");
      const ACCENT = rgb("#9f5afd");
      const MUTE   = rgb("#888899");
      const LIGHT  = rgb("#f4f4f8");
      const WARN   = rgb("#d4a44a");
      const DANGER = rgb("#e05c5c");

      const scoreRgb = scores.overall < 35 ? DANGER : scores.overall < 65 ? WARN : ACCENT;

      // ── background ──
      doc.setFillColor(...LIGHT);
      doc.rect(0, 0, 210, 297, "F");

      // ── header band ──
      doc.setFillColor(...INK);
      doc.rect(0, 0, 210, 50, "F");

      // logo
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("AGENTIC FIRST", M, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...MUTE);
      doc.text("GEO SCORE REPORT  ·  SINAPSIS INNOVADORA S.A.C.", M, 28);

      // date right
      const dateStr = new Date().toLocaleDateString("es-PE", { day:"2-digit", month:"short", year:"numeric" });
      doc.setTextColor(170, 170, 190);
      doc.text(dateStr, W - M, 20, { align: "right" });

      // company name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text(company, M, 42);

      // accent stripe
      doc.setFillColor(...ACCENT);
      doc.rect(0, 50, 210, 3, "F");

      let y = 68;

      // ── overall score ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...MUTE);
      doc.text("SCORE GLOBAL · GEO + AGENTIC READINESS", M, y - 4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(80);
      doc.setTextColor(...scoreRgb);
      doc.text(`${scores.overall}`, M, y + 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(20);
      doc.setTextColor(...MUTE);
      doc.text("/100", M + 58, y + 22);

      // verdict
      const vIdx = scores.overall < 35 ? 0 : scores.overall < 65 ? 1 : 2;
      const verdict = (copy.verdicts || [])[vIdx] || "";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(verdict, M, y + 34);

      y += 50;

      // divider
      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.4);
      doc.line(M, y, W - M, y);
      y += 12;

      // ── dimension breakdown ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text("PUNTUACIÓN POR DIMENSIÓN", M, y);
      y += 8;

      const dimLabels = copy.breakdown || ["Técnico", "Contenido", "Autoridad", "Agéntico"];
      const barW = CW - 60;

      scores.dims.forEach((val, i) => {
        const c = val < 35 ? DANGER : val < 65 ? WARN : ACCENT;
        const fill = (val / 100) * barW;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(dimLabels[i], M, y + 4);

        // track
        doc.setFillColor(210, 210, 225);
        doc.roundedRect(M + 50, y, barW, 5, 2, 2, "F");
        // fill
        if (fill > 0) { doc.setFillColor(...c); doc.roundedRect(M + 50, y, fill, 5, 2, 2, "F"); }
        // label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...c);
        doc.text(`${val}`, W - M, y + 4, { align: "right" });

        y += 13;
      });

      y += 4;

      // divider
      doc.setDrawColor(220, 220, 230);
      doc.line(M, y, W - M, y);
      y += 12;

      // ── recommendations ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text("PRIORIDADES DE ACCIÓN", M, y);
      y += 10;

      const RECS = [
        { key: "técnico",    val: scores.technical,
          txt: "Implementa schema.org JSON-LD: Organization, Service y FAQPage. Los motores IA leen datos estructurados antes que texto plano." },
        { key: "contenido",  val: scores.content,
          txt: "Reestructura tu contenido en formato Q&A con preguntas reales de clientes. Es el formato más citable por modelos generativos." },
        { key: "autoridad",  val: scores.authority,
          txt: "Aumenta menciones externas: Google Business Profile, directorios del sector y cobertura en medios relevantes de tu industria." },
        { key: "agéntico",   val: scores.agentic,
          txt: "Prueba tu visibilidad en ChatGPT, Claude y Perplexity con prompts de tu cliente ideal y documenta los gaps encontrados." },
        { key: "téc. ux",    val: Math.round((scores.technical * 0.6 + scores.content * 0.4)),
          txt: "Optimiza Core Web Vitals. Un sitio lento limita la capacidad de los crawlers de IA para indexar y citar tu contenido." },
      ];

      [...RECS].sort((a, b) => a.val - b.val).slice(0, 3).forEach((r, i) => {
        // circle badge
        doc.setFillColor(...ACCENT);
        doc.circle(M + 4, y + 2, 4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(`${i + 1}`, M + 4, y + 4, { align: "center" });

        // dim label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...INK);
        doc.text(r.key.toUpperCase(), M + 12, y + 1);

        // rec text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 80);
        const lines = doc.splitTextToSize(r.txt, CW - 14);
        doc.text(lines, M + 12, y + 7);
        y += 8 + lines.length * 4.5 + 4;
      });

      y += 4;

      // ── CTA footer box ──
      doc.setFillColor(...INK);
      doc.roundedRect(M, y, CW, 24, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Siguiente paso: auditoría completa + implementación en 4 semanas", M + 8, y + 9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...MUTE);
      doc.text("agentic-friendly.vercel.app  ·  acuba0103@gmail.com", M + 8, y + 18);

      y += 32;

      // fine print
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTE);
      doc.text(
        "Reporte diagnóstico inicial basado en las respuestas proporcionadas. Los resultados son indicativos y no constituyen una auditoría técnica completa.",
        M, y, { maxWidth: CW }
      );

      doc.save(`GEO-Score-${company.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch(err) {
      console.error("jsPDF error:", err);
    }
    setPdfBusy(false);
  }

  // ─── color helper ──────────────────────────────────────────
  const scoreColor = scores
    ? (scores.overall < 35 ? "oklch(0.65 0.20 25)"
    : scores.overall < 65 ? "oklch(0.78 0.18 80)"
    : "var(--accent)")
    : "var(--accent)";

  const statusLabel = stage === "quiz" ? `Q ${qIdx+1}/${total}`
    : stage === "calculating" ? "PROCESSING"
    : stage === "done" ? "DONE" : "READY";

  // ─── render ────────────────────────────────────────────────
  return (
    <div className="scanner-shell">
      <div className="scanner-window">

        {/* chrome bar */}
        <div className="scanner-chrome">
          <div className="scanner-dots"><span/><span/><span/></div>
          <div className="scanner-title mono">agentic.first / geo-score — v3.0</div>
          <div className="scanner-status mono">
            <span className="dot-live"/>{statusLabel}
          </div>
        </div>

        {/* ─── INTRO ─── */}
        {stage === "intro" && (
          <div className="sq-intro">
            <div className="sq-intro-label mono">
              {copy.inputLabel || "Empresa o dominio"}
            </div>
            <div className="sq-input-row">
              <span className="scanner-prompt mono">$</span>
              <input
                className="scanner-input mono"
                value={company}
                onChange={e => setCompany(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startQuiz()}
                placeholder={copy.inputPlaceholder || "tuempresa.com"}
              />
              <button className="scanner-go" onClick={startQuiz} disabled={!company.trim()}>
                {copy.startCta || "Iniciar"} →
              </button>
            </div>
            <div className="sq-intro-meta mono">
              {total} preguntas · ~2 min · {copy.downloadCta || "Reporte PDF incluido"}
            </div>
          </div>
        )}

        {/* ─── QUIZ ─── */}
        {stage === "quiz" && (
          <div className="sq-quiz">
            <div className="sq-progress-track">
              <div className="sq-progress-fill" style={{ width: `${(qIdx / total) * 100}%` }}/>
            </div>
            <div className="sq-q-meta mono">
              <span className="sq-q-dim">{(questions[qIdx]?.dim || "").toUpperCase()}</span>
              <span className="sq-q-num">{qIdx + 1} / {total}</span>
            </div>
            <div className="sq-question">{questions[qIdx]?.q}</div>
            <div className="sq-options">
              {(questions[qIdx]?.opts || []).map((opt, i) => (
                <button
                  key={i}
                  className={`sq-opt ${selected === i ? "is-sel" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  <span className="sq-opt-mark">{selected === i ? "●" : "○"}</span>
                  <span>{opt.l}</span>
                </button>
              ))}
            </div>
            <div className="sq-quiz-footer">
              <button className="scanner-go" onClick={handleNext} disabled={selected === null}>
                {qIdx + 1 < total ? "Siguiente →" : "Ver resultado →"}
              </button>
            </div>
          </div>
        )}

        {/* ─── CALCULATING ─── */}
        {stage === "calculating" && (
          <div className="sq-calc">
            <div className="sq-calc-inner">
              {["Claude", "ChatGPT", "Perplexity", "Gemini"].map((e, i) => (
                <div key={e} className="sq-calc-row mono" style={{ animationDelay: `${i * 0.18}s` }}>
                  <span className="qbar"/>
                  <span className="sq-calc-eng">{e}</span>
                  <span className="sq-calc-label">{copy.calculating || "Analizando"}…</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── DONE ─── */}
        {stage === "done" && scores && (
          <div className="sq-result">
            <div className="sq-result-header">
              <div>
                <div className="scanner-score-label mono">
                  {(copy.score || "GEO SCORE").toUpperCase()}
                </div>
                <div className="scanner-score-num display" style={{ color: scoreColor }}>
                  {scores.overall}<span className="of-mute">/100</span>
                </div>
                <div className="scanner-verdict">
                  {(copy.verdicts || [])[scores.overall < 35 ? 0 : scores.overall < 65 ? 1 : 2]}
                </div>
              </div>
              <div className="sq-company-tag mono">{company}</div>
            </div>

            <div className="scanner-breakdown">
              {(copy.breakdown || ["Técnico","Contenido","Autoridad","Agéntico"]).map((label, i) => (
                <div key={label} className="scanner-bar-row">
                  <div className="scanner-bar-label mono">{label}</div>
                  <div className="scanner-bar-track">
                    <div className="scanner-bar-fill" style={{
                      width: `${scores.dims[i]}%`,
                      background: scoreColor,
                    }}/>
                  </div>
                  <div className="scanner-bar-val mono">{scores.dims[i]}</div>
                </div>
              ))}
            </div>

            <div className="sq-actions">
              <button className="scanner-go sq-pdf-btn" onClick={downloadPDF} disabled={pdfBusy}>
                {pdfBusy ? "Generando…" : (copy.downloadCta || "Descargar Reporte PDF")} ↓
              </button>
              <button className="sq-reset" onClick={reset}>
                {copy.retry || "Nueva evaluación"} ↺
              </button>
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
        .scanner-dots span { width: 10px; height: 10px; border-radius: 50%; background: oklch(0.30 0.020 270); }
        .scanner-title { font-size: 11px; color: var(--ink-fg-dim); letter-spacing: .04em; }
        .scanner-status {
          margin-left: auto; font-size: 10px; color: var(--ink-fg-mute);
          letter-spacing: .12em; display: flex; align-items: center; gap: 6px;
        }
        .dot-live {
          width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
          animation: geo-pulse 1.2s ease-in-out infinite;
        }
        @keyframes geo-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(.8); } }

        .scanner-prompt { color: var(--accent); font-size: 16px; font-weight: 700; }
        .scanner-input {
          flex: 1; background: transparent; border: 0; outline: 0;
          color: var(--ink-fg); font-size: 16px; padding: 6px 4px; caret-color: var(--accent);
        }
        .scanner-input::placeholder { color: var(--ink-fg-dim); }
        .scanner-go {
          padding: 9px 16px; background: var(--accent); color: var(--accent-fg);
          font-family: var(--f-mono); font-size: 12px; font-weight: 600;
          letter-spacing: .04em; border-radius: 6px; white-space: nowrap;
          transition: transform .2s var(--ease), box-shadow .2s;
        }
        .scanner-go:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px var(--accent-soft); }
        .scanner-go:disabled { opacity: .4; cursor: not-allowed; }

        /* INTRO */
        .sq-intro { padding: 28px 22px 26px; }
        .sq-intro-label { font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .14em; margin-bottom: 12px; text-transform: uppercase; }
        .sq-input-row {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          background: oklch(0.13 0.016 270);
          border: 1px solid var(--ink-line); border-radius: 10px; margin-bottom: 14px;
        }
        .sq-intro-meta { font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .06em; }

        /* QUIZ */
        .sq-quiz { }
        .sq-progress-track { height: 3px; background: oklch(0.22 0.018 270); }
        .sq-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent-2), var(--accent)); transition: width .6s var(--ease); }
        .sq-q-meta { display: flex; justify-content: space-between; padding: 16px 22px 0; font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .12em; }
        .sq-q-dim { color: var(--accent); }
        .sq-question { font-size: clamp(17px, 2.2vw, 22px); font-weight: 500; color: var(--ink-fg); line-height: 1.35; padding: 14px 22px 20px; font-family: var(--f-display); }
        .sq-options { display: flex; flex-direction: column; gap: 8px; padding: 0 22px; }
        .sq-opt {
          display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px;
          background: oklch(0.16 0.016 270); border: 1px solid var(--ink-line);
          border-radius: 10px; text-align: left; font-size: 14px; color: var(--ink-fg-mute);
          transition: all .18s var(--ease); cursor: pointer; line-height: 1.4;
        }
        .sq-opt:hover { background: oklch(0.19 0.018 270); color: var(--ink-fg); border-color: var(--ink-fg-dim); }
        .sq-opt.is-sel { background: var(--accent-soft); border-color: oklch(0.68 0.22 var(--accent-h) / 0.6); color: var(--ink-fg); }
        .sq-opt-mark { color: var(--accent); font-size: 12px; flex-shrink: 0; margin-top: 2px; }
        .sq-quiz-footer { padding: 18px 22px 24px; display: flex; justify-content: flex-end; }

        /* CALCULATING */
        .sq-calc { padding: 48px 22px; min-height: 200px; display: flex; align-items: center; justify-content: center; }
        .sq-calc-inner { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 380px; }
        .sq-calc-row {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: var(--ink-fg-mute);
          animation: geo-rise .4s var(--ease) both;
        }
        .sq-calc-eng { color: var(--ink-fg); min-width: 90px; }
        .sq-calc-label { color: var(--ink-fg-dim); }
        .qbar { display: inline-block; width: 22px; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); background-size: 200% 100%; animation: qbar-slide 1s linear infinite; }
        @keyframes qbar-slide { from { background-position: 200% 0; } to { background-position: -200% 0; } }

        /* RESULT */
        .sq-result { padding: 24px 22px; animation: geo-rise .5s var(--ease); }
        .sq-result-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; flex-wrap: wrap; gap: 14px; }
        .scanner-score-label { font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .14em; margin-bottom: 4px; }
        .scanner-score-num { font-size: 88px; font-weight: 500; letter-spacing: -0.04em; line-height: 1; }
        .of-mute { font-size: 22px; color: var(--ink-fg-dim); font-family: var(--f-mono); }
        .scanner-verdict { font-size: 14px; line-height: 1.5; color: var(--ink-fg); font-family: var(--f-display); margin-top: 8px; max-width: 28ch; }
        .sq-company-tag { font-size: 11px; color: var(--ink-fg-dim); letter-spacing: .08em; padding: 6px 12px; border: 1px solid var(--ink-line); border-radius: 6px; align-self: flex-start; }

        .scanner-breakdown { display: flex; flex-direction: column; gap: 14px; padding: 18px 0; border-top: 1px solid var(--ink-line); border-bottom: 1px solid var(--ink-line); margin-bottom: 20px; }
        .scanner-bar-row { display: grid; grid-template-columns: 120px 1fr 40px; gap: 12px; align-items: center; }
        @media (max-width: 480px) { .scanner-bar-row { grid-template-columns: 90px 1fr 32px; } }
        .scanner-bar-label { font-size: 11px; color: var(--ink-fg-mute); }
        .scanner-bar-track { height: 4px; background: oklch(0.20 0.018 270); border-radius: 2px; overflow: hidden; }
        .scanner-bar-fill { height: 100%; transition: width 1.2s cubic-bezier(.2,.7,.2,1); border-radius: 2px; }
        .scanner-bar-val { font-size: 11px; color: var(--ink-fg); text-align: right; font-variant-numeric: tabular-nums; }

        .sq-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .sq-pdf-btn { font-size: 13px; padding: 11px 20px; }
        .sq-reset { font-family: var(--f-mono); font-size: 11px; color: var(--ink-fg-dim); letter-spacing: .06em; padding: 4px 8px; }
        .sq-reset:hover { color: var(--ink-fg); }

        @keyframes geo-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

window.Scanner = Scanner;
