// ============================================
// MAPPD - Globe Renderer with real country outlines
// ============================================

// ---- TopoJSON decode (shared, computed once) ----
function decodeWorld(topo) {
  const arcs = topo.arcs;
  const tr = topo.transform;
  const sx = tr ? tr.scale[0] : 1, sy = tr ? tr.scale[1] : 1;
  const tx = tr ? tr.translate[0] : 0, ty = tr ? tr.translate[1] : 0;

  const decodedArcs = arcs.map(arc => {
    let x = 0, y = 0;
    const pts = [];
    for (let k = 0; k < arc.length; k++) {
      x += arc[k][0];
      y += arc[k][1];
      pts.push([x * sx + tx, y * sy + ty]);
    }
    return pts;
  });

  function ringFromArcIndices(indices) {
    const ring = [];
    for (const idx of indices) {
      let pts = idx < 0 ? decodedArcs[~idx].slice().reverse() : decodedArcs[idx];
      if (ring.length) pts = pts.slice(1);
      for (const p of pts) ring.push(p);
    }
    return ring;
  }

  return topo.objects.countries.geometries.map(geom => {
    const rings = [];
    if (geom.type === 'Polygon') {
      geom.arcs.forEach(r => rings.push(ringFromArcIndices(r)));
    } else if (geom.type === 'MultiPolygon') {
      geom.arcs.forEach(poly => poly.forEach(r => rings.push(ringFromArcIndices(r))));
    }
    // representative point = centroid of the LARGEST ring (most vertices)
    let main = rings[0] || [];
    rings.forEach(r => { if (r.length > main.length) main = r; });
    let cx = 0, cy = 0;
    main.forEach(p => { cx += p[0]; cy += p[1]; });
    const n = main.length || 1;
    const name = geom.properties && geom.properties.name;
    return {
      name,
      code: codeFromName(name),
      rings,
      centroid: [cx / n, cy / n]
    };
  });
}

let WORLD_FEATURES = null;
function getWorldFeatures() {
  if (!WORLD_FEATURES && typeof WORLD_TOPO !== 'undefined') {
    WORLD_FEATURES = decodeWorld(WORLD_TOPO);
  }
  return WORLD_FEATURES || [];
}

// ============================================
class Globe {
  constructor(canvasId, cloudCanvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.cloudCanvas = cloudCanvasId ? document.getElementById(cloudCanvasId) : null;
    this.cloudCtx = this.cloudCanvas ? this.cloudCanvas.getContext('2d') : null;

    this.rotX = 0.25;
    this.rotY = -0.4;
    this.targetRotX = this.rotX;
    this.targetRotY = this.rotY;
    this.autoRotate = true;
    this.autoRotateSpeed = 0.0006;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.mousePos = { x: -9999, y: -9999 };
    this.radius = 0;
    this.baseRadius = 0;
    this.zoom = 1;
    this.targetZoom = 1;
    this.minZoom = 0.7;
    this.maxZoom = 3;
    this.centerX = 0;
    this.centerY = 0;

    this.visitedCountries = new Set();
    this.hoveredCode = null;
    this.hoverProgress = {};
    this.onCountryClick = options.onCountryClick || null;
    this.onCountryHover = options.onCountryHover || null;
    this.interactive = options.interactive !== false;

    this.features = getWorldFeatures();

    this.clouds = [];
    this.numClouds = 70;
    this.stars = [];
    this.numStars = 110;

    this._hoverDirty = false;
    this.animFrame = null;

    this.init();
  }

