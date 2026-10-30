// Truxco — mobile nav, hero tabs, listings carousel, testimonials switcher + valuation form validation
(function () {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Icon motion: pop icons in as they scroll into view, staggered per group
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const iconGroups = ['.stat-cards', '.about-bento', '.svc-group', '.tq'];
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    const seen = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        seen.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    iconGroups.forEach((sel) => {
      document.querySelectorAll(sel).forEach((group) => {
        group.querySelectorAll('.stat-card img, .tile img, .svc img, .tq__icon').forEach((img, i) => {
          img.classList.add('anim-icon');
          img.style.setProperty('--d', (i * 0.12) + 's');
          img.addEventListener('animationend', () => img.classList.add('is-done'), { once: true });
          seen.observe(img);
        });
      });
    });
  }

  // Hero Buy / Sell tabs
  const tabs = [...document.querySelectorAll('.tabs__list [role="tab"]')];
  function selectTab(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });

  // Featured listings carousel
  const track = document.getElementById('listings-track');
  const [prev, next] = document.querySelectorAll('.carousel__btn');
  const bar = document.querySelector('.carousel__progress span');

  function updateCarousel() {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
    const visible = track.clientWidth / track.scrollWidth;
    bar.style.width = (visible * 100) + '%';
    bar.style.transform = 'translateX(' + (max > 0 ? (track.scrollLeft / max) * (1 / visible - 1) * 100 : 0) + '%)';
  }

  document.querySelectorAll('.carousel__btn').forEach((b) => {
    b.addEventListener('click', () => {
      const step = track.querySelector('.listing').offsetWidth + 24;
      track.scrollBy({ left: step * Number(b.dataset.dir), behavior: 'smooth' });
    });
  });
  track.addEventListener('scroll', updateCarousel, { passive: true });
  window.addEventListener('resize', updateCarousel);
  updateCarousel();

  // Testimonials: one quote at a time, switch by author or arrows
  const slides = [...document.querySelectorAll('.tq__slide')];
  const whos = [...document.querySelectorAll('.tq__who')];
  let current = 0;
  function showQuote(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => { s.hidden = n !== current; });
    whos.forEach((w, n) => w.setAttribute('aria-pressed', String(n === current)));
  }
  whos.forEach((w) => w.addEventListener('click', () => showQuote(Number(w.dataset.go))));
  document.querySelectorAll('.tq__arrow').forEach((a) => {
    a.addEventListener('click', () => showQuote(current + Number(a.dataset.step)));
  });

  const form = document.getElementById('valuation-form');
  const email = form.elements.email;
  const error = document.getElementById('email-error');
  const status = document.querySelector('.valuation__status');

  function validateEmail() {
    if (!email.value.trim()) return 'Enter your email so we can send the estimate.';
    if (!email.validity.valid) return 'That email looks incomplete — check for a typo.';
    return '';
  }

  function showError(msg) {
    error.textContent = msg;
    email.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  email.addEventListener('blur', () => showError(validateEmail()));
  email.addEventListener('input', () => {
    if (email.getAttribute('aria-invalid') === 'true' && !validateEmail()) showError('');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = validateEmail();
    showError(msg);
    if (msg) {
      email.focus();
      return;
    }
    status.textContent = 'Thanks! We’ll get back to you with an estimate within 24 hours.';
    form.reset();
  });
})();
