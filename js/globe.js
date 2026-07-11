// ── Interactive 3D Globe ───────────────────────────────────────────────────────
// Geography: fetched from Natural Earth 1:110m via world-atlas CDN (topojson).
// Interaction: click + drag to rotate on both axes, with inertia + touch support.

// ── Fallback simplified continents (used if CDN unavailable) ──────────────────
const CONTINENTS_FALLBACK = [
  [[71,-141],[65,-168],[63,-162],[60,-147],[57,-153],[55,-163],[58,-136],
   [54,-130],[48,-124],[44,-124],[40,-124],[37,-122],[34,-120],[32,-117],
   [28,-110],[22,-106],[20,-105],[16,-90],[15,-92],[10,-83],[9,-79],[8,-77],
   [10,-75],[20,-74],[25,-80],[30,-81],[35,-75],[41,-70],[44,-66],[47,-53],
   [53,-56],[60,-64],[63,-65],[68,-65],[72,-65],[80,-65],[83,-72],[80,-90],
   [75,-100],[72,-105],[70,-120],[71,-141]],
  [[83,-36],[80,-18],[76,-18],[72,-22],[68,-24],[65,-38],[62,-42],[60,-45],
   [64,-52],[68,-52],[72,-55],[76,-65],[80,-65],[83,-42],[83,-36]],
  [[8,-77],[5,-77],[0,-78],[-3,-80],[-5,-80],[-8,-78],[-15,-75],[-18,-70],
   [-28,-71],[-33,-71],[-38,-73],[-42,-73],[-48,-75],[-52,-68],[-55,-68],
   [-48,-66],[-42,-63],[-38,-57],[-34,-53],[-28,-48],[-23,-43],[-16,-39],
   [-12,-37],[-8,-35],[-2,-41],[0,-50],[2,-50],[5,-52],[8,-60],[10,-62],
   [12,-72],[10,-75],[8,-77]],
  [[71,28],[70,22],[68,14],[65,14],[60,5],[58,5],[55,8],[51,2],[48,-2],
   [47,-2],[44,-2],[43,-9],[36,-9],[36,-5],[37,0],[40,3],[43,5],[44,8],
   [44,13],[40,15],[38,15],[37,15],[38,23],[40,27],[41,30],[43,28],[45,30],
   [47,24],[48,17],[54,18],[55,20],[56,21],[58,22],[60,25],[60,28],[64,26],
   [68,28],[71,28]],
  [[37,-5],[37,10],[37,12],[33,32],[30,33],[22,37],[14,43],[11,43],[11,51],
   [2,41],[0,41],[-5,40],[-10,40],[-15,37],[-20,35],[-25,33],[-30,30],
   [-34,26],[-35,20],[-30,16],[-25,14],[-20,12],[-15,11],[-10,15],[-5,10],
   [0,9],[5,2],[5,-3],[5,-8],[10,-17],[15,-17],[20,-17],[25,-15],[30,-10],
   [35,-6],[37,-5]],
  [[71,28],[70,40],[68,55],[65,65],[60,75],[55,73],[55,83],[60,90],[65,100],
   [68,110],[70,130],[72,140],[68,145],[62,150],[55,140],[48,135],[45,135],
   [40,130],[35,128],[30,122],[25,122],[20,110],[18,109],[10,104],[5,103],
   [1,104],[3,102],[6,100],[10,98],[15,98],[18,95],[22,92],[22,90],[20,87],
   [15,80],[10,77],[8,76],[12,74],[20,73],[23,68],[22,62],[22,58],[25,57],
   [23,55],[15,52],[12,44],[22,37],[30,33],[33,32],[37,37],[40,38],[40,40],
   [43,42],[43,50],[48,55],[48,60],[52,60],[56,60],[60,60],[65,65],[68,55],
   [70,40],[71,28]],
  [[-13,136],[-12,130],[-14,127],[-16,123],[-22,114],[-28,114],[-32,116],
   [-35,117],[-35,138],[-38,140],[-38,147],[-37,150],[-35,150],[-28,153],
   [-22,150],[-18,147],[-15,145],[-12,143],[-12,137],[-13,136]],
];

