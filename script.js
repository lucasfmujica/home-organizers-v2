/* Home Organizers Long Island — site interactions */
(function () {
  "use strict";

  /* ---------- Mobile / tablet nav overlay ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMobile");
  if (toggle && menu) {
    var setOpen = function (open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      // Lock background scroll while the overlay is open
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) setOpen(false);
    });
    // Close if the viewport grows back to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 991 && document.body.classList.contains("nav-open")) setOpen(false);
    });
  }

  /* ---------- Before & After carousel ---------- */
  var track = document.getElementById("baTrack");
  if (track) {
    var slides = track.children.length;
    var idx = 0;
    var dotsWrap = document.getElementById("baDots");
    var prev = document.getElementById("baPrev");
    var next = document.getElementById("baNext");
    var baReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var baDragging = false;

    function render() {
      track.style.transform = "translateX(" + (-idx * 100) + "%)";
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.classList.toggle("active", i === idx);
        });
      }
    }
    function go(n) { idx = (n + slides) % slides; render(); }

    if (dotsWrap) {
      for (var i = 0; i < slides; i++) {
        var dot = document.createElement("button");
        dot.className = "ba-dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Go to transformation " + (i + 1));
        (function (n) { dot.addEventListener("click", function () { go(n); restartAuto(); }); })(i);
        dotsWrap.appendChild(dot);
      }
    }
    if (prev) prev.addEventListener("click", function () { go(idx - 1); restartAuto(); });
    if (next) next.addEventListener("click", function () { go(idx + 1); restartAuto(); });

    /* ---- Interactive before/after slider (mobile): draggable reveal divider ---- */
    function setPos(pair, clientX) {
      var r = pair.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      pair.style.setProperty("--ba-pos", pct + "%");
    }
    Array.prototype.forEach.call(track.querySelectorAll(".ba-pair"), function (pair) {
      pair.style.setProperty("--ba-pos", "50%");
      var handle = document.createElement("div");
      handle.className = "ba-handle";
      handle.setAttribute("role", "slider");
      handle.setAttribute("aria-label", "Drag to compare before and after");
      handle.innerHTML =
        '<div class="ba-grip"><span class="ms">chevron_left</span><span class="ms">chevron_right</span></div>';
      pair.appendChild(handle);

      handle.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        baDragging = true;
        if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);
      });
      handle.addEventListener("pointermove", function (e) {
        if (!baDragging) return;
        setPos(pair, e.clientX);
      });
      function endDrag() { baDragging = false; }
      handle.addEventListener("pointerup", endDrag);
      handle.addEventListener("pointercancel", endDrag);
    });

    /* basic swipe (ignored while dragging the compare handle) */
    var startX = null;
    track.addEventListener("touchstart", function (e) {
      if (e.target.closest(".ba-handle")) { startX = null; return; }
      startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (startX === null || baDragging) { startX = null; return; }
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restartAuto(); }
      startX = null;
    });

    /* ---- Desktop autoplay: cycle slides every few seconds ---- */
    var AUTO_MS = 3000;
    var autoTimer = null;
    function autoEnabled() { return !baReduce && window.innerWidth > 767; }
    function startAuto() {
      stopAuto();
      if (!autoEnabled()) return;
      autoTimer = setInterval(function () { go(idx + 1); }, AUTO_MS);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function restartAuto() { if (autoEnabled()) startAuto(); }

    var viewport = track.closest(".ba-viewport");
    if (viewport) {
      viewport.addEventListener("mouseenter", stopAuto);
      viewport.addEventListener("mouseleave", startAuto);
    }
    window.addEventListener("resize", startAuto);

    render();
    startAuto();
  }

  /* ---------- Keep --nav-h in sync (hero uses 100svh - nav) ---------- */
  var navEl = document.querySelector(".nav");
  function setNavH() {
    var h = navEl ? navEl.offsetHeight : 84;
    document.documentElement.style.setProperty("--nav-h", h + "px");
  }
  setNavH();
  window.addEventListener("resize", setNavH);

  /* ---------- Eased in-page scrolling for anchor links ---------- */
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var scrollRAF = null;

  function stopScroll() {
    if (scrollRAF !== null) {
      cancelAnimationFrame(scrollRAF);
      scrollRAF = null;
      document.documentElement.style.scrollBehavior = "";
    }
  }
  // Any manual scroll wins over an animation in flight.
  ["wheel", "touchstart", "keydown"].forEach(function (evt) {
    window.addEventListener(evt, stopScroll, { passive: true });
  });

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function scrollToY(end) {
    var start = window.pageYOffset;
    var delta = end - start;
    if (Math.abs(delta) < 2) return;

    stopScroll();
    // Our own per-frame scrollTo calls must not be re-smoothed by the browser.
    document.documentElement.style.scrollBehavior = "auto";

    // Longer trips get a little more time, within a comfortable range.
    var duration = Math.min(1100, Math.max(520, Math.abs(delta) * 0.45));
    var t0 = null;

    function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, start + delta * easeInOutCubic(p));
      if (p < 1) {
        scrollRAF = requestAnimationFrame(step);
      } else {
        scrollRAF = null;
        document.documentElement.style.scrollBehavior = "";
      }
    }
    scrollRAF = requestAnimationFrame(step);
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey ||
        e.shiftKey || e.altKey) return;

    var link = e.target.closest && e.target.closest('a[href*="#"]');
    if (!link || link.target === "_blank") return;

    var hash = link.hash;
    if (!hash || hash.length < 2) return;
    // Same-document links only — cross-page links keep their normal behaviour.
    if (link.pathname !== location.pathname || link.search !== location.search) return;

    var target = document.getElementById(hash.slice(1));
    if (!target) return;

    e.preventDefault();

    var offset = (navEl ? navEl.offsetHeight : 84) + 24;
    var maxY = document.documentElement.scrollHeight - window.innerHeight;
    var y = Math.max(0, Math.min(
      target.getBoundingClientRect().top + window.pageYOffset - offset,
      maxY
    ));

    if (motionQuery.matches) {
      window.scrollTo(0, y);
    } else {
      scrollToY(y);
    }

    // Keep the URL shareable without letting the browser jump on its own.
    if (history.replaceState) history.replaceState(null, "", hash);
  });

  /* ---------- Motion (GSAP, with graceful fallback) ---------- */
  function showAllReveals() {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !window.gsap) {
    // No motion library or user prefers reduced motion → just show everything.
    showAllReveals();
  } else {
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;
    if (ST) gsap.registerPlugin(ST);
    document.documentElement.classList.add("gsap");

    /* Hero entrance — one orchestrated load-in */
    if (document.getElementById("hero")) {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("#hero .hero-eyebrow", { opacity: 0, y: 18, duration: 0.6 })
        .from("#hero .hero-title", { opacity: 0, y: 30, duration: 0.9 }, "-=0.30")
        .from("#hero .lead", { opacity: 0, y: 20, duration: 0.8 }, "-=0.60")
        .from("#hero .hero-actions > *", { opacity: 0, y: 16, duration: 0.6, stagger: 0.1 }, "-=0.55")
        .from("#hero .hero-stats .hstat", { opacity: 0, y: 16, duration: 0.6, stagger: 0.12 }, "-=0.40")
        .from("#hero .hero-figure", { opacity: 0, scale: 0.97, duration: 1.1, ease: "power2.out" }, "-=1.05")
        .from("#hero .hero-chip", { opacity: 0, y: 14, duration: 0.6 }, "-=0.45");

      /* Count-up the numeric hero stats (e.g. "20+", "2") */
      gsap.utils.toArray("#hero .hero-stats .n").forEach(function (el) {
        var m = el.textContent.trim().match(/^(\d+)(\D*)$/);
        if (!m) return; // leave non-numeric values like "Zero" alone
        var target = parseInt(m[1], 10);
        var suffix = m[2] || "";
        var counter = { v: 0 };
        el.textContent = "0" + suffix;
        tl.to(counter, {
          v: target,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(counter.v) + suffix; }
        }, "-=0.9");
      });
    }

    /* Scroll reveals — staggered fade-up as each group enters */
    var scrollReveals = gsap.utils.toArray(".reveal").filter(function (el) {
      return !el.closest("#hero");
    });
    gsap.set(scrollReveals, { opacity: 0, y: 28 });

    if (ST) {
      ST.batch(scrollReveals, {
        start: "top 86%",
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.12, overwrite: true });
        }
      });

      /* Kicker rule lines draw in */
      gsap.utils.toArray(".kicker .rule").forEach(function (rule) {
        gsap.fromTo(rule, { scaleX: 0 }, {
          scaleX: 1, duration: 0.9, ease: "power2.out",
          scrollTrigger: { trigger: rule, start: "top 90%" }
        });
      });

      /* Recalculate positions once images have loaded */
      window.addEventListener("load", function () { ST.refresh(); });
    } else {
      gsap.to(scrollReveals, { opacity: 1, y: 0, duration: 0.6 });
    }
  }

  /* ---------- Contact form (Netlify Forms) ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      })
        .then(function () { window.location.href = "thank-you.html"; })
        .catch(function () { window.location.href = "thank-you.html"; });
    });
  }
})();
