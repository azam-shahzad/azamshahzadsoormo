// Truxco — mobile nav + valuation form validation
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

  const form = document.getElementById('valuation-form');
  const email = form.elements.email;
  const error = document.getElementById('email-error');
  const status = form.querySelector('.valuation__status');

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
