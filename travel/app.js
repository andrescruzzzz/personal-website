// ============================================
// MAPPD - Main Application
// ============================================

function defaultUserData() {
  return {
    name: '',
    age: 0,
    homeCountry: '',
    email: '',
    provider: '',          // 'google' | 'email'
    createdAt: 0,
    childMode: false,      // under-13 protections
    privacy: {
      profileVisibility: 'public',  // public | friends | private
      showInFeed: true,
      allowComments: true,
      shareLocation: true,
      searchable: true,
      analytics: true
    },
    visited: [],
    regions: {},     // { countryCode: [regionId,...] }
    wishlist: [],
    upcoming: [],
    rankings: {},
    photos: {},
    feed: []         // social feed events
  };
}

let userData = defaultUserData();
let pendingAuth = null;   // { email, provider } during new-account onboarding

let globe = null;
let friendGlobe = null;
let regionMap = null;
let currentStep = 0;
let currentCountry = null;
let currentExploreTab = 'see';
let currentDetailTab = 'regions';
let particlesCtx = null;
let particles = [];
let feedSeeded = false;

// ============================================
// PARTICLES BACKGROUND
// ============================================
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  particlesCtx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    particlesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.6 + 0.4,
      opacity: Math.random() * 0.18 + 0.05
    });
  }
  animateParticles();
}

function animateParticles() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  particlesCtx.clearRect(0, 0, w, h);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    particlesCtx.beginPath();
    particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    particlesCtx.fillStyle = `rgba(220, 121, 58, ${p.opacity})`;
    particlesCtx.fill();
  });

  particles.forEach((p, i) => {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = p.x - particles[j].x;
      const dy = p.y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        particlesCtx.beginPath();
        particlesCtx.moveTo(p.x, p.y);
        particlesCtx.lineTo(particles[j].x, particles[j].y);
        particlesCtx.strokeStyle = `rgba(220, 121, 58, ${0.04 * (1 - dist / 120)})`;
        particlesCtx.lineWidth = 0.5;
        particlesCtx.stroke();
      }
    }
  });

  requestAnimationFrame(animateParticles);
}

// ============================================
// ONBOARDING
// ============================================
function initOnboarding() {
  const select = document.getElementById('user-country');
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.name;
    select.appendChild(opt);
  });

  const picker = document.getElementById('country-picker');
  COUNTRIES.forEach(c => {
    const chip = document.createElement('div');
    chip.className = 'country-chip';
    chip.textContent = c.name;
    chip.dataset.code = c.code;
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
    });
    picker.appendChild(chip);
  });
}

function nextStep() {
  const steps = document.querySelectorAll('.onboarding-step');

  if (currentStep === 1) {
    const name = document.getElementById('user-name').value.trim();
    const age = document.getElementById('user-age').value;
    if (!name) { shakeElement(document.getElementById('user-name')); return; }
    userData.name = name;
    userData.age = parseInt(age) || 0;
  }

  if (currentStep === 2) {
    const country = document.getElementById('user-country').value;
    if (!country) { shakeElement(document.getElementById('user-country')); return; }
    userData.homeCountry = country;
  }

  if (currentStep === 3) {
    const selected = document.querySelectorAll('.country-chip.selected');
    userData.visited = Array.from(selected).map(chip => chip.dataset.code);
  }

  if (currentStep === 3) {
    document.getElementById('user-name-display').textContent = userData.name;
  }

  steps[currentStep].classList.remove('active');
  currentStep++;
  if (currentStep < steps.length) {
    steps[currentStep].classList.add('active');
  }
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.5s ease';
  setTimeout(() => el.style.animation = '', 500);
}

function finishOnboarding() {
  // finalise the new account
  if (pendingAuth) {
    userData.email = pendingAuth.email;
    userData.provider = pendingAuth.provider;
  }
  userData.createdAt = Date.now();
  applyChildSafety();
  saveData();
  pendingAuth = null;

  const overlay = document.getElementById('onboarding-overlay');
  overlay.classList.remove('active');

  setTimeout(() => {
    overlay.style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    initApp();
  }, 800);
}

// ============================================
// APP INITIALIZATION
// ============================================
function initApp() {
  ensurePrivacy();
  document.getElementById('nav-avatar').textContent = userData.name.charAt(0).toUpperCase();
  updateAccountMenu();

  document.querySelectorAll('.nav-link[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  initGlobe();
  seedFeed();
  updateStats();
  populateSelects();
  renderFriends();
  renderWishlist();
  renderUpcoming();
  renderRankings();
  renderFeed();

  saveData();
}

function initGlobe() {
  globe = new Globe('globe-canvas', 'cloud-canvas', {
    onCountryClick: (code) => openCountryDetail(code),
    onCountryHover: (code, name, x, y) => {
      const tooltip = document.getElementById('country-tooltip');
      if (code) {
        tooltip.classList.remove('hidden');
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        tooltip.querySelector('.tooltip-name').textContent = name;
        tooltip.querySelector('.tooltip-status').textContent =
          userData.visited.includes(code) ? 'Visited' : 'Explore';
        tooltip.classList.toggle('is-visited', userData.visited.includes(code));
      } else {
        tooltip.classList.add('hidden');
      }
    }
  });
  globe.setVisited(userData.visited);
}

function totalRegionsCount() {
  let n = 0;
  Object.values(userData.regions || {}).forEach(arr => { n += (arr ? arr.length : 0); });
  return n;
}

function computeTotalScore() {
  let total = 0;
  userData.visited.forEach(code => { total += calculateScore(userData.homeCountry, code); });
  Object.entries(userData.regions || {}).forEach(([code, ids]) => {
    total += countryRegionScore(code, ids);
  });
  return total;
}

function updateStats() {
  const continents = new Set();
  userData.visited.forEach(code => {
    const country = COUNTRIES.find(c => c.code === code);
    if (country) continents.add(country.continent);
  });
  const totalScore = computeTotalScore();

  animateCounter('countries-visited', userData.visited.length);
  animateCounter('regions-visited', totalRegionsCount());
  animateCounter('total-score', totalScore);
  animateCounter('continents-count', continents.size);
  document.getElementById('nav-score').textContent = totalScore;
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current;
  }, 30);
}

