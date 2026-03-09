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

/* ===== Hero Typewriter (index.html only) ===== */
(function () {
  var h1 = document.querySelector('.hero h1');
  if (!h1) return;

  var subtitle = document.querySelector('.hero .subtitle');
  var tagline  = document.querySelector('.hero .tagline');

  var delay  = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var jitter = function (base, v) { return base + (Math.random() - 0.5) * v; };

  // Rebuild h1 with animated structure; without JS the original static <s>Riot</s> remains
  h1.innerHTML =
    'The <span class="accent">Attica</span> ' +
    '<span class="riot-container">' +
      '<span class="riot-word"></span>' +
      '<span class="strike-line"></span>' +
    '</span>' +
    '<span class="uprising-word accent"></span>' +
    '<span class="type-cursor"></span>';

  var riotWord    = h1.querySelector('.riot-word');
  var strikeLine  = h1.querySelector('.strike-line');
  var uprisingWord = h1.querySelector('.uprising-word');
  var cursor      = h1.querySelector('.type-cursor');

  async function run() {
    // Hide subtitle & tagline so we can fade them in after
    [subtitle, tagline].forEach(function (el) {
      if (!el) return;
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(14px)';
      el.style.transition = 'opacity 0.75s ease, transform 0.75s ease';
    });

    await delay(480);

    // Type "Riot"
    for (var ch of 'Riot') {
      await delay(jitter(95, 45));
      riotWord.textContent += ch;
    }

    await delay(880);

    // Draw strikethrough across "Riot"
    strikeLine.classList.add('drawn');
    await delay(520);

    // Move cursor to after the uprising span, then type " Uprising"
    uprisingWord.after(cursor);
    uprisingWord.textContent = '\u00a0'; // gap

    for (var ch2 of 'Uprising') {
      await delay(jitter(88, 42));
      uprisingWord.textContent += ch2;
    }

    // Fade in subtitle, then tagline
    await delay(360);
    if (subtitle) { subtitle.style.opacity = '1'; subtitle.style.transform = 'translateY(0)'; }
    await delay(230);
    if (tagline)  { tagline.style.opacity  = '1'; tagline.style.transform  = 'translateY(0)'; }

    // Cursor blinks a moment then disappears
    await delay(1800);
    cursor.style.transition = 'opacity 0.55s';
    cursor.style.opacity = '0';
    setTimeout(function () { cursor.remove(); }, 650);
  }

  run();
}());
