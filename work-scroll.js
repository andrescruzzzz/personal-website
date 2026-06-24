(() => {
  const outer = document.getElementById('wsOuter');
  if (!outer) return;

  const personalGroup  = document.getElementById('wsSlidesPersonalGroup');
  const businessGroup  = document.getElementById('wsSlidesBusinessGroup');
  const personalCont   = document.getElementById('wsSlidesPersonal');
  const businessCont   = document.getElementById('wsSlidesBusiness');
  const personalSlides = [...(personalCont?.querySelectorAll('.ws-slide') || [])];
  const businessSlides = [...(businessCont?.querySelectorAll('.ws-slide') || [])];

  const audioBtn       = document.getElementById('wsAudioBtn');
  const counterCurrent = document.getElementById('wsCounterCurrent');
  const counterTotal   = document.getElementById('wsCounterTotal');
  const progressEl     = document.getElementById('wsProgress');
  const scrollHint     = document.getElementById('wsScrollHint');
  const labelEl        = document.getElementById('wsLabel');
  const bgRow1         = document.getElementById('wsBgRow1');
  const bgRow2         = document.getElementById('wsBgRow2');

  const P = personalSlides.length;
  const B = businessSlides.length;

  function vh() { return window.innerHeight; }

  function setHeight() {
    outer.style.height = `${(P + B + 0.5) * vh()}px`;
  }
  setHeight();

  // ── Personal: flex row, slides go LEFT as you scroll (enter from right) ──
  personalCont.style.display = 'flex';
  personalCont.style.width   = `${P * 100}%`;
  personalCont.style.height  = '100%';
  personalSlides.forEach(s => {
    s.style.position = 'relative';
    s.style.flex     = `0 0 ${100 / P}%`;
    s.style.height   = '100%';
  });

  // ── Business: each slide stacked at -(i * 100%) from container origin  ──
  // Container = 100vw wide. Each slide is absolute, positioned at left=-i*100%.
  // As scroll progresses, container translateX = +clamped * 100vw
  // → slide[i] screen position = translateX - i*100vw  →  enters from LEFT ✓
  businessCont.style.position = 'absolute';
  businessCont.style.inset    = '0';
  businessCont.style.width    = '100%';
  businessCont.style.height   = '100%';
  businessSlides.forEach((s, i) => {
    s.style.position  = 'absolute';
    s.style.inset     = '0';
    s.style.transform = `translateX(${-i * 100}%)`;
    s.style.height    = '100%';
    s.style.width     = '100%';
  });

  function buildDots(count) {
    if (!progressEl) return;
    progressEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 'ws-progress-dot' + (i === 0 ? ' active' : '');
      progressEl.appendChild(d);
    }
  }
  buildDots(P);

  const bgTexts = {
    personal: 'PERSONAL   PERSONAL   PERSONAL   PERSONAL   PERSONAL   ',
    business: 'BUSINESS   BUSINESS   BUSINESS   BUSINESS   BUSINESS   ',
  };

  let lastPhase = '';
  let lastPIdx  = -1;
  let lastBIdx  = -1;

  function getOuterTop() {
    return outer.getBoundingClientRect().top + window.scrollY;
  }

  function update() {
    const outerTop    = getOuterTop();
    const scrolled    = window.scrollY - outerTop;
    const rawProgress = scrolled / vh();

    if (scrolled > 80 && scrollHint) scrollHint.style.opacity = '0';
    else if (scrolled <= 0 && scrollHint) scrollHint.style.opacity = '1';

    // ── PERSONAL phase ───────────────────────────────────────────────────────
    if (rawProgress < P) {
      const clamped = Math.max(0, Math.min(P - 1, rawProgress));
      const pIdx    = Math.min(P - 1, Math.floor(clamped));

      personalGroup.style.opacity = '1';
      businessGroup.style.opacity = '0';
      businessGroup.style.pointerEvents = 'none';

      // Translate personal container LEFT
      personalCont.style.transform = `translateX(${-(clamped / P) * 100}%)`;

      // Background text parallax drift
      if (bgRow1) bgRow1.style.transform = `translateX(${-clamped * 4}vw)`;
      if (bgRow2) bgRow2.style.transform = `translateX(${clamped * 4}vw)`;

      if (lastPhase !== 'personal') {
        lastPhase = 'personal';
        if (bgRow1) bgRow1.textContent = bgTexts.personal;
        if (bgRow2) bgRow2.textContent = bgTexts.personal;
        if (labelEl) labelEl.textContent = 'P E R S O N A L';
        if (counterTotal) counterTotal.textContent = String(P).padStart(2, '0');
        buildDots(P);
      }

      if (pIdx !== lastPIdx) {
        lastPIdx = pIdx;
        lastBIdx = -1;
        if (counterCurrent) counterCurrent.textContent = String(pIdx + 1).padStart(2, '0');
        [...document.querySelectorAll('.ws-progress-dot')].forEach((d, i) => d.classList.toggle('active', i === pIdx));
        personalSlides.forEach((s, i) => {
          const v = s.querySelector('video');
          if (!v) return;
          if (i === pIdx) { if (v.readyState === 0) v.load(); v.muted = globalMuted; v.play().catch(() => {}); }
          else if (i === pIdx + 1) { if (v.readyState === 0) v.load(); v.pause(); }
          else v.pause();
        });
      }

    // ── BUSINESS phase ───────────────────────────────────────────────────────
    } else {
      const bizProgress = rawProgress - P;
      const clamped     = Math.max(0, Math.min(B - 1, bizProgress));
      const bIdx        = Math.min(B - 1, Math.floor(clamped));

      personalGroup.style.opacity = '0';
      businessGroup.style.opacity = '1';
      businessGroup.style.pointerEvents = 'none';

      // Translate business container RIGHT → slides enter from LEFT
      // Each slide[i] has translateX(-i*100%) baked in, so adding +clamped*100vw
      // makes slide[clamped] sit at 0.
      businessCont.style.transform = `translateX(${clamped * 100}%)`;

      // Background text drift (opposite direction)
      if (bgRow1) bgRow1.style.transform = `translateX(${clamped * 4}vw)`;
      if (bgRow2) bgRow2.style.transform = `translateX(${-clamped * 4}vw)`;

      if (lastPhase !== 'business') {
        lastPhase = 'business';
        if (bgRow1) bgRow1.textContent = bgTexts.business;
        if (bgRow2) bgRow2.textContent = bgTexts.business;
        if (labelEl) labelEl.textContent = 'B U S I N E S S';
        if (counterTotal) counterTotal.textContent = String(B).padStart(2, '0');
        buildDots(B);
        personalSlides.forEach(s => s.querySelector('video')?.pause());
      }

      if (bIdx !== lastBIdx) {
        lastBIdx = bIdx;
        if (counterCurrent) counterCurrent.textContent = String(bIdx + 1).padStart(2, '0');
        [...document.querySelectorAll('.ws-progress-dot')].forEach((d, i) => d.classList.toggle('active', i === bIdx));
      }
    }
  }

  // Audio toggle
  let globalMuted = true;
  function getCurrentVideo() {
    if (lastPhase === 'business') return businessSlides[Math.max(0, lastBIdx)]?.querySelector('video');
    return personalSlides[Math.max(0, lastPIdx)]?.querySelector('video');
  }
  function updateAudioIcon() {
    const muted = document.querySelector('.ws-audio-icon--muted');
    const live  = document.querySelector('.ws-audio-icon--live');
    if (muted) muted.style.display = globalMuted ? '' : 'none';
    if (live)  live.style.display  = globalMuted ? 'none' : '';
  }
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      globalMuted = !globalMuted;
      const v = getCurrentVideo();
      if (v) v.muted = globalMuted;
      updateAudioIcon();
    });
  }

  // Play first personal video immediately
  personalSlides[0]?.querySelector('video')?.play().catch(() => {});

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { setHeight(); update(); });
  update();
})();
