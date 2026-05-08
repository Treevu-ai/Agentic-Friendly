/* AGENTIC FRIENDLY — GEO Score Quiz v5
   CTA button → modal overlay → 5-question quiz one-by-one → delivery choice (PDF | email | Telegram)
   Bilingual via copy.scanner */

const { useState: useQ, useEffect: useQE, useRef: useQR } = React;

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
  const modalBodyRef = useQR(null);

  const questions = copy.questions || [];
  const total     = questions.length;

  // Expose openModal globally so external buttons (Nav, Hero, Pricing) can trigger it
  useQE(() => {
    window.openGEOScanner = () => setOpen(true);
    return () => { delete window.openGEOScanner; };
  }, []);

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

  // Scroll modal body to top on question change
  useQE(() => {
    if (modalBodyRef.current) modalBodyRef.current.scrollTop = 0;
  }, [qIdx]);

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

  // ─── PDF (4-bloque: definiciones + gaps + recs + CTA Telegram) ─
  function downloadPDF() {
    if (!window.jspdf || !scores) return;
    setPdfBusy(true);
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210, M = 18, CW = 174;

      function rgb(h) {
        return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
      }
      const INK    = rgb("#0d0e14");
      const ACCENT = rgb("#9f5afd");
      const MUTE   = rgb("#888899");
      const LIGHT  = rgb("#f4f4f8");
      const WARN   = rgb("#d4a44a");
      const DANGER = rgb("#e05c5c");
      const scoreRgb = scores.overall < 35 ? DANGER : scores.overall < 65 ? WARN : ACCENT;

      // auto-paginate: add page with mini-header if content overflows
      function checkPage(yy, need) {
        if (yy + need > 272) {
          doc.addPage();
          doc.setFillColor(...LIGHT); doc.rect(0, 0, W, 297, "F");
          doc.setFillColor(...INK);   doc.rect(0, 0, W, 11, "F");
          doc.setFillColor(...ACCENT); doc.rect(0, 11, W, 2, "F");
          doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
          doc.setTextColor(...MUTE);
          doc.text("AGENTIC FRIENDLY  |  GEO SCORE  |  " + company, M, 8);
          return 22;
        }
        return yy;
      }

      // ── PAGE 1 ─────────────────────────────────────────────────
      doc.setFillColor(...LIGHT); doc.rect(0, 0, W, 297, "F");

      // Header band
      doc.setFillColor(...INK); doc.rect(0, 0, W, 52, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text("AGENTIC FRIENDLY", M, 17);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      doc.setTextColor(...MUTE);
      doc.text("GEO SCORE REPORT  |  SINAPSIS INNOVADORA S.A.C.", M, 25);
      const dateStr = new Date().toLocaleDateString("es-PE", { day:"2-digit", month:"short", year:"numeric" });
      doc.setTextColor(180, 180, 200);
      doc.text(dateStr, W - M, 17, { align: "right" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(company, M, 44);
      doc.setFillColor(...ACCENT); doc.rect(0, 52, W, 3, "F");

      // Score block
      let y = 66;
      doc.setFont("helvetica", "bold"); doc.setFontSize(7);
      doc.setTextColor(...MUTE);
      doc.text("SCORE GLOBAL  |  GEO + AGENTIC READINESS", M, y);
      y += 3;
      doc.setFont("helvetica", "bold"); doc.setFontSize(72);
      doc.setTextColor(...scoreRgb);
      doc.text(`${scores.overall}`, M, y + 20);
      doc.setFont("helvetica", "normal"); doc.setFontSize(20);
      doc.setTextColor(...MUTE);
      doc.text("/100", M + 54, y + 20);
      const vIdx = scores.overall < 35 ? 0 : scores.overall < 65 ? 1 : 2;
      const verdict = (copy.verdicts || [])[vIdx] || "";
      doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text(verdict, M, y + 32);
      y += 47;
      doc.setDrawColor(220, 220, 230); doc.setLineWidth(0.3);
      doc.line(M, y, W - M, y); y += 10;

      // ── BLOQUE A: Definicion de dimensiones ──────────────────
      doc.setFont("helvetica", "bold"); doc.setFontSize(7);
      doc.setTextColor(...MUTE);
      doc.text("QUE MIDE CADA DIMENSION Y POR QUE TE IMPORTA", M, y);
      y += 7;

      const DIMS_DEF = [
        {
          label: "TECNICO", w: "43.8%", score: scores.technical,
          def: "Infraestructura que los crawlers de IA leen: schema.org JSON-LD, velocidad de carga, HTML semantico correcto.",
          why: "Si los robots no entienden tu sitio, ningun LLM te citara, sin importar la calidad de tu contenido."
        },
        {
          label: "AGENTICO", w: "32.4%", score: scores.agentic,
          def: "Presencia directa en LLMs: si ChatGPT, Claude, Perplexity y Gemini te mencionan cuando alguien pregunta por tu servicio.",
          why: "El factor mas diferenciador hoy. Las marcas con alto score agentico capturan clientes que ni saben que buscaban."
        },
        {
          label: "AUTORIDAD", w: "14.7%", score: scores.authority,
          def: "Menciones externas y validacion: Google Business Profile, directorios del sector, cobertura en medios relevantes.",
          why: "Cuantos mas sitios te citen, mas confianza le asignan los modelos de IA a tu marca al generar respuestas."
        },
        {
          label: "CONTENIDO", w: "9.1%", score: scores.content,
          def: "Formato y profundidad: estructura Q&A, respuestas directas, cobertura de preguntas reales del cliente.",
          why: "Los LLMs reproducen fragmentos especificos. El contenido vago no se cita; las respuestas concretas si."
        },
      ];

      DIMS_DEF.forEach(d => {
        const c = d.score < 35 ? DANGER : d.score < 65 ? WARN : ACCENT;
        y = checkPage(y, 24);
        // card bg
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, y, CW, 21, 2.5, 2.5, "F");
        doc.setDrawColor(215, 215, 228); doc.setLineWidth(0.25);
        doc.roundedRect(M, y, CW, 21, 2.5, 2.5, "S");
        // left accent bar
        doc.setFillColor(...c);
        doc.roundedRect(M, y, 3, 21, 1.5, 1.5, "F");
        // label
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
        doc.setTextColor(...INK);
        doc.text(d.label, M + 7, y + 6);
        // score chip
        const labelW = doc.getTextWidth(d.label);
        doc.setFillColor(...c);
        doc.roundedRect(M + 7 + labelW + 3, y + 1.5, 16, 5, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(6);
        doc.setTextColor(255, 255, 255);
        doc.text(`${d.score}/100`, M + 7 + labelW + 11, y + 5.8, { align: "center" });
        // weight
        doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
        doc.setTextColor(...MUTE);
        doc.text(`Peso: ${d.w}`, W - M - 4, y + 6, { align: "right" });
        // definition
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
        doc.setTextColor(55, 55, 75);
        const defLine = doc.splitTextToSize(d.def, CW - 12);
        doc.text(defLine.slice(0, 1), M + 7, y + 12.5);
        // why (italic)
        doc.setFont("helvetica", "italic"); doc.setFontSize(7);
        doc.setTextColor(...MUTE);
        const whyLine = doc.splitTextToSize("Por que importa: " + d.why, CW - 12);
        doc.text(whyLine.slice(0, 1), M + 7, y + 18);
        y += 24;
      });

      y += 4;
      doc.setDrawColor(220, 220, 230); doc.setLineWidth(0.3);
      doc.line(M, y, W - M, y); y += 10;

      // ── BLOQUE B: Gap visualization ───────────────────────────
      y = checkPage(y, 68);
      doc.setFont("helvetica", "bold"); doc.setFontSize(7);
      doc.setTextColor(...MUTE);
      doc.text("TU DIAGNOSTICO  |  BRECHA ACTUAL VS OBJETIVO (100 PTS)", M, y);
      y += 8;

      const gapData = [
        { label: "Tecnico",   val: scores.technical },
        { label: "Agentico",  val: scores.agentic   },
        { label: "Autoridad", val: scores.authority  },
        { label: "Contenido", val: scores.content    },
      ].sort((a, b) => a.val - b.val); // mayor brecha primero

      const barW = CW - 72;
      gapData.forEach(d => {
        const c = d.val < 35 ? DANGER : d.val < 65 ? WARN : ACCENT;
        const gap = 100 - d.val;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.setTextColor(...INK);
        doc.text(d.label, M, y + 4);
        // track (ghost)
        doc.setFillColor(215, 215, 228);
        doc.roundedRect(M + 44, y, barW, 5.5, 2, 2, "F");
        // actual fill
        if (d.val > 0) {
          doc.setFillColor(...c);
          doc.roundedRect(M + 44, y, (d.val / 100) * barW, 5.5, 2, 2, "F");
        }
        // score value
        doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.setTextColor(...c);
        doc.text(`${d.val}`, M + 44 + barW + 5, y + 4.5);
        // gap delta
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
        doc.setTextColor(...DANGER);
        doc.text(`-${gap} pts`, W - M, y + 4.5, { align: "right" });
        y += 13;
      });

      y += 2;
      doc.setFont("helvetica", "italic"); doc.setFontSize(6.5);
      doc.setTextColor(...MUTE);
      doc.text("Los valores en rojo indican los puntos que faltan para alcanzar el maximo. Son tu oportunidad de diferenciacion.", M, y);
      y += 10;

      // ── PAGE 2: Recomendaciones + CTA ──────────────────────────
      doc.addPage();
      doc.setFillColor(...LIGHT); doc.rect(0, 0, W, 297, "F");
      doc.setFillColor(...INK);   doc.rect(0, 0, W, 11, "F");
      doc.setFillColor(...ACCENT); doc.rect(0, 11, W, 2, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
      doc.setTextColor(...MUTE);
      doc.text("AGENTIC FRIENDLY  |  GEO SCORE  |  " + company, M, 8);
      y = 22;

      // ── BLOQUE C: Prioridades de accion ───────────────────────
      doc.setFont("helvetica", "bold"); doc.setFontSize(7);
      doc.setTextColor(...MUTE);
      doc.text("PRIORIDADES DE ACCION  |  ORDENADAS POR MAYOR IMPACTO EN TU SCORE", M, y);
      y += 10;

      const RECS_ALL = [
        {
          dim: "AGENTICO", val: scores.agentic,
          txt: "Prueba ahora mismo: busca en ChatGPT y Perplexity el mejor proveedor de tu servicio en tu ciudad. Si no apareces, tu competencia ya captura ese cliente antes de que tu sitio cargue. Una auditoria agéntica identifica exactamente por donde entrar."
        },
        {
          dim: "CONTENIDO", val: scores.content,
          txt: "Reestructura tu web con formato Q&A usando preguntas reales de tus clientes. Es el formato mas citado por modelos generativos. Una pagina de preguntas frecuentes bien construida puede duplicar tu visibilidad en LLMs en 30 dias."
        },
        {
          dim: "TECNICO", val: scores.technical,
          txt: "Implementa schema.org JSON-LD (Organization, Service, FAQPage). Los motores IA leen datos estructurados antes que texto plano. Sin esto, tu contenido es invisible para los crawlers de IA aunque sea excelente."
        },
        {
          dim: "AUTORIDAD", val: scores.authority,
          txt: "Activa o completa tu Google Business Profile y solicita inclusion en los 3 directorios principales de tu sector. Cada mencion externa valida tu marca ante los indices de IA y eleva tu score de autoridad directamente."
        },
      ];

      [...RECS_ALL].sort((a, b) => a.val - b.val).slice(0, 3).forEach((r, i) => {
        y = checkPage(y, 30);
        const c = r.val < 35 ? DANGER : r.val < 65 ? WARN : ACCENT;
        // number circle
        doc.setFillColor(...ACCENT);
        doc.circle(M + 5, y + 4, 5, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(`${i + 1}`, M + 5, y + 6, { align: "center" });
        // dim label
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
        doc.setTextColor(...INK);
        doc.text(r.dim, M + 14, y + 3);
        // score chip
        const dW = doc.getTextWidth(r.dim);
        doc.setFillColor(...c);
        doc.roundedRect(M + 14 + dW + 3, y - 0.5, 16, 5, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`${r.val}/100`, M + 14 + dW + 11, y + 3.8, { align: "center" });
        // recommendation text
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
        doc.setTextColor(55, 55, 75);
        const lines = doc.splitTextToSize(r.txt, CW - 16);
        doc.text(lines, M + 14, y + 9);
        y += 9 + lines.length * 4.5 + 7;
      });

      // ── BLOQUE D: Conversemos CTA ──────────────────────────────
      y = checkPage(y + 6, 46);
      const tgUrl = (window.GEO_SCORE_TELEGRAM_URL || "https://t.me/AgenticFriendlyBot")
        + "?start=geo_" + scores.overall;

      doc.setFillColor(...INK);
      doc.roundedRect(M, y, CW, 38, 5, 5, "F");

      doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("Siguiente paso: auditoria + implementacion en 4 semanas", M + 10, y + 11);

      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.setTextColor(...MUTE);
      const ctaLines = doc.splitTextToSize(
        "Identificamos que implementar, en que orden y con que herramientas para maximizar tu ROI en 30 dias.",
        CW - 22
      );
      doc.text(ctaLines, M + 10, y + 19);

      // Telegram button (clickable en PDF)
      doc.setFillColor(...ACCENT);
      doc.roundedRect(M + 10, y + 28, 72, 8, 3, 3, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("Conversemos en Telegram  ->", M + 46, y + 33.5, { align: "center" });
      doc.link(M + 10, y + 28, 72, 8, { url: tgUrl });

      y += 46;

      // Fine print
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
      doc.setTextColor(...MUTE);
      doc.text("agentic-friendly.vercel.app  |  sinapsisinnovadoraperu@gmail.com", M, y);
      y += 5;
      doc.text(
        "Reporte diagnostico inicial basado en respuestas del usuario. Resultados indicativos; no constituyen auditoria tecnica completa.",
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

  const tgHref = (window.GEO_SCORE_TELEGRAM_URL || "https://t.me/AgenticFriendlyBot")
    + (scores ? "?start=geo_" + scores.overall : "");

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
                <span className="geo-mtitle mono">GEO SCORE · AGENTIC FRIENDLY</span>
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
              <button className="geo-mclose" onClick={closeModal} aria-label={copy.close || "Cerrar"}>✕</button>
            </div>

            {/* Modal body */}
            <div className="geo-mbody" ref={modalBodyRef}>

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
                <div className="geo-mquiz" key={qIdx}>
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

                    {/* Conversemos en Telegram */}
                    <a
                      className="geo-mdel-opt geo-mdel-opt--tg"
                      href={tgHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="geo-mdel-opt-ico">✈</span>
                      <div className="geo-mdel-opt-body">
                        <span className="geo-mdel-opt-title">
                          {copy.tgOpt || "Conversemos en Telegram"}
                        </span>
                        <span className="geo-mdel-opt-sub mono">
                          {copy.tgOptSub || "Respuesta en minutos · sin compromiso"}
                        </span>
                      </div>
                      <span className="geo-mdel-opt-arr">→</span>
                    </a>
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
          --geo-fg: rgba(255,255,255,0.96);
          --geo-fg-mute: rgba(255,255,255,0.78);
          --geo-fg-dim: rgba(255,255,255,0.58);
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
        .geo-mtitle { font-size: 10px; color: var(--geo-fg-dim); letter-spacing: .10em; }
        .geo-mclose {
          margin-left: auto;
          font-size: 14px; color: var(--geo-fg-mute);
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          transition: background .15s, color .15s;
        }
        .geo-mclose:hover { background: oklch(0.22 0.018 270); color: var(--geo-fg); }

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
          font-weight: 600; color: var(--geo-fg); line-height: 1.25;
          margin: 0 0 12px;
        }
        .geo-mint-sub {
          font-size: 14px; color: var(--geo-fg-mute); line-height: 1.55;
          margin: 0 0 24px;
        }
        .geo-mint-label {
          font-size: 10px; color: var(--geo-fg-dim); letter-spacing: .14em;
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
          color: var(--geo-fg); font-size: 15px; caret-color: var(--accent);
        }
        .geo-mint-input::placeholder { color: var(--geo-fg-dim); }
        .geo-mint-cta { width: 100%; justify-content: center; padding: 13px; font-size: 15px; margin-bottom: 14px; }
        .geo-mint-meta { font-size: 10px; color: var(--geo-fg-dim); letter-spacing: .06em; text-align: center; margin: 0; }

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
          font-size: 10px; color: var(--geo-fg-dim); letter-spacing: .12em;
          margin-bottom: 14px;
        }
        .geo-mq-dim  { color: var(--accent); }
        .geo-mq-num  { }
        .geo-mq-q {
          font-family: var(--f-display); font-size: clamp(17px,2.4vw,22px);
          font-weight: 500; color: var(--geo-fg); line-height: 1.35;
          margin: 0 0 22px;
        }
        .geo-mq-opts { display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
        .geo-mq-opt {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 13px 15px;
          background: oklch(0.16 0.016 270);
          border: 1px solid oklch(0.22 0.018 270);
          border-radius: 10px;
          text-align: left; font-size: 14px; color: var(--geo-fg-mute);
          transition: all .16s var(--ease, ease); cursor: pointer; line-height: 1.45;
        }
        .geo-mq-opt:hover { background: oklch(0.19 0.018 270); color: var(--geo-fg); border-color: oklch(0.32 0.022 270); }
        .geo-mq-opt.is-sel {
          background: oklch(0.68 0.22 var(--accent-h, 285) / 0.12);
          border-color: oklch(0.68 0.22 var(--accent-h, 285) / 0.5);
          color: var(--geo-fg);
        }
        .geo-mq-mark { color: var(--accent); font-size: 11px; flex-shrink: 0; margin-top: 3px; }
        .geo-mq-footer { display: flex; justify-content: flex-end; }

        /* ── CALCULATING ────────────────────────────── */
        .geo-mcalc {
          display: flex; flex-direction: column; align-items: center;
          gap: 24px; padding: 20px 0 10px;
        }
        .geo-mcalc-title { font-size: 13px; color: var(--geo-fg-mute); letter-spacing: .06em; margin: 0; }
        .geo-mcalc-rows { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 340px; }
        .geo-mcalc-row {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: var(--geo-fg-mute);
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
        .geo-mcalc-eng { color: var(--geo-fg); min-width: 90px; }
        .geo-mcalc-lbl { color: var(--geo-fg-dim); }

        /* ── DELIVERY ───────────────────────────────── */
        .geo-mdel { display: flex; flex-direction: column; gap: 0; }
        .geo-mdel-score {
          display: flex; gap: 24px; align-items: flex-start;
          margin-bottom: 24px; flex-wrap: wrap;
        }
        .geo-mdel-score-left { display: flex; flex-direction: column; min-width: 120px; }
        .geo-mdel-slabel { font-size: 9px; color: var(--geo-fg-dim); letter-spacing: .14em; margin-bottom: 4px; }
        .geo-mdel-snum {
          font-size: 72px; font-weight: 600; line-height: 1;
          letter-spacing: -0.04em; font-family: var(--f-display);
        }
        .geo-mdel-of { font-size: 18px; color: var(--geo-fg-dim); font-family: var(--f-mono); }
        .geo-mdel-verdict {
          font-size: 13px; color: var(--geo-fg); line-height: 1.45;
          margin-top: 8px; max-width: 22ch;
          font-family: var(--f-display);
        }
        .geo-mdel-bars { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 180px; }
        .geo-mdel-bar-row {
          display: grid; grid-template-columns: 90px 1fr 32px; gap: 8px; align-items: center;
        }
        .geo-mdel-bar-lbl { font-size: 10px; color: var(--geo-fg-dim); }
        .geo-mdel-bar-track {
          height: 4px; background: oklch(0.20 0.018 270); border-radius: 2px; overflow: hidden;
        }
        .geo-mdel-bar-fill {
          height: 100%; border-radius: 2px;
          transition: width 1s cubic-bezier(.2,.8,.2,1);
        }
        .geo-mdel-bar-val { font-size: 10px; color: var(--geo-fg); text-align: right; }
        .geo-mdel-div {
          height: 1px; background: oklch(0.20 0.018 270); margin-bottom: 20px;
        }
        .geo-mdel-q {
          font-size: 15px; font-weight: 500; color: var(--geo-fg);
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
          text-decoration: none;
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
        .geo-mdel-opt-body { display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .geo-mdel-opt-title { font-size: 14px; font-weight: 500; color: var(--geo-fg); }
        .geo-mdel-opt-sub { font-size: 11px; color: var(--geo-fg-dim); letter-spacing: .04em; }
        .geo-mdel-opt-arr { color: var(--accent); font-size: 18px; margin-left: auto; }

        /* Telegram option: accent border + subtle glow */
        .geo-mdel-opt--tg {
          border-color: oklch(0.68 0.22 var(--accent-h,285) / 0.5);
          background: oklch(0.68 0.22 var(--accent-h,285) / 0.07);
        }
        .geo-mdel-opt--tg:hover {
          background: oklch(0.68 0.22 var(--accent-h,285) / 0.14);
          border-color: var(--accent);
          box-shadow: 0 8px 32px oklch(0.68 0.22 var(--accent-h,285) / 0.25);
        }

        /* ── EMAIL ──────────────────────────────────── */
        .geo-memail { display: flex; flex-direction: column; align-items: center; gap: 0; text-align: center; }
        .geo-memail-ico {
          font-size: 36px; color: var(--accent); margin-bottom: 16px;
        }
        .geo-memail-title {
          font-family: var(--f-display); font-size: 20px; font-weight: 600;
          color: var(--geo-fg); margin: 0 0 8px;
        }
        .geo-memail-company {
          font-size: 11px; color: var(--geo-fg-dim); letter-spacing: .06em;
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
          padding: 12px 16px; color: var(--geo-fg);
          font-size: 14px; outline: 0;
          caret-color: var(--accent);
        }
        .geo-memail-input:focus { border-color: var(--accent); }
        .geo-memail-input::placeholder { color: var(--geo-fg-dim); }

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
          color: var(--geo-fg); margin: 0 0 8px;
        }
        .geo-msent-email { font-size: 12px; color: var(--geo-fg-dim); letter-spacing: .04em; margin: 0; }

        /* ── Shared ─────────────────────────────────── */
        .geo-link-btn {
          align-self: center; margin-top: 4px;
          font-family: var(--f-mono); font-size: 11px;
          color: var(--geo-fg-mute); letter-spacing: .06em;
          padding: 6px 8px;
          transition: color .15s;
        }
        .geo-link-btn:hover { color: var(--geo-fg); }
      `}</style>
    </>
  );
}

window.Scanner = Scanner;