function populateSelects() {
  const wishSelect = document.getElementById('wishlist-select');
  const upcomingSelect = document.getElementById('upcoming-country');
  [wishSelect, upcomingSelect].forEach(sel => {
    COUNTRIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  });
}

// ============================================
// NAVIGATION
// ============================================
function switchTab(tab) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tab);
  });

  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
  });

  const viewId = tab === 'map' ? 'map-view' : `${tab}-view`;
  const view = document.getElementById(viewId);
  if (view) {
    view.classList.remove('hidden');
    view.classList.add('view-enter');
    setTimeout(() => view.classList.remove('view-enter'), 500);
  }

  if (tab === 'map' && globe) {
    requestAnimationFrame(() => globe.resize());
  }
  if (tab === 'feed') renderFeed();
}

// ============================================
// COUNTRY DETAIL
// ============================================
function openCountryDetail(code) {
  currentCountry = code;
  const country = COUNTRIES.find(c => c.code === code);
  if (!country) return;

  const isVisited = userData.visited.includes(code);
  const score = calculateScore(userData.homeCountry, code);

  playWooshTransition();

  // Build the page + the heavy region map WHILE the clouds fully cover the
  // screen, so the rasterization jank is hidden. The clouds then fade out
  // over the already-rendered page for a seamless "out of the clouds" arrival.
  setTimeout(() => {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById('country-detail').classList.remove('hidden');

    document.getElementById('detail-country-name').textContent = country.name;
    document.getElementById('detail-continent').textContent = country.continent;
    document.getElementById('detail-capital').textContent = country.capital;
    document.getElementById('detail-score').textContent = score;
    document.getElementById('detail-region-score').textContent =
      countryRegionScore(code, userData.regions[code] || []);

    updateVisitToggleLabel();

    const heroBg = document.getElementById('country-hero-bg');
    heroBg.style.background = isVisited
      ? 'linear-gradient(135deg, #3a1d0d, #1b1712)'
      : 'linear-gradient(135deg, #0c2b2e, #1b1712)';

    renderPhotos(code);
    renderCountryRanking(code);
    switchExploreTab('see');
    renderRegionChecklist(code);
    switchDetailTab('regions');

    document.getElementById('country-detail').scrollTop = 0;
  }, 280);

  // Tear down the cloud overlay after it has finished fading out
  setTimeout(() => {
    const woosh = document.getElementById('woosh');
    if (woosh) woosh.remove();
    const gc = document.getElementById('globe-container');
    if (gc) gc.classList.remove('woosh-zoom');
  }, 880);
}

function playWooshTransition() {
  // fast zoom on the globe + clouds rushing past
  const gc = document.getElementById('globe-container');
  if (gc) gc.classList.add('woosh-zoom');

  const old = document.getElementById('woosh');
  if (old) old.remove();
  const woosh = document.createElement('div');
  woosh.id = 'woosh';

  const flash = document.createElement('div');
  flash.className = 'woosh-flash';
  woosh.appendChild(flash);

  // scatter cloud puffs around the centre that rush outward
  const n = 12;
  for (let i = 0; i < n; i++) {
    const cloud = document.createElement('div');
    cloud.className = 'woosh-cloud';
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.random() * 28;
    const cx = 50 + Math.cos(ang) * dist;
    const cy = 50 + Math.sin(ang) * dist;
    const size = 120 + Math.random() * 220;
    cloud.style.left = cx + '%';
    cloud.style.top = cy + '%';
    cloud.style.width = size + 'px';
    cloud.style.height = size + 'px';
    cloud.style.animationDelay = (Math.random() * 0.12) + 's';
    woosh.appendChild(cloud);
  }
  document.body.appendChild(woosh);
}

function updateVisitToggleLabel() {
  const btn = document.getElementById('detail-visit-toggle');
  if (!btn) return;
  const isVisited = userData.visited.includes(currentCountry);
  btn.textContent = isVisited ? '✓ Visited' : '+ Mark Visited';
  btn.classList.toggle('is-on', isVisited);
}

function toggleCountryVisited() {
  if (!currentCountry) return;
  const i = userData.visited.indexOf(currentCountry);
  if (i >= 0) {
    userData.visited.splice(i, 1);
  } else {
    userData.visited.push(currentCountry);
    postFeedEvent({ type: 'country', user: 'me', code: currentCountry });
  }
  if (globe) globe.setVisited(userData.visited);
  updateVisitToggleLabel();
  updateStats();
  renderRankings();
  saveData();
}

