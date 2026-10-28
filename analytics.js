/* Home Organizers Long Island — analytics, consent & conversion tracking
   ---------------------------------------------------------------------
   Paste the two IDs below to switch tracking on. While an ID is empty its
   tool simply never loads, so the site works untouched before setup.

     GA4     → analytics.google.com → Admin → Data streams → Measurement ID
     Clarity → clarity.microsoft.com → Settings → Project ID

   Google Consent Mode v2 is set to "denied" before gtag.js loads, so GA4
   sends cookieless pings until the visitor accepts. Clarity has no
   cookieless mode, so it only loads after an explicit accept.

   Add ?debug=1 to any URL to log every event to the console. */
(function () {
  "use strict";

  var GA4_ID = "G-E7NLV3QNG0";
  var CLARITY_ID = "z4kt20itio";

  var STORAGE_KEY = "ho_consent"; // "granted" | "denied"
  var DEBUG = /[?&]debug=1\b/.test(location.search);

  function log() {
    if (!DEBUG) return;
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console, ["[analytics]"].concat(args));
  }

  /* localStorage throws in private mode on some browsers — never let that
     take the page down with it. */
  function readConsent() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }
  function writeConsent(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* ignore */
    }
  }

  /* ---------- Google Consent Mode v2 (must run before gtag.js) ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted"
  });

  /* ---------- GA4 ---------- */
  if (GA4_ID) {
    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    document.head.appendChild(ga);

    gtag("js", new Date());
    gtag("config", GA4_ID);
    log("GA4 configured", GA4_ID);
  } else {
    log("GA4_ID is empty — GA4 not loaded");
  }

  /* ---------- Microsoft Clarity (consent-gated) ---------- */
  var clarityLoaded = false;
  function loadClarity() {
    if (clarityLoaded || !CLARITY_ID) return;
    clarityLoaded = true;

    // Official Clarity bootstrap, with the queue stub it expects.
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);

    window.clarity("consent");
    log("Clarity loaded", CLARITY_ID);
  }

  /* ---------- Consent state ---------- */
  function grantConsent() {
    writeConsent("granted");
    gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted"
    });
    loadClarity();
    log("consent granted");
  }

  function denyConsent() {
    writeConsent("denied");
    log("consent denied — GA4 stays cookieless, Clarity stays off");
  }

  var stored = readConsent();
  if (stored === "granted") grantConsent();

  /* ---------- Consent banner ---------- */
  function buildBanner() {
    var banner = document.createElement("div");
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.innerHTML =
      '<p>We use cookies to understand how visitors find and use this site, ' +
      'so we can make it better. Nothing is ever sold or shared. ' +
      'See our <a href="privacy.html">privacy policy</a>.</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn btn--secondary btn--sm" data-consent="deny">Decline</button>' +
      '<button type="button" class="btn btn--primary btn--sm" data-consent="accept">Accept</button>' +
      "</div>";

    banner.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("button[data-consent]");
      if (!btn) return;
      if (btn.getAttribute("data-consent") === "accept") grantConsent();
      else denyConsent();
      dismiss(banner);
    });

    document.body.appendChild(banner);

    // Reveal on the next frame so the CSS transition actually runs. rAF is
    // throttled in background tabs, so a timer backs it up — otherwise the
    // banner would sit at opacity 0 while still swallowing clicks.
    var reveal = function () {
      banner.classList.add("in");
    };
    requestAnimationFrame(function () {
      requestAnimationFrame(reveal);
    });
    setTimeout(reveal, 120);
  }

  function dismiss(banner) {
    banner.classList.remove("in");
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 300);
  }

  // Only worth showing if there is actually something to consent to.
  if (!stored && (GA4_ID || CLARITY_ID)) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", buildBanner);
    } else {
      buildBanner();
    }
  }

  /* Lets someone change their mind — referenced from privacy.html. */
  window.hoResetConsent = function () {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    location.reload();
  };

  /* ---------- Clarity smart events & tags ---------- */
  /* Mirrors our events into Clarity (only once it has loaded, i.e. after
     consent) so recordings can be filtered — "dropped at step 2", "picked
     Closet" — and a funnel built from view_contact_form → form_step_2 →
     form_step_3 → generate_lead. Steps become separate event names because a
     Clarity funnel step is an event, not an event plus a parameter. Only these
     non-personal fields ever become tags. */
  var CLARITY_TAGS = ["need", "timeline", "contact_pref", "form_location", "preset", "cta_location"];
  function toClarity(name, params) {
    if (typeof window.clarity !== "function") return;
    var event = name === "form_step" && params.step ? "form_step_" + params.step : name;
    window.clarity("event", event);
    CLARITY_TAGS.forEach(function (key) {
      if (params[key] != null && params[key] !== "") window.clarity("set", key, String(params[key]));
    });
    if (name === "generate_lead") window.clarity("set", "lead", "yes");
    log("clarity", event);
  }

  /* ---------- Event tracking ---------- */
  /* `done` (optional) runs once the hit is sent, or after a short timeout,
     so callers can navigate away without dropping the event — gtag batches
     hits and a page unload can swallow them. */
  function track(name, params, done) {
    var payload = params || {};
    payload.page_path = location.pathname;
    log("event", name, payload);

    var finished = false;
    function finish() {
      if (finished || !done) return;
      finished = true;
      done();
    }

    toClarity(name, payload);

    if (window.gtag && GA4_ID) {
      if (done) {
        payload.event_callback = finish;
        payload.event_timeout = 1500;
        setTimeout(finish, 1600); // gtag never calls back if it failed to load
      }
      window.gtag("event", name, payload);
    } else {
      finish();
    }
  }
  // script.js fires generate_lead through this after a confirmed submission.
  window.hoTrack = track;

  /* Where on the page a click happened, so we can tell a hero CTA apart
     from the same link repeated in the footer. */
  function locationOf(el) {
    if (el.closest(".nav-overlay")) return "mobile_nav";
    if (el.closest(".nav")) return "nav";
    if (el.closest(".footer")) return "footer";
    if (el.closest("#hero")) return "hero";
    if (el.closest("#contact")) return "contact";
    var section = el.closest("section[id]");
    return section ? section.id : "body";
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[href]");
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var where = locationOf(link);

    if (href.indexOf("tel:") === 0) {
      track("contact_phone", { link_location: where, link_url: href });
    } else if (href.indexOf("mailto:") === 0) {
      track("contact_email", { link_location: where, link_url: href });
    } else if (href.indexOf("instagram.com") !== -1) {
      track("instagram_click", { link_location: where });
    } else if (href.indexOf("#contact") !== -1) {
      track("cta_click", {
        cta_text: (link.textContent || "").trim().slice(0, 60),
        cta_location: where
      });
    }
  });

  /* Form engagement funnel: saw the form → started it → submitted it. */
  var form = document.getElementById("contactForm");
  if (form) {
    var started = false;
    form.addEventListener(
      "input",
      function () {
        if (started) return;
        started = true;
        track("form_start");
      },
      { once: false }
    );

    if ("IntersectionObserver" in window) {
      var seen = false;
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || seen) return;
            seen = true;
            track("view_contact_form");
            io.disconnect();
          });
        },
        { threshold: 0.4 }
      );
      io.observe(form);
    }
  }
})();
