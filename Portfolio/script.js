// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CURSOR + MAGNETIC PULL
// ─────────────────────────────────────────────────────────────────────────────
const cursor    = document.createElement('div');
const cursorDot = document.createElement('div');
cursor.className    = 'custom-cursor';
cursorDot.className = 'custom-cursor-dot';
document.body.appendChild(cursor);
document.body.appendChild(cursorDot);

let mouseX = -100, mouseY = -100;
let curX   = -100, curY   = -100;
let targetX = -100, targetY = -100;

document.addEventListener('mousemove', (e) => {
  targetX = e.clientX;
  targetY = e.clientY;

  // Magnetic pull toward nearest interactive element
  let pull = 0, pullX = 0, pullY = 0;
  document.querySelectorAll('a, button').forEach(el => {
    const r    = el.getBoundingClientRect();
    const cx   = r.left + r.width  / 2;
    const cy   = r.top  + r.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const radius = 90;
    if (dist < radius) {
      const strength = (1 - dist / radius) * 0.4;
      pullX += (cx - e.clientX) * strength;
      pullY += (cy - e.clientY) * strength;
      pull   = Math.max(pull, strength);
    }
  });

  mouseX = e.clientX + pullX;
  mouseY = e.clientY + pullY;
  cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  cursor.style.setProperty('--pull', pull);
});

(function animateCursor() {
  curX += (mouseX - curX) * 0.1;
  curY += (mouseY - curY) * 0.1;
  cursor.style.transform = `translate(${curX}px, ${curY}px)`;
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
});

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL PROGRESS LINE
// ─────────────────────────────────────────────────────────────────────────────
const progressLine = document.createElement('div');
progressLine.className = 'scroll-progress';
document.body.appendChild(progressLine);

window.addEventListener('scroll', () => {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  progressLine.style.transform = `scaleY(${docH > 0 ? window.scrollY / docH : 0})`;
}, { passive: true });

// ─────────────────────────────────────────────────────────────────────────────
// TEXT SCRAMBLE
// ─────────────────────────────────────────────────────────────────────────────
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?><—=+*#/\\[]{}';

function scramble(el) {
  const original = el.dataset.orig || el.textContent.trim();
  el.dataset.orig = original;
  const chars = original.split('');
  const delays = chars.map(() => Math.floor(Math.random() * 8));
  const durations = chars.map(() => Math.floor(Math.random() * 10) + 6);
  let frame = 0;

  function tick() {
    let html = '';
    let done = 0;
    chars.forEach((ch, i) => {
      if (ch === ' ') { html += ' '; done++; return; }
      if (frame >= delays[i] + durations[i]) {
        html += ch; done++;
      } else if (frame >= delays[i]) {
        const g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        html += `<span class="sc-char">${g}</span>`;
      } else {
        html += `<span class="sc-dim">${ch}</span>`;
      }
    });
    el.innerHTML = html;
    if (done < chars.filter(c => c !== ' ').length) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = original;
    }
    frame++;
  }
  requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE TICKER
// ─────────────────────────────────────────────────────────────────────────────
function createMarquee(text, reverse = false) {
  const wrap = document.createElement('div');
  wrap.className = 'marquee-wrap';
  const inner = document.createElement('div');
  inner.className = 'marquee-inner' + (reverse ? ' marquee-inner--rev' : '');
  // Repeat text enough times to fill viewport even when scrolling
  const repeated = (text + ' ').repeat(8);
  inner.textContent = repeated + repeated;
  wrap.appendChild(inner);
  return wrap;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM READY
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Nav toggle ──────────────────────────────────────────────────────────────
  const toggle  = document.querySelector('.menu-toggle');
  const navList = document.querySelector('nav ul');
  if (toggle && navList) {
    toggle.addEventListener('click', () => navList.classList.toggle('open'));
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
  }

  // ── Reveal on scroll ────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  // Scramble observer for headings
  const scrambleTargets = document.querySelectorAll('.section-subtitle, .page-title span, .skills-heading');
  const scrambleIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.scrambled) {
        e.target.dataset.scrambled = '1';
        scrambleIO.unobserve(e.target);
        scramble(e.target);
      }
    });
  }, { threshold: 0.6 });
  scrambleTargets.forEach(el => scrambleIO.observe(el));

  // ── Hero name — split into letters ──────────────────────────────────────────
  const heroName = document.getElementById('heroName');
  if (heroName) {
    const text = heroName.textContent;
    heroName.textContent = '';
    text.split('').forEach((char) => {
      if (char === ' ') { heroName.appendChild(document.createTextNode(' ')); return; }
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = char;
      heroName.appendChild(span);
    });
  }

  // ── Hero letter scatter on scroll ───────────────────────────────────────────
  const heroSection = document.getElementById('hero');
  const letters = [...document.querySelectorAll('#heroName .letter')];
  if (heroSection && letters.length) {
    const scatter = letters.map((_, i) => {
      const angle = (i / letters.length) * Math.PI * 2 + Math.random() * 1.2;
      const dist  = 120 + Math.random() * 220;
      return {
        x:  Math.cos(angle) * dist,
        y:  Math.sin(angle) * dist * 0.5,
        r:  (Math.random() - 0.5) * 80,
        s:  0.2 + Math.random() * 0.5,
      };
    });

    letters.forEach(l => { l.style.display = 'inline-block'; l.style.willChange = 'transform, opacity'; });

    window.addEventListener('scroll', () => {
      const heroH = heroSection.offsetHeight;
      const prog  = Math.max(0, Math.min(1, window.scrollY / (heroH * 0.75)));
      const ease  = prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog;

      letters.forEach((l, i) => {
        const d = scatter[i];
        l.style.transform = `translate(${d.x * ease}px, ${d.y * ease}px) rotate(${d.r * ease}deg) scale(${1 - (1 - d.s) * ease})`;
        l.style.opacity   = String(1 - ease * 0.95);
      });
    }, { passive: true });
  }

  // ── Marquee strips between sections ─────────────────────────────────────────
  const marqueeDefs = [
    { after: '#about',      text: 'VIDEOGRAPHER  ·  COMPUTER ENGINEER  ·  AUTOMATION  ·  CONTENT CREATOR  ·  PHILIPPINES  ·  ', rev: false },
    { after: '#experience', text: 'PLC  ·  EMBEDDED SYSTEMS  ·  DAVINCI RESOLVE  ·  FINAL CUT PRO  ·  ARDUINO  ·  KEYENCE  ·  ', rev: true  },
  ];

  marqueeDefs.forEach(({ after, text, rev }) => {
    const anchor = document.querySelector(after);
    if (!anchor) return;
    const m = createMarquee(text, rev);
    anchor.insertAdjacentElement('afterend', m);
  });

  // ── Film frame 3-D tilt ─────────────────────────────────────────────────────
  document.querySelectorAll('.film-frame').forEach((frame) => {
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      frame.style.transform = `perspective(600px) rotateX(${(-y / rect.height) * 14}deg) rotateY(${(x / rect.width) * 14}deg) scale(1.06)`;
    });
    frame.addEventListener('mouseleave', () => { frame.style.transform = ''; });
  });

});