function switchDetailTab(tab) {
  currentDetailTab = tab;
  document.querySelectorAll('.detail-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.dtab === tab));
  ['regions', 'memories', 'ranking', 'explore'].forEach(t => {
    document.getElementById('dtab-' + t).classList.toggle('hidden', t !== tab);
  });
  if (tab === 'regions') initRegionMap(currentCountry);
}

// ---- Region map ----
function initRegionMap(code) {
  const canvas = document.getElementById('region-map-canvas');
  if (!canvas) return;
  if (regionMap) { regionMap.destroy(); regionMap = null; }
  const regions = getCountryRegions(code);
  // size canvas to wrapper before building
  requestAnimationFrame(() => {
    regionMap = new RegionMap(canvas, code, regions, userData.regions[code] || [], {
      onToggle: (region, isOn, allIds) => {
        userData.regions[code] = allIds;
        // visiting a region implies visiting the country
        if (allIds.length && !userData.visited.includes(code)) {
          userData.visited.push(code);
          postFeedEvent({ type: 'country', user: 'me', code });
          if (globe) globe.setVisited(userData.visited);
          updateVisitToggleLabel();
        }
        document.getElementById('detail-region-score').textContent = countryRegionScore(code, allIds);
        updateStats();
        saveData();
      },
      onHover: (region) => {
        const hint = document.getElementById('region-hint');
        if (region) hint.textContent = region.name + ' — ' + REGION_TIER_LABEL[region.tier] + ' (+' + regionPoints(region.tier) + ' pts)';
        else hint.textContent = "Click a region to log it • scroll to zoom, drag to pan";
      }
    });
    renderRegionChecklist(code);
  });
}

function renderRegionChecklist(code) {
  const wrap = document.getElementById('region-checklist');
  if (!wrap) return;
  const regions = getCountryRegions(code);
  const visited = userData.regions[code] || [];
  wrap.innerHTML = regions.map(r => `
    <button class="region-chip ${visited.includes(r.id) ? 'on' : ''} tier-${r.tier}"
      onclick="toggleRegionChip('${code}','${r.id}')">
      <span class="region-chip-name">${r.name}</span>
      <span class="region-chip-pts">+${regionPoints(r.tier)}</span>
    </button>`).join('');
}

function toggleRegionChip(code, regionId) {
  if (!userData.regions[code]) userData.regions[code] = [];
  const arr = userData.regions[code];
  const i = arr.indexOf(regionId);
  if (i >= 0) arr.splice(i, 1); else arr.push(regionId);
  if (arr.length && !userData.visited.includes(code)) {
    userData.visited.push(code);
    postFeedEvent({ type: 'country', user: 'me', code });
    if (globe) globe.setVisited(userData.visited);
    updateVisitToggleLabel();
  }
  document.getElementById('detail-region-score').textContent = countryRegionScore(code, arr);
  renderRegionChecklist(code);
  if (regionMap) { regionMap.visited = new Set(arr); regionMap.refresh(); }
  updateStats();
  saveData();
}

function closeCountryDetail() {
  if (regionMap) { regionMap.destroy(); regionMap = null; }
  document.getElementById('country-detail').classList.add('hidden');
  document.getElementById('map-view').classList.remove('hidden');
  currentCountry = null;
  if (globe) requestAnimationFrame(() => globe.resize());
}

// ============================================
// PHOTOS (Instagram-style)
// ============================================
function renderPhotos(code) {
  const grid = document.getElementById('photo-grid');
  grid.innerHTML = '';

  const photos = userData.photos[code] || [];
  if (photos.length === 0) {
    for (let i = 0; i < 6; i++) {
      const ph = document.createElement('div');
      ph.className = 'photo-placeholder';
      ph.innerHTML = '+';
      ph.addEventListener('click', openPhotoUpload);
      grid.appendChild(ph);
    }
    return;
  }

  photos.forEach(src => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    const img = document.createElement('img');
    img.src = src;
    item.appendChild(img);
    grid.appendChild(item);
  });

  const addMore = document.createElement('div');
  addMore.className = 'photo-placeholder';
  addMore.innerHTML = '+';
  addMore.addEventListener('click', openPhotoUpload);
  grid.appendChild(addMore);
}

function openPhotoUpload() {
  document.getElementById('photo-modal').classList.remove('hidden');
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('photo-input');

  zone.onclick = () => input.click();
  input.onchange = handlePhotoSelect;

  zone.ondragover = (e) => { e.preventDefault(); zone.style.borderColor = 'var(--primary-light)'; };
  zone.ondragleave = () => { zone.style.borderColor = 'var(--border)'; };
  zone.ondrop = (e) => {
    e.preventDefault();
    zone.style.borderColor = 'var(--border)';
    handleFiles(e.dataTransfer.files);
  };
}

function handlePhotoSelect(e) {
  handleFiles(e.target.files);
}

