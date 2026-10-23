/* Truxel — page behaviour */
(function () {
  "use strict";

  /* Mobile navigation */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* Contact form (no backend yet) */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cName");
      var email = document.getElementById("cEmail");
      var note = document.getElementById("formNote");
      if (!name.value.trim()) { note.textContent = "Add your name so we know who to reply to."; name.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { note.textContent = "Enter an email like name@company.com."; email.focus(); return; }
      note.textContent = "Thanks, " + name.value.trim() + ". We'll reply to " + email.value.trim() + ".";
      form.reset();
    });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  /* Reveal sections as they scroll in. Content is visible by default;
     the animation starts just before an element enters the screen. */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-in"); revealIO.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px 12% 0px" });
  Array.prototype.forEach.call(document.querySelectorAll("[data-reveal]"), function (el, i) {
    var r = el.getBoundingClientRect();
    if (r.top > window.innerHeight) { el.style.animationDelay = (i % 3) * 0.08 + "s"; revealIO.observe(el); }
  });

  /* Count numbers up when they come into view (final value is in the HTML) */
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, end = parseFloat(el.getAttribute("data-count")), t0 = null;
      countIO.unobserve(el);
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (el) { countIO.observe(el); });

  /* Gentle parallax on the hero photo */
  var bg = document.querySelector(".hero__bg"), ticking = false;
  if (bg) {
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight * 1.2);
        bg.style.transform = "translate3d(0," + (y * -0.12).toFixed(1) + "px,0)";
        ticking = false;
      });
    }, { passive: true });
  }
})();

/* Frosted nav: firm up the glass once the page scrolls */
(function () {
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var darkSel = ".night, .energy, .footer, .foot, .impact__panel, .svc__media, .reel";
  function update() {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
    var mid = nav.offsetHeight / 2, dark = false;
    Array.prototype.forEach.call(document.querySelectorAll(darkSel), function (el) {
      var r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid && r.left <= window.innerWidth / 2 && r.right >= window.innerWidth / 2) dark = true;
    });
    nav.classList.toggle("nav--dark", dark);
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
})();

/* Spotlight hover: feed pointer position to .spot cards */
(function () {
  if (window.matchMedia("(hover: none)").matches) return;
  document.addEventListener("pointermove", function (e) {
    var el = e.target.closest && e.target.closest(".spot");
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (e.clientX - r.left) + "px");
    el.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
})();

/* Services: expand one row and swap the photo */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll(".svc__item"));
  if (!items.length) return;
  var imgs = document.querySelectorAll(".svc__img");
  var cap = document.getElementById("svcCaption");
  function activate(i) {
    items.forEach(function (it, k) {
      var on = k === i;
      it.classList.toggle("is-active", on);
      it.querySelector(".svc__btn").setAttribute("aria-expanded", String(on));
    });
    Array.prototype.forEach.call(imgs, function (im, k) { im.classList.toggle("is-active", k === i); });
    if (cap) cap.textContent = items[i].querySelector(".svc__title").textContent;
  }
  items.forEach(function (it, i) {
    it.querySelector(".svc__btn").addEventListener("click", function () { activate(i); });
    it.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) activate(i); });
  });
})();

/* Gallery: expand the hovered / focused / tapped panel */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll(".reel__item"));
  if (!items.length) return;
  function activate(el) { items.forEach(function (it) { it.classList.toggle("is-active", it === el); }); }
  items.forEach(function (it) {
    it.addEventListener("mouseenter", function () { activate(it); });
    it.addEventListener("focus", function () { activate(it); });
    it.addEventListener("click", function (e) {
      if (!it.classList.contains("is-active")) { e.preventDefault(); activate(it); }
    });
  });
})();


/* About dashboard: chart curves per range tab */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll(".dash__chart"), function (box) { var svg = box.querySelector("svg"); var root = box.parentNode.closest("section");
  var line = svg.querySelector(".dash__line"), area = svg.querySelector(".dash__area"), dot = svg.querySelector(".dash__dot");
  var sets = [
    [150,140,152,120,128,96,104,80,92,70,84,62],
    [168,150,156,128,110,122,92,74,96,70,60,48],
    [176,160,138,146,118,100,108,84,66,76,52,40],
    [182,170,150,128,120,98,86,90,70,58,46,30]
  ];
  function path(v) {
    var step = 520 / (v.length - 1), d = "M0 " + v[0];
    for (var i = 1; i < v.length; i++) {
      var x0 = (i - 1) * step, x1 = i * step, cx = (x0 + x1) / 2;
      d += " C" + cx + " " + v[i - 1] + " " + cx + " " + v[i] + " " + x1 + " " + v[i];
    }
    return d;
  }
  function draw(i) {
    var v = sets[i], d = path(v);
    line.setAttribute("d", d); area.setAttribute("d", d + " L520 200 L0 200 Z");
    dot.setAttribute("cx", 520 * 8 / 11); dot.setAttribute("cy", v[8]);
  }
  var tabs = root.querySelectorAll(".dash__tabs button");
  Array.prototype.forEach.call(tabs, function (b) {
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(tabs, function (t) { t.setAttribute("aria-selected", String(t === b)); });
      draw(+b.getAttribute("data-range"));
    });
  });
  draw(1);
}); })();
