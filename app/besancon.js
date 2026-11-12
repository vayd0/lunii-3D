import * as THREE from 'three'

export function besanconLandscape({ world, add, toon, PUT, LP, merge, facetMat, jc, rr, rnd, pick, TAU, trunkSeg, mv, GY, SPAN, flatG, sstep, gm, curveU }) {
  const MS = 3.2;
  const Cc = (h) => new THREE.Color(h);
  const BX = (it, x, y, z, sx, sy, sz, c, r) => PUT(it, LP.box, [x, y, z], r, [sx, sy, sz], c);
  const longPlane = (w, x, y, c) => add(new THREE.PlaneGeometry(w, 2600, 1, 260), toon(c), world, [x, y, 0], null, [-Math.PI / 2, 0, 0]);
  const longBox = (x, y, sx, sy, c) => add(new THREE.BoxGeometry(sx, sy, 2600, 1, 1, 260), toon(c), world, [x, y, 0]);
  const RY0 = GY;
  const WATER = GY - 30;
  longPlane(23, -5.5, RY0, 0x55585E);
  longPlane(13, -23.5, RY0 + 0.25, 0xC9C1B1);
  longPlane(14, 12, RY0 + 0.25, 0xC6BEAE);
  longBox(-30.4, RY0 + 1.4, 2.0, 2.8, 0xD9CCB2);
  longBox(-30.4, RY0 + 2.9, 2.6, 0.35, 0xE6DBC4);
  longBox(-32.5, RY0 - 15, 3.0, 30.5, 0xC2B395);
  longPlane(16, -40.5, RY0 - 27, 0xB5AB98);
  longBox(-49, RY0 - 28.5, 1.5, 3.2, 0xA99C82);
  add(new THREE.PlaneGeometry(290, 2600, 1, 260), new THREE.MeshToonMaterial({ color: 0x5B7C62, gradientMap: gm }), world, [-190, WATER, 0], null, [-Math.PI / 2, 0, 0]);
  longPlane(18, -339, RY0 - 27, 0xB5AB98);
  longBox(-331, RY0 - 28.5, 1.5, 3.2, 0xA99C82);
  longBox(-349.5, RY0 - 15, 3.0, 30.5, 0xC2B395);
  longBox(-351, RY0 + 1.75, 2.0, 3.5, 0xD9CCB2);
  longBox(-351, RY0 + 3.6, 2.6, 0.35, 0xE6DBC4);
  longPlane(46, -375, RY0, 0x5A5D63);
  longPlane(8, -401, RY0 + 0.25, 0xC9C1B1);

  const extXY = (it, pts, z0, depth, c, holes) => {
    const s = new THREE.Shape();
    pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
    (holes || []).forEach((h) => s.holes.push(h));
    const g = new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 10 });
    g.translate(0, 0, z0);
    PUT(it, g.toNonIndexed ? g : g, [0, 0, 0], 0, [1, 1, 1], c);
  };

  const STONE = [0xEAD9BC, 0xF0DDBD, 0xE6C7A2, 0xEFC6A4, 0xDCCFB8, 0xCFCBC0, 0xF3E6CC, 0xE9D2A8, 0xF2C9B0];
  const TILE = [0xC0643C, 0xB55A36, 0xA65638, 0xC97445, 0x9E4F33, 0xB86A48];
  const SHUT = [0x6B8E8A, 0x8C6F55, 0xA9B7B4, 0x4F6A5E, 0xC9B79A, 0x7E8FA0];
  const AWN = [0xA8322D, 0x2F5A3C, 0x23395B, 0x7A2C3B, 0x3C3F44, 0xC9A23A];
  const IRON = Cc(0x26292C), WIN = Cc(0x3D4652), WIN2 = Cc(0x4A5562), DOOR = Cc(0x3A3530), SHOPG = Cc(0x2A333C);
  const hauss = (it, xf, dir, z0, w, detail) => {
    const m = MS, wm = w / m;
    const stone = jc(pick(STONE), 0.03), light = stone.clone().lerp(Cc(0xFFFFFF), 0.3), grey = jc(0xB9B6AC, 0.04);
    const tile = jc(pick(TILE), 0.05), shut = rnd() < 0.55 ? jc(pick(SHUT), 0.05) : null;
    const nF = 2 + Math.floor(rnd() * 3), h0 = 4.0 * m, fh = 3.0 * m, D = rr(11, 14) * m;
    const Hc = h0 + nF * fh;
    const X = (prot) => xf + dir * prot;
    const zc = z0 + w / 2;
    BX(it, xf - dir * D / 2, RY0 + Hc / 2, zc, D, Hc, w - 0.15, stone);
    BX(it, X(0.06 * m), RY0 + h0 / 2, zc, 0.12 * m, h0, w - 0.2, grey);
    [[h0, 0.2, 0.25], [Hc, 0.45, 0.45]].forEach((c) => BX(it, X(c[1] * m / 2), RY0 + c[0], zc, c[1] * m, c[2] * m, w - 0.1, light));
    const nc = Math.max(2, Math.floor(wm / 2.9)), sp = w / nc;
    for (let i = 0; i < nc; i++) {
      const z = z0 + (i + 0.5) * sp;
      if (detail) {
        if (i === Math.floor(nc / 2)) BX(it, X(0.13 * m), RY0 + 1.6 * m, z, 0.06 * m, 3.2 * m, 1.6 * m, DOOR);
        else {
          BX(it, X(0.13 * m), RY0 + 1.5 * m, z, 0.05 * m, 2.7 * m, sp - 0.9 * m, SHOPG);
          if (rnd() < 0.35) BX(it, X(0.7 * m), RY0 + 3.2 * m, z, 1.4 * m, 0.1 * m, sp - 0.6 * m, jc(pick(AWN), 0.05), [0, 0, dir * 0.42]);
        }
      }
      for (let f = 1; f <= nF; f++) {
        if (!detail && (i + f) % 2) continue;
        const wh = 1.9 * m, yb = RY0 + h0 + (f - 1) * fh + 0.55 * m;
        BX(it, X(0.03 * m), yb + wh / 2, z, 0.06 * m, wh + 0.3 * m, 1.45 * m, grey);
        BX(it, X(0.07 * m), yb + wh / 2, z, 0.06 * m, wh, 1.05 * m, f % 2 ? WIN : WIN2);
        if (detail && shut) [-1, 1].forEach((s2) => BX(it, X(0.09 * m), yb + wh / 2, z + s2 * 0.95 * m, 0.08 * m, wh, 0.5 * m, shut));
        if (detail && f === 1 && rnd() < 0.3) BX(it, X(0.25 * m), yb + 0.45 * m, z, 0.05 * m, 0.9 * m, 1.2 * m, IRON);
      }
    }
    const RH = D * 0.42;
    extXY(it, [[X(0.55 * m), RY0 + Hc - 0.1], [X(-D / 2), RY0 + Hc + RH], [X(-D - 0.4 * m), RY0 + Hc - 0.1]], z0 - 0.15, w + 0.3, tile);
    if (detail) for (let i = 0; i < nc; i += 2) {
      const z = z0 + (i + 0.5) * sp, y = RY0 + Hc + 1.1 * m;
      BX(it, X(-1.4 * m), y, z, 1.4 * m, 1.6 * m, 1.3 * m, light);
      BX(it, X(-0.66 * m), y - 0.05 * m, z, 0.06 * m, 1.0 * m, 0.75 * m, WIN);
      PUT(it, LP.roof, [X(-1.4 * m), y + 1.15 * m, z], 0, [1.4 * m, 0.7 * m, 1.6 * m], tile.clone().multiplyScalar(0.92));
    }
    const nCh = 1 + Math.floor(rnd() * 2);
    for (let k = 0; k < nCh; k++) BX(it, X(-D / 2 + rr(-1, 1) * m), RY0 + Hc + RH * 0.85, z0 + rr(0.2, 0.8) * w, 0.8 * m, 2.2 * m, 1.4 * m, light);
  };
  const prismX = (it, x0, x1, zc, w, y0, h, c) => {
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.lineTo(-w / 2, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: false });
    PUT(it, g, [x0, y0, zc], [0, Math.PI / 2, 0], [1, 1, 1], c);
  };
  const imperialeG = (() => {
    const pts = [[1.08, 0], [1.12, 0.08], [1.0, 0.22], [0.62, 0.42], [0.42, 0.58], [0.5, 0.72], [0.5, 0.82], [0.36, 0.95], [0.16, 1.02], [0.16, 1.22], [0.24, 1.26], [0.12, 1.36], [0.03, 1.62], [0, 1.64]];
    return flatG(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 4, Math.PI / 4));
  })();
  const egliseComtoise = (it, xf, zc) => {
    const m = MS, st = jc(0xE7DCC6, 0.02), grey = Cc(0xB8B4A9), tile = jc(0xA65638, 0.04);
    const L = 38 * m, W = 15 * m, Hn = 15 * m;
    BX(it, xf - L / 2 - 9 * m, RY0 + Hn / 2, zc, L, Hn, W, st);
    prismX(it, xf - L - 9.5 * m, xf - 8.5 * m, zc, W + 1.2 * m, RY0 + Hn - 0.2, 7 * m, tile);
    for (let k = 0; k < 5; k++) [-1, 1].forEach((s2) => BX(it, xf - 14 * m - k * 6.5 * m, RY0 + 8 * m, zc + s2 * (W / 2 + 0.03), 1.6 * m, 5 * m, 0.1 * m, WIN));
    const T = 9 * m, Ht = 36 * m, xt = xf - T / 2;
    BX(it, xt, RY0 + Ht / 2, zc, T, Ht, T, st);
    BX(it, xf + 0.05, RY0 + 2.8 * m, zc, 0.12 * m, 5.6 * m, 3.2 * m, Cc(0x5A4636));
    [12, 24].forEach((y) => BX(it, xt, RY0 + y * m, zc, T + 0.5 * m, 0.5 * m, T + 0.5 * m, grey));
    BX(it, xt, RY0 + Ht, zc, T + 0.9 * m, 0.7 * m, T + 0.9 * m, grey);
    PUT(it, LP.cyl, [xf + 0.05, RY0 + 27.5 * m, zc], [0, 0, Math.PI / 2], [1.6 * m, 0.15 * m, 1.6 * m], Cc(0xF4F1E8));
    [1, -1].forEach((s2) => BX(it, xt, RY0 + 31 * m, zc + s2 * (T / 2 + 0.02), 1.8 * m, 3.4 * m, 0.1 * m, Cc(0x2B2B2E)));
    BX(it, xf + 0.02, RY0 + 31 * m, zc, 0.1 * m, 3.4 * m, 1.8 * m, Cc(0x2B2B2E));
    PUT(it, imperialeG, [xt, RY0 + Ht + 0.35 * m, zc], 0, [T * 0.5, 9 * m, T * 0.5], jc(0x5F7C74, 0.03));
    BX(it, xt, RY0 + Ht + 15.6 * m, zc, 0.25 * m, 2.2 * m, 0.25 * m, Cc(0x2B2B2E));
    BX(it, xt, RY0 + Ht + 16.0 * m, zc, 0.25 * m, 0.25 * m, 1.2 * m, Cc(0x2B2B2E));
  };
  const citeArts = (it, xf, za, zb, endA, endB) => {
    const m = MS, Dp = 30 * m, Hh = 13 * m, zc = (za + zb) / 2, L = zb - za;
    BX(it, xf - Dp / 2, RY0 + Hh / 2, zc, Dp - 1.5 * m, Hh, L, Cc(0x30363C));
    for (let z = za + 0.6 * m; z < zb; z += 1.2 * m) BX(it, xf + 0.2 * m, RY0 + Hh / 2, z, 0.35 * m, Hh, 0.32 * m, jc(0x9B7650, 0.06));
    [3.3, 7.6].forEach((y) => BX(it, xf + 0.3 * m, RY0 + y * m, zc, 0.5 * m, 0.25 * m, L, Cc(0x6F5A44)));
    const cell = 3.4 * m, nx = Math.round((Dp + 6 * m) / cell);
    for (let i = 0; i < nx; i++) for (let z = za; z < zb - 0.1; z += cell) {
      const r = rnd(), c = r < 0.45 ? jc(0x7B8B98, 0.05) : r < 0.75 ? jc(0x6E8E4A, 0.08) : jc(0xA07A50, 0.06);
      PUT(it, LP.box, [xf + 3 * m - (i + 0.5) * cell, RY0 + Hh + 0.6 * m + i * 0.12 * m, z + cell / 2], [0, 0, 0], [cell * 0.96, 0.4 * m, cell * 0.96], c);
    }
    if (endA) BX(it, xf - Dp / 2, RY0 + Hh / 2, za + 0.3 * m, Dp, Hh, 0.6 * m, jc(0x9B7650, 0.05));
    if (endB) BX(it, xf - Dp / 2, RY0 + Hh / 2, zb - 0.3 * m, Dp, Hh, 0.6 * m, jc(0x9B7650, 0.05));
  };

  const LEAF = [0x6F8F4A, 0x83994E, 0x5F7F45, 0xA3A04A, 0xC9A23A, 0xD3B24E];
  const platane = (it, x, y, z, s, auto) => {
    const h = rr(5.5, 7) * s;
    trunkSeg(it, x, y, x + rr(-0.4, 0.4), y + h, z, 0.36 * s, jc(0x9F9680, 0.08));
    for (let k = 0; k < 6; k++) { const a = rnd() * TAU, yy = y + rr(0.1, 0.9) * h; PUT(it, LP.ico0, [x + Math.cos(a) * 0.33 * s, yy, z + Math.sin(a) * 0.33 * s], [rnd(), rnd(), rnd()], [0.12 * s, 0.32 * s, 0.12 * s], jc(pick([0xC8C0A6, 0x8A8470, 0xB9B49A, 0x7F7C66]), 0.06)); }
    PUT(it, LP.ico0, [x, y + h * 0.55, z + 0.3 * s], [rnd(), 0, rnd()], [0.45 * s, 0.6 * s, 0.25 * s], jc(0x8E8470, 0.1));
    const R = rr(4.2, 5.4) * s, cy = y + h + R * 0.55;
    const base = auto > rnd() ? pick(LEAF.slice(3)) : pick(LEAF.slice(0, 3));
    PUT(it, LP.ico1, [x, cy, z], [0, rnd() * 3, 0], [R, R * 0.78, R], jc(base, 0.08));
    for (let k = 0; k < 5; k++) {
      const g = rnd() * TAU, cw = R * rr(0.45, 0.62);
      PUT(it, LP.ico1, [x + Math.cos(g) * R * 0.75, cy + rr(-0.3, 0.45) * R, z + Math.sin(g) * R * 0.75], [rnd(), rnd() * 3, 0], [cw, cw * 0.8, cw], jc(rnd() < 0.3 ? pick(LEAF) : base, 0.08));
    }
  };
  const reverbere = (it, x, y, z) => {
    const c = Cc(0x253229);
    PUT(it, LP.cyl, [x, y + 0.6 * MS, z], 0, [0.22 * MS, 1.2 * MS, 0.22 * MS], c);
    PUT(it, LP.cyl, [x, y + 2.6 * MS, z], 0, [0.09 * MS, 4.2 * MS, 0.09 * MS], c);
    BX(it, x, y + 4.75 * MS, z, 0.36 * MS, 0.1 * MS, 0.36 * MS, c);
    BX(it, x, y + 5.1 * MS, z, 0.3 * MS, 0.62 * MS, 0.3 * MS, Cc(0xF2EBD2));
    PUT(it, LP.roof, [x, y + 5.55 * MS, z], 0, [0.62 * MS, 0.3 * MS, 0.62 * MS], c);
  };
  const bouquiniste = (it, x, z) => {
    const g = jc(0x2A4F38, 0.04);
    BX(it, x, RY0 + 3.1 + 0.27 * MS, z, 0.75 * MS, 0.55 * MS, 1.9 * MS, g);
    extXY(it, [[x - 0.45 * MS, RY0 + 3.1 + 0.55 * MS], [x + 0.45 * MS, RY0 + 3.1 + 0.55 * MS], [x + 0.2 * MS, RY0 + 3.1 + 0.72 * MS], [x - 0.2 * MS, RY0 + 3.1 + 0.72 * MS]], z - MS, 2 * MS, g.clone().multiplyScalar(0.85));
  };
  const pont = (it, z0, wz) => {
    const st = Cc(0xD3C4A6), x0 = -351, x1 = -30, top = RY0 + 0.4, bot = WATER - 4;
    const holes = [];
    const n = 5, pier = 10, span = (x1 - x0 - 40 - (n - 1) * pier) / n;
    for (let k = 0; k < n; k++) {
      const xa = x0 + 20 + k * (span + pier), xc = xa + span / 2, ys = WATER + 6;
      const h = new THREE.Path();
      h.moveTo(xa + span, bot); h.lineTo(xa + span, ys);
      h.absellipse(xc, ys, span / 2, 15, 0, Math.PI, false);
      h.lineTo(xa, bot); h.lineTo(xa + span, bot);
      holes.push(h);
    }
    extXY(it, [[x0, bot], [x1, bot], [x1, top], [x0, top]], z0 - wz / 2, wz, st, holes);
    BX(it, (x0 + x1) / 2, top + 0.15 * MS, z0, x1 - x0, 0.3 * MS, wz + 1.2, Cc(0xE2D6BC));
    [-1, 1].forEach((s) => {
      BX(it, (x0 + x1) / 2, top + 0.9 * MS, z0 + s * (wz / 2 - 0.8), x1 - x0, 1.1 * MS, 1.6, Cc(0xDCCFB4));
      for (let x = x0 + 30; x < x1 - 10; x += 42) reverbere(it, x, top, z0 + s * (wz / 2 - 2.5));
    });
    BX(it, (x0 + x1) / 2, top + 0.02, z0, x1 - x0, 0.3, wz - 6, Cc(0x5A5D63));
  };
  const mkBoat = () => {
    const it = [], L = rr(28, 34) * MS, W = 6.5 * MS;
    extXY(it, [[-W / 2, 0], [W / 2, 0], [W / 2 + 0.3 * MS, 1.6 * MS], [-W / 2 - 0.3 * MS, 1.6 * MS]], -L / 2, L, Cc(0xF1F2F2));
    BX(it, 0, 0.5 * MS, 0, W + 0.05, 0.35 * MS, L + 0.05, Cc(0x2B3A55));
    BX(it, 0, 2.6 * MS, -L * 0.05, W - 0.6 * MS, 2.0 * MS, L * 0.78, Cc(0x9DB3C2));
    BX(it, 0, 3.7 * MS, -L * 0.05, W - 0.4 * MS, 0.18 * MS, L * 0.8, Cc(0xE9EAEA));
    for (let z = -L * 0.4; z < L * 0.33; z += 1.6 * MS) [-1, 1].forEach((s) => BX(it, s * (W / 2 - 0.25 * MS), 2.6 * MS, z, 0.1 * MS, 2.0 * MS, 0.12 * MS, Cc(0xE9EAEA)));
    BX(it, 0, 2.5 * MS, L * 0.42, 2.4 * MS, 1.8 * MS, 2.4 * MS, Cc(0xF1F2F2));
    return new THREE.Mesh(merge(it), facetMat);
  };

  const NT = 20, TL = SPAN / NT;
  for (let ti = 0; ti < NT; ti++) {
    const it = [], bridge = ti === 3 || ti === 13;
    for (let zl = 0; zl < TL; zl += 40) BX(it, -5.5, RY0 + 0.05, zl + 6, 0.5, 0.06, 12, Cc(0xE9E8E2));
    if (bridge) for (let k = 0; k < 7; k++) BX(it, 4 - k * 3.2, RY0 + 0.05, TL / 2 + 26, 1.7, 0.06, 9, Cc(0xEDECE6));
    for (let k = 0; k < 2; k++) { const z = k * TL / 2 + rr(8, 20); if (!bridge || Math.abs(z - TL / 2) > 40) platane(it, -23.5, RY0 + 0.25, z, MS * rr(0.95, 1.15), 0.05); }
    reverbere(it, -19, RY0 + 0.25, TL * 0.75);
    for (let zl = 2; zl < TL; zl += 4.6) BX(it, -29.37, RY0 + 1.4, zl, 0.06, 2.75, 0.12, Cc(0xBDB096));
    BX(it, -29.37, RY0 + 1.6, TL / 2, 0.06, 0.08, TL, Cc(0xC4B79D));
    BX(it, -17.2, RY0 + 0.13, TL / 2, 0.8, 0.3, TL, Cc(0xA9A49A));
    for (let zl = 3; zl < TL; zl += 12.5) { PUT(it, LP.cyl, [-18.4, RY0 + 1.4, zl], 0, [0.22, 2.3, 0.22], Cc(0x4A3E36)); PUT(it, LP.ico0, [-18.4, RY0 + 2.6, zl], 0, [0.28, 0.24, 0.28], Cc(0x4A3E36)); }
    for (let k = 0; k < 2; k++) { const z = (k + 0.5) * TL / 2 + rr(-4, 4); if (!bridge || Math.abs(z - TL / 2) > 38) platane(it, -357, RY0, z, MS * rr(0.8, 0.95), 0.08); }
    reverbere(it, -353, RY0, TL * 0.2);
    const row = (xf, dir, detail) => {
      let z = 0;
      const gap = bridge ? [TL / 2 - 22, TL / 2 + 22] : xf < -500 || xf > 0 ? null : ti === 7 ? [12, TL + 1] : ti === 8 ? [-1, 78] : ti === 10 ? [14, 86] : null;
      while (z < TL - 1) {
        let w = Math.min(TL - z, rr(8, 15) * MS);
        if (TL - z - w < 7 * MS) w = TL - z;
        if (gap && z < gap[1] && z + w > gap[0]) {
          if (z < gap[0]) { hauss(it, xf, dir, z, gap[0] - z, detail); }
          z = gap[1];
          continue;
        }
        hauss(it, xf, dir, z, w, detail);
        z += w;
      }
    };
    row(-405, 1, true);
    row(18, -1, true);
    row(-470 - rr(0, 20), 1, false);
    if (bridge) pont(it, TL / 2, 62);
    if (ti === 7) citeArts(it, -398, 14, TL, true, false);
    if (ti === 8) citeArts(it, -398, 0, 76, false, true);
    if (ti === 10) egliseComtoise(it, -405, TL / 2);
    const tile = new THREE.Mesh(merge(it), facetMat);
    mv(tile, ti * TL);
  }
  [[-170, 18, 0]].forEach((b, k) => {
    const g = mkBoat();
    g.position.set(b[0], WATER, 0);
    g.rotation.y = b[2];
    mv(g, 200 + k * 380, b[1]);
  });

  const farMovers = [];
  const FSPAN = 9600, FLO = -4800;
  const far = (g, z) => { farMovers.push({ g: g, z: z }); world.add(g); return g; };
  const TW = TAU / FSPAN;
  const wrapZ = (z, c) => ((z - c) % FSPAN + FSPAN * 1.5) % FSPAN - FSPAN / 2;
  const CTX = -1420, CTZ = -900, CH_ = 470;
  const hillA = (z) => 440 + 120 * Math.sin(z * TW * 2 + 0.4) + 60 * Math.sin(z * TW * 5 + 1.9) + 30 * Math.sin(z * TW * 11 + 0.7);
  const citMask = (x, z) => { const q = Math.max(Math.abs(x - CTX) / 95, Math.abs(wrapZ(z, CTZ)) / 240); return sstep(4.2, 1.1, q); };
  const Hh = (x, z) => {
    const u = sstep(-600, -1400, x);
    let h = hillA(z) * u * (1 - 0.3 * sstep(-2000, -2800, x)) * (1 - 0.45 * sstep(-2900, -4200, x));
    h += u * (16 * Math.sin(x * 0.013 + z * 0.007) + 10 * Math.sin(z * 0.0041 - x * 0.006 + 2.0));
    const cm = citMask(x, z);
    return h * (1 - cm) + CH_ * cm;
  };
  const GREEN = [0x2F5A2A, 0x3A6A30, 0x467634, 0x2A4F26, 0x56833A, 0x3E6F3A];
  const hillMat = new THREE.MeshToonMaterial({ color: 0xffffff, vertexColors: true, gradientMap: gm });
  hillMat.onBeforeCompile = (sh) => {
    sh.uniforms.uCurve = curveU;
    sh.vertexShader = 'uniform float uCurve;\n' + sh.vertexShader.replace('#include <project_vertex>',
      'vec4 cwp = modelMatrix * vec4( transformed, 1.0 );\n' +
      'cwp.y -= dot( cwp.xz, cwp.xz ) * uCurve * ( 1.0 - 0.72 * smoothstep( 0.0, 380.0, cwp.y ) );\n' +
      'vec4 mvPosition = viewMatrix * cwp;\n' +
      'gl_Position = projectionMatrix * mvPosition;');
  };
  hillMat.customProgramCacheKey = () => 'hill';
  const hillMesh = (g) => { const o = new THREE.Mesh(g, hillMat); o.userData.noCurve = true; o.frustumCulled = false; return o; };
  const gA = Cc(0x2B5227), gB = Cc(0x4A7A36), gC = Cc(0x5E8A3C), rock = Cc(0xC9C0AA), lawn = Cc(0x7FA052), foot = Cc(0x7E8A5E);
  const CHK = FSPAN / 24;
  for (let ci = 0; ci < 24; ci++) {
    const zc = FLO + (ci + 0.5) * CHK, it = [];
    const xs = []; for (let x = -412; x > -4300; x -= Math.max(16, Math.abs(x) * 0.028)) xs.push(x);
    const NZ = 24, NX = xs.length;
    const pos = new Float32Array(NX * (NZ + 1) * 3), nor = new Float32Array(NX * (NZ + 1) * 3), col = new Float32Array(NX * (NZ + 1) * 3);
    const tc = new THREE.Color();
    for (let i = 0; i < NX; i++) for (let j = 0; j <= NZ; j++) {
      const x = xs[i], zl = -CHK / 2 + (CHK * j) / NZ, zw = zc + zl, q = (i * (NZ + 1) + j) * 3;
      const h = Hh(x, zw), dx = (Hh(x - 4, zw) - Hh(x + 4, zw)) / 8, dz = (Hh(x, zw + 4) - Hh(x, zw - 4)) / 8;
      pos[q] = x; pos[q + 1] = h; pos[q + 2] = zl;
      const nl = Math.hypot(dx, 1, dz); nor[q] = dx / nl; nor[q + 1] = 1 / nl; nor[q + 2] = -dz / nl;
      const n = 0.5 + 0.25 * Math.sin(x * 0.013 + zw * 0.009) + 0.17 * Math.sin(x * 0.031 - zw * 0.024 + 1.3) + 0.08 * Math.sin(zw * 0.05 + x * 0.04) + 0.16 * Math.sin(x * 0.11 + zw * 0.07) * Math.sin(zw * 0.13 - x * 0.05);
      tc.copy(gA).lerp(gB, Math.min(1, n * 1.3));
      if (n > 0.72) tc.lerp(gC, (n - 0.72) * 3);
      const sl = Math.hypot(dx, dz);
      tc.lerp(foot, sstep(30, 2, h));
      tc.lerp(lawn, sstep(0.45, 0.85, citMask(x, zw)));
      col[q] = tc.r; col[q + 1] = tc.g; col[q + 2] = tc.b;
    }
    const idx = [];
    for (let i = 0; i < NX - 1; i++) for (let j = 0; j < NZ; j++) {
      const a0 = i * (NZ + 1) + j, b0 = (i + 1) * (NZ + 1) + j, c0 = a0 + 1, d0 = b0 + 1;
      idx.push(a0, b0, c0, b0, d0, c0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(idx);
    const grp = new THREE.Group();
    grp.add(hillMesh(g));
    for (let k = 0; k < 230; k++) {
      const x = rr(-650, -1700), zl = rr(-CHK / 2, CHK / 2), h = Hh(x, zc + zl);
      if (h < 25 || citMask(x, zc + zl) > 0.3) continue;
      const sl = Math.abs(Hh(x - 10, zc + zl) - h) / 10 + Math.abs(Hh(x, zc + zl + 10) - h) / 10;
      if (sl > 1.2) continue;
      const r = rr(8, 13) * (1 + Math.abs(x) / 2500);
      PUT(it, k % 3 ? LP.ico0 : LP.ico1, [x, h - r * 0.25, zl], [0, rnd() * 3, 0], [r, r * 0.75, r], jc(pick(GREEN), 0.06));
    }
    if (it.length) grp.add(hillMesh(merge(it)));
    grp.position.y = RY0 - 0.1;
    far(grp, zc);
  }
  const citadelle = (() => {
    const it = [], m = MS, st = jc(0xD6CAAE, 0.02), stD = Cc(0xB9AD92), wh = Cc(0xEDE6D6), slate = Cc(0x6A7078), tile = jc(0xA9593A, 0.04);
    const LX = 140, LZ = 400, Hw = 10 * m;
    [[0, -LZ / 2, LX, 4 * m], [0, LZ / 2, LX, 4 * m]].forEach((w) => BX(it, w[0], Hw / 2 - 6, w[1], w[2], Hw + 12, w[3], st));
    [-1, 1].forEach((s2) => BX(it, s2 * LX / 2, Hw / 2 - 6, 0, 4 * m, Hw + 12, LZ, st));
    [-1, 1].forEach((s2) => {
      BX(it, s2 * (LX / 2 + 0.1), Hw - 5, 0, 4.4 * m, 1.2 * m, LZ, stD);
      [-1, 1].forEach((e) => BX(it, s2 * 38, Hw / 2 - 8, e * (LZ / 2 + 30), 70, Hw + 14, 70, st, [0, Math.PI / 4, 0]));
    });
    [[-30, -60, 140], [30, -60, 140], [0, 110, 90]].forEach((b) => {
      BX(it, b[0], 7 * m, b[1], 12 * m, 14 * m, b[2], wh);
      extXY(it, [[b[0] + 6.6 * m, 13.9 * m], [b[0], 18.5 * m], [b[0] - 6.6 * m, 13.9 * m]], b[1] - b[2] / 2 - 0.5, b[2] + 1, slate);
      for (let z = b[1] - b[2] / 2 + 8; z < b[1] + b[2] / 2 - 6; z += 12) [3.5, 9].forEach((y) => BX(it, b[0] + 6.05 * m, y * m, z, 0.1 * m, 1.8 * m, 1.1 * m, WIN));
    });
    BX(it, 0, 6 * m, 40, 14 * m, 12 * m, 26 * m, wh);
    prismX(it, -7.5 * m, 7.5 * m, 40, 27 * m, 11.8 * m, 5 * m, tile);
    BX(it, 6 * m, 15 * m, 40, 4 * m, 30 * m, 4 * m, wh);
    PUT(it, LP.roof, [6 * m, 33 * m, 40], 0, [4 * m, 6 * m, 4 * m], slate);
    return hillMesh(merge(it));
  })();
  citadelle.position.set(CTX, RY0 - 0.1 + CH_, 0);
  far(citadelle, CTZ);

  return { farMovers, rotors: [], FSPAN, FLO }
}
