/* AGENTIC FIRST — dazzle layer
   1. Magnetic cursor (dual-ring orb + trail)
   2. Hero particle field (floating tokens routing between AI engines)
   3. Scroll progress beam at top of viewport
   4. Aurora ambient layer
   5. Section reveal choreography (different per section index)
   6. Magnetic CTA buttons (subtle pull toward cursor)

   Self-contained: this file only adds DOM nodes + a few classes.
   Respects prefers-reduced-motion. */

(function () {
  if (window.__AF_DAZZLE) return;
  window.__AF_DAZZLE = true;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───────── 1. Aurora + scroll beam + cursor (DOM scaffold) ───────── */
  function buildScaffold() {
    if (document.querySelector(".af-aurora")) return;

    const aurora = document.createElement("div");
    aurora.className = "af-aurora";
    aurora.setAttribute("aria-hidden", "true");
    aurora.innerHTML = `
      <div class="af-aurora-blob af-aurora-blob-1"></div>
      <div class="af-aurora-blob af-aurora-blob-2"></div>
      <div class="af-aurora-blob af-aurora-blob-3"></div>
      <div class="af-aurora-noise"></div>
    `;
    document.body.appendChild(aurora);

    // Scroll progress beam
    const beam = document.createElement("div");
    beam.className = "af-scroll-beam";
    beam.setAttribute("aria-hidden", "true");
    document.body.appendChild(beam);

    // Custom cursor
    if (!reduced && window.matchMedia("(pointer: fine)").matches) {
      const cursor = document.createElement("div");
      cursor.className = "af-cursor";
      cursor.innerHTML = `
        <div class="af-cursor-ring"></div>
        <div class="af-cursor-dot"></div>
      `;
      document.body.appendChild(cursor);
      bindCursor(cursor);
    }
  }

  /* ───────── 2. Cursor follower w/ easing ───────── */
  function bindCursor(cursor) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx, cy = my;     // ring (delayed)
    let dx = mx, dy = my;     // dot (instant)

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dx = mx; dy = my;

      // hover-state detection
      const t = e.target;
      const interactive = t.closest && (
        t.closest("a, button, .btn, .pillar, .plan, .stat-card, .trend-card, .card, .cases-tab, .nav-toggle button, [role='button']")
      );
      cursor.classList.toggle("is-hot", !!interactive);

      // Magnetic pull on .btn--accent: nudge the button toward cursor
      const mag = t.closest && t.closest(".btn--accent");
      document.querySelectorAll(".btn--accent.is-mag").forEach(b => {
        if (b !== mag) {
          b.style.transform = "";
          b.classList.remove("is-mag");
        }
      });
      if (mag) {
        const r = mag.getBoundingClientRect();
        const px = ((mx - (r.left + r.width / 2)) / r.width) * 12;
        const py = ((my - (r.top + r.height / 2)) / r.height) * 8;
        mag.style.transform = `translate(${px}px, ${py}px)`;
        mag.classList.add("is-mag");
      }
    }, { passive: true });

    document.addEventListener("mousedown", () => cursor.classList.add("is-down"));
    document.addEventListener("mouseup", () => cursor.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => cursor.classList.add("is-out"));
    document.addEventListener("mouseenter", () => cursor.classList.remove("is-out"));

    function tick() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      cursor.style.setProperty("--dx", (dx - cx) + "px");
      cursor.style.setProperty("--dy", (dy - cy) + "px");
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ───────── 3. Scroll beam ───────── */
  function bindScrollBeam() {
    const beam = document.querySelector(".af-scroll-beam");
    if (!beam) return;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h <= 0 ? 0 : window.scrollY / h;
      beam.style.setProperty("--p", p);
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ───────── 4. Hero particles (floating tokens between engines) ───────── */
  function buildHeroParticles() {
    if (reduced) return;
    const hero = document.querySelector(".hero");
    if (!hero || hero.querySelector(".af-particles")) return;

    const layer = document.createElement("div");
    layer.className = "af-particles";
    layer.setAttribute("aria-hidden", "true");
    hero.appendChild(layer);

    const N = 28;
    for (let i = 0; i < N; i++) {
      const p = document.createElement("span");
      p.className = "af-particle";
      const startX = Math.random() * 100;
      const startY = 20 + Math.random() * 60;
      const drift = (Math.random() - 0.5) * 30;
      const dur = 14 + Math.random() * 18;
      const delay = -Math.random() * dur;
      const size = 2 + Math.random() * 4;
      const isToken = Math.random() < 0.35;
      p.style.cssText = `
        left: ${startX}%;
        top: ${startY}%;
        --drift: ${drift}vw;
        --size: ${size}px;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
      `;
      if (isToken) {
        p.classList.add("af-particle--token");
        p.textContent = ["{}", "[ ]", "//", "→", "·", "▣", "○", "◆"][i % 8];
      }
      layer.appendChild(p);
    }
  }

  /* ───────── 5. Section choreography ───────── */
  function tagSections() {
    const sections = document.querySelectorAll("section");
    sections.forEach((s, i) => {
      const labels = ["hero", "metrics", "pillars", "timeline", "cases", "scanner", "pricing", "cta"];
      // skip the hero — it has its own entrance
      if (s.classList.contains("hero")) return;
      const choreo = ["af-rise", "af-zoom", "af-rise", "af-fade-l", "af-rise", "af-fade-r", "af-zoom"];
      s.classList.add("af-choreo", choreo[(i - 1) % choreo.length]);
      s.dataset.choreoIdx = i;
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("af-on");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -100px 0px" });
    document.querySelectorAll(".af-choreo").forEach(el => io.observe(el));
  }

  /* ───────── 6. Headline word reveal ───────── */
  function splitHeadline() {
    const h1 = document.querySelector(".hero-h");
    if (!h1 || h1.dataset.split) return;
    h1.dataset.split = "1";
    // Walk text nodes only, wrapping each word in a span
    const walk = (node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        const words = node.textContent.split(/(\s+)/);
        words.forEach((w, i) => {
          if (/\s+/.test(w)) {
            frag.appendChild(document.createTextNode(w));
          } else if (w) {
            const span = document.createElement("span");
            span.className = "af-word";
            span.style.setProperty("--i", i);
            span.textContent = w;
            frag.appendChild(span);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !node.classList.contains("hero-underline")) {
        Array.from(node.childNodes).forEach(walk);
      }
    };
    Array.from(h1.childNodes).forEach(walk);
    // trigger reveal
    requestAnimationFrame(() => h1.classList.add("af-on"));
  }

  function refreshHeroHeadline() {
    const h1 = document.querySelector(".hero-h");
    buildHeroParticles();
    if (!h1) return;
    delete h1.dataset.split;
    h1.classList.remove("af-on");
    splitHeadline();
  }

  /* ───────── 7. Card tilt (3D) ───────── */
  function bindCardTilt() {
    if (reduced) return;
    document.querySelectorAll(".pillar, .plan, .stat-card, .trend-card, .card").forEach((card) => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-6px)`;
        card.style.setProperty("--shine-x", `${(px + 0.5) * 100}%`);
        card.style.setProperty("--shine-y", `${(py + 0.5) * 100}%`);
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ───────── boot ───────── */
  function boot() {
    buildScaffold();
    bindScrollBeam();
    buildHeroParticles();
    splitHeadline();
    tagSections();
    bindCardTilt();
  }

  function start() {
    window.__AF_refreshHeroHeadline = refreshHeroHeadline;
    boot();
    // React mounts after; rebind a few times to catch new nodes
    let tries = 0;
    const id = setInterval(() => {
      buildHeroParticles();
      splitHeadline();
      tagSections();
      bindCardTilt();
      if (++tries > 20) clearInterval(id);
    }, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
