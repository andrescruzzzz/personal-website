// ============================================
// MAPPD - Still regional map with REAL ADM1 boundaries + relief
// ============================================

class RegionMap {
  constructor(canvas, code, regions, visitedRegionIds, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.code = code;
    this.regions = regions || [];        // [{id,name,tier,rings:[[ [lng,lat],...] ]}]
    this.visited = new Set(visitedRegionIds || []);
    this.onToggle = opts.onToggle || null;
    this.onHover = opts.onHover || null;
    this.hoverRegion = -1;

    // view transform
    this.zoom = 1; this.minZoom = 1; this.maxZoom = 7;
    this.panX = 0; this.panY = 0;
    this.isPanning = false; this.dragMoved = false;

    this.build();

    this._down = (e) => this.onDown(e);
    this._move = (e) => this.onMove(e);
    this._up = (e) => this.onUp(e);
    this._leave = () => { this.isPanning = false; this.setHover(-1); };
    this._wheel = (e) => this.onWheel(e);
    canvas.addEventListener('mousedown', this._down);
    canvas.addEventListener('mousemove', this._move);
    window.addEventListener('mouseup', this._up);
    canvas.addEventListener('mouseleave', this._leave);
    canvas.addEventListener('wheel', this._wheel, { passive: false });
  }