function handleFiles(files) {
  const preview = document.getElementById('upload-preview');
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.className = 'upload-thumb';
      img.src = e.target.result;
      img.dataset.data = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function savePhotos() {
  if (!currentCountry) return;
  const thumbs = document.querySelectorAll('.upload-thumb');
  if (!userData.photos[currentCountry]) userData.photos[currentCountry] = [];

  thumbs.forEach(img => {
    userData.photos[currentCountry].push(img.dataset.data);
  });

  closePhotoUpload();
  renderPhotos(currentCountry);
  saveData();
}

function closePhotoUpload() {
  document.getElementById('photo-modal').classList.add('hidden');
  document.getElementById('upload-preview').innerHTML = '';
  document.getElementById('photo-input').value = '';
}

// ============================================
// COUNTRY RANKING
// ============================================
function renderCountryRanking(code) {
  const container = document.getElementById('country-ranking');
  const categories = ['Overall', 'Food', 'Culture', 'Scenery', 'Nightlife', 'Safety', 'Value'];

  if (!userData.rankings[code]) {
    userData.rankings[code] = {};
    categories.forEach(cat => userData.rankings[code][cat.toLowerCase()] = 0);
  }

  container.innerHTML = categories.map(cat => {
    const key = cat.toLowerCase();
    const val = userData.rankings[code][key] || 0;
    const stars = Array.from({length: 5}, (_, i) =>
      `<span class="star ${i < val ? 'filled' : ''}" data-code="${code}" data-cat="${key}" data-val="${i + 1}" onclick="setRating('${code}','${key}',${i + 1})">&#9733;</span>`
    ).join('');
    return `
      <div class="ranking-category">
        <span class="ranking-label">${cat}</span>
        <div class="ranking-stars">${stars}</div>
      </div>`;
  }).join('');
}

function setRating(code, category, value) {
  if (!userData.rankings[code]) userData.rankings[code] = {};
  userData.rankings[code][category] = value;
  renderCountryRanking(code);
  renderRankings();
  saveData();
}

// ============================================
// EXPLORE TABS (Not visited)
// ============================================
function switchExploreTab(tab) {
  currentExploreTab = tab;
  document.querySelectorAll('.explore-tab').forEach(t => {
    t.classList.toggle('active', t.textContent.toLowerCase().includes(tab));
  });

  const data = COUNTRY_EXPLORE_DATA.default[tab] || [];
  const container = document.getElementById('explore-content');
  container.innerHTML = data.map(item => `
    <div class="explore-card">
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </div>
  `).join('');
}

// ============================================
// FRIENDS
// ============================================
function renderFriends() {
  const list = document.getElementById('friends-list');
  list.innerHTML = '';

  Object.entries(FRIEND_DATA).forEach(([key, friend]) => {
    const card = document.createElement('div');
    card.className = 'friend-card';
    card.innerHTML = `
      <div class="friend-info">
        <div class="friend-avatar" style="background:${friend.avatarGradient}">${friend.avatar}</div>
        <div>
          <div class="friend-name">${friend.name}</div>
          <div class="friend-country">${friend.countryName}</div>
        </div>
      </div>
      <div class="friend-stats">
        <div class="friend-stat">
          <span class="friend-stat-num">${friend.visited.length}</span>
          <span class="friend-stat-label">Countries</span>
        </div>
        <div class="friend-stat">
          <span class="friend-stat-num">${friend.score}</span>
          <span class="friend-stat-label">Score</span>
        </div>
      </div>`;
    card.addEventListener('click', () => openFriendMap(key));
    list.appendChild(card);
  });
}

function openFriendMap(key) {
  const friend = FRIEND_DATA[key];
  if (!friend) return;

  document.getElementById('friends-list').style.display = 'none';
  const container = document.getElementById('friend-map-container');
  container.classList.remove('hidden');

  document.getElementById('friend-map-header').innerHTML = `
    <div class="friend-avatar" style="background:${friend.avatarGradient};width:40px;height:40px;font-size:16px;display:flex;align-items:center;justify-content:center;border-radius:50%">${friend.avatar}</div>
    <div>
      <div style="font-weight:600;font-size:16px">${friend.name}'s World</div>
      <div style="font-size:13px;color:var(--text-muted)">${friend.visited.length} countries visited &bull; ${friend.score} points</div>
    </div>`;

  if (friendGlobe) friendGlobe.destroy();
  friendGlobe = new Globe('friend-globe-canvas', 'friend-cloud-canvas', {
    interactive: true
  });
  friendGlobe.setVisited(friend.visited);
}

function closeFriendMap() {
  if (friendGlobe) { friendGlobe.destroy(); friendGlobe = null; }
  document.getElementById('friend-map-container').classList.add('hidden');
  document.getElementById('friends-list').style.display = '';
}

// ============================================
// WISHLIST
// ============================================
function renderWishlist() {
  const grid = document.getElementById('wishlist-grid');
  grid.innerHTML = '';

  userData.wishlist.forEach(code => {
    const country = COUNTRIES.find(c => c.code === code);
    if (!country) return;

    const card = document.createElement('div');
    card.className = 'wishlist-card';
    card.innerHTML = `
      <span class="wishlist-icon">&#10024;</span>
      <div class="wishlist-country">${country.name}</div>
      <div class="wishlist-continent">${country.continent} &bull; ${country.capital}</div>
      <button class="wishlist-remove" onclick="removeWishlist('${code}')">Remove</button>`;
    grid.appendChild(card);
  });

  if (userData.wishlist.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;grid-column:1/-1">Your wishlist is empty. Explore the map and add dream destinations!</p>';
  }
}

function addToWishlist(code) {
  if (!code || userData.wishlist.includes(code)) return;
  userData.wishlist.push(code);
  renderWishlist();
  saveData();
}

function addWishlistFromSelect() {
  const sel = document.getElementById('wishlist-select');
  if (sel.value) {
    addToWishlist(sel.value);
    sel.value = '';
  }
}

function removeWishlist(code) {
  userData.wishlist = userData.wishlist.filter(c => c !== code);
  renderWishlist();
  saveData();
}

// ============================================
// UPCOMING TRAVELS
// ============================================
function renderUpcoming() {
  const list = document.getElementById('upcoming-list');
  list.innerHTML = '';

  const sorted = [...userData.upcoming].sort((a, b) => new Date(a.date) - new Date(b.date));

  sorted.forEach((trip, idx) => {
    const country = COUNTRIES.find(c => c.code === trip.country);
    if (!country) return;

    const date = new Date(trip.date);
    const now = new Date();
    const daysUntil = Math.max(0, Math.ceil((date - now) / (1000 * 60 * 60 * 24)));
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const card = document.createElement('div');
    card.className = 'upcoming-card';
    card.innerHTML = `
      <div class="upcoming-date-box">
        <span class="upcoming-month">${months[date.getMonth()]}</span>
        <span class="upcoming-day">${date.getDate()}</span>
      </div>
      <div class="upcoming-info">
        <h3>${country.name}</h3>
        <div class="upcoming-notes">${trip.notes || country.continent}</div>
      </div>
      <div class="upcoming-countdown">
        <span class="countdown-num">${daysUntil}</span>
        <span class="countdown-label">days away</span>
      </div>`;
    list.appendChild(card);
  });

  if (userData.upcoming.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">No upcoming trips. Time to plan your next adventure!</p>';
  }
}

function addUpcomingTrip() {
  const country = document.getElementById('upcoming-country').value;
  const date = document.getElementById('upcoming-date').value;
  const notes = document.getElementById('upcoming-notes').value;

  if (!country || !date) return;

  userData.upcoming.push({ country, date, notes });
  renderUpcoming();
  saveData();

  document.getElementById('upcoming-country').value = '';
  document.getElementById('upcoming-date').value = '';
  document.getElementById('upcoming-notes').value = '';
}

// ============================================
// RANKINGS VIEW
// ============================================
function renderRankings() {
  const list = document.getElementById('rankings-list');
  list.innerHTML = '';

  const ranked = userData.visited
    .map(code => {
      const country = COUNTRIES.find(c => c.code === code);
      const rankings = userData.rankings[code] || {};
      const overall = rankings.overall || 0;
      const score = calculateScore(userData.homeCountry, code);
      return { code, country, overall, score };
    })
    .sort((a, b) => b.overall - a.overall || b.score - a.score);

  ranked.forEach((item, idx) => {
    if (!item.country) return;
    const posClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
    const starsHtml = Array.from({length: 5}, (_, i) =>
      `<span style="color:${i < item.overall ? 'var(--primary-light)' : 'var(--text-muted)'}">★</span>`
    ).join('');

    const el = document.createElement('div');
    el.className = 'ranking-item';
    el.innerHTML = `
      <span class="ranking-pos ${posClass}">#${idx + 1}</span>
      <div class="ranking-info">
        <h3>${item.country.name}</h3>
        <p>${item.country.continent} &bull; ${item.score} pts</p>
      </div>
      <div class="ranking-score-display">
        <div class="ranking-stars-display">${starsHtml}</div>
      </div>`;
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => openCountryDetail(item.code));
    list.appendChild(el);
  });

  if (ranked.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">Visit some countries first, then rank them here!</p>';
  }
}

