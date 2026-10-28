/* Home Organizers Long Island — town / ZIP suggestions for the contact form.
   Enhances #hcLocation into an accessible combobox. Suggestions cover all of
   New York State (GeoNames postal codes, CC BY 4.0 — credited on privacy.html)
   and rank Long Island first, then NYC, then the rest of the state. Free text is
   always accepted: picking a suggestion is a convenience, never a requirement.
   The data file is only fetched the first time someone focuses the field. */
(function () {
  "use strict";

  var input = document.getElementById("hcLocation");
  if (!input) return;

  var DATA_URL = "assets/data/ny-places.v1.json";
  var MAX = 6;
  var field = input.closest(".hc-field") || input.parentNode;
  var places = null;
  var loading = null;
  var results = [];
  var active = -1;
  var selecting = false;

  /* ---------- Markup & ARIA ---------- */
  var list = document.createElement("ul");
  list.id = "hcLocationList";
  list.className = "hc-ac";
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", "Town and ZIP suggestions");
  list.hidden = true;
  input.insertAdjacentElement("afterend", list);

  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", list.id);
  // Two dropdowns fighting over the same field is worse than either alone.
  input.setAttribute("autocomplete", "off");

  /* ---------- Data ---------- */
  function norm(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function load() {
    if (places || loading) return loading;
    loading = fetch(DATA_URL)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (d) {
        places = d.places.map(function (p) {
          return { name: p[0], area: p[1], prio: p[2], zips: p[3], key: norm(p[0]) };
        });
      })
      .catch(function () {
        places = []; // no suggestions, the field still works as plain text
      });
    return loading;
  }

  /* ---------- Matching ---------- */
  function search(raw) {
    var q = norm(raw).replace(/\b(ny|new york state)$/, "").trim();
    if (!places || !q) return [];

    if (/^\d+$/.test(q)) {
      if (q.length < 3) return [];
      var byZip = [];
      places.forEach(function (p) {
        p.zips.forEach(function (z) {
          if (z.indexOf(q) === 0) {
            byZip.push({ main: z + " · " + p.name, sub: p.area === p.name ? "New York City" : p.area, value: p.name + ", NY " + z, prio: p.prio, sort: z });
          }
        });
      });
      return byZip
        .sort(function (a, b) { return a.prio - b.prio || (a.sort < b.sort ? -1 : 1); })
        .slice(0, MAX);
    }

    if (q.length < 2) return [];
    var byName = [];
    places.forEach(function (p) {
      var score;
      if (p.key.indexOf(q) === 0) score = 0; // "garden c" → Garden City
      else if (p.key.indexOf(" " + q) !== -1) score = 1; // "islip" → West Islip
      else if (q.length >= 3 && p.key.indexOf(q) !== -1) score = 2; // "hampton" → Southampton
      else return;
      byName.push({
        main: p.name,
        // "Brooklyn · Brooklyn" says nothing; say which city it is instead
        sub: p.area === p.name ? "New York City" : p.area,
        // One ZIP is unambiguous enough to fill in; several are left for the visitor
        value: p.name + ", NY" + (p.zips.length === 1 ? " " + p.zips[0] : ""),
        prio: p.prio,
        score: score,
        sort: p.key
      });
    });
    return byName
      .sort(function (a, b) { return a.prio - b.prio || a.score - b.score || (a.sort < b.sort ? -1 : 1); })
      .slice(0, MAX);
  }

  /* ---------- Rendering ---------- */
  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render() {
    list.innerHTML = "";
    results.forEach(function (r, i) {
      var li = document.createElement("li");
      li.id = "hcLocationOpt" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === active ? "true" : "false");
      li.className = i === active ? "is-active" : "";
      li.innerHTML =
        '<span class="hc-ac-main">' + escapeHtml(r.main) + "</span>" +
        (r.sub ? '<span class="hc-ac-sub">' + escapeHtml(r.sub) + "</span>" : "");
      // pointerdown, not click: keep focus in the input so blur doesn't close the list first
      li.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        choose(i);
      });
      list.appendChild(li);
    });
    var open = results.length > 0;
    list.hidden = !open;
    list.style.top = input.offsetTop + input.offsetHeight + 4 + "px";
    input.setAttribute("aria-expanded", open ? "true" : "false");
    if (active >= 0) {
      input.setAttribute("aria-activedescendant", "hcLocationOpt" + active);
      var el = list.children[active];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function close() {
    results = [];
    active = -1;
    render();
  }

  function update() {
    if (selecting) return;
    load().then(function () {
      results = search(input.value);
      active = -1;
      render();
    });
  }

  function choose(i) {
    var r = results[i];
    if (!r) return;
    selecting = true;
    input.value = r.value;
    // Let contact-form.js clear any "add your town" error
    input.dispatchEvent(new Event("input", { bubbles: true }));
    selecting = false;
    close();
  }

  /* ---------- Events ---------- */
  input.addEventListener("focus", load);
  input.addEventListener("input", update);
  input.addEventListener("blur", function () {
    setTimeout(close, 120);
  });
  input.addEventListener("keydown", function (e) {
    var open = !list.hidden;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!open) { update(); return; }
      e.preventDefault();
      var n = results.length;
      active = e.key === "ArrowDown" ? (active + 1) % n : (active - 1 + n) % n;
      render();
    } else if (e.key === "Enter" && open && active >= 0) {
      // pick the suggestion instead of submitting / moving to the next step
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" && open) {
      // close the list without closing the modal around it
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  });
})();
