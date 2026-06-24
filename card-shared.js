// Shared definitions, form builders, and rendering for index / register / manage.

/* ───────────────────────── helpers ───────────────────────── */

export function esc(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : s;
  return d.innerHTML;
}

function clean(h) {
  return String(h || '').trim().replace(/^@+/, '').replace(/\s+/g, '');
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function getInitials(name) {
  return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function normalizeUrl(u) {
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

function hostname(u) {
  try { return new URL(normalizeUrl(u)).hostname.replace(/^www\./, ''); }
  catch { return u; }
}

// Compress an uploaded image to a small JPEG data URL so it fits in Firestore.
export function compressImage(file, maxSize = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
        else if (height >= width && height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ───────────────────────── icons ───────────────────────── */

const GENERIC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>';

// Each social platform: brand colour, glyph, the label for the handle field,
// and a builder that turns a handle into a profile URL (or null if none).
export const SOCIAL_PLATFORMS = {
  instagram: { label: 'Instagram', handleLabel: 'Username', bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="white"/></svg>',
    url: h => `https://instagram.com/${clean(h)}` },
  facebook: { label: 'Facebook', handleLabel: 'Username', bg: '#1877f2',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    url: h => `https://facebook.com/${clean(h)}` },
  snapchat: { label: 'Snapchat', handleLabel: 'Username', bg: '#fffc00',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#1d1d1f"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.4-.15.73-.1.96.04.23.14.48.465.31.91-.18.48-.72.78-1.2.96-.36.12-.9.3-1.05.36-.12.06-.18.15-.18.27 0 .12.06.21.12.3.66.96 1.65 2.07 3.12 2.37.36.06.6.36.54.72-.06.36-.42.63-.78.72-.93.24-1.77.42-2.58.42-.27 0-.54-.03-.78-.09 0 0-.3 1.08-.84 1.47-.24.18-.48.27-.72.27-.24 0-.48-.09-.72-.27-.54-.39-.84-1.47-.84-1.47-.24.06-.51.09-.78.09-.81 0-1.65-.18-2.58-.42-.36-.09-.72-.36-.78-.72-.06-.36.18-.66.54-.72 1.47-.3 2.46-1.41 3.12-2.37.06-.09.12-.18.12-.3 0-.12-.06-.21-.18-.27-.15-.06-.69-.24-1.05-.36-.48-.18-1.02-.48-1.2-.96-.17-.445.08-.77.31-.91.23-.14.56-.19.96-.04.263.094.622.198.922.214.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.653 1.069 11.016.793 12.006.793h.2z"/></svg>',
    url: h => `https://snapchat.com/add/${clean(h)}` },
  spotify: { label: 'Spotify', handleLabel: 'Username / profile ID', bg: '#1db954',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    url: h => `https://open.spotify.com/user/${clean(h)}` },
  applemusic: { label: 'Apple Music', handleLabel: 'Profile ID', bg: 'linear-gradient(135deg,#fa2d48,#fb5c74)',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M8.5 18V6l11-2v10"/></svg>',
    url: h => `https://music.apple.com/profile/${clean(h)}` },
  youtube: { label: 'YouTube', handleLabel: 'Channel', bg: '#ff0000',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23 6.5a3 3 0 00-2.1-2.1C19.1 4 12 4 12 4s-7.1 0-8.9.4A3 3 0 001 6.5 31.4 31.4 0 00.6 12a31.4 31.4 0 00.4 5.5 3 3 0 002.1 2.1c1.8.4 8.9.4 8.9.4s7.1 0 8.9-.4a3 3 0 002.1-2.1 31.4 31.4 0 00.4-5.5 31.4 31.4 0 00-.4-5.5z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="#ff0000"/></svg>',
    url: h => `https://youtube.com/@${clean(h)}` },
  tiktok: { label: 'TikTok', handleLabel: 'Username', bg: '#010101',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.79a8.18 8.18 0 004.78 1.52V6.83a4.85 4.85 0 01-1.01-.14z"/></svg>',
    url: h => `https://tiktok.com/@${clean(h)}` },
  x: { label: 'X', handleLabel: 'Username', bg: '#000',
    svg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    url: h => `https://x.com/${clean(h)}` },
  pinterest: { label: 'Pinterest', handleLabel: 'Username', bg: '#e60023',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>',
    url: h => `https://pinterest.com/${clean(h)}` },
  reddit: { label: 'Reddit', handleLabel: 'Username', bg: '#ff4500',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.191-4.259-1.949-6.971-2.046l1.483-4.669 4.016.941-.006.058c0 1.193.975 2.163 2.174 2.163 1.198 0 2.172-.97 2.172-2.163s-.975-2.164-2.172-2.164c-.92 0-1.704.574-2.021 1.379l-4.329-1.015c-.189-.046-.381.063-.44.249l-1.654 5.207c-2.838.034-5.409.798-7.3 2.025-.474-.438-1.103-.712-1.799-.712-1.465 0-2.656 1.187-2.656 2.646 0 .97.533 1.811 1.317 2.271-.052.282-.086.567-.086.857 0 3.911 4.808 7.093 10.719 7.093s10.72-3.182 10.72-7.093c0-.288-.033-.571-.084-.852.789-.458 1.327-1.298 1.327-2.276zm-17.224 1.816c0-.836.683-1.517 1.519-1.517.835 0 1.518.681 1.518 1.517 0 .836-.683 1.517-1.518 1.517-.836.001-1.519-.681-1.519-1.517zm9.61 4.32c-.69.69-2.038 1.244-3.886 1.244-1.847 0-3.196-.554-3.886-1.244-.182-.182-.182-.479 0-.661.182-.182.479-.182.661 0 .378.378 1.237.846 3.225.846 1.989 0 2.847-.467 3.225-.845.182-.182.479-.182.661 0 .181.182.181.479 0 .661zm-.293-2.803c-.835 0-1.518-.681-1.518-1.517 0-.836.683-1.517 1.518-1.517.836 0 1.519.681 1.519 1.517 0 .836-.683 1.517-1.519 1.517z"/></svg>',
    url: h => `https://reddit.com/user/${clean(h)}` },
  discord: { label: 'Discord', handleLabel: 'Username', bg: '#5865f2',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>',
    url: () => null },
  twitch: { label: 'Twitch', handleLabel: 'Username', bg: '#9146ff',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>',
    url: h => `https://twitch.tv/${clean(h)}` },
  threads: { label: 'Threads', handleLabel: 'Username', bg: '#000',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 013.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L9.097 7.503c.98-1.46 2.568-2.26 4.471-2.26h.03c3.18.02 5.075 1.97 5.264 5.351.108.046.215.094.32.143 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65z"/></svg>',
    url: h => `https://threads.net/@${clean(h)}` },
  bereal: { label: 'BeReal', handleLabel: 'Username', bg: '#000',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="3.5"/></svg>',
    url: h => `https://bere.al/${clean(h)}` },
};

// Work-link types. Some build a URL from a username, others take a full URL.
export const WORK_TYPES = {
  linkedin: { label: 'LinkedIn', inputLabel: 'Profile URL or username', bg: '#0a66c2',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
    url: v => /^https?:/i.test(v) ? v : `https://linkedin.com/in/${clean(v)}` },
  github: { label: 'GitHub', inputLabel: 'Username', bg: '#24292e',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    url: v => /^https?:/i.test(v) ? v : `https://github.com/${clean(v)}` },
  slack: { label: 'Slack', inputLabel: 'Workspace or profile URL', bg: '#4a154b',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/></svg>',
    url: v => normalizeUrl(v) },
  resume: { label: 'Resume / CV', inputLabel: 'Link (Drive, Notion, PDF…)', bg: '#34c759',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    url: v => normalizeUrl(v) },
  portfolio: { label: 'Portfolio', inputLabel: 'Link', bg: '#5e5ce6',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
    url: v => normalizeUrl(v) },
  other: { label: 'Other', inputLabel: 'Link', bg: '#86868b',
    svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
    url: v => normalizeUrl(v) },
};

const WEBSITE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>';
const EDU_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5"/></svg>';
const CERT_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11"/></svg>';

const CONTACT_ICONS = {
  email: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
  whatsapp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
  telegram: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
};

/* ───────────────────────── option lists ───────────────────────── */

export const TITLE_GROUPS = {
  'Engineering': ['Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Chemical Engineer', 'Aerospace Engineer', 'Biomedical Engineer', 'Industrial Engineer', 'Environmental Engineer', 'Structural Engineer', 'Computer Engineer', 'Robotics Engineer', 'Data Engineer', 'DevOps Engineer', 'Engineer'],
  'Medical & Health': ['Doctor', 'Physician', 'Surgeon', 'Dentist', 'Nurse', 'Pharmacist', 'Psychologist', 'Psychiatrist', 'Veterinarian', 'Physical Therapist', 'Nutritionist', 'Optometrist', 'Radiologist', 'Pediatrician', 'Cardiologist', 'Dermatologist', 'Medical Student'],
  'Creative & Media': ['Videographer', 'Photographer', 'Filmmaker', 'Production Director', 'Creative Director', 'Art Director', 'Graphic Designer', 'UX/UI Designer', 'Illustrator', 'Animator', 'Content Creator', 'Writer', 'Author', 'Journalist', 'Editor', 'Musician', 'Producer', 'DJ', 'Actor', 'Model', 'Influencer', 'Visionary', 'Creative'],
  'Business & Management': ['Founder', 'Co-Founder', 'CEO', 'COO', 'CFO', 'CTO', 'Entrepreneur', 'Product Manager', 'Project Manager', 'Marketing Manager', 'Sales Manager', 'Business Analyst', 'Consultant', 'Accountant', 'Financial Analyst', 'Investor', 'Operations Manager', 'HR Manager'],
  'Technology': ['Software Developer', 'Web Developer', 'Mobile Developer', 'Data Scientist', 'Machine Learning Engineer', 'AI Researcher', 'Cybersecurity Analyst', 'Systems Administrator', 'Cloud Architect', 'Game Developer', 'QA Engineer', 'IT Specialist'],
  'Science & Academia': ['Researcher', 'Scientist', 'Professor', 'Lecturer', 'Biologist', 'Chemist', 'Physicist', 'Mathematician', 'Economist', 'Statistician', 'Lab Technician'],
  'Architecture & Design': ['Architect', 'Interior Designer', 'Landscape Architect', 'Urban Planner', 'Industrial Designer', 'Fashion Designer'],
  'Law & Public Service': ['Lawyer', 'Attorney', 'Paralegal', 'Judge', 'Police Officer', 'Firefighter', 'Diplomat', 'Politician', 'Social Worker', 'Civil Servant'],
  'Skilled Trades': ['Electrician', 'Plumber', 'Carpenter', 'Welder', 'Mechanic', 'Chef', 'Baker', 'Barber', 'Pilot'],
  'Education': ['Teacher', 'Tutor', 'Principal', 'Coach', 'Trainer', 'Instructor'],
  'Student & Other': ['Student', 'Intern', 'Apprentice', 'Freelancer', 'Volunteer', 'Self-Employed', 'Retired'],
};

export const EDU_LEVELS = ['High School Diploma', 'Vocational / Trade', 'Associate Degree', "Bachelor's Degree", "Master's Degree", 'Doctorate (PhD)', 'Postdoctoral', 'Professional Degree (MD, JD, etc.)', 'Certificate', 'Other'];

export const CERT_TYPES = ['Language', 'Professional', 'Course', 'Technical', 'Award', 'Membership', 'Other'];

export const COUNTRY_CODES = [
  { c: '🇵🇭', d: '+63' }, { c: '🇺🇸', d: '+1' }, { c: '🇬🇧', d: '+44' }, { c: '🇦🇺', d: '+61' },
  { c: '🇨🇦', d: '+1' }, { c: '🇮🇳', d: '+91' }, { c: '🇸🇬', d: '+65' }, { c: '🇯🇵', d: '+81' },
  { c: '🇰🇷', d: '+82' }, { c: '🇨🇳', d: '+86' }, { c: '🇭🇰', d: '+852' }, { c: '🇲🇾', d: '+60' },
  { c: '🇮🇩', d: '+62' }, { c: '🇹🇭', d: '+66' }, { c: '🇻🇳', d: '+84' }, { c: '🇦🇪', d: '+971' },
  { c: '🇸🇦', d: '+966' }, { c: '🇩🇪', d: '+49' }, { c: '🇫🇷', d: '+33' }, { c: '🇪🇸', d: '+34' },
  { c: '🇮🇹', d: '+39' }, { c: '🇳🇱', d: '+31' }, { c: '🇸🇪', d: '+46' }, { c: '🇨🇭', d: '+41' },
  { c: '🇧🇷', d: '+55' }, { c: '🇲🇽', d: '+52' }, { c: '🇳🇿', d: '+64' }, { c: '🇿🇦', d: '+27' },
  { c: '🇳🇬', d: '+234' }, { c: '🇪🇬', d: '+20' }, { c: '🇹🇷', d: '+90' }, { c: '🇷🇺', d: '+7' },
  { c: '🇵🇰', d: '+92' }, { c: '🇧🇩', d: '+880' }, { c: '🇶🇦', d: '+974' }, { c: '🇮🇪', d: '+353' },
];

/* ───────────────────────── icon dropdown component ───────────────────────── */

let stylesInjected = false;
export function injectFormStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const css = `
    .icon-dd { position: relative; flex-shrink: 0; }
    .icon-dd-toggle {
      display: flex; align-items: center; gap: 8px; min-width: 132px;
      padding: 9px 12px; background: var(--bg, #f5f5f7); border: 1px solid transparent;
      border-radius: 8px; cursor: pointer; font: inherit; font-size: 14px; color: var(--text, #1d1d1f);
    }
    .icon-dd-toggle:hover { background: #ececee; }
    .icon-dd-toggle .ic { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .icon-dd-toggle .ic svg { width: 14px; height: 14px; }
    .icon-dd-toggle .lbl { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .icon-dd-toggle .chev { color: var(--secondary, #86868b); font-size: 11px; }
    .icon-dd-menu {
      position: absolute; top: calc(100% + 4px); left: 0; z-index: 30;
      background: #fff; border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,0.16);
      padding: 6px; max-height: 280px; overflow-y: auto; min-width: 190px; display: none;
    }
    .icon-dd-menu.open { display: block; }
    .icon-dd-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .icon-dd-item:hover { background: var(--bg, #f5f5f7); }
    .icon-dd-item .ic { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .icon-dd-item .ic svg { width: 15px; height: 15px; }
    .entry { display: flex; gap: 8px; align-items: flex-end; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 0.5px solid rgba(210,210,215,0.4); flex-wrap: wrap; }
    .entry:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .entry .field { flex: 1; margin-bottom: 0; min-width: 120px; }
    .avatar-upload { display: flex; align-items: center; gap: 16px; }
    .avatar-preview {
      width: 76px; height: 76px; border-radius: 50%; background: var(--bg, #f5f5f7) center/cover no-repeat;
      display: flex; align-items: center; justify-content: center; color: var(--secondary, #86868b);
      font-size: 12px; text-align: center; cursor: pointer; flex-shrink: 0; border: 1px solid var(--divider, #d2d2d7);
    }
    .avatar-preview.has-image { color: transparent; }
    .cert-thumb-row { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
    .cert-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid var(--divider, #d2d2d7); }
    .upload-link { font-size: 13px; color: var(--accent, #0071e3); cursor: pointer; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

// Build an icon dropdown. `defs` is the map (SOCIAL_PLATFORMS or WORK_TYPES).
function createIconDropdown(defs, initialKey, onChange) {
  const keys = Object.keys(defs);
  const startKey = initialKey && defs[initialKey] ? initialKey : keys[0];
  const wrap = el('<div class="icon-dd"></div>');
  wrap.dataset.value = startKey;

  const toggle = el(`<button type="button" class="icon-dd-toggle">
    <span class="ic"></span><span class="lbl"></span><span class="chev">▾</span></button>`);
  const menu = el('<div class="icon-dd-menu"></div>');

  function paintToggle(key) {
    const d = defs[key];
    toggle.querySelector('.ic').style.background = d.bg;
    toggle.querySelector('.ic').innerHTML = d.svg;
    toggle.querySelector('.lbl').textContent = d.label;
  }
  keys.forEach(key => {
    const d = defs[key];
    const item = el(`<div class="icon-dd-item"><span class="ic" style="background:${d.bg}">${d.svg}</span><span>${esc(d.label)}</span></div>`);
    item.addEventListener('click', () => {
      wrap.dataset.value = key;
      paintToggle(key);
      menu.classList.remove('open');
      if (onChange) onChange(key);
    });
    menu.appendChild(item);
  });

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.icon-dd-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
    menu.classList.toggle('open');
  });
  document.addEventListener('click', () => menu.classList.remove('open'));

  paintToggle(startKey);
  wrap.appendChild(toggle);
  wrap.appendChild(menu);
  return wrap;
}

/* ───────────────────────── row builders ───────────────────────── */

function removeBtn(row) {
  const b = el('<button type="button" class="remove-btn" title="Remove">&times;</button>');
  b.addEventListener('click', () => row.remove());
  return b;
}

export function addWebsiteRow(value = '') {
  const row = el('<div class="entry"></div>');
  row.appendChild(el(`<div class="field"><label>Website URL</label><input class="web-url" placeholder="https://yoursite.com" value="${esc(value)}" /></div>`));
  row.appendChild(removeBtn(row));
  document.getElementById('websites-list').appendChild(row);
}

export function addSocialRow(s = { platform: 'instagram', handle: '' }) {
  const row = el('<div class="entry"></div>');
  const handleField = el(`<div class="field"><label></label><input class="s-handle" value="${esc(s.handle)}" /></div>`);
  function applyLabel(key) {
    const d = SOCIAL_PLATFORMS[key];
    handleField.querySelector('label').textContent = d.handleLabel;
    handleField.querySelector('input').placeholder = d.handleLabel;
  }
  const dd = createIconDropdown(SOCIAL_PLATFORMS, s.platform, applyLabel);
  applyLabel(SOCIAL_PLATFORMS[s.platform] ? s.platform : 'instagram');
  row.appendChild(dd);
  row.appendChild(handleField);
  row.appendChild(removeBtn(row));
  document.getElementById('socials-list').appendChild(row);
}

export function addWorkRow(w = { type: 'linkedin', value: '', label: '' }) {
  const row = el('<div class="entry"></div>');
  const valueField = el(`<div class="field"><label></label><input class="w-value" value="${esc(w.value)}" /></div>`);
  const labelField = el(`<div class="field w-label-field"><label>Label</label><input class="w-label" placeholder="Custom label" value="${esc(w.label || '')}" /></div>`);
  function applyType(key) {
    const d = WORK_TYPES[key];
    valueField.querySelector('label').textContent = d.inputLabel;
    valueField.querySelector('input').placeholder = d.inputLabel;
    labelField.style.display = key === 'other' ? '' : 'none';
  }
  const dd = createIconDropdown(WORK_TYPES, w.type, applyType);
  applyType(WORK_TYPES[w.type] ? w.type : 'linkedin');
  row.appendChild(dd);
  row.appendChild(valueField);
  row.appendChild(labelField);
  row.appendChild(removeBtn(row));
  document.getElementById('work-list').appendChild(row);
}

function levelOptions(sel) {
  return EDU_LEVELS.map(l => `<option ${l === sel ? 'selected' : ''}>${esc(l)}</option>`).join('');
}
function certTypeOptions(sel) {
  return CERT_TYPES.map(t => `<option ${t === sel ? 'selected' : ''}>${esc(t)}</option>`).join('');
}

export function addEducationRow(e = { school: '', level: "Bachelor's Degree", year: '' }) {
  const row = el('<div class="entry"></div>');
  row.appendChild(el(`<div class="field" style="flex:2"><label>School</label><input class="e-school" placeholder="University name" value="${esc(e.school)}" /></div>`));
  row.appendChild(el(`<div class="field"><label>Level</label><select class="e-level">${levelOptions(e.level)}</select></div>`));
  row.appendChild(el(`<div class="field" style="flex:0 0 80px"><label>Year</label><input class="e-year" placeholder="2024" value="${esc(e.year)}" /></div>`));
  row.appendChild(removeBtn(row));
  document.getElementById('education-list').appendChild(row);
}

export function addCertRow(c = { type: 'Professional', title: '', issuer: '', year: '', image: '' }) {
  const row = el('<div class="entry" style="flex-direction:column;align-items:stretch"></div>');
  const top = el('<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap"></div>');
  top.appendChild(el(`<div class="field"><label>Type</label><select class="c-type">${certTypeOptions(c.type)}</select></div>`));
  top.appendChild(el(`<div class="field" style="flex:2"><label>Title</label><input class="c-title" placeholder="e.g. IELTS, AWS Certified" value="${esc(c.title)}" /></div>`));
  top.appendChild(removeBtn(row));
  const mid = el('<div style="display:flex;gap:8px;width:100%;margin-top:10px"></div>');
  mid.appendChild(el(`<div class="field"><label>Issuer</label><input class="c-issuer" placeholder="Issuing body" value="${esc(c.issuer)}" /></div>`));
  mid.appendChild(el(`<div class="field" style="flex:0 0 80px"><label>Year</label><input class="c-year" placeholder="2024" value="${esc(c.year)}" /></div>`));

  const hidden = el(`<input type="hidden" class="c-image" value="${esc(c.image || '')}" />`);
  const fileInput = el('<input type="file" accept="image/*" style="display:none" />');
  const thumbRow = el('<div class="cert-thumb-row"></div>');
  const uploadLink = el('<span class="upload-link">＋ Upload image (optional)</span>');
  const thumb = el('<img class="cert-thumb" style="display:none" />');
  if (c.image) { thumb.src = c.image; thumb.style.display = ''; uploadLink.textContent = 'Change image'; }
  uploadLink.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files[0]; if (!f) return;
    const url = await compressImage(f, 800, 0.7);
    hidden.value = url; thumb.src = url; thumb.style.display = ''; uploadLink.textContent = 'Change image';
  });
  thumbRow.appendChild(thumb);
  thumbRow.appendChild(uploadLink);

  row.appendChild(top);
  row.appendChild(mid);
  row.appendChild(thumbRow);
  row.appendChild(hidden);
  row.appendChild(fileInput);
  document.getElementById('certs-list').appendChild(row);
}

export function addEmailRow(value = '') {
  const row = el('<div class="entry"></div>');
  row.appendChild(el(`<div class="field"><label>Email</label><input class="email-input" type="email" placeholder="you@example.com" value="${esc(value)}" /></div>`));
  row.appendChild(removeBtn(row));
  document.getElementById('emails-list').appendChild(row);
}

/* ───────────────────────── form setup / gather / fill ───────────────────────── */

function countryOptions(sel) {
  return COUNTRY_CODES.map((c, i) =>
    `<option value="${c.d}" ${c.d === sel ? 'selected' : (sel == null && i === 0 ? 'selected' : '')}>${c.c} ${c.d}</option>`
  ).join('');
}

function titleOptions(sel) {
  let html = '<option value="">Select a title…</option>';
  for (const [group, items] of Object.entries(TITLE_GROUPS)) {
    html += `<optgroup label="${esc(group)}">`;
    html += items.map(t => `<option ${t === sel ? 'selected' : ''}>${esc(t)}</option>`).join('');
    html += '</optgroup>';
  }
  html += '<option value="__other__">Other (type your own)…</option>';
  return html;
}

// Wires up a standard form (used by register.html and manage.html).
export function setupForm() {
  injectFormStyles();

  document.getElementById('title-select').innerHTML = titleOptions(null);
  document.getElementById('phone-code').innerHTML = countryOptions(null);
  document.getElementById('whatsapp-code').innerHTML = countryOptions(null);

  const titleSel = document.getElementById('title-select');
  titleSel.addEventListener('change', () => {
    document.getElementById('title-other-wrap').style.display = titleSel.value === '__other__' ? '' : 'none';
  });

  document.getElementById('add-website').addEventListener('click', () => addWebsiteRow());
  document.getElementById('add-social').addEventListener('click', () => addSocialRow());
  document.getElementById('add-work').addEventListener('click', () => addWorkRow());
  document.getElementById('add-education').addEventListener('click', () => addEducationRow());
  document.getElementById('add-cert').addEventListener('click', () => addCertRow());
  document.getElementById('add-email').addEventListener('click', () => addEmailRow());

  const av = document.getElementById('avatar-preview');
  const avInput = document.getElementById('avatar-input');
  const avData = document.getElementById('avatar-data');
  av.addEventListener('click', () => avInput.click());
  avInput.addEventListener('change', async () => {
    const f = avInput.files[0]; if (!f) return;
    const url = await compressImage(f, 256, 0.85);
    avData.value = url;
    av.style.backgroundImage = `url(${url})`;
    av.classList.add('has-image');
  });
}

export function gatherForm() {
  const titleSel = document.getElementById('title-select');
  const title = titleSel.value === '__other__'
    ? document.getElementById('title-other').value.trim()
    : titleSel.value;

  const websites = [...document.querySelectorAll('#websites-list .web-url')]
    .map(i => i.value.trim()).filter(Boolean);

  const socials = [...document.querySelectorAll('#socials-list .entry')].map(row => ({
    platform: row.querySelector('.icon-dd').dataset.value,
    handle: row.querySelector('.s-handle').value.trim(),
  })).filter(s => s.handle);

  const work = [...document.querySelectorAll('#work-list .entry')].map(row => ({
    type: row.querySelector('.icon-dd').dataset.value,
    value: row.querySelector('.w-value').value.trim(),
    label: row.querySelector('.w-label').value.trim(),
  })).filter(w => w.value);

  const education = [...document.querySelectorAll('#education-list .entry')].map(row => ({
    school: row.querySelector('.e-school').value.trim(),
    level: row.querySelector('.e-level').value,
    year: row.querySelector('.e-year').value.trim(),
  })).filter(e => e.school);

  const certifications = [...document.querySelectorAll('#certs-list .entry')].map(row => ({
    type: row.querySelector('.c-type').value,
    title: row.querySelector('.c-title').value.trim(),
    issuer: row.querySelector('.c-issuer').value.trim(),
    year: row.querySelector('.c-year').value.trim(),
    image: row.querySelector('.c-image').value,
  })).filter(c => c.title);

  const emails = [...document.querySelectorAll('#emails-list .email-input')]
    .map(i => i.value.trim()).filter(Boolean);

  return {
    name: document.getElementById('name').value.trim(),
    title,
    company: document.getElementById('company').value.trim(),
    bio: document.getElementById('bio').value.trim(),
    location: document.getElementById('location').value.trim(),
    avatar: document.getElementById('avatar-data').value || '',
    websites,
    socials,
    work,
    education,
    certifications,
    emails,
    phone: { code: document.getElementById('phone-code').value, number: document.getElementById('phone-number').value.trim() },
    whatsapp: { code: document.getElementById('whatsapp-code').value, number: document.getElementById('whatsapp-number').value.trim() },
    telegram: document.getElementById('telegram').value.trim(),
  };
}

export function fillForm(data) {
  document.getElementById('name').value = data.name || '';
  const titleSel = document.getElementById('title-select');
  const known = [...titleSel.options].some(o => o.value === data.title && o.value !== '__other__');
  if (data.title && !known) {
    titleSel.value = '__other__';
    document.getElementById('title-other-wrap').style.display = '';
    document.getElementById('title-other').value = data.title;
  } else {
    titleSel.value = data.title || '';
  }
  document.getElementById('company').value = data.company || '';
  document.getElementById('bio').value = data.bio || '';
  document.getElementById('location').value = data.location || '';

  if (data.avatar) {
    document.getElementById('avatar-data').value = data.avatar;
    const av = document.getElementById('avatar-preview');
    av.style.backgroundImage = `url(${data.avatar})`;
    av.classList.add('has-image');
  }

  (data.websites || []).forEach(addWebsiteRow);
  (data.socials || []).forEach(addSocialRow);
  (data.work || []).forEach(addWorkRow);
  (data.education || []).forEach(addEducationRow);
  (data.certifications || []).forEach(addCertRow);

  // Contact (handle legacy string fields gracefully).
  const emails = data.emails || (data.email ? [data.email] : []);
  emails.forEach(addEmailRow);

  const phone = typeof data.phone === 'object' ? data.phone : { code: '+63', number: data.phone || '' };
  document.getElementById('phone-code').value = phone.code || '+63';
  document.getElementById('phone-number').value = phone.number || '';

  const wa = typeof data.whatsapp === 'object' ? data.whatsapp : { code: '+63', number: data.whatsapp || '' };
  document.getElementById('whatsapp-code').value = wa.code || '+63';
  document.getElementById('whatsapp-number').value = wa.number || '';

  document.getElementById('telegram').value = data.telegram || '';
}

/* ───────────────────────── public card render ───────────────────────── */

function linkRow(href, iconBg, iconSvg, primary, secondary, isLink = true) {
  const tag = isLink ? 'a' : 'span';
  const attrs = isLink ? `href="${esc(href)}" target="_blank" rel="noopener"` : '';
  return `<${tag} class="link-item" ${attrs}>
    <span class="link-icon" style="background:${iconBg}">${iconSvg}</span>
    <span class="link-text"><span class="primary">${esc(primary)}</span><span class="secondary">${esc(secondary)}</span></span>
    ${isLink ? '<span class="link-arrow">&#8250;</span>' : ''}
  </${tag}>`;
}

export function renderCard(data) {
  // Avatar
  const av = document.getElementById('avatar');
  if (data.avatar) {
    av.innerHTML = `<img src="${esc(data.avatar)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
  } else {
    av.textContent = getInitials(data.name);
  }

  document.getElementById('card-name').textContent = data.name || '';
  const titleText = data.title
    ? (data.company ? `${data.title} at ${data.company}` : data.title)
    : (data.company || '');
  document.getElementById('card-title').textContent = titleText;
  document.getElementById('card-bio').textContent = data.bio || '';
  document.getElementById('location-text').textContent = data.location || '';
  document.title = data.name || 'Card';
  if (!data.location) document.getElementById('card-location').classList.add('hidden');

  // Websites
  const websites = data.websites || [];
  const webEl = document.getElementById('websites-list');
  if (!websites.length) document.getElementById('websites-section').classList.add('hidden');
  else webEl.innerHTML = websites.map(u =>
    linkRow(normalizeUrl(u), '#f5f5f7', WEBSITE_ICON, hostname(u), 'Visit website')).join('');

  // Socials
  const socials = data.socials || [];
  const socEl = document.getElementById('socials-list');
  if (!socials.length) document.getElementById('socials-section').classList.add('hidden');
  else socEl.innerHTML = socials.map(s => {
    const def = SOCIAL_PLATFORMS[s.platform];
    if (!def) return '';
    const url = def.url(s.handle);
    const handle = clean(s.handle);
    return linkRow(url || '#', def.bg, def.svg, def.label, '@' + handle, !!url);
  }).join('');

  // Work
  const work = data.work || [];
  const workEl = document.getElementById('work-list');
  if (!work.length) document.getElementById('work-section').classList.add('hidden');
  else workEl.innerHTML = work.map(w => {
    const def = WORK_TYPES[w.type] || WORK_TYPES.other;
    const label = (w.type === 'other' && w.label) ? w.label : def.label;
    return linkRow(def.url(w.value), def.bg, def.svg, label, hostname(def.url(w.value)));
  }).join('');

  // Credentials (education + certifications)
  const education = data.education || [];
  const certs = data.certifications || [];
  const eduEl = document.getElementById('education-list');
  const certEl = document.getElementById('certs-list');
  if (!education.length && !certs.length) {
    document.getElementById('credentials-section').classList.add('hidden');
  } else {
    if (!education.length) eduEl.classList.add('hidden');
    else eduEl.innerHTML = education.map(e =>
      linkRow('#', '#f5f5f7', EDU_ICON, e.school, [e.level, e.year].filter(Boolean).join(' · '), false)).join('');

    if (!certs.length) { certEl.classList.add('hidden'); document.getElementById('certs-label').classList.add('hidden'); }
    else certEl.innerHTML = certs.map(c => {
      const sub = [c.type, c.issuer, c.year].filter(Boolean).join(' · ');
      if (c.image) {
        return `<a class="link-item" href="${esc(c.image)}" target="_blank" rel="noopener">
          <span class="link-icon" style="background:#f5f5f7">${CERT_ICON}</span>
          <span class="link-text"><span class="primary">${esc(c.title)}</span><span class="secondary">${esc(sub)}</span></span>
          <img src="${esc(c.image)}" class="cert-thumb" />
        </a>`;
      }
      return linkRow('#', '#f5f5f7', CERT_ICON, c.title, sub, false);
    }).join('');
  }

  // Contact
  const contacts = [];
  const emails = data.emails || (data.email ? [data.email] : []);
  emails.forEach(e => contacts.push({ href: `mailto:${e}`, icon: CONTACT_ICONS.email, label: 'Email' }));

  const phone = typeof data.phone === 'object' ? data.phone : (data.phone ? { code: '', number: data.phone } : null);
  if (phone && phone.number) contacts.push({ href: `tel:${(phone.code || '') + phone.number}`, icon: CONTACT_ICONS.phone, label: 'Call' });

  const wa = typeof data.whatsapp === 'object' ? data.whatsapp : (data.whatsapp ? { code: '', number: data.whatsapp } : null);
  if (wa && wa.number) contacts.push({ href: `https://wa.me/${((wa.code || '') + wa.number).replace(/[^0-9]/g, '')}`, icon: CONTACT_ICONS.whatsapp, label: 'WhatsApp' });

  if (data.telegram) contacts.push({ href: `https://t.me/${clean(data.telegram)}`, icon: CONTACT_ICONS.telegram, label: 'Telegram' });

  const contactEl = document.getElementById('contact-row');
  if (!contacts.length) document.getElementById('contact-section').classList.add('hidden');
  else contactEl.innerHTML = contacts.map(c =>
    `<a class="contact-btn" href="${esc(c.href)}" target="_blank" rel="noopener">
      <span class="btn-icon">${c.icon}</span><span class="btn-label">${esc(c.label)}</span></a>`).join('');
}