// ============================================
// SOCIAL FEED
// ============================================
const REACTIONS = ['❤️', '🔥', '👏', '😍', '✈️'];

function seedFeed() {
  if (feedSeeded) return;
  feedSeeded = true;
  // Only seed sample friend activity once, if feed is empty
  if (!userData.feed || userData.feed.length === 0) {
    const now = Date.now();
    userData.feed = [
      {
        id: 'f1', type: 'country', user: 'john', code: 'IS',
        ts: now - 1000 * 60 * 60 * 5,
        reactions: { '🔥': 3, '😍': 1 }, myReaction: null,
        comments: [{ author: 'You', text: 'Iceland looks unreal! 😍', ts: now - 1000 * 60 * 60 * 4 }]
      },
      {
        id: 'f2', type: 'country', user: 'john', code: 'JP',
        ts: now - 1000 * 60 * 60 * 26,
        reactions: { '❤️': 5, '✈️': 2 }, myReaction: '❤️',
        comments: []
      }
    ];
  }
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24); return d + 'd ago';
}

function feedAuthor(user) {
  if (user === 'me') {
    return { name: userData.name || 'You', initial: (userData.name || 'Y').charAt(0).toUpperCase(), grad: 'var(--primary)' };
  }
  const f = FRIEND_DATA[user];
  return f ? { name: f.name, initial: f.avatar, grad: f.avatarGradient }
           : { name: 'Traveller', initial: 'T', grad: 'var(--secondary)' };
}

function postFeedEvent(ev) {
  // respect privacy: child accounts and "don't share" never post to the feed
  if (ev.user === 'me') {
    ensurePrivacy();
    if (userData.childMode || !userData.privacy.showInFeed) return;
  }
  const item = {
    id: 'f' + Date.now() + Math.floor(Math.random() * 999),
    type: ev.type, user: ev.user, code: ev.code, region: ev.region || null,
    ts: Date.now(), reactions: {}, myReaction: null, comments: []
  };
  if (!userData.feed) userData.feed = [];
  userData.feed.unshift(item);
  saveData();
  if (!document.getElementById('feed-view').classList.contains('hidden')) renderFeed();
}

function feedActionText(item) {
  const country = COUNTRIES.find(c => c.code === item.code);
  const cname = country ? country.name : item.code;
  const who = feedAuthor(item.user).name;
  if (item.type === 'region') return `${who} explored ${item.region} in ${cname}`;
  return `${who} visited ${cname}!`;
}

