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
  // Quintic ease-out: fast start, pronounced deceleration toward the end
  function easeOut(t) { return 1 - Math.pow(1 - t, 5); }

  function animateCounter(el, delay) {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const duration = 2200;

    setTimeout(function () {
      const box = el.closest('.stat-box');
      if (box) box.classList.add('stat-visible');

      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = prefix + Math.round(easeOut(progress) * target).toLocaleString();
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          // Brief flash when the number lands
          if (box) box.classList.add('stat-done');
        }
      }
      requestAnimationFrame(tick);
    }, delay);
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        const idx = parseInt(entry.target.dataset.index || 0, 10);
        animateCounter(entry.target, idx * 150);
      }
    });
  }, { threshold: 0.3 });

  var idx = 0;
  document.querySelectorAll('.stat-number').forEach(function (el) {
    const raw = el.textContent.trim();
    const prefix = raw.startsWith('~') ? '~' : '';
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits) {
      el.dataset.target = digits;
      el.dataset.prefix = prefix;
      el.dataset.index = idx++;
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
  // Humanised timing: random offset that stays positive so it never rushes
  var jitter = function (base, lo, hi) { return base + lo + Math.random() * (hi - lo); };

  // Rebuild h1 — all spans start empty; without JS the original <s>Riot</s> markup remains
  h1.innerHTML =
    '<span class="typed-prefix"></span>'  +
    '<span class="typed-attica accent"></span>' +
    '<span class="riot-container">'  +
      '<span class="riot-word"></span>' +
      '<span class="strike-line"></span>' +
    '</span>' +
    '<span class="uprising-word accent"></span>' +
    '<span class="type-cursor"></span>';

  var prefixSpan    = h1.querySelector('.typed-prefix');
  var atticaSpan    = h1.querySelector('.typed-attica');
  var riotContainer = h1.querySelector('.riot-container');
  var riotWord      = h1.querySelector('.riot-word');
  var strikeLine    = h1.querySelector('.strike-line');
  var uprisingWord  = h1.querySelector('.uprising-word');
  var cursor        = h1.querySelector('.type-cursor');

  // Place cursor right after the prefix span to start
  prefixSpan.after(cursor);

  async function typeInto(el, text, baseMs, loJitter, hiJitter) {
    for (var i = 0; i < text.length; i++) {
      await delay(jitter(baseMs, loJitter, hiJitter));
      el.textContent += text[i];
    }
  }

  async function run() {
    // Hide subtitle & tagline — will fade in after the sequence
    [subtitle, tagline].forEach(function (el) {
      if (!el) return;
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(20px)';
      el.style.transition = 'opacity 1.1s ease, transform 1.1s ease';
    });

    await delay(700);

    // "The " — steady, unhurried
    await typeInto(prefixSpan, 'The\u00a0', 130, 0, 55);

    // Move cursor; type "Attica " — slightly faster, it's a proper name being recalled
    atticaSpan.after(cursor);
    await typeInto(atticaSpan, 'Attica\u00a0', 120, 0, 50);

    // Move cursor; type "Riot" — deliberate, like writing something you're about to cross out
    riotContainer.after(cursor);
    await delay(jitter(0, 80, 160)); // tiny pre-pause, feels like a breath
    await typeInto(riotWord, 'Riot', 145, 0, 70);

    // Long pause — hesitation before the correction
    await delay(1100);

    // Draw strikethrough left-to-right
    strikeLine.classList.add('drawn');
    await delay(680); // let the line fully finish before moving on

    // Move cursor; type " Uprising"
    uprisingWord.after(cursor);
    uprisingWord.textContent = '\u00a0';
    await delay(200);
    await typeInto(uprisingWord, 'Uprising', 130, 0, 65);

    // Subtitle then tagline drift up — unhurried, let the title breathe first
    await delay(900);
    if (subtitle) { subtitle.style.opacity = '1'; subtitle.style.transform = 'translateY(0)'; }
    await delay(600);
    if (tagline)  { tagline.style.opacity  = '1'; tagline.style.transform  = 'translateY(0)'; }

    // Cursor lingers, then fades
    await delay(2200);
    cursor.style.transition = 'opacity 0.7s ease';
    cursor.style.opacity = '0';
    setTimeout(function () { if (cursor.parentNode) cursor.remove(); }, 800);
  }

  run();
}());
