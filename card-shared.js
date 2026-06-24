// Shared icons, helpers, and rendering used by index / register / manage.

export const ICONS = {
  instagram: { bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="white"/></svg>' },
  linkedin: { bg: '#0a66c2', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>' },
  tiktok: { bg: '#010101', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.79a8.18 8.18 0 004.78 1.52V6.83a4.85 4.85 0 01-1.01-.14z"/></svg>' },
  x: { bg: '#000', svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  youtube: { bg: '#ff0000', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23 6.5a3 3 0 00-2.1-2.1C19.1 4 12 4 12 4s-7.1 0-8.9.4A3 3 0 001 6.5 31.4 31.4 0 00.6 12a31.4 31.4 0 00.4 5.5 3 3 0 002.1 2.1c1.8.4 8.9.4 8.9.4s7.1 0 8.9-.4a3 3 0 002.1-2.1 31.4 31.4 0 00.4-5.5 31.4 31.4 0 00-.4-5.5z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98"/></svg>' },
  github: { bg: '#24292e', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>' },
  facebook: { bg: '#1877f2', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
  twitter: { bg: '#1da1f2', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>' },
  snapchat: { bg: '#fffc00', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#1d1d1f"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.4-.15.73-.1.96.04.23.14.48.465.31.91-.18.48-.72.78-1.2.96-.36.12-.9.3-1.05.36-.12.06-.18.15-.18.27 0 .12.06.21.12.3.66.96 1.65 2.07 3.12 2.37.36.06.6.36.54.72-.06.36-.42.63-.78.72-.93.24-1.77.42-2.58.42-.27 0-.54-.03-.78-.09 0 0-.3 1.08-.84 1.47-.24.18-.48.27-.72.27-.24 0-.48-.09-.72-.27-.54-.39-.84-1.47-.84-1.47-.24.06-.51.09-.78.09-.81 0-1.65-.18-2.58-.42-.36-.09-.72-.36-.78-.72-.06-.36.18-.66.54-.72 1.47-.3 2.46-1.41 3.12-2.37.06-.09.12-.18.12-.3 0-.12-.06-.21-.18-.27-.15-.06-.69-.24-1.05-.36-.48-.18-1.02-.48-1.2-.96-.17-.445.08-.77.31-.91.23-.14.56-.19.96-.04.263.094.622.198.922.214.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.653 1.069 11.016.793 12.006.793h.2z"/></svg>' },
};

export const CONTACT_ICONS = {
  email: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
  whatsapp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
  telegram: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
};

export function esc(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : s;
  return d.innerHTML;
}

export function getInitials(name) {
  return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export function getIcon(platform) {
  const key = (platform || '').toLowerCase().replace(/\s+/g, '');
  return ICONS[key] || { bg: '#86868b', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' };
}

export function getWorkIcon() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
}

// Renders the public card into the standard markup used by index.html.
export function renderCard(data) {
  document.getElementById('avatar').textContent = getInitials(data.name);
  document.getElementById('card-name').textContent = data.name || '';
  document.getElementById('card-title').textContent = data.title || '';
  document.getElementById('card-bio').textContent = data.bio || '';
  document.getElementById('location-text').textContent = data.location || '';
  document.title = data.name || 'Card';

  if (!data.location) document.getElementById('card-location').classList.add('hidden');

  const socialsEl = document.getElementById('socials-list');
  socialsEl.innerHTML = '';
  const socials = data.socials || [];
  if (socials.length === 0) {
    document.getElementById('socials-section').classList.add('hidden');
  } else {
    socials.forEach(s => {
      const icon = getIcon(s.platform);
      socialsEl.innerHTML += `
        <a class="link-item" href="${esc(s.url)}" target="_blank" rel="noopener">
          <span class="link-icon" style="background:${icon.bg}">${icon.svg}</span>
          <span class="link-text">
            <span class="primary">${esc(s.platform)}</span>
            <span class="secondary">${esc(s.handle)}</span>
          </span>
          <span class="link-arrow">&#8250;</span>
        </a>`;
    });
  }

  const workEl = document.getElementById('work-list');
  workEl.innerHTML = '';
  const work = data.work || [];
  if (work.length === 0) {
    document.getElementById('work-section').classList.add('hidden');
  } else {
    work.forEach(w => {
      workEl.innerHTML += `
        <a class="link-item" href="${esc(w.url || '#')}" target="_blank" rel="noopener">
          <span class="link-icon" style="background:#f5f5f7">${getWorkIcon()}</span>
          <span class="link-text">
            <span class="primary">${esc(w.label)}</span>
            <span class="secondary">${esc(w.description)}</span>
          </span>
          <span class="link-arrow">&#8250;</span>
        </a>`;
    });
  }

  const contactEl = document.getElementById('contact-row');
  contactEl.innerHTML = '';
  const contacts = [];
  if (data.email) contacts.push({ href: `mailto:${data.email}`, icon: CONTACT_ICONS.email, label: 'Email' });
  if (data.phone) contacts.push({ href: `tel:${data.phone}`, icon: CONTACT_ICONS.phone, label: 'Call' });
  if (data.whatsapp) contacts.push({ href: `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}`, icon: CONTACT_ICONS.whatsapp, label: 'WhatsApp' });
  if (data.telegram) contacts.push({ href: `https://t.me/${data.telegram.replace('@', '')}`, icon: CONTACT_ICONS.telegram, label: 'Telegram' });

  if (contacts.length === 0) {
    document.getElementById('contact-section').classList.add('hidden');
  } else {
    contacts.forEach(c => {
      contactEl.innerHTML += `
        <a class="contact-btn" href="${esc(c.href)}" target="_blank" rel="noopener">
          <span class="btn-icon">${c.icon}</span>
          <span class="btn-label">${esc(c.label)}</span>
        </a>`;
    });
  }
}

// Collects the profile form fields shared by register.html and manage.html.
export function gatherForm() {
  const socials = [...document.querySelectorAll('#socials-list .entry')].map(el => ({
    platform: el.querySelector('.s-platform').value.trim(),
    handle: el.querySelector('.s-handle').value.trim(),
    url: el.querySelector('.s-url').value.trim(),
  })).filter(s => s.platform || s.url);

  const work = [...document.querySelectorAll('#work-list .entry')].map(el => ({
    label: el.querySelector('.w-label').value.trim(),
    description: el.querySelector('.w-desc').value.trim(),
    url: el.querySelector('.w-url').value.trim(),
  })).filter(w => w.label || w.url);

  return {
    name: document.getElementById('name').value.trim(),
    title: document.getElementById('title').value.trim(),
    bio: document.getElementById('bio').value.trim(),
    location: document.getElementById('location').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    telegram: document.getElementById('telegram').value.trim(),
    socials,
    work,
  };
}

export function addSocialRow(s = { platform: '', handle: '', url: '' }) {
  const list = document.getElementById('socials-list');
  const div = document.createElement('div');
  div.className = 'entry';
  div.innerHTML = `
    <div class="field"><label>Platform</label><input class="s-platform" placeholder="Instagram" value="${esc(s.platform)}" /></div>
    <div class="field"><label>Handle</label><input class="s-handle" placeholder="@username" value="${esc(s.handle)}" /></div>
    <div class="field"><label>URL</label><input class="s-url" placeholder="https://..." value="${esc(s.url)}" /></div>
    <button type="button" class="remove-btn" title="Remove">&times;</button>`;
  div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
  list.appendChild(div);
}

export function addWorkRow(w = { label: '', description: '', url: '' }) {
  const list = document.getElementById('work-list');
  const div = document.createElement('div');
  div.className = 'entry';
  div.innerHTML = `
    <div class="field"><label>Title</label><input class="w-label" placeholder="Resume" value="${esc(w.label)}" /></div>
    <div class="field"><label>Subtitle</label><input class="w-desc" placeholder="View or download" value="${esc(w.description)}" /></div>
    <div class="field"><label>URL</label><input class="w-url" placeholder="https://..." value="${esc(w.url)}" /></div>
    <button type="button" class="remove-btn" title="Remove">&times;</button>`;
  div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
  list.appendChild(div);
}

export function fillForm(data) {
  document.getElementById('name').value = data.name || '';
  document.getElementById('title').value = data.title || '';
  document.getElementById('bio').value = data.bio || '';
  document.getElementById('location').value = data.location || '';
  document.getElementById('email').value = data.email || '';
  document.getElementById('phone').value = data.phone || '';
  document.getElementById('whatsapp').value = data.whatsapp || '';
  document.getElementById('telegram').value = data.telegram || '';
  (data.socials || []).forEach(addSocialRow);
  (data.work || []).forEach(addWorkRow);
}