function renderFeed() {
  const list = document.getElementById('feed-list');
  if (!list) return;
  const feed = (userData.feed || []).slice().sort((a, b) => b.ts - a.ts);
  if (feed.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">No activity yet. Add a country to get started!</p>';
    return;
  }
  list.innerHTML = feed.map(item => {
    const a = feedAuthor(item.user);
    const country = COUNTRIES.find(c => c.code === item.code);
    const reactionsBar = REACTIONS.map(r => {
      const count = item.reactions[r] || 0;
      const on = item.myReaction === r ? 'on' : '';
      return `<button class="react-btn ${on}" onclick="toggleReaction('${item.id}','${r}')">${r}${count ? ' <span>' + count + '</span>' : ''}</button>`;
    }).join('');
    const comments = (item.comments || []).map(c =>
      `<div class="comment"><span class="comment-author">${escapeHtml(c.author)}</span> ${escapeHtml(c.text)} <span class="comment-time">${timeAgo(c.ts)}</span></div>`
    ).join('');
    return `
      <div class="feed-card">
        <div class="feed-head">
          <div class="feed-avatar" style="background:${a.grad}">${a.initial}</div>
          <div class="feed-head-text">
            <div class="feed-action">${escapeHtml(feedActionText(item))}</div>
            <div class="feed-meta">${country ? country.continent + ' • ' : ''}${timeAgo(item.ts)}</div>
          </div>
          ${country ? `<button class="feed-open" onclick="openCountryDetail('${item.code}')">View map</button>` : ''}
        </div>
        <div class="feed-reactions">${reactionsBar}</div>
        <div class="feed-comments">${comments}</div>
        <div class="feed-add-comment">
          <input type="text" class="comment-input" id="ci-${item.id}" placeholder="Add a comment..."
            onkeydown="if(event.key==='Enter')addComment('${item.id}')">
          <button class="comment-send" onclick="addComment('${item.id}')">Post</button>
        </div>
      </div>`;
  }).join('');
}

function toggleReaction(id, emoji) {
  const item = (userData.feed || []).find(f => f.id === id);
  if (!item) return;
  if (!item.reactions) item.reactions = {};
  if (item.myReaction === emoji) {
    item.reactions[emoji] = Math.max(0, (item.reactions[emoji] || 1) - 1);
    item.myReaction = null;
  } else {
    if (item.myReaction) item.reactions[item.myReaction] = Math.max(0, (item.reactions[item.myReaction] || 1) - 1);
    item.reactions[emoji] = (item.reactions[emoji] || 0) + 1;
    item.myReaction = emoji;
  }
  saveData();
  renderFeed();
}

function addComment(id) {
  const input = document.getElementById('ci-' + id);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const item = (userData.feed || []).find(f => f.id === id);
  if (!item) return;
  if (!item.comments) item.comments = [];
  item.comments.push({ author: userData.name || 'You', text, ts: Date.now() });
  saveData();
  renderFeed();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ============================================
// ADD COUNTRY
// ============================================
function openAddCountry() {
  const modal = document.getElementById('add-country-modal');
  modal.classList.remove('hidden');
  const search = document.getElementById('add-country-search');
  search.value = '';
  renderAddCountryList('');
  search.oninput = () => renderAddCountryList(search.value);
  setTimeout(() => search.focus(), 50);
}

function closeAddCountry() {
  document.getElementById('add-country-modal').classList.add('hidden');
}

function renderAddCountryList(query) {
  const list = document.getElementById('add-country-list');
  const q = query.toLowerCase();
  const items = COUNTRIES
    .filter(c => c.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  list.innerHTML = items.map(c => {
    const visited = userData.visited.includes(c.code);
    const pts = calculateScore(userData.homeCountry, c.code);
    return `<button class="add-country-item ${visited ? 'visited' : ''}" onclick="selectAddCountry('${c.code}')">
      <span>${c.name}</span>
      <span class="aci-right">${visited ? '✓ Visited' : '+' + pts + ' pts'}</span>
    </button>`;
  }).join('');
}

function selectAddCountry(code) {
  if (!userData.visited.includes(code)) {
    userData.visited.push(code);
    postFeedEvent({ type: 'country', user: 'me', code });
    if (globe) globe.setVisited(userData.visited);
    updateStats();
    renderRankings();
    saveData();
  }
  closeAddCountry();
  openCountryDetail(code);
}

// ============================================
// ACCOUNTS & AUTH (simulated, fully client-side)
// ============================================
function getAccounts() {
  try { return JSON.parse(localStorage.getItem('mappd_accounts') || '{}'); }
  catch (e) { return {}; }
}
function setAccounts(a) {
  try { localStorage.setItem('mappd_accounts', JSON.stringify(a)); } catch (e) {}
}

function ensurePrivacy() {
  if (!userData.privacy) userData.privacy = defaultUserData().privacy;
  const d = defaultUserData().privacy;
  for (const k in d) if (userData.privacy[k] === undefined) userData.privacy[k] = d[k];
}

function applyChildSafety() {
  const under13 = userData.age && userData.age < 13;
  userData.childMode = !!under13;
  if (under13) {
    // COPPA-style: turn off data collection, lock the account private
    ensurePrivacy();
    userData.privacy.profileVisibility = 'private';
    userData.privacy.showInFeed = false;
    userData.privacy.searchable = false;
    userData.privacy.allowComments = false;
    userData.privacy.shareLocation = false;
    userData.privacy.analytics = false;
  }
}

function saveData() {
  if (!userData.email) return;     // not signed in yet
  try {
    const accounts = getAccounts();
    accounts[userData.email] = userData;
    setAccounts(accounts);
    localStorage.setItem('mappd_session', userData.email);
  } catch (e) {}
}

function validEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());
}

