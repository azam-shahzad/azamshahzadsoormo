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
  var darkSel = ".night, .energy, .footer";
  function update() {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
    var probe = document.elementFromPoint(window.innerWidth / 2, nav.offsetHeight + 2);
    nav.classList.toggle("nav--dark", !!(probe && probe.closest(darkSel)));
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