  // ---- view helpers ----
  toScreen(p) { return [p[0] * this.zoom + this.panX, p[1] * this.zoom + this.panY]; }
  clampPan() {
    const minX = this.W * (1 - this.zoom), minY = this.H * (1 - this.zoom);
    this.panX = Math.min(0, Math.max(minX, this.panX));
    this.panY = Math.min(0, Math.max(minY, this.panY));
    if (this.zoom <= 1) { this.panX = 0; this.panY = 0; }
  }
  zoomAt(factor, cx, cy) {
    const nz = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor));
    if (nz === this.zoom) return;
    this.panX = cx - (cx - this.panX) * (nz / this.zoom);
    this.panY = cy - (cy - this.panY) * (nz / this.zoom);
    this.zoom = nz; this.clampPan();
  }
  zoomButton(factor) { this.zoomAt(factor, this.W / 2, this.H / 2); }

  // ---- noise / relief ----
  noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const h = (a, b) => {
      let n = a * 374761393 + b * 668265263;
      n = (n ^ (n >> 13)) * 1274126177;
      return ((n ^ (n >> 16)) >>> 0) / 4294967295;
    };
    const sm = t => t * t * (3 - 2 * t);
    const u = sm(xf), v = sm(yf);
    const n00 = h(xi, yi), n10 = h(xi + 1, yi);
    const n01 = h(xi, yi + 1), n11 = h(xi + 1, yi + 1);
    return (n00 * (1 - u) + n10 * u) * (1 - v) + (n01 * (1 - u) + n11 * u) * v;
  }
  fbm(x, y) {
    let v = 0, amp = 0.5, f = 1;
    for (let i = 0; i < 3; i++) { v += amp * this.noise(x * f, y * f); f *= 2; amp *= 0.5; }
    return v / 0.875;
  }

  build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = this.canvas.clientWidth || 600;
    const cssH = this.canvas.clientHeight || 420;
    this.W = Math.round(cssW); this.H = Math.round(cssH);
    this.dpr = dpr;
    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const hasGeo = this.regions.some(r => r.rings && r.rings.length);
    if (!hasGeo) { this.regionScreens = []; this.startLoop(); return; }

    // bbox over all region rings, with antimeridian handling
    let lo = 1e9, hi = -1e9;
    this.regions.forEach(r => r.rings.forEach(ring => ring.forEach(p => {
      lo = Math.min(lo, p[0]); hi = Math.max(hi, p[0]);
    })));
    const wrap = (hi - lo) > 180;
    const adjLng = wrap ? (l => l < 0 ? l + 360 : l) : (l => l);

    let minLng = 1e9, maxLng = -1e9, minLat = 1e9, maxLat = -1e9;
    this.regions.forEach(r => r.rings.forEach(ring => ring.forEach(p => {
      const L = adjLng(p[0]);
      if (L < minLng) minLng = L; if (L > maxLng) maxLng = L;
      if (p[1] < minLat) minLat = p[1]; if (p[1] > maxLat) maxLat = p[1];
    })));

    const pad = 24;
    const bw = (maxLng - minLng) || 1, bh = (maxLat - minLat) || 1;
    const latMid = (minLat + maxLat) / 2;
    const aspect = Math.cos(latMid * Math.PI / 180);
    const scale = Math.min((this.W - pad * 2) / (bw * aspect), (this.H - pad * 2) / bh);
    const drawW = bw * aspect * scale, drawH = bh * scale;
    const offX = (this.W - drawW) / 2, offY = (this.H - drawH) / 2;
    this.project = (lng, lat) => [
      offX + (adjLng(lng) - minLng) * aspect * scale,
      offY + (maxLat - lat) * scale
    ];

    // screen-space rings per region + centroid (largest ring) for labels
    this.regionScreens = this.regions.map(r => r.rings.map(ring => ring.map(p => this.project(p[0], p[1]))));
    this.centroids = this.regionScreens.map(rings => {
      let main = rings[0] || [], best = -1;
      rings.forEach(ring => { const a = this.ringArea(ring); if (a > best) { best = a; main = ring; } });
      let cx = 0, cy = 0;
      main.forEach(p => { cx += p[0]; cy += p[1]; });
      const n = main.length || 1;
      return [cx / n, cy / n];
    });

    // ---- rasterize region index via colored picking pass ----
    const idxCanvas = document.createElement('canvas');
    idxCanvas.width = this.W; idxCanvas.height = this.H;
    const ictx = idxCanvas.getContext('2d');
    ictx.imageSmoothingEnabled = false;
    this.regionScreens.forEach((rings, ri) => {
      ictx.fillStyle = 'rgb(' + (ri + 1) + ',0,0)';
      ictx.beginPath();
      rings.forEach(ring => {
        ring.forEach((p, i) => i ? ictx.lineTo(p[0], p[1]) : ictx.moveTo(p[0], p[1]));
        ictx.closePath();
      });
      ictx.fill();
    });
    const idxData = ictx.getImageData(0, 0, this.W, this.H).data;

    const N = this.W * this.H;
    this.regionIdx = new Int16Array(N).fill(-1);
    this.relief = new Float32Array(N);
    this.regionPixels = this.regions.map(() => []);
    const nf = 0.035;
    for (let i = 0; i < N; i++) {
      const r = idxData[i * 4];
      const a = idxData[i * 4 + 3];
      if (a < 128 || r === 0) continue;
      const ri = Math.min(this.regions.length - 1, r - 1);
      this.regionIdx[i] = ri;
      this.regionPixels[ri].push(i);
      const x = i % this.W, y = (i / this.W) | 0;
      this.relief[i] = this.fbm(x * nf, y * nf);
    }

    this.baseImage = this.ctx.createImageData(this.W, this.H);
    this.composite = document.createElement('canvas');
    this.composite.width = this.W; this.composite.height = this.H;
    this.compositeCtx = this.composite.getContext('2d');

    this.placeCities();
    this.renderBase();
    this.compose();
    this.startLoop();
  }

  ringArea(r) {
    let a = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] * r[i][1]) - (r[i][0] * r[j][1]);
    return Math.abs(a / 2);
  }

  placeCities() {
    const cities = (typeof getMajorCities === 'function') ? getMajorCities(this.code) : [];
    this.cities = [];
    cities.forEach((c, i) => {
      const p = this.project(c.lng, c.lat);
      if (p[0] < 2 || p[0] > this.W - 2 || p[1] < 2 || p[1] > this.H - 2) return;
      this.cities.push({ name: c.name, capital: !!c.capital, x: p[0], y: p[1], phase: i * 1.7, speed: 1.0 + (i % 3) * 0.18 });
    });
  }

  regionColor(ri, state) {
    const visited = this.visited.has(this.regions[ri].id);
    if (state === 'hover') return [57, 215, 219];
    if (visited) return [220, 121, 58];
    return [70, 78, 80];
  }

  writePixel(img, idx, ri, state) {
    const base = this.regionColor(ri, state);
    const r = this.relief[idx];
    const N = this.W * this.H;
    const x = idx % this.W, y = (idx / this.W) | 0;
    const rE = (idx + 1 < N) ? this.relief[idx + 1] : r;
    const rS = (idx + this.W < N) ? this.relief[idx + this.W] : r;

    let shade = 0.42 + r * 0.95;
    const slope = (rE - r) + (rS - r);
    let hill = 1 - slope * 14;
    if (hill < 0.55) hill = 0.55; if (hill > 1.5) hill = 1.5;
    shade *= hill;

    const levels = 7;
    const band = Math.floor(r * levels);
    const contour = (Math.floor(rE * levels) !== band || Math.floor(rS * levels) !== band);

    let border = false;
    if (x + 1 < this.W && this.regionIdx[idx + 1] !== ri && this.regionIdx[idx + 1] !== -1) border = true;
    if (y + 1 < this.H && this.regionIdx[idx + this.W] !== ri && this.regionIdx[idx + this.W] !== -1) border = true;

    let cr = base[0] * shade, cg = base[1] * shade, cb = base[2] * shade;
    if (r > 0.78) { const t = (r - 0.78) / 0.22; cr += t * 70; cg += t * 70; cb += t * 60; }
    if (contour) { cr *= 0.7; cg *= 0.7; cb *= 0.72; }
    if (border) { cr = 12; cg = 10; cb = 9; }
    const o = idx * 4;
    img.data[o] = Math.max(0, Math.min(255, cr));
    img.data[o + 1] = Math.max(0, Math.min(255, cg));
    img.data[o + 2] = Math.max(0, Math.min(255, cb));
    img.data[o + 3] = 255;
  }

  renderBase() {
    for (let ri = 0; ri < this.regions.length; ri++)
      for (const idx of this.regionPixels[ri]) this.writePixel(this.baseImage, idx, ri, 'base');
  }
  compose() {
    if (!this.composite) return;
    let img = this.baseImage;
    if (this.hoverRegion >= 0) {
      img = this.ctx.createImageData(this.W, this.H);
      img.data.set(this.baseImage.data);
      for (const idx of this.regionPixels[this.hoverRegion]) this.writePixel(img, idx, this.hoverRegion, 'hover');
    }
    this.compositeCtx.putImageData(img, 0, 0);
  }
  refresh() { this.renderBase(); this.compose(); }

  startLoop() {
    const loop = () => { this.renderFrame(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }

  renderFrame() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.regionScreens || !this.regionScreens.length) { ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); return; }

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.zoom, this.zoom);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.composite, 0, 0, this.W, this.H);
    ctx.restore();

    // accurate region borders
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,210,180,0.30)';
    ctx.lineWidth = 0.8;
    this.regionScreens.forEach(rings => {
      ctx.beginPath();
      rings.forEach(ring => {
        ring.forEach((p, i) => { const t = this.toScreen(p); i ? ctx.lineTo(t[0], t[1]) : ctx.moveTo(t[0], t[1]); });
        ctx.closePath();
      });
      ctx.stroke();
    });

    // region labels (visited / hovered only)
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    this.centroids.forEach((c, ri) => {
      const visited = this.visited.has(this.regions[ri].id);
      const isHover = ri === this.hoverRegion;
      if (!visited && !isHover) return;
      const ts = this.toScreen(c);
      const label = this.regions[ri].name;
      const tw = ctx.measureText(label).width + 12;
      ctx.fillStyle = 'rgba(12,10,8,0.8)';
      this.roundRect(ctx, ts[0] - tw / 2, ts[1] - 8, tw, 16, 5); ctx.fill();
      ctx.fillStyle = visited ? '#FF9A5C' : '#39D7DB';
      ctx.fillText(label, ts[0], ts[1] + 3.5);
    });

    this.drawCities(ctx);
  }

  drawCities(ctx) {
    if (!this.cities || !this.cities.length) return;
    const t = performance.now() / 1000;
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    this.cities.forEach(c => {
      const ts = this.toScreen([c.x, c.y]);
      const floatY = Math.sin(t * c.speed + c.phase) * 3.2;
      const bob = (Math.sin(t * c.speed + c.phase) + 1) * 0.5;
      const cx = ts[0], cy = ts[1] + floatY;

      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12 + bob * 4);
      halo.addColorStop(0, 'rgba(255,154,92,' + (0.32 + bob * 0.18) + ')');
      halo.addColorStop(1, 'rgba(255,154,92,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, 12 + bob * 4, 0, Math.PI * 2); ctx.fill();

      const rad = c.capital ? 4.2 : 3.2;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = '#FF9A5C'; ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.stroke();
      if (c.capital) { ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); }

      const tw = ctx.measureText(c.name).width + 12;
      const ly = cy - 12;
      ctx.fillStyle = 'rgba(12,10,8,0.82)';
      this.roundRect(ctx, cx - tw / 2, ly - 9, tw, 16, 5); ctx.fill();
      ctx.fillStyle = '#ffe9d8'; ctx.fillText(c.name, cx, ly + 2.5);
    });
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---- interaction ----
  regionAt(sx, sy) {
    const mx = (sx - this.panX) / this.zoom;
    const my = (sy - this.panY) / this.zoom;
    if (mx < 0 || my < 0 || mx >= this.W || my >= this.H) return -1;
    return this.regionIdx ? this.regionIdx[(my | 0) * this.W + (mx | 0)] : -1;
  }
  localCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }
  onWheel(e) {
    e.preventDefault();
    const [x, y] = this.localCoords(e);
    this.zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, x, y);
  }
  onDown(e) {
    const [x, y] = this.localCoords(e);
    this.isPanning = true; this.dragMoved = false;
    this.lastX = x; this.lastY = y; this.downX = x; this.downY = y;
  }
  onMove(e) {
    const [x, y] = this.localCoords(e);
    if (this.isPanning && this.zoom > 1) {
      const dx = x - this.lastX, dy = y - this.lastY;
      if (Math.abs(x - this.downX) > 3 || Math.abs(y - this.downY) > 3) this.dragMoved = true;
      this.panX += dx; this.panY += dy; this.lastX = x; this.lastY = y;
      this.clampPan();
      this.canvas.style.cursor = 'grabbing';
    } else {
      this.setHover(this.regionAt(x, y));
      this.canvas.style.cursor = this.zoom > 1 ? 'grab' : (this.hoverRegion >= 0 ? 'pointer' : 'default');
    }
  }
  onUp(e) {
    if (!this.isPanning) return;
    this.isPanning = false;
    if (this.dragMoved) return;
    const [x, y] = this.localCoords(e);
    const ri = this.regionAt(x, y);
    if (ri < 0) return;
    const region = this.regions[ri];
    if (this.visited.has(region.id)) this.visited.delete(region.id);
    else this.visited.add(region.id);
    for (const idx of this.regionPixels[ri]) this.writePixel(this.baseImage, idx, ri, 'base');
    this.compose();
    if (this.onToggle) this.onToggle(region, this.visited.has(region.id), [...this.visited]);
  }
  setHover(ri) {
    if (ri === this.hoverRegion) return;
    this.hoverRegion = ri;
    this.compose();
    if (this.onHover) this.onHover(ri >= 0 ? this.regions[ri] : null);
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener('mousedown', this._down);
    this.canvas.removeEventListener('mousemove', this._move);
    window.removeEventListener('mouseup', this._up);
    this.canvas.removeEventListener('mouseleave', this._leave);
    this.canvas.removeEventListener('wheel', this._wheel);
  }
}
