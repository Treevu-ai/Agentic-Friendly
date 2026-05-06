/* AGENTIC FIRST — global motion controller
   - IntersectionObserver scroll reveals (.reveal, .reveal-stagger)
   - Nav scrolled state
   - Button cursor-tracked ripple (--mx/--my)
   - Auto-tags every <section> + cards as reveal targets */

(function () {
  function init() {
    // Auto-mark sections + grids
    document.querySelectorAll("section").forEach((s) => {
      s.classList.add("reveal");
    });
    document.querySelectorAll(
      ".pillars-grid, .metrics-grid, .timeline-list, .pricing-grid, .cases-grid, .pillars, .pricing, .stats-grid, .trend-row"
    ).forEach((g) => g.classList.add("reveal-stagger"));

    // IntersectionObserver
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-on");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );
    document
      .querySelectorAll(".reveal, .reveal-stagger")
      .forEach(function (el) { io.observe(el); });

    // Nav scroll state
    var nav = document.querySelector(".nav");
    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 24) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Button cursor ripple
    document.addEventListener("mousemove", function (e) {
      var btn = e.target.closest && e.target.closest(".btn");
      if (!btn) return;
      var r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      btn.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }

  // Re-run after React mounts; observe DOM mutations briefly
  function start() {
    init();
    var mo = new MutationObserver(function () { init(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