// ── Vendor locations ───────────────────────────────────────────────────────────
const VENDOR_LOCATIONS = [
  // US Northeast
  { name:'HubSpot',                            lat:42.4, lon:-71.1  },
  { name:'WeWork',                             lat:40.7, lon:-74.0  },
  { name:'Marriott Hotels',                    lat:38.9, lon:-77.1  },
  { name:'Staples',                            lat:42.0, lon:-71.5  },
  { name:'TechVault Innovations',              lat:41.8, lon:-72.7  },

  // US Southeast
  { name:'Delta Airlines',                     lat:33.6, lon:-84.4  },
  { name:'Mailchimp',                          lat:33.8, lon:-84.4  },
  { name:'Office Depot',                       lat:26.3, lon:-80.2  },

  // US Midwest / South
  { name:'FedEx',                              lat:35.1, lon:-90.1  },
  { name:'Best Buy Business',                  lat:44.9, lon:-93.4  },

  // US Mountain / Pacific NW
  { name:'Costco Business',                    lat:47.6, lon:-122.3 },
  { name:'Microsoft 365',                      lat:47.6, lon:-122.1 },
  { name:'Amazon Business',                    lat:47.6, lon:-122.3 },

  // US West / Northern Virginia (AWS HQ)
  { name:'AWS',                                lat:38.9, lon:-77.5  },

  // Bay Area — spread around the peninsula so dots don't all stack
  { name:'Salesforce',                         lat:37.79, lon:-122.40 },
  { name:'Slack',                              lat:37.78, lon:-122.42 },
  { name:'GitHub',                             lat:37.78, lon:-122.39 },
  { name:'Stripe',                             lat:37.77, lon:-122.43 },
  { name:'Figma',                              lat:37.76, lon:-122.41 },
  { name:'LinkedIn Premium',                   lat:37.37, lon:-122.03 },
  { name:'Zoom',                               lat:37.38, lon:-121.98 },
  { name:'Adobe Systems',                      lat:37.33, lon:-121.88 },
  { name:'Google Workspace',                   lat:37.42, lon:-122.08 },
  { name:'QuickBooks',                         lat:37.35, lon:-121.95 },

  // Southern California
  { name:'Pinnacle Marketing Solutions LLC',   lat:34.05, lon:-118.25 },

  // AWS global infrastructure regions (adds geographic spread)
  { name:'_aws_eu_ire',  lat:53.3,  lon:-6.3   }, // Ireland
  { name:'_aws_eu_fra',  lat:50.1,  lon: 8.7   }, // Frankfurt
  { name:'_aws_ap_tok',  lat:35.7,  lon:139.7  }, // Tokyo
  { name:'_aws_ap_sin',  lat: 1.4,  lon:103.8  }, // Singapore
  { name:'_aws_ap_syd',  lat:-33.9, lon:151.2  }, // Sydney
  { name:'_aws_sa_sao',  lat:-23.5, lon:-46.6  }, // São Paulo
];

// Arc pairs to animate
const ARC_PAIRS = [
  ['AWS',            '_aws_eu_ire'],
  ['AWS',            '_aws_ap_tok'],
  ['AWS',            '_aws_sa_sao'],
  ['Salesforce',     'WeWork'],
  ['FedEx',          'Delta Airlines'],
  ['_aws_eu_ire',    '_aws_eu_fra'],
  ['_aws_ap_tok',    '_aws_ap_sin'],
];

// ── Globe class ────────────────────────────────────────────────────────────────
class Globe {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Rotation (radians)
    this.lonRot  =  0.4;    // Y-axis (longitude)
    this.latRot  = -0.38;   // X-axis tilt (latitude)

    // Interaction state
    this.dragging = false;
    this.lastMX   = 0;
    this.lastMY   = 0;
    this.velLon   = 0.003;  // auto-spin speed
    this.velLat   = 0;
    this.spinning = true;   // true = auto-spin active

    // Visual
    this.pulseT = 0;
    this.raf    = null;

    // Data
    this.vendors        = VENDOR_LOCATIONS.map(v => ({...v}));
    this.anomalyVendors = new Set();
    this.geoRings       = null; // loaded async; null = loading, [] = fallback
    this.geoLoaded      = false;

    this.arcs = ARC_PAIRS
      .map(([a, b]) => ({
        a: VENDOR_LOCATIONS.find(v => v.name === a),
        b: VENDOR_LOCATIONS.find(v => v.name === b),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.003,
      }))
      .filter(p => p.a && p.b);

