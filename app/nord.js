import * as THREE from 'three'

export function nordLandscape({ world, add, toon, PUT, LP, merge, facetMat, jc, rr, rnd, pick, TAU, trunkSeg, mv, GY, SPAN, flatG, wheelG }) {
  const MS = 3.2;
  const Cc = (h) => new THREE.Color(h);
  const BX = (it, x, y, z, sx, sy, sz, c, r) => PUT(it, LP.box, [x, y, z], r, [sx, sy, sz], c);
  const longPlane = (w, x, y, c) => add(new THREE.PlaneGeometry(w, 2600, 1, 260), toon(c), world, [x, y, 0], null, [-Math.PI / 2, 0, 0]);
  const RY0 = GY;
  longPlane(23, -5.5, RY0, 0x5D6065);
  longPlane(14, -24, RY0 + 0.04, 0x7E9150);
  longPlane(7, -34.5, RY0 - 0.9, 0x5C773C);
  longPlane(14, 13, RY0 + 0.04, 0x7E9150);
  add(new THREE.PlaneGeometry(11000, 11000, 170, 170), toon(0x6E8248), world, [0, RY0 - 6, 0], null, [-Math.PI / 2, 0, 0]);
  LP.quad = flatG(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
  LP.torus = flatG(new THREE.TorusGeometry(1, 0.13, 5, 16));

  const extXY = (it, pts, z0, depth, c, holes) => {
    const s = new THREE.Shape();
    pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
    (holes || []).forEach((h) => s.holes.push(h));
    const g = new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 10 });
    g.translate(0, 0, z0);
    PUT(it, g, [0, 0, 0], 0, [1, 1, 1], c);
  };
  const WIN = Cc(0x3A4350), WIN2 = Cc(0x46515E), FRAME = Cc(0xE9E6DE);

  const FIELD = {
    ble: [0x83A44F, 0x759849], prairie: [0x6C9046, 0x7B9C4D], labour: [0x7B6551, 0x6A5645],
    chaume: [0xB9A876, 0xAA9B6C], betterave: [0x547E3A, 0x4A7133], friche: [0x8E9259, 0x9A945F],
    chemin: [0xA79C84, 0x9C9179], rue: [0x66696E, 0x6E7176], jardin: [0x6A8C45, 0x5D7E3D], cour: [0x8E8A80, 0x858176]
  };
  const parcel = (it, xa, xb, za, zb, kind, y) => {
    if (xb - xa < 0.5 || zb - za < 0.5) return;
    const pal = FIELD[kind], near = Math.min(Math.abs(xa), Math.abs(xb));
    const s = Math.max(9, near * 0.05);
    const nx = Math.max(1, Math.round((xb - xa) / s)), nz = Math.max(1, Math.round((zb - za) / s));
    const base = jc(pal[0], 0.05), alt = jc(pal[1], 0.05);
    const rows = (kind === 'labour' || kind === 'betterave' || kind === 'ble' || kind === 'jardin') ? (rnd() < 0.5 ? 'x' : 'z') : null;
    const sx = (xb - xa) / nx, sz = (zb - za) / nz;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      let c = base;
      if (rows && s < 15) c = (rows === 'x' ? i : j) % 2 ? alt : base;
      else if (rnd() < 0.3) c = alt;
      PUT(it, LP.quad, [xa + (i + 0.5) * sx, y || 0, za + (j + 0.5) * sz], 0, [sx, 1, sz], c);
    }
  };
  const KINDS = [['ble', 0.3], ['labour', 0.25], ['prairie', 0.2], ['chaume', 0.1], ['betterave', 0.1], ['friche', 0.05]];
  const kindOf = () => { let r = rnd(); for (const k of KINDS) { r -= k[1]; if (r <= 0) return k[0]; } return 'ble'; };

  const arbre = (it, x, z, s, kind) => {
    const h = kind === 'peuplier' ? rr(5, 7) * s : rr(2.5, 3.5) * s;
    trunkSeg(it, x, 0, x + rr(-0.2, 0.2) * s, h, z, (kind === 'peuplier' ? 0.22 : 0.3) * s, jc(0x5E5144, 0.1));
    if (kind === 'peuplier') {
      const c = jc(pick([0xB9A445, 0xA5A04A, 0x8C9443, 0xC4A040]), 0.06);
      PUT(it, LP.ico0, [x, h + 7 * s, z], [0, rnd() * 3, 0], [1.6 * s, 9 * s, 1.6 * s], c);
      PUT(it, LP.ico0, [x + 0.4 * s, h + 4 * s, z + 0.3 * s], [0, rnd() * 3, 0], [1.3 * s, 5 * s, 1.3 * s], c.clone().multiplyScalar(0.9));
    } else {
      const R = rr(2.6, 4) * s, c = jc(pick([0x6F8442, 0x8C8A3E, 0xB08A3A, 0x5E7A3C, 0xA0763A]), 0.07);
      PUT(it, LP.ico1, [x, h + R * 0.6, z], [0, rnd() * 3, 0], [R, R * 0.85, R], c);
      for (let k = 0; k < 3; k++) { const a = rnd() * TAU, cw = R * rr(0.5, 0.65); PUT(it, LP.ico0, [x + Math.cos(a) * R * 0.7, h + R * rr(0.3, 0.9), z + Math.sin(a) * R * 0.7], [rnd(), rnd(), 0], [cw, cw * 0.8, cw], jc(c.getHex(), 0.08)); }
    }
  };
  const haie = (it, x0, z0, x1, z1, s) => {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.floor(L / (2.2 * s)));
    for (let k = 0; k < n; k++) {
      const u = (k + rnd() * 0.5) / n, r = rr(1.2, 1.9) * s;
      PUT(it, LP.ico0, [x0 + (x1 - x0) * u, r * 0.7, z0 + (z1 - z0) * u], [rnd(), rnd(), 0], [r, r * 0.9, r], jc(pick([0x4E6B35, 0x5A6F38, 0x6B6A35]), 0.08));
    }
  };

  const BRICK = [0x9B4A34, 0x8A3F2D, 0xA4563B, 0x84402F, 0xAE6046];
  const TUILE = [0x4A4E56, 0x545961, 0x8A4634, 0x7A3E30, 0x934F38];
  const DOORS = [0x2E5A7A, 0x7A2E2E, 0x2F5E3E, 0xE7E2D4, 0x3B3B45, 0x9A7A3A, 0x6E8FA8];
  const coron = (it, xf, dir, z0, n, detail) => {
    const m = MS, W = 5.6 * m, D = 7.5 * m, H = 5.8 * m, RH = 3.0 * m;
    const brick = jc(pick(BRICK), 0.04), roofc = jc(pick(TUILE), 0.04), dark = brick.clone().multiplyScalar(0.82);
    const X = (p) => xf + dir * p;
    const L = n * W, zc = z0 + L / 2;
    BX(it, xf - dir * D / 2, H / 2, zc, D, H, L, brick);
    BX(it, X(0.05 * m), 0.35 * m, zc, 0.12 * m, 0.7 * m, L, Cc(0x2A2928));
    BX(it, X(0.05 * m), H - 0.25 * m, zc, 0.14 * m, 0.4 * m, L, dark);
    extXY(it, [[X(0.45 * m), H - 0.15], [X(-D / 2), H + RH], [X(-D - 0.45 * m), H - 0.15]], z0 - 0.3 * m, L + 0.6 * m, roofc);
    for (let k = 0; k < n; k++) {
      const za = z0 + k * W, mid = za + W / 2, dz = (k % 2 ? 1 : -1) * 1.3 * m;
      if (detail) {
        BX(it, X(0.06 * m), 1.1 * m, mid + dz, 0.1 * m, 2.2 * m, 1.0 * m, jc(pick(DOORS), 0.05));
        [[1.6, -0.75], [4.2, -0.75], [4.2, 1]].forEach((w) => {
          const zw = mid + dz * w[1];
          BX(it, X(0.04 * m), w[0] * m, zw, 0.08 * m, 1.45 * m, 1.25 * m, FRAME);
          BX(it, X(0.09 * m), w[0] * m, zw, 0.06 * m, 1.25 * m, 1.05 * m, k % 3 ? WIN : WIN2);
          BX(it, X(0.12 * m), (w[0] - 0.78) * m, zw, 0.2 * m, 0.1 * m, 1.4 * m, Cc(0xD8D0C2));
        });
        BX(it, X(2.6 * m), 0.35 * m, mid + (k % 2 ? 0.6 : -0.6) * m, 0.25 * m, 0.7 * m, W - 1.4 * m, dark);
        if (rnd() < 0.5) BX(it, X(-D - rr(7, 10) * m), 1.1 * m, mid, 2.2 * m, 2.2 * m, 2.6 * m, jc(pick([0x7A6A55, 0x5E6A5A, 0x8E3F2E]), 0.06));
      } else if (k % 2 === 0) {
        BX(it, X(0.06 * m), 1.5 * m, mid, 0.1 * m, 1.3 * m, 1.2 * m, WIN);
        BX(it, X(0.06 * m), 4.2 * m, mid, 0.1 * m, 1.2 * m, 1.2 * m, WIN);
      }
      if (k % 2 === 0) BX(it, X(-D / 2), H + RH + 0.5 * m, za, 0.7 * m, 1.8 * m, 1.1 * m, dark);
    }
    BX(it, X(-D / 2), H + RH + 0.5 * m, z0 + L, 0.7 * m, 1.8 * m, 1.1 * m, dark);
  };
  const cite = (it, xa, za, zb, nRows, detail) => {
    const m = MS; let x = xa;
    const strip = (w, kind) => { parcel(it, x - w, x, za, zb, kind); x -= w; };
    for (let r = 0; r < nRows; r++) {
      strip(5 * m, 'rue');
      strip(3.2 * m, 'prairie');
      const xf = x;
      strip(7.5 * m, 'cour');
      strip(rr(10, 13) * m, 'jardin');
      let z = za + rr(2, 6) * m;
      while (z < zb - 25 * m) {
        const n = Math.min(Math.floor((zb - z - 3 * m) / (5.6 * m)), 5 + Math.floor(rnd() * 6));
        if (n < 3) break;
        coron(it, xf, 1, z, n, detail);
        z += n * 5.6 * m + rr(4, 7) * m;
      }
      if (rnd() < 0.5) for (let k = 0; k < 3; k++) arbre(it, xf - rr(12, 18) * m, rr(za, zb), MS * rr(0.9, 1.2), 'rond');
    }
    return x;
  };
  const eglise = (it, x, z) => {
    const m = MS, b = jc(0x9A5038, 0.04), sl = Cc(0x4D525A);
    BX(it, x, 6 * m, z, 12 * m, 12 * m, 30 * m, b);
    extXY(it, [[x + 6.6 * m, 11.8 * m], [x, 18 * m], [x - 6.6 * m, 11.8 * m]], z - 15.5 * m, 31 * m, sl);
    BX(it, x, 13 * m, z + 18 * m, 7 * m, 26 * m, 7 * m, b);
    PUT(it, LP.roof, [x, 26 * m + 9 * m, z + 18 * m], 0, [7.4 * m, 18 * m, 7.4 * m], sl);
    for (const s of [-1, 1]) BX(it, x + s * 6.05 * m, 7 * m, z, 0.1 * m, 4 * m, 20 * m, WIN);
  };
  const chateauDEau = (it, x, z) => {
    const m = MS, c = Cc(0xCFCABD);
    PUT(it, LP.cyl, [x, 14 * m, z], 0, [2.2 * m, 28 * m, 2.2 * m], c);
    PUT(it, LP.cyl, [x, 31 * m, z], 0, [7 * m, 7 * m, 7 * m], c.clone().multiplyScalar(0.96));
    PUT(it, LP.cyl, [x, 35 * m, z], 0, [7.4 * m, 0.6 * m, 7.4 * m], Cc(0xE2DED3));
  };
  const ferme = (it, x, z) => {
    const m = MS, S = 32 * m, b = jc(pick(BRICK), 0.05), roofc = jc(pick(TUILE), 0.05);
    parcel(it, x - S / 2, x + S / 2, z - S / 2, z + S / 2, 'cour', 0.6);
    [[0, -1], [0, 1]].forEach((d) => {
      const zz = z + d[1] * (S / 2 - 4 * m);
      BX(it, x, 3 * m, zz, S, 6 * m, 8 * m, b);
      PUT(it, LP.roof, [x, 6 * m + 1.6 * m, zz], [0, 0, 0], [S * 0.71, 3.2 * m, 8.6 * m * 0.71], roofc);
    });
    [-1, 1].forEach((s) => {
      const xx = x + s * (S / 2 - 4 * m);
      BX(it, xx, 3.2 * m, z, 8 * m, 6.4 * m, S - 16 * m, b);
      extXY(it, [[xx + 4.4 * m, 6.3 * m], [xx, 9 * m], [xx - 4.4 * m, 6.3 * m]], z - (S - 16 * m) / 2, S - 16 * m, roofc);
    });
    BX(it, x - S / 2 - 14 * m, 4 * m, z, 18 * m, 8 * m, 26 * m, Cc(0x9AA0A3));
    BX(it, x - S / 2 - 14 * m, 8.2 * m, z, 19 * m, 0.5 * m, 27 * m, Cc(0x6F7A7E));
    for (let k = 0; k < 4; k++) arbre(it, x + rr(-1, 1) * S, z + S / 2 + rr(4, 10) * m, MS, 'rond');
  };
  const village = (it, xc, za, zb, big) => {
    const m = MS, rows = big ? 4 : 2;
    for (let r = 0; r < rows; r++) {
      const xf = xc + (r - rows / 2) * 40 * m + rr(-6, 6) * m;
      parcel(it, xf, xf + 5 * m, za, zb, 'rue', 0.6);
      parcel(it, xf - 28 * m, xf, za, zb, 'jardin', 0.6);
      let z = za + rr(5, 30) * m;
      while (z < zb - 30 * m) { const n = 3 + Math.floor(rnd() * 6); if (z + n * 5.6 * m > zb) break; coron(it, xf, 1, z, n, false); z += n * 5.6 * m + rr(6, 20) * m; }
      for (let k = 0; k < 3; k++) arbre(it, xf - rr(14, 26) * m, rr(za, zb), MS * 1.2, rnd() < 0.4 ? 'peuplier' : 'rond');
    }
    if (big) eglise(it, xc + 20 * m, (za + zb) / 2);
    if (big && rnd() < 0.7) chateauDEau(it, xc + 20 * m, za + (zb - za) * 0.15);
  };

  const farMovers = [];
  const FSPAN = 9600, FLO = -4800;
  const far = (g, z) => { farMovers.push({ g: g, z: z }); world.add(g); return g; };
  const KEEP = [];
  const wrapD = (a, b) => { const d = ((a - b) % FSPAN + FSPAN * 1.5) % FSPAN - FSPAN / 2; return Math.abs(d); };
  const free = (x, z, r) => KEEP.every((k) => Math.hypot(x - k.x, wrapD(z, k.z)) > r + k.r);
  const terril = (R, H, ph, plat, elong) => {
    const pos = [], col = [], NA = 80, NR = 28;
    const P = (i, j) => {
      const u = i / NR, a = (j / NA) * TAU;
      const rr2 = u * R * (1 + 0.035 * Math.sin(a * 23 + ph) * Math.sin(u * Math.PI) + 0.025 * Math.sin(a * 7 + ph * 2) * u);
      let y = plat ? H * Math.min(1, Math.pow(1 - u, 1.05) / (1 - plat)) : H * Math.pow(1 - u, 1.12) * (1 - 0.02 * Math.cos(a * 23 + ph));
      if (i === NR) y = -6;
      y -= 6 * Math.sin(a * 23 + ph) * Math.sin(u * Math.PI) * (1 - u);
      return [Math.cos(a) * rr2, y, Math.sin(a) * rr2 * (elong || 1)];
    };
    const veg = [0x6B7A44, 0x7C8650, 0x5F6E3C, 0x8A8B55], sch = [0x4B4744, 0x55504B, 0x5F5852, 0x47423F, 0x6A5A4C];
    for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) {
      const u = (i + 0.5) / NR, a = ((j + 0.5) / NA) * TAU;
      const nz = Math.sin(a * 5 + ph) * Math.sin(u * 9 + ph * 2) + 0.6 * Math.sin(a * 13 + u * 20 + ph * 3) + 0.4 * Math.sin(a * 31 + ph);
      const gul = 0.5 + 0.5 * Math.sin(a * 23 + ph) * (0.6 + 0.4 * Math.sin(a * 3 + ph));
      const c = Cc(0x4A4542).lerp(Cc(0x6B635B), gul * 0.8 + 0.2 * (0.5 + 0.5 * Math.sin(u * 7 + a * 2 + ph)));
      if (plat) c.lerp(Cc(0x6A7445), 0.35);
      const vg = nz * 0.55 + u * 1.9 - (plat ? 0.4 : 1.25);
      c.lerp(Cc(vg > 0.9 ? 0x6C7947 : 0x7A7E52), Math.max(0, Math.min(0.85, (vg - 0.25) * 1.4)));
      c.multiplyScalar(0.98 + rnd() * 0.04);
      const A = P(i, j), B = P(i, j + 1), C2 = P(i + 1, j), D2 = P(i + 1, j + 1);
      [A, B, C2, B, D2, C2].forEach((v) => { pos.push(v[0], v[1], v[2]); col.push(c.r, c.g, c.b); });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return new THREE.Mesh(g, facetMat);
  };
  const placeFar = (obj, x, z, r) => { obj.position.x = x; obj.position.y = RY0; far(obj, z); KEEP.push({ x: x, z: z, r: r }); return obj; };
  placeFar(terril(880, 595, 0.3), -1450, -950, 900);
  placeFar(terril(860, 580, 2.1), -1520, -2120, 880);
  placeFar(terril(700, 400, 4.0), -2400, 1700, 720);
  placeFar(terril(520, 135, 1.3, 0.45, 2.6), -1350, 3400, 1300);
  placeFar(terril(560, 300, 5.2), -2300, -3700, 600);
  const base1119 = (() => {
    const it = [], m = MS, beton = Cc(0xC2BBAD), betonD = Cc(0xA8A194), acier = Cc(0x3D4746), b = jc(0x8E4632, 0.03);
    parcel(it, -70 * m, 70 * m, -60 * m, 60 * m, 'cour', 0.6);
    BX(it, 0, 30 * m, 0, 15 * m, 60 * m, 15 * m, beton);
    BX(it, 0, 63 * m, 0, 17 * m, 8 * m, 17 * m, betonD);
    BX(it, 0, 67.5 * m, 0, 12 * m, 1.5 * m, 12 * m, beton);
    for (const s of [-1, 1]) { BX(it, s * 7.55 * m, 31 * m, 0, 0.2 * m, 54 * m, 3 * m, betonD); BX(it, 0, 31 * m, s * 7.55 * m, 3 * m, 54 * m, 0.2 * m, betonD); }
    for (let k = 0; k < 6; k++) BX(it, 7.6 * m, (8 + k * 9) * m, 4.5 * m, 0.15 * m, 1.4 * m, 2.2 * m, WIN);
    const cx = -32 * m, cz = 18 * m, hh = 38 * m;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((c) => BX(it, cx + c[0] * 3.5 * m, hh / 2, cz + c[1] * 3.5 * m, 0.9 * m, hh, 0.9 * m, acier));
    for (let y = 6; y < 38; y += 7) [-1, 1].forEach((s) => { BX(it, cx + s * 3.5 * m, y * m, cz, 0.5 * m, 0.5 * m, 7.5 * m, acier); BX(it, cx, y * m, cz + s * 3.5 * m, 7.5 * m, 0.5 * m, 0.5 * m, acier); });
    BX(it, cx, hh + 1 * m, cz, 9 * m, 2 * m, 9 * m, acier);
    [-1, 1].forEach((s) => trunkSeg(it, cx + 22 * m, 0, cx + 2 * m, hh, cz + s * 3 * m, 0.7 * m, acier));
    [-1.6, 1.6].forEach((dz) => PUT(it, LP.torus, [cx, hh + 4.5 * m, cz + dz * m], [0, Math.PI / 2, 0], [3.4 * m, 3.4 * m, 3.4 * m], Cc(0x2E3534)));
    [[-10, -40, 34, 12, 26], [30, -30, 22, 9, 40], [24, 34, 30, 10, 22]].forEach((h) => {
      BX(it, h[0] * m, h[3] / 2 * m, h[1] * m, h[2] * m, h[3] * m, h[4] * m, b);
      extXY(it, [[(h[0] + h[2] / 2 + 0.5) * m, (h[3] - 0.2) * m], [h[0] * m, (h[3] + 5) * m], [(h[0] - h[2] / 2 - 0.5) * m, (h[3] - 0.2) * m]], (h[1] - h[4] / 2) * m, h[4] * m, Cc(0x4C5158));
      for (let z = h[1] - h[4] / 2 + 3; z < h[1] + h[4] / 2 - 2; z += 4.5) BX(it, (h[0] + h[2] / 2 + 0.05) * m, h[3] * 0.55 * m, z * m, 0.15 * m, h[3] * 0.45 * m, 2.2 * m, WIN);
    });
    return new THREE.Mesh(merge(it), facetMat);
  })();
  placeFar(base1119, -760, -320, 260);
  const rotors = [];
  const eolienne = (x, z) => {
    const g = new THREE.Group(), m = MS, wh = Cc(0xEEF0F1), it = [];
    PUT(it, flatG(new THREE.CylinderGeometry(1.4 * m, 2.4 * m, 100 * m, 10)), [0, 50 * m, 0], 0, [1, 1, 1], wh);
    BX(it, 1.5 * m, 101 * m, 0, 9 * m, 3.4 * m, 3.4 * m, wh);
    g.add(new THREE.Mesh(merge(it), facetMat));
    const r = [], rot = new THREE.Group();
    PUT(r, LP.ico0, [0, 0, 0], 0, [1.6 * m, 1.6 * m, 1.6 * m], wh);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      PUT(r, LP.box, [0, Math.cos(a) * 27 * m, Math.sin(a) * 27 * m], [a, 0, 0], [0.4 * m, 54 * m, 2.6 * m], wh);
    }
    const rm = new THREE.Mesh(merge(r), facetMat);
    rot.add(rm);
    rot.position.set(6.6 * m, 101 * m, 0);
    g.add(rot);
    rotors.push(rot);
    g.rotation.y = 0.15;
    placeFar(g, x, z, 60);
  };
  [[-2900, 300], [-3150, 700], [-2750, 1050], [-3300, 1400], [-3000, 1800], [-2600, -2900], [-2950, -2500]].forEach((p) => eolienne(p[0], p[1]));

  const CH = FSPAN / 24;
  for (let ci = 0; ci < 24; ci++) {
    const it = [], zc = FLO + (ci + 0.5) * CH, za = -CH / 2, zb = CH / 2;
    let xr = -38;
    const open0 = zc > -2900 && zc < 300;
    const hasCite = !open0 && rnd() < 0.35 && free(-300, zc, 350);
    if (hasCite) {
      parcel(it, -60, xr, za, zb, 'prairie');
      xr = cite(it, -60, za, zb, 2 + Math.floor(rnd() * 2), true);
      KEEP.push({ x: -250, z: zc, r: 240 });
    }
    const fx = -rr(380, 900), vx = -rr(900, 2100);
    const hasFerme = (!open0 || fx < -650) && rnd() < 0.4 && fx < xr - 140 && free(fx, zc, 160);
    const hasVillage = rnd() < 0.45 && free(vx, zc, 330);
          if (hasFerme) { ferme(it, fx, rr(-60, 60)); KEEP.push({ x: fx, z: zc, r: 140 }); }
    if (hasVillage) { village(it, vx, za + 10, zb - 10, rnd() < 0.6); KEEP.push({ x: vx, z: zc, r: 260 }); }
    while (xr > -4200) {
      const w = rr(70, 170) + Math.abs(xr) * rr(0.06, 0.16), x0 = xr - w;
      const nz = 1 + Math.floor(rnd() * 3);
      let z = za;
      for (let k = 0; k < nz; k++) {
        const z1 = k === nz - 1 ? zb : z + rr(0.25, 0.5) * CH;
        parcel(it, x0, xr, z, z1, kindOf());
        if (k < nz - 1 && Math.abs(xr) < 1800 && rnd() < 0.45) haie(it, x0, z1, xr, z1, MS * 1.1);
        z = z1;
      }
      if (Math.abs(xr) < 2400) {
        const r = rnd();
        if (r < 0.18) { parcel(it, x0 - 7, x0, za, zb, 'chemin'); xr = x0 - 7; continue; }
        const treesOk = Math.abs(x0) > 300 && !(open0 && Math.abs(x0) < 1000);
        if (r < 0.36) { if (treesOk) for (let z2 = za + 6; z2 < zb; z2 += rr(14, 20)) arbre(it, x0 - 3, z2, MS * rr(0.9, 1.15), 'peuplier'); }
        else if (r < 0.55 && Math.abs(xr) < 1500) haie(it, x0, za, x0, zb, MS * 1.1);
        else if (r < 0.62 && treesOk) for (let k = 0; k < 4; k++) arbre(it, x0 + rr(-10, 10), rr(za, zb), MS * rr(1, 1.3), 'rond');
      }
      xr = x0;
    }
    let xl = 20;
    while (xl < 1600) {
      const w = rr(80, 200) + xl * 0.1, nz = 1 + Math.floor(rnd() * 2);
      let z = za;
      for (let k = 0; k < nz; k++) { const z1 = k === nz - 1 ? zb : z + rr(0.3, 0.6) * CH; parcel(it, xl, xl + w, z, z1, kindOf()); z = z1; }
      if (rnd() < 0.3) for (let z2 = za + 8; z2 < zb; z2 += rr(15, 22)) arbre(it, xl + w, z2, MS * rr(0.9, 1.1), 'peuplier');
      xl += w;
    }
    const g = new THREE.Mesh(merge(it), facetMat);
    g.position.y = RY0 - 0.12;
    far(g, zc);
  }

  const NT = 10, TL = SPAN / NT, WH = Cc(0xEDECE6);
  for (let ti = 0; ti < NT; ti++) {
    const it = [];
    for (let zl = 0; zl < TL; zl += 33.3) BX(it, -5.5, RY0 + 0.05, zl + 6, 0.45, 0.06, 9.6, WH);
    for (let zl = 0; zl < TL; zl += 20) { BX(it, -16.3, RY0 + 0.05, zl + 5, 0.4, 0.06, 9.6, WH); BX(it, 5.3, RY0 + 0.05, zl + 5, 0.4, 0.06, 9.6, WH); }
    [[-18.6, 0xE38A2A], [7.6, 0xE0E0E0]].forEach((b) => [TL * 0.25, TL * 0.75].forEach((z) => {
      BX(it, b[0], RY0 + 1.6, z, 0.35, 3.2, 0.35, Cc(0xF2F1EC));
      BX(it, b[0], RY0 + 2.5, z, 0.37, 0.55, 0.37, Cc(0x1E1F21));
      BX(it, b[0] + (b[0] < 0 ? 0.19 : -0.19), RY0 + 2.5, z, 0.02, 0.4, 0.2, Cc(b[1]));
    }));
    const px = -27, pz = TL * 0.45;
    PUT(it, LP.cyl, [px, RY0 + 4 * MS, pz], 0, [0.12 * MS, 8 * MS, 0.12 * MS], jc(0x6B5A48, 0.06));
    BX(it, px, RY0 + 7.6 * MS, pz, 1.5 * MS, 0.12 * MS, 0.12 * MS, Cc(0x5B4C3D));
    [-0.6, 0, 0.6].forEach((o) => {
      BX(it, px + o * MS, RY0 + 7.75 * MS, pz, 0.1 * MS, 0.25 * MS, 0.1 * MS, Cc(0xDCDCD6));
      BX(it, px + o * MS, RY0 + 7.82 * MS, TL / 2, 0.05, 0.05, TL, Cc(0x2A2A2A));
    });
    for (let k = 0; k < 7; k++) { const x = rr(-30, -19), z = rr(0, TL), s = rr(0.6, 1.2); for (let b = 0; b < 4; b++) PUT(it, LP.blade, [x + rr(-0.6, 0.6), RY0, z + rr(-0.6, 0.6)], [rr(-0.4, 0.4), rnd() * 3, rr(-0.4, 0.4)], [s * 2, s * 2.2, s * 2], jc(pick([0x8C9A55, 0xA5A060, 0x77894A]), 0.08)); }
    if (rnd() < 0.5) { const z = rr(10, TL - 10), r = rr(1.5, 2.6); PUT(it, LP.ico0, [rr(-32, -28), RY0 + r * 0.5, z], [rnd(), rnd(), 0], [r * 1.4, r, r * 1.2], jc(pick([0x55703A, 0x6E6A38]), 0.08)); }
    for (let k = 0; k < 4; k++) { const z = rr(0, TL), s = rr(0.6, 1.1); PUT(it, LP.blade, [rr(8, 19), RY0, z], [rr(-0.4, 0.4), rnd() * 3, 0], [s * 2, s * 2.2, s * 2], jc(0x8C9A55, 0.08)); }
    if (ti === 6) {
      const z = TL * 0.7, m = MS, x = -25;
      parcel(it, -31, -18.5, z - 12, z + 12, 'chemin', RY0 + 0.09);
      BX(it, x, RY0 + 1.9 * m, z, 2.4 * m, 2.4 * m, 4.6 * m, Cc(0xF3EFE4));
      BX(it, x, RY0 + 1.0 * m, z, 2.45 * m, 0.4 * m, 4.65 * m, Cc(0xC7322B));
      BX(it, x + 1.23 * m, RY0 + 2.2 * m, z, 0.05 * m, 1.0 * m, 3.0 * m, Cc(0x2E3540));
      for (let k = 0; k < 6; k++) BX(it, x + 1.75 * m, RY0 + 3.0 * m, z - 1.6 * m + k * 0.64 * m, 1.1 * m, 0.08 * m, 0.64 * m, Cc(k % 2 ? 0xF5F2EA : 0xD33A2F), [0, 0, -0.35]);
      BX(it, x, RY0 + 3.2 * m, z, 2.5 * m, 0.2 * m, 4.7 * m, Cc(0xE8C23A));
      [-1.4, 1.4].forEach((o) => PUT(it, wheelG, [x, RY0 + 0.35 * m, z + o * m], 0, [0.6 * m, 0.35 * m, 0.6 * m], Cc(0x1B1C1E)));
      PUT(it, LP.cyl, [x + 4.6 * m, RY0 + 0.5 * m, z + 2.6 * m], 0, [0.7 * m, 0.08 * m, 0.7 * m], Cc(0xD9D4C8));
      PUT(it, LP.cyl, [x + 4.6 * m, RY0 + 0.25 * m, z + 2.6 * m], 0, [0.06 * m, 0.5 * m, 0.06 * m], Cc(0x2B2B2B));
    }
    const tile = new THREE.Mesh(merge(it), facetMat);
    mv(tile, ti * TL);
  }

  return { farMovers, rotors, FSPAN, FLO }
}
