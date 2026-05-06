/* AGENTIC FIRST — GEO Score Quiz v4
   CTA button → modal overlay → 5-question quiz one-by-one → delivery choice (PDF | email)
   Bilingual via copy.scanner */

const { useState: useQ, useEffect: useQE } = React;

function Scanner({ copy }) {
  const [open,       setOpen]       = useQ(false);
  const [company,    setCompany]    = useQ("");
  const [stage,      setStage]      = useQ("intro");
  // stages: intro | quiz | calculating | delivery | email | emailsent
  const [qIdx,       setQIdx]       = useQ(0);
  const [answers,    setAnswers]    = useQ([]);
  const [selected,   setSelected]   = useQ(null);
  const [scores,     setScores]     = useQ(null);
  const [pdfBusy,    setPdfBusy]    = useQ(false);
  const [email,      setEmail]      = useQ("");
  const [emailBusy,  setEmailBusy]  = useQ(false);

  const questions = copy.questions || [];
  const total     = questions.length;

  // ─── score model (calibrado v2) ────────────────────────────
  // Pesos derivados de regresión sobre 35 empresas peruanas:
  //   Técnico  43.8%  → schema.org es el predictor más fuerte (r=0.953)
  //   Agéntico 32.4%  → presencia directa en LLMs, segundo más crítico
  //   Autoridad 14.7% → menciones externas
  //   Contenido  9.1% → correlacionado con técnico, menor peso incremental
  function computeScores(a) {
    const technical = Math.round((a[0] + a[4]) / 2);
    const content   = a[1];
    const authority = a[2];
    const agentic   = a[3];
    const overall   = Math.round(
      technical * 0.438 +
      agentic   * 0.324 +
      authority * 0.147 +
      content   * 0.091
    );
    return { technical, content, authority, agentic, overall,
             dims: [technical, content, authority, agentic] };
  }

  // ─── modal ─────────────────────────────────────────────────
  function openModal() { setOpen(true); }
  function closeModal() {
    setOpen(false);
    setTimeout(reset, 350);
  }

  useQE(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ─── flow ──────────────────────────────────────────────────
  function startQuiz() {
    if (!company.trim()) return;
    setStage("quiz"); setQIdx(0); setAnswers([]); setSelected(null);
  }

  function handleNext() {
    if (selected === null) return;
    const val    = questions[qIdx].opts[selected].v;
    const newAns = [...answers, val];
    setAnswers(newAns);
    setSelected(null);
    if (qIdx + 1 >= total) {
      setStage("calculating");
      setTimeout(() => { setScores(computeScores(newAns)); setStage("delivery"); }, 2800);
    } else {
      setQIdx(qIdx + 1);
    }
  }

  function reset() {
    setCompany(""); setStage("intro"); setQIdx(0);
    setAnswers([]); setSelected(null); setScores(null);
    setEmail(""); setEmailBusy(false);
  }

  // ─── PDF ───────────────────────────────────────────────────
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

      doc.setFillColor(...LIGHT);
      doc.rect(0, 0, 210, 297, "F");

      doc.setFillColor(...INK);
      doc.rect(0, 0, 210, 50, "F");

      doc.setFont("helvetica", "bold"); doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("AGENTIC FIRST", M, 20);

      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.setTextColor(...MUTE);
      doc.text("GEO SCORE REPORT  ·  SINAPSIS INNOVADORA S.A.C.", M, 28);

      const dateStr = new Date().toLocaleDateString("es-PE", { day:"2-digit", month:"short", year:"numeric" });
      doc.setTextColor(170, 170, 190);
      doc.text(dateStr, W - M, 20, { align: "right" });

      doc.setFont("helvetica", "bold"); doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text(company, M, 42);

      doc.setFillColor(...ACCENT);
      doc.rect(0, 50, 210, 3, "F");

      let y = 68;

      doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.setTextColor(...MUTE);
      doc.text("SCORE GLOBAL · GEO + AGENTIC READINESS", M, y - 4);

      doc.setFont("helvetica", "bold"); doc.setFontSize(80);
      doc.setTextColor(...scoreRgb);
      doc.text(`${scores.overall}`, M, y + 22);

      doc.setFont("helvetica", "normal"); doc.setFontSize(20);
      doc.setTextColor(...MUTE);
      doc.text("/100", M + 58, y + 22);

      const vIdx = scores.overall < 35 ? 0 : scores.overall < 65 ? 1 : 2;
      const verdict = (copy.verdicts || [])[vIdx] || "";
      doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(verdict, M, y + 34);

      y += 50;
      doc.setDrawColor(220, 220, 230); doc.setLineWidth(0.4);
      doc.line(M, y, W - M, y);
      y += 12;

      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text("PUNTUACIÓN POR DIMENSIÓN", M, y);
      y += 8;

      const dimLabels = copy.breakdown || ["Técnico", "Contenido", "Autoridad", "Agéntico"];
      const barW = CW - 60;

      scores.dims.forEach((val, i) => {
        const c    = val < 35 ? DANGER : val < 65 ? WARN : ACCENT;
        const fill = (val / 100) * barW;
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        doc.setTextColor(...INK);
        doc.text(dimLabels[i], M, y + 4);
        doc.setFillColor(210, 210, 225);
        doc.roundedRect(M + 50, y, barW, 5, 2, 2, "F");
        if (fill > 0) { doc.setFillColor(...c); doc.roundedRect(M + 50, y, fill, 5, 2, 2, "F"); }
        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.setTextColor(...c);
        doc.text(`${val}`, W - M, y + 4, { align: "right" });
        y += 13;
      });

      y += 4;
      doc.setDrawColor(220, 220, 230);
      doc.line(M, y, W - M, y);
      y += 12;

      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text("PRIORIDADES DE ACCIÓN", M, y);
      y += 10;

      const RECS = [
        { key: "técnico",   val: scores.technical,
          txt: "Implementa schema.org JSON-LD: Organization, Service y FAQPage. Los motores IA leen datos estructurados antes que texto plano." },
        { key: "contenido", val: scores.content,
          txt: "Reestructura tu contenido en formato Q&A con preguntas reales de clientes. Es el formato más citable por modelos generativos." },
        { key: "autoridad", val: scores.authority,
          txt: "Aumenta menciones externas: Google Business Profile, directorios del sector y cobertura en medios relevantes de tu industria." },
        { key: "agéntico",  val: scores.agentic,
          txt: "Prueba tu visibilidad en ChatGPT, Claude y Perplexity con prompts de tu cliente ideal y documenta los gaps encontrados." },
        { key: "téc. ux",   val: Math.round((scores.technical * 0.6 + scores.content * 0.4)),
          txt: "Optimiza Core Web Vitals. Un sitio lento limita la capacidad de los crawlers de IA para indexar y citar tu contenido." },
      ];

      [...RECS].sort((a, b) => a.val - b.val).slice(0, 3).forEach((r, i) => {
        doc.setFillColor(...ACCENT);
        doc.circle(M + 4, y + 2, 4, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(`${i + 1}`, M + 4, y + 4, { align: "center" });

        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
        doc.setTextColor(...INK);
        doc.text(r.key.toUpperCase(), M + 12, y + 1);

        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 80);
        const lines = doc.splitTextToSize(r.txt, CW - 14);
        doc.text(lines, M + 12, y + 7);
        y += 8 + lines.length * 4.5 + 4;
      });

      y += 4;
      doc.setFillColor(...INK);
      doc.roundedRect(M, y, CW, 24, 4, 4, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Siguiente paso: auditoría completa + implementación en 4 semanas", M + 8, y + 9);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.setTextColor(...MUTE);
      doc.text("agentic-friendly.vercel.app  ·  acuba0103@gmail.com", M + 8, y + 18);

      y += 32;
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
      doc.setTextColor(...MUTE);
      doc.text(
        "Reporte diagnóstico inicial basado en las respuestas proporcionadas. Los resultados son indicativos y no constituyen una auditoría técnica completa.",
        M, y, { maxWidth: CW }
      );

      doc.save(`GEO-Score-${company.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch(err) { console.error("jsPDF error:", err); }
    setPdfBusy(false);
  }

  // ─── email ─────────────────────────────────────────────────
  async function sendEmail() {
    if (!email.trim()) return;
    setEmailBusy(true);
    const webhook = window.GEO_SCORE_EMAIL_WEBHOOK;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, company, scores }),
        });
      } catch(e) { console.warn("webhook:", e); }
    }
    setEmailBusy(false);
    setStage("emailsent");
  }

  // ─── helpers ───────────────────────────────────────────────
  const scoreColor = scores
    ? (scores.overall < 35 ? "oklch(0.65 0.20 25)"
    : scores.overall < 65  ? "oklch(0.78 0.18 80)"
    : "var(--accent)")
    : "var(--accent)";

  const ENGINES = ["Claude", "ChatGPT", "Perplexity", "Gemini", "Grok"];

  // ─── render ────────────────────────────────────────────────
  return (
    <>
      {/* ── Section launch area ── */}
      <div className="geo-launch">
        <button className="btn btn--accent geo-launch-btn" onClick={openModal}>
          {copy.startCta || "Iniciar evaluación"} <span className="arr">→</span>
        </button>
        <p className="geo-launch-meta mono">
          {total} {copy.qLabel || "preguntas"} · ~2 min · {copy.noCard || "sin tarjeta"}
        </p>
      </div>

      {/* ── Modal backdrop ── */}
      {open && (
        <div
          className="geo-backdrop"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="geo-modal" role="dialog" aria-modal="true">

            {/* Modal header */}
            <div className="geo-mhdr">
              <div className="geo-mhdr-left">
                <div className="geo-mdots"><span/><span/><span/></div>
                <span className="geo-mtitle mono">GEO SCORE · AGENTIC FIRST</span>
              </div>
              {stage === "quiz" && (
                <div className="geo-mprog-dots">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`geo-mprog-dot ${i < qIdx ? "done" : i === qIdx ? "active" : ""}`}
                    />
                  ))}
                </div>
              )}
              <button className="geo-mclose" onClick={closeModal} aria-label="Cerrar">✕</button>
            </div>

            {/* Modal body */}
            <div className="geo-mbody">

              {/* ── INTRO ── */}
              {stage === "intro" && (
                <div className="geo-mint">
                  <div className="geo-mint-icon">◈</div>
                  <h3 className="geo-mint-title">
                    {copy.modalTitle || copy.title || "Evalúa tu visibilidad en IA"}
                  </h3>
                  <p className="geo-mint-sub">{copy.sub}</p>
                  <label className="geo-mint-label mono">
                    {copy.inputLabel || "Empresa o dominio"}
                  </label>
                  <div className="geo-mint-irow">
                    <span className="geo-mint-prompt mono">$</span>
                    <input
                      className="geo-mint-input mono"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && startQuiz()}
                      placeholder={copy.inputPlaceholder || "tuempresa.com"}
                      autoFocus
                    />
                  </div>
                  <button
                    className="btn btn--accent geo-mint-cta"
                    onClick={startQuiz}
                    disabled={!company.trim()}
                  >
                    {copy.startCta || "Iniciar"} <span className="arr">→</span>
                  </button>
                  <p className="geo-mint-meta mono">
                    {total} {copy.qLabel || "preguntas"} · ~2 min · {copy.noCard || "sin tarjeta"} · reporte PDF gratis
                  </p>
                </div>
              )}

              {/* ── QUIZ ── */}
              {stage === "quiz" && (
                <div className="geo-mquiz">
                  <div className="geo-mq-bar-wrap">
                    <div
                      className="geo-mq-bar-fill"
                      style={{ width: `${(qIdx / total) * 100}%` }}
                    />
                  </div>
                  <div className="geo-mq-meta mono">
                    <span className="geo-mq-dim">
                      {(questions[qIdx]?.dim || "").toUpperCase()}
                    </span>
                    <span className="geo-mq-num">{qIdx + 1} / {total}</span>
                  </div>
                  <p className="geo-mq-q">{questions[qIdx]?.q}</p>
                  <div className="geo-mq-opts">
                    {(questions[qIdx]?.opts || []).map((opt, i) => (
                      <button
                        key={i}
                        className={`geo-mq-opt ${selected === i ? "is-sel" : ""}`}
                        onClick={() => setSelected(i)}
                      >
                        <span className="geo-mq-mark">{selected === i ? "●" : "○"}</span>
                        <span>{opt.l}</span>
                      </button>
                    ))}
                  </div>
                  <div className="geo-mq-footer">
                    <button
                      className="btn btn--accent"
                      onClick={handleNext}
                      disabled={selected === null}
                      style={{ padding: "12px 28px" }}
                    >
                      {qIdx + 1 < total
                        ? (copy.nextBtn    || "Siguiente")
                        : (copy.finishBtn  || "Ver resultado")
                      } →
                    </button>
                  </div>
                </div>
              )}

              {/* ── CALCULATING ── */}
              {stage === "calculating" && (
                <div className="geo-mcalc">
                  <p className="geo-mcalc-title mono">
                    {copy.calculating || "Analizando"} {company}…
                  </p>
                  <div className="geo-mcalc-rows">
                    {ENGINES.map((eng, i) => (
                      <div
                        key={eng}
                        className="geo-mcalc-row mono"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      >
                        <span className="geo-mcalc-bar"/>
                        <span className="geo-mcalc-eng">{eng}</span>
                        <span className="geo-mcalc-lbl">{copy.calculating || "Analizando"}…</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── DELIVERY CHOICE ── */}
              {stage === "delivery" && scores && (
                <div className="geo-mdel">

                  {/* Score strip */}
                  <div className="geo-mdel-score">
                    <div className="geo-mdel-score-left">
                      <span className="geo-mdel-slabel mono">GEO SCORE</span>
                      <span className="geo-mdel-snum" style={{ color: scoreColor }}>
                        {scores.overall}
                        <span className="geo-mdel-of">/100</span>
                      </span>
                      <span className="geo-mdel-verdict">
                        {(copy.verdicts || [])[scores.overall < 35 ? 0 : scores.overall < 65 ? 1 : 2]}
                      </span>
                    </div>
                    <div className="geo-mdel-bars">
                      {(copy.breakdown || ["Técnico","Contenido","Autoridad","Agéntico"]).map((label, i) => (
                        <div key={label} className="geo-mdel-bar-row">
                          <span className="geo-mdel-bar-lbl mono">{label}</span>
                          <div className="geo-mdel-bar-track">
                            <div
                              className="geo-mdel-bar-fill"
                              style={{ width: `${scores.dims[i]}%`, background: scoreColor }}
                            />
                          </div>
                          <span className="geo-mdel-bar-val mono">{scores.dims[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="geo-mdel-div"/>

                  <p className="geo-mdel-q">
                    {copy.deliveryTitle || "¿Cómo quieres tu reporte detallado?"}
                  </p>

                  <div className="geo-mdel-opts">
                    {/* Download PDF */}
                    <button
                      className="geo-mdel-opt"
                      onClick={downloadPDF}
                      disabled={pdfBusy}
                    >
                      <span className="geo-mdel-opt-ico">↓</span>
                      <div className="geo-mdel-opt-body">
                        <span className="geo-mdel-opt-title">
                          {copy.downloadOpt || "Descargar PDF ahora"}
                        </span>
                        <span className="geo-mdel-opt-sub mono">
                          {pdfBusy ? "Generando…" : (copy.downloadOptSub || "Inmediato · sin formulario")}
                        </span>
                      </div>
                    </button>

                    {/* Send by email */}
                    <button
                      className="geo-mdel-opt"
                      onClick={() => setStage("email")}
                    >
                      <span className="geo-mdel-opt-ico">✉</span>
                      <div className="geo-mdel-opt-body">
                        <span className="geo-mdel-opt-title">
                          {copy.emailOpt || "Recibir por correo"}
                        </span>
                        <span className="geo-mdel-opt-sub mono">
                          {copy.emailOptSub || "Con análisis adicional"}
                        </span>
                      </div>
                    </button>
                  </div>

                  <button className="geo-link-btn" onClick={reset}>
                    ↺ {copy.retry || "Nueva evaluación"}
                  </button>
                </div>
              )}

              {/* ── EMAIL INPUT ── */}
              {stage === "email" && (
                <div className="geo-memail">
                  <div className="geo-memail-ico">✉</div>
                  <h3 className="geo-memail-title">
                    {copy.emailTitle || "¿A qué correo te enviamos el reporte?"}
                  </h3>
                  <p className="geo-memail-company mono">
                    {company} · GEO Score {scores?.overall}/100
                  </p>
                  <div className="geo-memail-row">
                    <input
                      className="geo-memail-input mono"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendEmail()}
                      placeholder={copy.emailPlaceholder || "tu@empresa.com"}
                      autoFocus
                    />
                    <button
                      className="btn btn--accent"
                      onClick={sendEmail}
                      disabled={!email.trim() || emailBusy}
                      style={{ padding: "12px 22px", whiteSpace: "nowrap" }}
                    >
                      {emailBusy ? "…" : (copy.emailCta || "Enviar")} →
                    </button>
                  </div>
                  <button className="geo-link-btn" onClick={() => setStage("delivery")}>
                    ← {copy.back || "Volver"}
                  </button>
                </div>
              )}

              {/* ── EMAIL SENT ── */}
              {stage === "emailsent" && (
                <div className="geo-msent">
                  <div className="geo-msent-ico">✓</div>
                  <h3 className="geo-msent-title">
                    {copy.emailSent || "¡Listo! Te lo enviamos pronto."}
                  </h3>
                  <p className="geo-msent-email mono">{email}</p>
                  <button
                    className="btn btn--accent"
                    onClick={closeModal}
                    style={{ marginTop: 28 }}
                  >
                    {copy.close || "Cerrar"} ✕
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ── Launch trigger ─────────────────────────── */
        .geo-launch {
          display: flex; flex-direction: column; align-items: center;
          gap: 14px; padding: 8px 0 0;
        }
        .geo-launch-btn {
          font-size: 16px; padding: 14px 32px;
          box-shadow: 0 0 40px var(--accent-soft);
        }
        .geo-launch-meta {
          font-size: 11px; color: var(--ink-fg-dim);
          letter-spacing: .08em; margin: 0;
        }

        /* ── Backdrop ───────────────────────────────── */
        .geo-backdrop {
          position: fixed; inset: 0; z-index: 9000;
          background: oklch(0.05 0.014 270 / 0.88);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: geo-fade-in .2s ease;
        }
        @keyframes geo-fade-in { from { opacity: 0; } to { opacity: 1; } }

        /* ── Modal shell ────────────────────────────── */
        .geo-modal {
          background: oklch(0.13 0.016 270);
          border: 1px solid oklch(0.26 0.020 270);
          border-radius: 16px;
          width: 100%;
          max-width: 560px;
          max-height: 92vh;
          overflow-y: auto;
          box-shadow:
            0 48px 120px -20px oklch(0 0 0 / 0.7),
            0 0 0 1px oklch(0.30 0.020 270 / 0.2),
            inset 0 1px 0 oklch(0.30 0.025 270 / 0.4);
          animation: geo-slide-up .28s cubic-bezier(.2,.9,.3,1);
          display: flex; flex-direction: column;
        }
        @keyframes geo-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(.97); }
          to   { opacity: 1; transform: none; }
        }

        /* ── Modal header ───────────────────────────── */
        .geo-mhdr {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px 13px;
          border-bottom: 1px solid oklch(0.20 0.018 270);
          background: oklch(0.16 0.018 270);
          border-radius: 16px 16px 0 0;
          flex-shrink: 0;
        }
        .geo-mhdr-left { display: flex; align-items: center; gap: 10px; }
        .geo-mdots { display: flex; gap: 6px; }
        .geo-mdots span {
          width: 9px; height: 9px; border-radius: 50%;
          background: oklch(0.28 0.020 270);
        }
        .geo-mtitle { font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .10em; }
        .geo-mclose {
          margin-left: auto;
          font-size: 14px; color: var(--ink-fg-dim);
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          transition: background .15s, color .15s;
        }
        .geo-mclose:hover { background: oklch(0.22 0.018 270); color: var(--ink-fg); }

        /* progress dots */
        .geo-mprog-dots {
          display: flex; gap: 5px; margin: 0 auto;
        }
        .geo-mprog-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: oklch(0.28 0.020 270);
          transition: background .3s, transform .3s;
        }
        .geo-mprog-dot.done   { background: var(--accent); opacity: .5; }
        .geo-mprog-dot.active { background: var(--accent); transform: scale(1.3); }

        /* ── Modal body ─────────────────────────────── */
        .geo-mbody { padding: 32px 28px; flex: 1; }
        @media (max-width: 480px) { .geo-mbody { padding: 24px 18px; } }

        /* ── INTRO ──────────────────────────────────── */
        .geo-mint { display: flex; flex-direction: column; gap: 0; }
        .geo-mint-icon {
          font-size: 32px; color: var(--accent); margin-bottom: 12px;
          animation: geo-pulse 2s ease-in-out infinite;
        }
        @keyframes geo-pulse { 0%,100%{opacity:1}50%{opacity:.6} }
        .geo-mint-title {
          font-family: var(--f-display); font-size: clamp(20px,3vw,26px);
          font-weight: 600; color: var(--ink-fg); line-height: 1.25;
          margin: 0 0 12px;
        }
        .geo-mint-sub {
          font-size: 14px; color: var(--ink-fg-mute); line-height: 1.55;
          margin: 0 0 24px;
        }
        .geo-mint-label {
          font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .14em;
          text-transform: uppercase; margin-bottom: 8px; display: block;
        }
        .geo-mint-irow {
          display: flex; align-items: center; gap: 10px;
          background: oklch(0.10 0.014 270);
          border: 1px solid oklch(0.22 0.018 270);
          border-radius: 10px;
          padding: 13px 16px; margin-bottom: 20px;
        }
        .geo-mint-prompt { color: var(--accent); font-size: 16px; font-weight: 700; }
        .geo-mint-input {
          flex: 1; background: transparent; border: 0; outline: 0;
          color: var(--ink-fg); font-size: 15px; caret-color: var(--accent);
        }
        .geo-mint-input::placeholder { color: var(--ink-fg-dim); }
        .geo-mint-cta { width: 100%; justify-content: center; padding: 13px; font-size: 15px; margin-bottom: 14px; }
        .geo-mint-meta { font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .06em; text-align: center; margin: 0; }

        /* ── QUIZ ───────────────────────────────────── */
        .geo-mquiz { display: flex; flex-direction: column; gap: 0; }
        .geo-mq-bar-wrap {
          height: 3px; background: oklch(0.20 0.018 270); border-radius: 2px;
          margin-bottom: 20px; overflow: hidden;
        }
        .geo-mq-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-2, var(--accent)), var(--accent));
          border-radius: 2px; transition: width .6s cubic-bezier(.4,0,.2,1);
        }
        .geo-mq-meta {
          display: flex; justify-content: space-between;
          font-size: 10px; color: var(--ink-fg-dim); letter-spacing: .12em;
          margin-bottom: 14px;
        }
        .geo-mq-dim  { color: var(--accent); }
        .geo-mq-num  { }
        .geo-mq-q {
          font-family: var(--f-display); font-size: clamp(17px,2.4vw,22px);
          font-weight: 500; color: var(--ink-fg); line-height: 1.35;
          margin: 0 0 22px;
        }
        .geo-mq-opts { display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
        .geo-mq-opt {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 13px 15px;
          background: oklch(0.16 0.016 270);
          border: 1px solid oklch(0.22 0.018 270);
          border-radius: 10px;
          text-align: left; font-size: 14px; color: var(--ink-fg-mute);
          transition: all .16s var(--ease, ease); cursor: pointer; line-height: 1.45;
        }
        .geo-mq-opt:hover { background: oklch(0.19 0.018 270); color: var(--ink-fg); border-color: oklch(0.32 0.022 270); }
        .geo-mq-opt.is-sel {
          background: oklch(0.68 0.22 var(--accent-h, 285) / 0.12);
          border-color: oklch(0.68 0.22 var(--accent-h, 285) / 0.5);
          color: var(--ink-fg);
        }
        .geo-mq-mark { color: var(--accent); font-size: 11px; flex-shrink: 0; margin-top: 3px; }
        .geo-mq-footer { display: flex; justify-content: flex-end; }

        /* ── CALCULATING ────────────────────────────── */
        .geo-mcalc {
          display: flex; flex-direction: column; align-items: center;
          gap: 24px; padding: 20px 0 10px;
        }
        .geo-mcalc-title { font-size: 13px; color: var(--ink-fg-mute); letter-spacing: .06em; margin: 0; }
        .geo-mcalc-rows { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 340px; }
        .geo-mcalc-row {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: var(--ink-fg-mute);
          animation: geo-rise .4s ease both;
        }
        @keyframes geo-rise { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        .geo-mcalc-bar {
          display: inline-block; width: 22px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          background-size: 200% 100%;
          animation: qbar-slide 1s linear infinite;
        }
        @keyframes qbar-slide { from{background-position:200% 0} to{background-position:-200% 0} }
        .geo-mcalc-eng { color: var(--ink-fg); min-width: 90px; }
        .geo-mcalc-lbl { color: var(--ink-fg-dim); }

        /* ── DELIVERY ───────────────────────────────── */
        .geo-mdel { display: flex; flex-direction: column; gap: 0; }
        .geo-mdel-score {
          display: flex; gap: 24px; align-items: flex-start;
          margin-bottom: 24px; flex-wrap: wrap;
        }
        .geo-mdel-score-left { display: flex; flex-direction: column; min-width: 120px; }
        .geo-mdel-slabel { font-size: 9px; color: var(--ink-fg-dim); letter-spacing: .14em; margin-bottom: 4px; }
        .geo-mdel-snum {
          font-size: 72px; font-weight: 600; line-height: 1;
          letter-spacing: -0.04em; font-family: var(--f-display);
        }
        .geo-mdel-of { font-size: 18px; color: var(--ink-fg-dim); font-family: var(--f-mono); }
        .geo-mdel-verdict {
          font-size: 13px; color: var(--ink-fg); line-height: 1.45;
          margin-top: 8px; max-width: 22ch;
          font-family: var(--f-display);
        }
        .geo-mdel-bars { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 180px; }
        .geo-mdel-bar-row {
          display: grid; grid-template-columns: 90px 1fr 32px; gap: 8px; align-items: center;
        }
        .geo-mdel-bar-lbl { font-size: 10px; color: var(--ink-fg-dim); }
        .geo-mdel-bar-track {
          height: 4px; background: oklch(0.20 0.018 270); border-radius: 2px; overflow: hidden;
        }
        .geo-mdel-bar-fill {
          height: 100%; border-radius: 2px;
          transition: width 1s cubic-bezier(.2,.8,.2,1);
        }
        .geo-mdel-bar-val { font-size: 10px; color: var(--ink-fg); text-align: right; }
        .geo-mdel-div {
          height: 1px; background: oklch(0.20 0.018 270); margin-bottom: 20px;
        }
        .geo-mdel-q {
          font-size: 15px; font-weight: 500; color: var(--ink-fg);
          font-family: var(--f-display); margin: 0 0 16px;
        }
        .geo-mdel-opts { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .geo-mdel-opt {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 18px;
          background: oklch(0.16 0.016 270);
          border: 1px solid oklch(0.22 0.018 270);
          border-radius: 12px;
          text-align: left; cursor: pointer;
          transition: all .18s ease;
        }
        .geo-mdel-opt:hover:not(:disabled) {
          background: oklch(0.19 0.018 270);
          border-color: var(--accent);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px oklch(0.68 0.22 var(--accent-h,285) / 0.18);
        }
        .geo-mdel-opt:disabled { opacity: .5; cursor: not-allowed; }
        .geo-mdel-opt-ico {
          font-size: 22px; color: var(--accent);
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: oklch(0.68 0.22 var(--accent-h,285) / 0.12);
          border-radius: 8px; flex-shrink: 0;
        }
        .geo-mdel-opt-body { display: flex; flex-direction: column; gap: 3px; }
        .geo-mdel-opt-title { font-size: 14px; font-weight: 500; color: var(--ink-fg); }
        .geo-mdel-opt-sub { font-size: 11px; color: var(--ink-fg-dim); letter-spacing: .04em; }

        /* ── EMAIL ──────────────────────────────────── */
        .geo-memail { display: flex; flex-direction: column; align-items: center; gap: 0; text-align: center; }
        .geo-memail-ico {
          font-size: 36px; color: var(--accent); margin-bottom: 16px;
        }
        .geo-memail-title {
          font-family: var(--f-display); font-size: 20px; font-weight: 600;
          color: var(--ink-fg); margin: 0 0 8px;
        }
        .geo-memail-company {
          font-size: 11px; color: var(--ink-fg-dim); letter-spacing: .06em;
          margin: 0 0 24px;
        }
        .geo-memail-row {
          display: flex; gap: 10px; width: 100%; margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .geo-memail-input {
          flex: 1; min-width: 200px;
          background: oklch(0.10 0.014 270);
          border: 1px solid oklch(0.22 0.018 270);
          border-radius: 10px;
          padding: 12px 16px; color: var(--ink-fg);
          font-size: 14px; outline: 0;
          caret-color: var(--accent);
        }
        .geo-memail-input:focus { border-color: var(--accent); }
        .geo-memail-input::placeholder { color: var(--ink-fg-dim); }

        /* ── EMAIL SENT ─────────────────────────────── */
        .geo-msent {
          display: flex; flex-direction: column; align-items: center;
          gap: 0; text-align: center; padding: 16px 0;
        }
        .geo-msent-ico {
          font-size: 48px; color: var(--accent);
          width: 72px; height: 72px; border-radius: 50%;
          background: oklch(0.68 0.22 var(--accent-h,285) / 0.14);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          animation: geo-pop .4s cubic-bezier(.2,.9,.3,1);
        }
        @keyframes geo-pop { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }
        .geo-msent-title {
          font-family: var(--f-display); font-size: 22px; font-weight: 600;
          color: var(--ink-fg); margin: 0 0 8px;
        }
        .geo-msent-email { font-size: 12px; color: var(--ink-fg-dim); letter-spacing: .04em; margin: 0; }

        /* ── Shared ─────────────────────────────────── */
        .geo-link-btn {
          align-self: center; margin-top: 4px;
          font-family: var(--f-mono); font-size: 11px;
          color: var(--ink-fg-dim); letter-spacing: .06em;
          padding: 6px 8px;
          transition: color .15s;
        }
        .geo-link-btn:hover { color: var(--ink-fg); }
      `}</style>
    </>
  );
}

window.Scanner = Scanner;