    this.resize();
    this._setupInteraction();
    this._loadGeo();
    window.addEventListener('resize', () => this.resize());
  }

  // ── Async geography loader ───────────────────────────────
  async _loadGeo() {
    try {
      const topo = await fetch(
        'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json'
      ).then(r => r.json());

      if (typeof topojson === 'undefined') throw new Error('topojson not loaded');

      const land  = topojson.feature(topo, topo.objects.land);
      const rings = [];

      const collect = (coords) => {
        for (const poly of coords) {
          for (const ring of poly) {
            rings.push(ring); // each ring: [[lon, lat], ...]
          }
        }
      };

      for (const feature of land.features) {
        const g = feature.geometry;
        if (g.type === 'Polygon')      collect([g.coordinates]);
        if (g.type === 'MultiPolygon') collect(g.coordinates);
      }

      this.geoRings  = rings;
      this.geoLoaded = true;
    } catch (e) {
      console.warn('Globe: using fallback geography —', e.message);
      this.geoRings  = [];   // signal: use CONTINENTS_FALLBACK
      this.geoLoaded = true;
    }
  }

  // ── Canvas resize ────────────────────────────────────────
  resize() {
    const p = this.canvas.parentElement;
    if (!p) return;
    this.canvas.width  = p.clientWidth  || 320;
    this.canvas.height = p.clientHeight || 300;
    this.cx = this.canvas.width  / 2;
    this.cy = this.canvas.height / 2;
    this.r  = Math.min(this.canvas.width, this.canvas.height) * 0.41;
  }

  // ── Math helpers ─────────────────────────────────────────

  // lat/lon (degrees) → unit sphere vector
  _ll(lat, lon) {
    const la = lat * Math.PI / 180;
    const lo = lon * Math.PI / 180;
    return {
      x: Math.cos(la) * Math.sin(lo),
      y: Math.sin(la),
      z: Math.cos(la) * Math.cos(lo),
    };
  }

  // Apply Y-axis (longitude) rotation then X-axis (latitude) tilt
  _rot(p) {
    const cy = Math.cos(this.lonRot), sy = Math.sin(this.lonRot);
    const x1 = p.x * cy - p.z * sy;
    const z1 = p.x * sy + p.z * cy;
    const cx = Math.cos(this.latRot), sx = Math.sin(this.latRot);
    return { x: x1, y: p.y * cx - z1 * sx, z: p.y * sx + z1 * cx };
  }

  // Project 3D point to canvas 2D coords (orthographic)
  _proj(p) {
    const t = this._rot(p);
    return { x: this.cx + t.x * this.r, y: this.cy - t.y * this.r, z: t.z };
  }

  // Great-circle interpolation (slerp) between two vendor locations
  _slerp(a, b, t) {
    const pa = this._ll(a.lat, a.lon);
    const pb = this._ll(b.lat, b.lon);
    const d  = Math.min(1, pa.x*pb.x + pa.y*pb.y + pa.z*pb.z);
    const om = Math.acos(d);
    if (Math.abs(om) < 0.0001) return pa;
    const s = Math.sin(om);
    return {
      x: (Math.sin((1-t)*om)/s)*pa.x + (Math.sin(t*om)/s)*pb.x,
      y: (Math.sin((1-t)*om)/s)*pa.y + (Math.sin(t*om)/s)*pb.y,
      z: (Math.sin((1-t)*om)/s)*pa.z + (Math.sin(t*om)/s)*pb.z,
    };
  }

  // ── Draw helpers ─────────────────────────────────────────

  // Draw a ring of [lat,lon] points (internal format)
  _drawRingLL(coords, color, width) {
    const ctx = this.ctx;
    ctx.beginPath();
    let pen = false;
    let prevLon = null;
    for (const [lat, lon] of coords) {
      if (prevLon !== null && Math.abs(lon - prevLon) > 180) pen = false;
      prevLon = lon;
      const p = this._proj(this._ll(lat, lon));
      if (p.z <= 0) { pen = false; continue; }
      pen ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
      pen = true;
    }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }

  // Draw a ring of [lon, lat] points (GeoJSON format)
  _drawRingGeo(ring, color, width) {
    const ctx = this.ctx;
    ctx.beginPath();
    let pen     = false;
    let prevLon = null;
    for (const [lon, lat] of ring) {
      if (prevLon !== null && Math.abs(lon - prevLon) > 180) pen = false;
      prevLon = lon;
      const p = this._proj(this._ll(lat, lon));
      if (p.z <= 0) { pen = false; continue; }
      pen ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
      pen = true;
    }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }

  // Draw lat/lon grid lines
  _drawGrid() {
    const color = 'rgba(99,102,241,0.07)';
    for (let lat = -75; lat <= 75; lat += 30) {
      const pts = [];
      for (let i = 0; i <= 180; i++) pts.push([lat, -180 + i * 2]);
      this._drawRingLL(pts, color, 0.4);
    }
    for (let lon = -180; lon < 180; lon += 30) {
      const pts = [];
      for (let i = 0; i <= 180; i++) pts.push([-90 + i, lon]);
      this._drawRingLL(pts, color, 0.4);
    }
  }

  // Draw all continents (topojson or fallback)
  _drawGeo() {
    const land  = 'rgba(148,163,184,0.28)';
    const lw    = 0.85;
    if (this.geoRings && this.geoRings.length > 0) {
      // Accurate topojson rings — GeoJSON format [lon, lat]
      for (const ring of this.geoRings) this._drawRingGeo(ring, land, lw);
    } else {
      // Fallback simplified continents — internal format [lat, lon]
      for (const c of CONTINENTS_FALLBACK) this._drawRingLL(c, land, lw);
    }
  }

  // Draw animated arc between two vendor locations
  _drawArc(arc) {
    const ctx   = this.ctx;
    const TRAIL = 0.14;
    const steps = 60;
    const t1    = arc.progress;
    const t0    = Math.max(0, t1 - TRAIL);

    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= steps; i++) {
      const t  = t0 + (t1 - t0) * (i / steps);
      const pt = this._slerp(arc.a, arc.b, t);
      const r  = this._rot(pt);
      if (r.z <= 0) { pen = false; continue; }
      const x = this.cx + r.x * this.r;
      const y = this.cy - r.y * this.r;
      pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      pen = true;
    }
    ctx.strokeStyle = 'rgba(129,140,248,0.35)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Head dot
    const h = this._slerp(arc.a, arc.b, t1);
    const hr = this._rot(h);
    if (hr.z > 0) {
      ctx.beginPath();
      ctx.arc(this.cx + hr.x * this.r, this.cy - hr.y * this.r, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#a5b4fc'; ctx.fill();
    }

    arc.progress += arc.speed;
    if (arc.progress > 1) arc.progress = 0;
  }

  // ── Main draw call ───────────────────────────────────────
  draw() {
    const { ctx, cx, cy, r } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Atmosphere glow
    const atm = ctx.createRadialGradient(cx, cy, r*0.85, cx, cy, r*1.55);
    atm.addColorStop(0,   'rgba(99,102,241,0.07)');
    atm.addColorStop(0.6, 'rgba(99,102,241,0.02)');
    atm.addColorStop(1,   'transparent');
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(cx, cy, r*1.55, 0, Math.PI*2); ctx.fill();

    // Ocean / sphere body
    const body = ctx.createRadialGradient(cx - r*0.25, cy - r*0.25, r*0.05, cx, cy, r);
    body.addColorStop(0, 'rgba(18,28,58,0.97)');
    body.addColorStop(1, 'rgba(4,8,20,0.99)');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();

    // Clip further drawing to sphere
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r - 0.5, 0, Math.PI*2); ctx.clip();

    this._drawGrid();
    this._drawGeo();
    for (const arc of this.arcs) this._drawArc(arc);

    ctx.restore(); // end sphere clip

    // Loading indicator (while geo data is fetching)
    if (!this.geoLoaded) {
      ctx.fillStyle = 'rgba(148,163,184,0.3)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading geography…', cx, cy + r + 16);
    }

    // Vendor dots — drawn outside clip so glow can bleed slightly
    for (const v of this.vendors) {
      const p = this._proj(this._ll(v.lat, v.lon));
      if (p.z <= 0) continue;

      const isInfra  = v.name.startsWith('_');
      const isAnomaly = !isInfra && (v.anomaly || this.anomalyVendors.has(v.name));
      const pulse     = Math.sin(this.pulseT * (isAnomaly ? 3 : 1.5));

      if (isInfra) {
        // Small dim infrastructure marker
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(99,102,241,0.4)'; ctx.fill();
        continue;
      }

      const dotR = isAnomaly ? 4.5 + pulse * 1.5 : 3;

      // Outer glow halo
      const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dotR * 5);
      gr.addColorStop(0, isAnomaly ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.28)');
      gr.addColorStop(1, 'transparent');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(p.x, p.y, dotR*5, 0, Math.PI*2); ctx.fill();

      // Pulsing ring for anomalies
      if (isAnomaly) {
        const rr = 10 + pulse * 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(239,68,68,${0.28 - pulse*0.08})`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }

      // Core dot
      ctx.beginPath(); ctx.arc(p.x, p.y, dotR, 0, Math.PI*2);
      ctx.fillStyle = isAnomaly
        ? `rgba(239,68,68,${0.9 + pulse * 0.08})`
        : 'rgba(129,140,248,0.92)';
      ctx.fill();

      // Inner highlight
      ctx.beginPath(); ctx.arc(p.x - dotR*0.25, p.y - dotR*0.25, dotR*0.35, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
    }

    // Specular rim highlight
    const rim = ctx.createLinearGradient(cx-r, cy-r*0.5, cx+r*0.2, cy+r*0.5);
    rim.addColorStop(0,   'rgba(129,140,248,0.22)');
    rim.addColorStop(0.5, 'rgba(129,140,248,0.0)');
    rim.addColorStop(1,   'rgba(129,140,248,0.0)');
    ctx.strokeStyle = rim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
  }

  // ── Interaction ───────────────────────────────────────────
  _setupInteraction() {
    const canvas = this.canvas;
    let decayFrame = null;

    const clampLat = lat => Math.max(-Math.PI * 0.5, Math.min(Math.PI * 0.5, lat));

    // ── Drag start ──────────────────────────────────────────
    const onStart = (mx, my) => {
      this.dragging  = true;
      this.spinning  = false;
      this.lastMX    = mx;
      this.lastMY    = my;
      this.velLon    = 0;
      this.velLat    = 0;
      if (decayFrame) { cancelAnimationFrame(decayFrame); decayFrame = null; }
    };

    // ── Drag move ───────────────────────────────────────────
    const onMove = (mx, my) => {
      if (!this.dragging) return;
      const dx = mx - this.lastMX;
      const dy = my - this.lastMY;
      const sensitivity = 0.005;
      this.lonRot += dx * sensitivity;
      this.latRot  = clampLat(this.latRot + dy * sensitivity);
      this.velLon  = dx * sensitivity;
      this.velLat  = dy * sensitivity;
      this.lastMX  = mx;
      this.lastMY  = my;
    };

    // ── Drag end — apply inertia ─────────────────────────────
    const onEnd = () => {
      if (!this.dragging) return;
      this.dragging = false;

      let vLon = this.velLon;
      let vLat = this.velLat;

      const decay = () => {
        if (Math.abs(vLon) < 0.00008 && Math.abs(vLat) < 0.00008) {
          // Resume gentle auto-spin
          this.velLon  = 0.003;
          this.spinning = true;
          decayFrame   = null;
          return;
        }
        vLon *= 0.92;
        vLat *= 0.92;
        this.lonRot += vLon;
        this.latRot  = clampLat(this.latRot + vLat);
        decayFrame = requestAnimationFrame(decay);
      };
      decayFrame = requestAnimationFrame(decay);
    };

    // ── Mouse events ────────────────────────────────────────
    canvas.addEventListener('mousedown', e => {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup',   ()  => onEnd());

    // ── Touch events ─────────────────────────────────────────
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    canvas.addEventListener('touchend',   () => onEnd());
  }

  // ── Animation loop ────────────────────────────────────────
  start() {
    const tick = () => {
      if (this.spinning && !this.dragging) {
        this.lonRot += 0.003;
      }
      this.pulseT += 0.04;
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  }

  // ── Mark anomaly vendors red after analysis ───────────────
  markAnomalies(names) {
    names.forEach(n => this.anomalyVendors.add(n));
    this.vendors = this.vendors.map(v => ({
      ...v,
      anomaly: v.anomaly || this.anomalyVendors.has(v.name),
    }));
  }
}
