// Truxco hero options — mobile nav per option, Buy/Sell tabs, quick-filter chips
(function () {
  document.querySelectorAll('.nav__toggle').forEach((toggle) => {
    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  });

  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    function select(tab) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      tab.focus();
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length]);
        if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length]);
      });
    });
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    });
  });
})();
