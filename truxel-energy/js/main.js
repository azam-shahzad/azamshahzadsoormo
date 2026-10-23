/* Truxel Energy — page behaviour. Reads colours from tokens.css at draw time. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Sector tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      var next = tabs[(i + d + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  /* ---------- Demo form ---------- */
  var form = document.getElementById("demoForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("demoEmail");
      var note = document.getElementById("formNote");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        note.textContent = "Enter a work email like name@company.com.";
        email.focus();
        return;
      }
      note.textContent = "Thanks. A grid engineer will email " + email.value.trim() + " within one working day.";
      form.reset();
    });
  }

  /* ---------- Hero load chart ---------- */
  var canvas = document.getElementById("loadChart");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  // 24 hourly points, MW. Example data for the design.
  var forecast = [318, 302, 291, 286, 290, 312, 356, 398, 421, 430, 436, 441, 438, 432, 428, 431, 447, 486, 521, 534, 512, 468, 412, 352];
  var actual   = [322, 305, 289, 284, 293, 318, 361, 402, 418, 426, 433, 445, 440, 429, 425, 434, 452, 491, 516, 529, 508, 471, 415, 356];
  var solar    = [0, 0, 0, 0, 0, 4, 28, 74, 128, 172, 204, 218, 214, 196, 160, 112, 58, 14, 0, 0, 0, 0, 0, 0];
  var battery  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 46, 82, 94, 70, 28, 0, 0];
  var cursor = 19; // hour shown by the readouts

  function token(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function draw() {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var pad = { l: 34, r: 8, t: 8, b: 22 };
    var max = 600;
    var x = function (i) { return pad.l + (i / 23) * (w - pad.l - pad.r); };
    var y = function (v) { return pad.t + (1 - v / max) * (h - pad.t - pad.b); };

    var mute = token("--c-grid-mute"), line = token("--c-grid-line");
    ctx.font = "10px " + token("--font-data");
    ctx.fillStyle = mute; ctx.strokeStyle = line; ctx.lineWidth = 1;

    [0, 200, 400, 600].forEach(function (v) {
      ctx.beginPath(); ctx.moveTo(pad.l, y(v) + .5); ctx.lineTo(w - pad.r, y(v) + .5); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(String(v), pad.l - 6, y(v));
    });
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    [0, 6, 12, 18, 23].forEach(function (i) { ctx.fillText(String(i).padStart(2, "0") + ":00", x(i), h - pad.b + 6); });

    function area(data, color) {
      ctx.beginPath(); ctx.moveTo(x(0), y(0));
      data.forEach(function (v, i) { ctx.lineTo(x(i), y(v)); });
      ctx.lineTo(x(23), y(0)); ctx.closePath();
      ctx.globalAlpha = .55; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1;
    }
    function path(data, color, width, dash) {
      ctx.beginPath(); ctx.setLineDash(dash || []);
      data.forEach(function (v, i) { i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)); });
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); ctx.setLineDash([]);
    }
    area(solar, token("--c-solar"));
    area(battery, token("--c-copper"));
    path(forecast, mute, 1.5, [4, 4]);
    path(actual, token("--c-volt"), 2.25);

    // cursor
    ctx.strokeStyle = token("--c-grid-ink"); ctx.globalAlpha = .35;
    ctx.beginPath(); ctx.moveTo(x(cursor) + .5, pad.t); ctx.lineTo(x(cursor) + .5, h - pad.b); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(x(cursor), y(actual[cursor]), 4.5, 0, Math.PI * 2);
    ctx.fillStyle = token("--c-volt"); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = token("--c-grid"); ctx.stroke();
  }

  function updateReadouts() {
    var mw = actual[cursor] + (Math.random() - .5) * 1.6;
    document.getElementById("roMw").innerHTML = mw.toFixed(1) + "<small>MW</small>";
    var hz = 50 + (Math.random() - .5) * .04;
    document.getElementById("roHz").innerHTML = hz.toFixed(2) + "<small>Hz</small>";
    var soc = Math.max(10, 68 - Math.round(battery[cursor] / 30));
    document.getElementById("roSoc").innerHTML = soc + "<small>%</small>";
  }

  draw(); updateReadouts();
  window.addEventListener("resize", draw);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  if (!reduceMotion) setInterval(updateReadouts, 1500);
})();