function authError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('hidden', !msg);
}

// Google sign-in (simulated chooser)
function signInWithGoogle() {
  document.getElementById('google-modal').classList.remove('hidden');
  const inp = document.getElementById('google-email');
  inp.value = '';
  authError('google-error', '');
  setTimeout(() => inp.focus(), 50);
}
function closeGoogleModal() {
  document.getElementById('google-modal').classList.add('hidden');
}
function googleSignInConfirm() {
  const email = document.getElementById('google-email').value.trim().toLowerCase();
  if (!validEmail(email)) { authError('google-error', 'Enter a valid email address.'); return; }
  closeGoogleModal();
  startSession(email, 'google');
}

function continueWithEmail() {
  const email = (document.getElementById('auth-email').value || '').trim().toLowerCase();
  if (!validEmail(email)) { authError('auth-error', 'Please enter a valid email address.'); return; }
  authError('auth-error', '');
  const provider = email.endsWith('@gmail.com') ? 'google' : 'email';
  startSession(email, provider);
}

// Route an authenticated email to either an existing account or onboarding
function startSession(email, provider) {
  const accounts = getAccounts();
  if (accounts[email] && accounts[email].name) {
    userData = Object.assign(defaultUserData(), accounts[email]);
    userData.email = email;
    ensurePrivacy();
    localStorage.setItem('mappd_session', email);
    hideAuthShowApp();
  } else {
    // new user -> onboarding
    pendingAuth = { email, provider };
    userData = defaultUserData();
    userData.email = email;
    userData.provider = provider;
    document.getElementById('auth-overlay').classList.remove('active');
    setTimeout(() => {
      document.getElementById('auth-overlay').style.display = 'none';
      const ob = document.getElementById('onboarding-overlay');
      ob.style.display = '';
      ob.classList.add('active');
      currentStep = 0;
      document.querySelectorAll('.onboarding-step').forEach((s, i) => s.classList.toggle('active', i === 0));
      initOnboarding();
    }, 500);
  }
}

function hideAuthShowApp() {
  const auth = document.getElementById('auth-overlay');
  auth.classList.remove('active');
  setTimeout(() => {
    auth.style.display = 'none';
    document.getElementById('onboarding-overlay').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    initApp();
  }, 500);
}

function logout() {
  saveData();
  localStorage.removeItem('mappd_session');
  closeAccountMenu();
  // hard reset to the auth screen
  document.getElementById('settings-modal').classList.add('hidden');
  document.getElementById('app').classList.add('hidden');
  if (globe) { globe.destroy(); globe = null; }
  userData = defaultUserData();
  const auth = document.getElementById('auth-overlay');
  auth.style.display = '';
  auth.classList.add('active');
  document.getElementById('auth-email').value = '';
  authError('auth-error', '');
}

// ============================================
// ACCOUNT MENU
// ============================================
function updateAccountMenu() {
  const initial = (userData.name || 'U').charAt(0).toUpperCase();
  document.getElementById('nav-avatar').textContent = initial;
  document.getElementById('am-avatar').textContent = initial;
  document.getElementById('am-name').textContent = userData.name || 'Traveler';
  document.getElementById('am-email').textContent = userData.email || '';
}
function toggleAccountMenu(e) {
  if (e) e.stopPropagation();
  const m = document.getElementById('account-menu');
  m.classList.toggle('hidden');
}
function closeAccountMenu() {
  const m = document.getElementById('account-menu');
  if (m) m.classList.add('hidden');
}
document.addEventListener('click', (e) => {
  const menu = document.getElementById('account-menu');
  const avatar = document.getElementById('nav-avatar');
  if (menu && !menu.classList.contains('hidden') &&
      !menu.contains(e.target) && e.target !== avatar) closeAccountMenu();
});

// ============================================
// SETTINGS
// ============================================
function openSettings(tab) {
  closeAccountMenu();
  document.getElementById('settings-modal').classList.remove('hidden');
  switchSettingsTab(tab || 'account');
}
function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}
function switchSettingsTab(tab) {
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.toggle('active', t.dataset.stab === tab));
  ['account', 'privacy', 'data'].forEach(t =>
    document.getElementById('stab-' + t).classList.toggle('hidden', t !== tab));
  if (tab === 'account') renderAccountSettings();
  else if (tab === 'privacy') renderPrivacySettings();
  else renderDataSettings();
}

function providerLabel() {
  return userData.provider === 'google' ? 'Google' : 'Email';
}

