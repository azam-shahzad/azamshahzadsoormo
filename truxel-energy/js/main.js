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
})();