  init() {
    this.resize();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

    if (this.interactive) {
      this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
      window.addEventListener('mousemove', this._mm = (e) => this.onMouseMove(e));
      window.addEventListener('mouseup', this._mu = () => this.onMouseUp());
      this.canvas.addEventListener('click', (e) => this.onClick(e));
      this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
      window.addEventListener('touchmove', this._tm = (e) => this.onTouchMove(e), { passive: false });
      window.addEventListener('touchend', this._te = () => this.onMouseUp());
      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12);
      }, { passive: false });
    }

    this.generateStars();
    this.generateClouds();
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    if (this.cloudCanvas) {
      this.cloudCanvas.width = w;
      this.cloudCanvas.height = h;
      this.cloudCanvas.style.width = w + 'px';
      this.cloudCanvas.style.height = h + 'px';
    }

    this.centerX = w / 2;
    this.centerY = h / 2;
    this.baseRadius = Math.min(w, h) * 0.38;
    this.radius = this.baseRadius * this.zoom;
  }

  zoomBy(factor) {
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * factor));
  }

  setZoom(z) {
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, z));
  }

  generateStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.2 + 0.3,
        brightness: Math.random() * 0.35 + 0.1,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  generateClouds() {
    this.clouds = [];
    for (let i = 0; i < this.numClouds; i++) {
      const lat = (Math.random() - 0.5) * 150;
      const lng = Math.random() * 360 - 180;
      this.clouds.push({
        lat, baseLng: lng,
        size: Math.random() * 22 + 10,
        opacity: Math.random() * 0.18 + 0.05,
        speed: (Math.random() * 0.4 + 0.15) * (Math.random() > 0.5 ? 1 : -1),
        repelX: 0, repelY: 0
      });
    }
  }

  // Project lat/lng (degrees) onto the rotating sphere
  project(latDeg, lngDeg) {
    const lat = latDeg * Math.PI / 180;
    const lng = lngDeg * Math.PI / 180;
    let x = Math.cos(lat) * Math.sin(lng);
    let y = -Math.sin(lat);
    let z = Math.cos(lat) * Math.cos(lng);

    const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
    let ty = y * cosX - z * sinX;
    let tz = y * sinX + z * cosX;
    y = ty; z = tz;

    const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);
    let tx = x * cosY + z * sinY;
    tz = -x * sinY + z * cosY;
    x = tx; z = tz;

    return {
      x: this.centerX + x * this.radius,
      y: this.centerY + y * this.radius,
      z, ux: x, uy: y
    };
  }

  // Build a screen ring; invisible points clamped to the limb (for fills)
  projectRing(ring) {
    const out = [];
    for (const c of ring) {
      const p = this.project(c[1], c[0]);
      if (p.z >= 0) {
        out.push({ x: p.x, y: p.y, z: p.z, vis: true });
      } else {
        const len = Math.sqrt(p.ux * p.ux + p.uy * p.uy) || 1;
        out.push({
          x: this.centerX + (p.ux / len) * this.radius,
          y: this.centerY + (p.uy / len) * this.radius,
          z: p.z, vis: false
        });
      }
    }
    return out;
  }

  // Build the visible front-cap polygon for a ring: keep front-facing points,
  // drop the ones behind the horizon, and insert the exact horizon-crossing
  // points on the limb. This avoids the "wedge across the globe" artifact that
  // clamping every hidden vertex to the rim produces.
  frontRing(ring) {
    const pts = ring.map(c => this.project(c[1], c[0]));
    const out = [];
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const A = pts[i], B = pts[(i + 1) % n];
      if (A.z >= 0) out.push({ x: A.x, y: A.y });
      if ((A.z >= 0) !== (B.z >= 0)) {
        // edge crosses the horizon (z = 0): interpolate and project to the limb
        const t = A.z / (A.z - B.z);
        let rx = A.ux + t * (B.ux - A.ux);
        let ry = A.uy + t * (B.uy - A.uy);
        const len = Math.sqrt(rx * rx + ry * ry) || 1;
        out.push({ x: this.centerX + (rx / len) * this.radius, y: this.centerY + (ry / len) * this.radius });
      }
    }
    return out;
  }

  // ---- interaction ----
  onMouseDown(e) {
    this.isDragging = true;
    this.autoRotate = false;
    this.lastMouse = { x: e.clientX, y: e.clientY };
    this.dragStartTime = Date.now();
    this.dragStartPos = { x: e.clientX, y: e.clientY };
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (this.isDragging) {
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.targetRotY += dx * 0.005;
      this.targetRotX += dy * 0.005;
      this.targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotX));
      this.lastMouse = { x: e.clientX, y: e.clientY };
    } else {
      this._hoverDirty = true;
    }
  }

  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      setTimeout(() => { this.autoRotate = true; }, 4000);
    }
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      const t = e.touches[0];
      this.isDragging = true;
      this.autoRotate = false;
      this.lastMouse = { x: t.clientX, y: t.clientY };
      this.dragStartTime = Date.now();
      this.dragStartPos = { x: t.clientX, y: t.clientY };
    }
  }

  onTouchMove(e) {
    if (this.isDragging && e.touches.length === 1) {
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - this.lastMouse.x;
      const dy = t.clientY - this.lastMouse.y;
      this.targetRotY += dx * 0.005;
      this.targetRotX += dy * 0.005;
      this.targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotX));
      this.lastMouse = { x: t.clientX, y: t.clientY };
    }
  }

  onClick(e) {
    if (!this.dragStartPos) return;
    const dx = e.clientX - this.dragStartPos.x;
    const dy = e.clientY - this.dragStartPos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 5 && Date.now() - this.dragStartTime < 300) {
      const f = this.findFeatureAt(this.mousePos.x, this.mousePos.y);
      if (f && f.code && this.onCountryClick) this.onCountryClick(f.code);
    }
  }

  pointInRing(px, py, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
      if (((yi > py) !== (yj > py)) &&
          (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  findFeatureAt(px, py) {
    // quick reject: outside disk
    const dx = px - this.centerX, dy = py - this.centerY;
    if (dx * dx + dy * dy > this.radius * this.radius) return null;

    let best = null, bestZ = -2;
    for (const f of this.features) {
      // only consider countries whose representative point faces the viewer
      const c = this.project(f.centroid[1], f.centroid[0]);
      if (c.z < 0.02) continue;
      let inside = false;
      for (const ring of f.rings) {
        const pts = this.frontRing(ring);
        if (pts.length >= 3 && this.pointInRing(px, py, pts)) inside = !inside;
      }
      if (inside && c.z > bestZ) { best = f; bestZ = c.z; }
    }
    return best;
  }

  setVisited(codes) {
    this.visitedCountries = new Set(codes);
  }

  focusOnCountry(code) {
    const f = this.features.find(ft => ft.code === code);
    if (!f) return;
    this.targetRotX = f.centroid[1] * Math.PI / 180;
    this.targetRotY = -f.centroid[0] * Math.PI / 180;
    this.autoRotate = false;
    setTimeout(() => { this.autoRotate = true; }, 5000);
  }

  animate() {
    this.update();
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.animate());
  }

  update() {
    if (this.autoRotate) this.targetRotY += this.autoRotateSpeed;
    this.rotX += (this.targetRotX - this.rotX) * 0.07;
    this.rotY += (this.targetRotY - this.rotY) * 0.07;
    if (Math.abs(this.targetZoom - this.zoom) > 0.001) {
      this.zoom += (this.targetZoom - this.zoom) * 0.15;
      this.radius = this.baseRadius * this.zoom;
    }

    // hover detection (throttled to one per frame)
    if (this._hoverDirty && this.interactive) {
      this._hoverDirty = false;
      const f = this.findFeatureAt(this.mousePos.x, this.mousePos.y);
      const code = f && f.code ? f.code : null;
      if (code !== this.hoveredCode) {
        this.hoveredCode = code;
        if (this.onCountryHover) {
          if (f && f.code) {
            this.onCountryHover(f.code, f.name, this.mousePos.x, this.mousePos.y);
          } else {
            this.onCountryHover(null);
          }
        }
      }
    }

    // hover animation
    const codes = new Set([...Object.keys(this.hoverProgress), this.hoveredCode].filter(Boolean));
    codes.forEach(code => {
      const target = code === this.hoveredCode ? 1 : 0;
      const cur = this.hoverProgress[code] || 0;
      const next = cur + (target - cur) * 0.18;
      if (next < 0.01 && target === 0) delete this.hoverProgress[code];
      else this.hoverProgress[code] = next;
    });

    // clouds drift
    const now = Date.now() / 1000;
    this.clouds.forEach(cloud => {
      cloud.lng = cloud.baseLng + now * cloud.speed * 6;
      const p = this.project(cloud.lat, cloud.lng);
      if (p.z > 0) {
        const ddx = this.mousePos.x - p.x;
        const ddy = this.mousePos.y - p.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < 110) {
          const force = (110 - dist) / 110;
          const ang = Math.atan2(ddy, ddx);
          cloud.repelX += -Math.cos(ang) * force * 3.2;
          cloud.repelY += -Math.sin(ang) * force * 3.2;
        }
      }
      cloud.repelX *= 0.9;
      cloud.repelY *= 0.9;
    });
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // stars
    const now = Date.now();
    this.stars.forEach(s => {
      const tw = Math.sin(now * s.twinkleSpeed + s.twinkleOffset) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255,240,230,${s.brightness * tw})`;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // ocean sphere
    const grad = ctx.createRadialGradient(
      this.centerX - this.radius * 0.3, this.centerY - this.radius * 0.3, this.radius * 0.1,
      this.centerX, this.centerY, this.radius
    );
    grad.addColorStop(0, '#103438');
    grad.addColorStop(0.55, '#0c272b');
    grad.addColorStop(1, '#08191c');
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // soft atmosphere
    const atmo = ctx.createRadialGradient(
      this.centerX, this.centerY, this.radius * 0.96,
      this.centerX, this.centerY, this.radius * 1.18
    );
    atmo.addColorStop(0, 'rgba(57,215,219,0.10)');
    atmo.addColorStop(1, 'rgba(57,215,219,0)');
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius * 1.18, 0, Math.PI * 2);
    ctx.fillStyle = atmo;
    ctx.fill();

    // clip to sphere for land
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.clip();

    this.drawGraticule(ctx);
    this.drawCountries(ctx);

    ctx.restore();

    this.drawClouds();
  }

  drawGraticule(ctx) {
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 0.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let started = false;
      for (let lng = -180; lng <= 180; lng += 6) {
        const p = this.project(lat, lng);
        if (p.z < 0) { started = false; continue; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    for (let lng = -180; lng < 180; lng += 30) {
      ctx.beginPath();
      let started = false;
      for (let lat = -90; lat <= 90; lat += 6) {
        const p = this.project(lat, lng);
        if (p.z < 0) { started = false; continue; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }

  drawCountries(ctx) {
    for (const f of this.features) {
      const visited = f.code && this.visitedCountries.has(f.code);
      const hov = f.code ? (this.hoverProgress[f.code] || 0) : 0;

      // Build outline paths (vis-flagged)
      const screenRings = f.rings.map(r => this.projectRing(r));

      // Fill (visited or hovered) — only when the country faces the viewer,
      // using horizon-clipped front rings to avoid wedge artifacts.
      if (visited || hov > 0.01) {
        const rep = this.project(f.centroid[1], f.centroid[0]);
        if (rep.z > 0.05) {
          ctx.beginPath();
          f.rings.forEach(r => {
            const pts = this.frontRing(r);
            if (pts.length < 3) return;
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
          });
          if (visited) {
            ctx.fillStyle = `rgba(220,121,58,${0.78 + hov * 0.18})`;
          } else {
            ctx.fillStyle = `rgba(57,215,219,${0.10 + hov * 0.22})`;
          }
          ctx.fill('evenodd');
        }
      }

      // Outline (only visible segments)
      ctx.beginPath();
      screenRings.forEach(pts => {
        let started = false;
        for (let i = 0; i < pts.length; i++) {
          if (pts[i].vis) {
            if (!started) { ctx.moveTo(pts[i].x, pts[i].y); started = true; }
            else ctx.lineTo(pts[i].x, pts[i].y);
          } else {
            started = false;
          }
        }
      });
      if (visited) {
        ctx.strokeStyle = `rgba(255,154,92,${0.85 + hov * 0.15})`;
        ctx.lineWidth = 1.1;
      } else if (hov > 0.01) {
        ctx.strokeStyle = `rgba(57,215,219,${0.4 + hov * 0.5})`;
        ctx.lineWidth = 1.0;
      } else {
        ctx.strokeStyle = 'rgba(255,210,180,0.22)';
        ctx.lineWidth = 0.6;
      }
      ctx.stroke();
    }
  }

  drawClouds() {
    if (!this.cloudCtx) return;
    const ctx = this.cloudCtx;
    const w = this.cloudCanvas.width, h = this.cloudCanvas.height;
    ctx.clearRect(0, 0, w, h);

    this.clouds.forEach(cloud => {
      const p = this.project(cloud.lat, cloud.lng);
      if (p.z < 0) return;
      const depth = 0.3 + (p.z) * 0.7;
      const x = p.x + cloud.repelX;
      const y = p.y + cloud.repelY;
      const size = cloud.size * depth;
      const op = cloud.opacity * depth;
      const g = ctx.createRadialGradient(x, y, 0, x, y, size);
      g.addColorStop(0, `rgba(255,255,255,${op})`);
      g.addColorStop(0.45, `rgba(255,255,255,${op * 0.45})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this._onResize);
    if (this._mm) window.removeEventListener('mousemove', this._mm);
    if (this._mu) window.removeEventListener('mouseup', this._mu);
    if (this._tm) window.removeEventListener('touchmove', this._tm);
    if (this._te) window.removeEventListener('touchend', this._te);
  }
}