function renderAccountSettings() {
  const el = document.getElementById('stab-account');
  const opts = COUNTRIES.map(c =>
    `<option value="${c.code}" ${c.code === userData.homeCountry ? 'selected' : ''}>${c.name}</option>`).join('');
  el.innerHTML = `
    <div class="set-profile">
      <div class="avatar lg">${(userData.name || 'U').charAt(0).toUpperCase()}</div>
      <div>
        <div class="set-name">${escapeHtml(userData.name || 'Traveler')}</div>
        <div class="set-email">${escapeHtml(userData.email || '')} <span class="prov-chip">${providerLabel()}</span></div>
      </div>
    </div>
    <label class="set-field"><span>Display name</span>
      <input type="text" id="set-name" class="styled-input" value="${escapeHtml(userData.name || '')}"></label>
    <label class="set-field"><span>Age</span>
      <input type="number" id="set-age" class="styled-input" min="1" max="120" value="${userData.age || ''}"></label>
    <label class="set-field"><span>Home country</span>
      <select id="set-country" class="styled-select" style="width:100%">${opts}</select></label>
    <button class="btn-primary" onclick="saveAccountSettings()">Save changes</button>
    <div class="set-divider"></div>
    <button class="btn-secondary" onclick="logout()">Log out</button>
    <button class="set-danger" onclick="deleteAccount()">Delete account</button>
  `;
}
function saveAccountSettings() {
  const name = document.getElementById('set-name').value.trim();
  const age = parseInt(document.getElementById('set-age').value) || userData.age;
  const country = document.getElementById('set-country').value;
  if (name) userData.name = name;
  userData.age = age;
  userData.homeCountry = country;
  applyChildSafety();
  updateAccountMenu();
  updateStats();
  saveData();
  toast('Account updated');
  renderAccountSettings();
}
function deleteAccount() {
  if (!confirm('Delete your account and all data on this device? This cannot be undone.')) return;
  const accounts = getAccounts();
  delete accounts[userData.email];
  setAccounts(accounts);
  localStorage.removeItem('mappd_session');
  document.getElementById('settings-modal').classList.add('hidden');
  logout();
}

function makeToggle(key, label, desc, on, disabled) {
  return `<div class="set-toggle ${disabled ? 'disabled' : ''}">
    <div class="st-text"><span>${label}</span><small>${desc}</small></div>
    <button class="switch ${on ? 'on' : ''}" ${disabled ? 'disabled' : ''} onclick="togglePrivacy('${key}')"></button>
  </div>`;
}

function renderPrivacySettings() {
  ensurePrivacy();
  const p = userData.privacy;
  const locked = userData.childMode;
  const el = document.getElementById('stab-privacy');
  const vis = ['public', 'friends', 'private'];
  const visLabel = { public: 'Public', friends: 'Friends', private: 'Only me' };
  el.innerHTML = `
    ${locked ? `<div class="child-banner">🔒 This is a child account. Privacy is locked to <b>Only me</b> and sharing is off.</div>` : ''}
    <div class="set-section-label">Who can see your map</div>
    <div class="vis-seg ${locked ? 'disabled' : ''}">
      ${vis.map(v => `<button class="vis-opt ${p.profileVisibility === v ? 'on' : ''}" ${locked ? 'disabled' : ''} onclick="setVisibility('${v}')">${visLabel[v]}</button>`).join('')}
    </div>
    ${makeToggle('showInFeed', 'Share trips to the feed', 'Post your visits to the social feed', p.showInFeed, locked)}
    ${makeToggle('allowComments', 'Allow comments', 'Let others comment on your activity', p.allowComments, locked)}
    ${makeToggle('shareLocation', 'Show home country', 'Display where you call home', p.shareLocation, locked)}
    ${makeToggle('searchable', 'Discoverable', 'Let people find you by name or email', p.searchable, locked)}
  `;
}
function setVisibility(v) {
  if (userData.childMode) return;
  userData.privacy.profileVisibility = v;
  saveData();
  renderPrivacySettings();
}
function togglePrivacy(key) {
  if (userData.childMode) return;
  ensurePrivacy();
  userData.privacy[key] = !userData.privacy[key];
  saveData();
  renderPrivacySettings();
  renderDataSettings();
}

function renderDataSettings() {
  ensurePrivacy();
  const el = document.getElementById('stab-data');
  const created = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '—';
  el.innerHTML = `
    ${userData.childMode
      ? `<div class="child-banner">👶 Child account (under 13). In line with COPPA, <b>data collection is disabled</b> and personalised features are off.</div>`
      : ''}
    <div class="set-section-label">Account</div>
    <div class="data-row"><span>Account type</span><b>${userData.childMode ? 'Child (under 13)' : 'Standard'}</b></div>
    <div class="data-row"><span>Member since</span><b>${created}</b></div>
    <div class="data-row"><span>Sign-in method</span><b>${providerLabel()}</b></div>
    <div class="set-section-label">Data collection</div>
    ${makeToggle('analytics', 'Usage analytics', 'Help improve Mappd with anonymous usage data', userData.privacy.analytics, userData.childMode)}
    <div class="set-section-label">Your data</div>
    <button class="btn-secondary" onclick="downloadMyData()">Download my data</button>
    <button class="set-danger" onclick="deleteAccount()">Delete account &amp; data</button>
    <p class="data-note">All data is stored locally on this device. Nothing is uploaded to a server.</p>
  `;
}
function downloadMyData() {
  try {
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mappd-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Data exported');
  } catch (e) {}
}

// small toast
function toast(msg) {
  let t = document.getElementById('mappd-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'mappd-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 1800);
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initParticles();

  const session = localStorage.getItem('mappd_session');
  const accounts = getAccounts();
  if (session && accounts[session] && accounts[session].name) {
    userData = Object.assign(defaultUserData(), accounts[session]);
    userData.email = session;
    ensurePrivacy();
    document.getElementById('auth-overlay').classList.remove('active');
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('onboarding-overlay').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    initApp();
  }
  // otherwise the auth overlay (active by default) is shown
});

// Shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}`;
document.head.appendChild(shakeStyle);
