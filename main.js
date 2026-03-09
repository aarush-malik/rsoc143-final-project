/* ===== Progress Bar ===== */
(function () {
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled = document.documentElement.scrollTop;
    const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
}());

/* ===== Stat Counters ===== */
(function () {
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = prefix + Math.round(easeOut(progress) * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => {
    const raw = el.textContent.trim();
    const prefix = raw.startsWith('~') ? '~' : '';
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits) {
      el.dataset.target = digits;
      el.dataset.prefix = prefix;
      el.textContent = prefix + '0';
      observer.observe(el);
    }
  });
}());

/* ===== Card Shimmer ===== */
(function () {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  });
}());

/* ===== Timeline Reveal (staggered) ===== */
(function () {
  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    const delay = i * 0.1;
    el.style.transitionDelay = delay + 's';

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        el.classList.add('tl-visible');
        // Clear delay after reveal so hover transitions are instant
        setTimeout(() => { el.style.transitionDelay = '0s'; }, (delay + 0.65) * 1000);
        obs.disconnect();
      }
    }, { threshold: 0.15 });

    obs.observe(el);
  });
}());
