import { useEffect, useMemo } from 'react'
import gsap from 'gsap'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const HOME = new THREE.Vector3(-0.54, 0, -0.22)
export const gaze = HOME.clone()
const SCALE = 2.5
const BRIGHT = 1.5
const LEAN = 0.3
const WRISTS = [
  [-2.55, 1.66, 3.0],
  [2.55, 1.66, 3.0],
]

function build() {
  const gc = document.createElement('canvas')
  gc.width = gc.height = 128
  const gx = gc.getContext('2d')
  const img = gx.createImageData(128, 128)
  for (let i = 0; i < 128 * 128; i++) {
    const v = 226 + Math.random() * 29
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255
  }
  gx.putImageData(img, 0, 0)
  const grain = new THREE.CanvasTexture(gc)
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping
  grain.repeat.set(3, 3)

  const gm = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat)
  gm.minFilter = THREE.NearestFilter
  gm.magFilter = THREE.NearestFilter
  gm.generateMipmaps = false
  gm.needsUpdate = true
  const toon = (c, extra) => {
    const m = new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: gm, map: grain, toneMapped: false }, extra || {}))
    m.color.multiplyScalar(BRIGHT)
    return m
  }
  const flat = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false })

  const M = {
    teal: toon(0x1fae9f),
    tealSide: toon(0x138c84),
    white: flat(0xfcfaf3),
    pupil: toon(0x2b1913, { map: null }),
    mouth: flat(0x0f5a57),
    mouthIn: flat(0x177571),
    brow: flat(0x0f6460),
    cap: toon(0xa884f7, { side: THREE.DoubleSide }),
    visor: toon(0x8b5fef, { side: THREE.DoubleSide }),
    visorUnder: toon(0x6a44d8, { side: THREE.DoubleSide }),
    seam: flat(0x7350dc),
    boot: toon(0xf2581f),
    sole: toon(0xc93e12),
    lace: toon(0xffb27a),
    sock: toon(0xff8c2e),
    sockBand: toon(0xffb066),
  }
  const peach = new THREE.Color(0xf9c48e)
  const orange = new THREE.Color(0xff7a2e)

  const sph = new THREE.SphereGeometry(1, 32, 20)
  const add = (geo, mat, parent, pos, scale, rot) => {
    const m = new THREE.Mesh(geo, mat)
    if (pos) m.position.set(pos[0], pos[1], pos[2])
    if (scale) m.scale.set(scale[0], scale[1], scale[2])
    if (rot) m.rotation.set(rot[0], rot[1], rot[2])
    parent.add(m)
    return m
  }

  const root = new THREE.Group()
  root.userData.pupils = []
  const char = new THREE.Group()
  char.scale.setScalar(SCALE)
  root.add(char)
  const torso = new THREE.Group()
  torso.rotation.x = LEAN
  char.add(torso)
  const squash = new THREE.Group()
  torso.add(squash)

  const BW = 0.68, BH = 1.05, BR = 0.36
  const s = new THREE.Shape()
  s.moveTo(-BW + BR, -BH); s.lineTo(BW - BR, -BH); s.quadraticCurveTo(BW, -BH, BW, -BH + BR)
  s.lineTo(BW, BH - BR); s.quadraticCurveTo(BW, BH, BW - BR, BH)
  s.lineTo(-BW + BR, BH); s.quadraticCurveTo(-BW, BH, -BW, BH - BR)
  s.lineTo(-BW, -BH + BR); s.quadraticCurveTo(-BW, -BH, -BW + BR, -BH)
  const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.13, bevelSegments: 8, curveSegments: 20 })
  bodyGeo.translate(0, 1.18, -0.25)
  add(bodyGeo, [M.teal, M.tealSide], squash)
  const FZ = 0.45
  const TOP = 2.36

  ;[
    { x: -0.32, y: 1.56, rx: 0.29, ry: 0.37, px: -0.05 },
    { x: 0.33, y: 1.58, rx: 0.33, ry: 0.41, px: -0.08 },
  ].forEach((e) => {
    const eg = new THREE.Group()
    eg.position.set(e.x, e.y, 0)
    squash.add(eg)
    add(sph, M.white, eg, [0, 0, FZ - 0.02], [e.rx, e.ry, 0.1])
    const pupil = add(sph, M.pupil, eg, [e.px, -0.1, FZ + 0.035], [e.rx * 0.62, e.ry * 0.64, 0.07])
    root.userData.pupils.push({ eg, pupil, rx: e.rx, ry: e.ry, base: pupil.scale.clone() })
  })
  const bs = new THREE.Shape()
  bs.moveTo(-0.17, -0.05)
  bs.quadraticCurveTo(0, 0.19, 0.17, -0.05)
  bs.quadraticCurveTo(0, 0.07, -0.17, -0.05)
  const brow = add(new THREE.ShapeGeometry(bs, 20), M.brow, squash, [-0.34, 2.02, FZ + 0.012], [1.05, 0.95, 1], [0, 0, 0.16])
  const ms = new THREE.Shape()
  ms.moveTo(-0.18, 0.06)
  ms.quadraticCurveTo(0, 0.0, 0.18, 0.06)
  ms.bezierCurveTo(0.15, -0.13, -0.15, -0.13, -0.18, 0.06)
  const mouthG = new THREE.Group()
  mouthG.position.set(-0.06, 1.12, 0)
  mouthG.rotation.z = 0.12
  squash.add(mouthG)
  add(new THREE.ShapeGeometry(ms, 16), M.mouth, mouthG, [0, -0.04, FZ + 0.004])
  const mi = new THREE.Shape()
  mi.moveTo(-0.08, -0.07)
  mi.quadraticCurveTo(0, -0.02, 0.09, -0.06)
  mi.quadraticCurveTo(0.02, -0.14, -0.08, -0.07)
  add(new THREE.ShapeGeometry(mi, 12), M.mouthIn, mouthG, [0, -0.04, FZ + 0.008])

  const head = new THREE.Group()
  head.position.set(0, TOP, 0)
  torso.add(head)
  const hairBase = toon(0xf9c48e)
  const hairMat = toon(0xffffff, { vertexColors: true })
  const HE = 0.055, BTOP = -0.13, YC = -0.34
  const CX = BW - BR, CY = BTOP - BR, RR = BR + HE
  const a2 = Math.asin((YC - CY) / RR), N = 14
  const hsh = new THREE.Shape()
  hsh.moveTo(-CX - RR * Math.cos(a2), YC)
  for (let i = 1; i <= N; i++) {
    const a = Math.PI - a2 + (a2 - Math.PI / 2) * (i / N)
    hsh.lineTo(-CX + RR * Math.cos(a), CY + RR * Math.sin(a))
  }
  for (let i = 1; i <= N; i++) {
    const a = Math.PI / 2 - (Math.PI / 2 - a2) * (i / N)
    hsh.lineTo(CX + RR * Math.cos(a), CY + RR * Math.sin(a))
  }
  hsh.closePath()
  const hairGeo = new THREE.ExtrudeGeometry(hsh, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.2 + HE, bevelSize: 0.13, bevelSegments: 8, curveSegments: 12 })
  hairGeo.translate(0, 0, -0.25)
  const hp = hairGeo.attributes.position
  for (let i = 0; i < hp.count; i++) {
    const y = hp.getY(i)
    if (y > YC + 0.15) continue
    const u = Math.max(0, Math.min(1, (hp.getZ(i) + 0.08) / 0.5))
    hp.setY(i, y + 0.2 * u * u * (3 - 2 * u))
  }
  hairGeo.computeVertexNormals()
  add(hairGeo, hairBase, head, null, null, [-0.07, 0, 0])

  const NR = 18, NS = 12
  const mkLock = (o) => {
    const g = new THREE.BufferGeometry()
    const n = (NR + 1) * NS
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), uv = new Float32Array(n * 2)
    const idx = []
    const c = new THREE.Color()
    const seg = o.len / NR
    let x = 0, y = 0
    for (let i = 0; i <= NR; i++) {
      const u = i / NR
      const th = o.rz + o.curve * u
      if (i > 0) { x += -Math.sin(th) * seg; y += Math.cos(th) * seg }
      const w = Math.max(0.004, o.w * Math.pow(1 - u, 0.65) * (0.72 + 0.28 * Math.sin((Math.min(1, u * 3) * Math.PI) / 2)))
      const th2 = Math.max(0.004, o.t * Math.pow(1 - u, 0.6))
      const nx = Math.cos(th), ny = Math.sin(th)
      for (let j = 0; j < NS; j++) {
        const k = i * NS + j
        const ph = (j / NS) * Math.PI * 2
        const cw = Math.cos(ph) * w
        pos[k * 3] = x + cw * nx
        pos[k * 3 + 1] = y + cw * ny
        pos[k * 3 + 2] = Math.sin(ph) * th2
        const side = (1 - Math.cos(ph)) / 2
        const lo = Math.max(0, Math.min(1, (side - 0.32) / 0.4))
        const mix = Math.min(1, lo * lo * (3 - 2 * lo) * (0.55 + 0.45 * u) + 0.2 * u * u)
        c.lerpColors(peach, orange, mix * (o.or == null ? 1 : o.or))
        col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b
        uv[k * 2] = (j / NS) * 2; uv[k * 2 + 1] = u * 3
        if (i < NR) {
          const b = i * NS + ((j + 1) % NS)
          idx.push(k, k + NS, b, b, k + NS, b + NS)
        }
      }
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    const m = new THREE.Mesh(g, hairMat)
    m.position.set(o.p[0], o.p[1], o.p[2])
    head.add(m)
  }
  mkLock({ p: [0.3, 0.14, -0.1], rz: 0.5, curve: 0.75, len: 1.0, w: 0.39, t: 0.18 })
  mkLock({ p: [0.2, 0.12, 0.24], rz: 0.82, curve: 0.75, len: 1.5, w: 0.47, t: 0.19 })
  mkLock({ p: [0.06, 0.04, 0.12], rz: 1.18, curve: 0.7, len: 1.38, w: 0.44, t: 0.18 })
  mkLock({ p: [-0.1, -0.04, 0.0], rz: 1.5, curve: 0.55, len: 1.1, w: 0.39, t: 0.17 })
  mkLock({ p: [0.34, 0.04, 0.47], rz: Math.PI - 0.6, curve: -0.4, len: 0.58, w: 0.31, t: 0.07, or: 0.5 })

  const cap = new THREE.Group()
  cap.position.set(0.42, 0.1, -0.1)
  cap.rotation.order = 'ZXY'
  cap.rotation.set(0.1, 1.1, -0.5)
  head.add(cap)
  const capDome = new THREE.Group()
  capDome.rotation.y = -1.35
  capDome.scale.set(1.12, 1.08, 1.14)
  capDome.position.y = -0.04
  cap.add(capDome)
  add(new THREE.SphereGeometry(0.72, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), M.cap, capDome, null, [1, 0.74, 0.8])
  add(sph, M.visor, capDome, [0, 0.53, 0], [0.07, 0.04, 0.07])
  const visor = new THREE.Group()
  visor.position.set(0.52, 0.02, 0.04)
  visor.rotation.set(0, -0.5, -0.08)
  cap.add(visor)
  add(new THREE.CylinderGeometry(0.6, 0.6, 0.045, 40, 1, false, 0, Math.PI), M.visor, visor, null, [1.15, 1, 0.95])
  add(new THREE.CylinderGeometry(0.6, 0.6, 0.02, 40, 1, false, 0, Math.PI), M.visorUnder, visor, [0, -0.03, 0], [1.13, 1, 0.93])
  const seams = new THREE.Group()
  seams.scale.set(1, 0.74, 0.8)
  capDome.add(seams)
  ;[0, Math.PI / 3, -Math.PI / 3].forEach((a) => add(new THREE.TorusGeometry(0.722, 0.012, 6, 56, Math.PI), M.seam, seams, null, null, [0, a, 0]))
  add(new THREE.TorusGeometry(0.72, 0.035, 8, 56), M.visor, seams, [0, 0.03, 0], null, [Math.PI / 2, 0, 0])

  const HPM = { band: toon(0x168a83), cup: toon(0x1fae9f), rim: toon(0xf0b232), pad: toon(0x116e69) }
  const phones = new THREE.Group()
  head.add(phones)
  const CUPY = -0.7, CUPZ = -0.12
  ;[-1, 1].forEach((g) => {
    const cup = new THREE.Group()
    cup.position.set(g * 0.86, CUPY, CUPZ)
    cup.rotation.z = Math.PI / 2
    phones.add(cup)
    add(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 30), HPM.pad, cup, [0, g * 0.02, 0])
    add(new THREE.CylinderGeometry(0.31, 0.33, 0.2, 30), HPM.cup, cup, [0, g * -0.12, 0])
    add(new THREE.TorusGeometry(0.31, 0.065, 10, 32), HPM.rim, cup, [0, g * -0.13, 0], null, [Math.PI / 2, 0, 0])
  })
  const bandCurve = new THREE.CatmullRomCurve3(
    [[-0.9, CUPY + 0.3], [-0.95, -0.02], [-0.8, 0.38], [-0.42, 0.72], [0.12, 0.84], [0.62, 0.78], [1.02, 0.54], [1.32, 0.14], [1.3, -0.22], [1.1, CUPY + 0.3]].map(
      (p) => new THREE.Vector3(p[0], p[1], CUPZ)
    )
  )
  add(new THREE.TubeGeometry(bandCurve, 80, 0.075, 10, false), HPM.band, phones)
  ;[-0.9, 1.1].forEach((x) => add(sph, HPM.band, phones, [x, CUPY + 0.3, CUPZ], [0.085, 0.085, 0.085]))

  const DOWN = new THREE.Vector3(0, -1, 0)
  const solveArm = (g1, g2, Sp, Hp, l1, l2, pole) => {
    const eA = Hp.clone().sub(Sp)
    const dd = Math.max(1e-3, Math.min(eA.length(), l1 + l2 - 1e-3))
    eA.normalize()
    const aa = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd)
    const hh = Math.sqrt(Math.max(0, l1 * l1 - aa * aa))
    const eB = pole.clone().addScaledVector(eA, -pole.dot(eA)).normalize()
    const eC = Sp.clone().addScaledVector(eA, aa).addScaledVector(eB, hh)
    const qA = new THREE.Quaternion().setFromUnitVectors(DOWN, eC.clone().sub(Sp).normalize())
    g1.quaternion.copy(qA)
    g2.quaternion.setFromUnitVectors(DOWN, Hp.clone().sub(eC).normalize().applyQuaternion(qA.invert()))
  }

  const hips = [-0.4, 0.4].map((x) => {
    const hip = new THREE.Group()
    hip.position.set(x, 0.14, 0)
    torso.add(hip)
    add(new THREE.CapsuleGeometry(0.12, 0.3, 6, 14), M.teal, hip, [0, -0.2, 0])
    const knee = new THREE.Group()
    knee.position.y = -0.42
    hip.add(knee)
    add(sph, M.teal, knee, null, [0.12, 0.12, 0.12])
    add(new THREE.CapsuleGeometry(0.11, 0.28, 6, 14), M.teal, knee, [0, -0.18, 0])
    const ankle = new THREE.Group()
    ankle.position.y = -0.4
    knee.add(ankle)
    add(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 20), M.sock, ankle, [0, -0.02, 0])
    add(new THREE.CylinderGeometry(0.155, 0.155, 0.05, 20), M.sockBand, ankle, [0, 0.04, 0])
    const boot = new THREE.Group()
    boot.position.set(0, -0.17, 0.08)
    ankle.add(boot)
    add(new THREE.CapsuleGeometry(0.23, 0.3, 6, 18), M.boot, boot, [0, 0.0, 0.06], [1, 0.85, 1], [Math.PI / 2, 0, 0])
    add(sph, M.sole, boot, [0, -0.14, 0.06], [0.25, 0.08, 0.46])
    add(new THREE.CapsuleGeometry(0.022, 0.14, 4, 8), M.lace, boot, [0, 0.155, 0.12], null, [0, 0, Math.PI / 2])
    add(new THREE.CapsuleGeometry(0.022, 0.12, 4, 8), M.lace, boot, [0, 0.125, 0.22], null, [0, 0, Math.PI / 2])
    return hip
  })
  const arms = []
  WRISTS.forEach(([wx, wy, wz]) => {
    const side = Math.sign(wx)
    const sh = new THREE.Group()
    const S = new THREE.Vector3(side * (BW + 0.08), 1.02, 0.02)
    sh.position.copy(S)
    torso.add(sh)
    add(new THREE.CapsuleGeometry(0.13, 0.42, 6, 16), M.teal, sh, [0, -0.25, 0])
    const el = new THREE.Group()
    el.position.y = -0.52
    sh.add(el)
    add(sph, M.teal, el, null, [0.13, 0.13, 0.13])
    add(new THREE.CapsuleGeometry(0.12, 0.36, 6, 16), M.teal, el, [0, -0.22, 0])
    const hand = new THREE.Group()
    hand.position.y = -0.46
    el.add(hand)
    add(sph, M.teal, hand, [0, -0.1, 0], [0.18, 0.19, 0.1])
    ;[-0.12, -0.04, 0.04, 0.12].forEach((x) => {
      add(new THREE.CapsuleGeometry(0.05, 0.12, 4, 10), M.teal, hand, [x * 1.15, -0.3 + Math.abs(x) * 0.35, 0], null, [0, 0, x * 1.8])
    })
    add(new THREE.CapsuleGeometry(0.055, 0.1, 4, 10), M.teal, hand, [side * 0.19, -0.06, 0.02], null, [0, 0, side * 1.0])
    arms.push({ sh, el, hand, S, W: new THREE.Vector3(wx, wy, wz), pole: new THREE.Vector3(side, -0.6, -0.4).normalize() })
  })

  const H = new THREE.Vector3(), d = new THREE.Vector3(), e = new THREE.Vector3(), q = new THREE.Quaternion(), m4 = new THREE.Matrix4()
  const Z = new THREE.Vector3(0, -1, 0)
  root.userData.pose = () => {
    root.updateMatrixWorld(true)
    arms.forEach(({ sh, el, hand, S, W, pole }) => {
      torso.worldToLocal(root.localToWorld(H.copy(W)))
      solveArm(sh, el, S, H, 0.52, 0.46, pole)
      sh.updateMatrixWorld(true)
      hand.getWorldPosition(d).sub(el.getWorldPosition(e))
      d.y = 0
      d.normalize().negate()
      m4.makeBasis(e.copy(d).cross(Z), d, Z)
      hand.quaternion.copy(el.getWorldQuaternion(q).invert().multiply(new THREE.Quaternion().setFromRotationMatrix(m4)))
    })
  }
  root.userData.pose()

  char.traverse((o) => {
    if (!o.isMesh) return
    o.castShadow = true
    o.raycast = () => {}
  })
  Object.assign(root.userData, { torso, squash, mouthG, hips, arms, brow, state: { look: null, surprise: 0, shiver: 0 } })
  return root
}

export function Mascot({ dive, onHole, onDone }) {
  const model = useMemo(build, [])

  useEffect(() => {
    if (!dive) return
    const { arms, hips, state: st } = model.userData
    const [A, B] = arms
    const limbs = [A.sh.scale, B.sh.scale, ...hips.map((h) => h.scale)]
    const end = model.parent.worldToLocal(new THREE.Vector3(...dive))
    const start = model.position.clone().add(new THREE.Vector3(0, 2.7, 0.9))
    const arc = { p: 0 }
    const fly = () => {
      model.position.lerpVectors(start, end, arc.p)
      model.position.y += Math.sin(arc.p * Math.PI) * 3.2
    }
    const tl = gsap.timeline()
    const snap = { x: 0.45, y: 0.45, z: 0.45, duration: 0.09, ease: 'back.out(3)' }
    tl.call(() => (st.look = A.hand))
    tl.call(() => onHole(), null, 0.1)
    tl.to(A.sh.scale, snap, 0.15)
    tl.to(st, { surprise: 0.6, duration: 0.15, ease: 'power2.out' }, 0.2)
    tl.call(() => (st.look = B.hand), null, 0.45)
    tl.to(B.sh.scale, snap, 0.6)
    tl.to(st, { surprise: 1, duration: 0.15 }, 0.65)
    tl.call(() => (st.look = null), null, 0.8)
    tl.to(st, { shiver: 1, duration: 0.15 }, 0.8)
    tl.to(hips[0].scale, snap, 0.85)
    tl.to(hips[1].scale, snap, 0.97)
    tl.to(model.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 0.12, ease: 'back.in(2.5)' }, 1.08)
    tl.to(model.position, { x: start.x, y: start.y, z: start.z, duration: 0.12, ease: 'power3.in' }, 1.08)
    tl.to(limbs, { x: 1, y: 1, z: 1, duration: 0.12 }, 1.08)
    tl.to(st, { shiver: 0, duration: 0.3 }, 1.3)
    tl.call(() => gaze.set(...dive), null, 1.3)
    tl.to(model.scale, { x: 0.13, y: 0.065, z: 0.13, duration: 0.18, ease: 'power2.out' }, 1.45)
    tl.to(model.scale, { x: 0.08, y: 0.13, z: 0.08, duration: 0.12, ease: 'power3.in' })
    tl.to(arc, { p: 0.5, duration: 0.42, ease: 'power2.out', onUpdate: fly }, '<')
    tl.to(arc, { p: 1, duration: 0.38, ease: 'power3.in', onUpdate: fly })
    tl.to(model.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 0.3, ease: 'power1.out' }, '<-0.3')
    tl.to(model.rotation, { x: Math.PI * 0.95, duration: 0.75, ease: 'power2.inOut' }, '<-0.1')
    tl.to(model.position, { y: end.y - 0.6, duration: 0.14, ease: 'power2.in' })
    tl.to(model.scale, { x: 0, y: 0, z: 0, duration: 0.14, onComplete: onDone }, '<')
    return () => tl.kill()
  }, [dive])

  const v = useMemo(() => new THREE.Vector3(), [])
  const turn = useMemo(() => ({ y: 0, at: -1, next: 2 }), [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const k = 1 - Math.exp(-dt * 8)
    const { torso, squash, mouthG, hips, pose, brow, state: st } = model.userData
    if (st.look) st.look.getWorldPosition(gaze)
    model.worldToLocal(v.copy(gaze))
    const ty = THREE.MathUtils.clamp(Math.atan2(v.x, v.z) * 0.6, -0.3, 0.3)
    turn.y += (ty - turn.y) * (1 - Math.exp(-dt * 4))
    const sh = st.shiver * 0.02
    torso.rotation.set(LEAN + Math.sin(t * 1.4) * 0.025 + Math.sin(t * 47) * sh, turn.y + Math.sin(t * 0.5) * 0.04, Math.sin(t * 0.8) * 0.04 - turn.y * 0.15 + Math.sin(t * 53) * sh)
    squash.scale.set(1 - Math.sin(t * 2.6) * 0.012, 1 + Math.sin(t * 2.6) * 0.02, 1)
    mouthG.scale.set(1 - 0.15 * st.surprise, (0.85 + 0.15 * Math.sin(t * 2.1)) * (1 + 0.5 * st.surprise), 1)
    brow.position.y = 2.02 + 0.05 * st.surprise
    if (t > turn.next) {
      turn.at = t
      turn.next = t + 2.5 + Math.random() * 2.5
    }
    const b = (t - turn.at) / 0.15
    const lid = b >= 0 && b < 1 ? Math.max(0.06, Math.abs(1 - 2 * b)) : 1
    if (model.scale.x < 0.01) return
    hips.forEach((h) => h.rotation.set(-torso.rotation.x, 0, -torso.rotation.z))
    pose()
    model.userData.pupils.forEach(({ eg, pupil, rx, ry, base }) => {
      eg.worldToLocal(v.copy(gaze)).sub(pupil.position.clone().setX(0).setY(0)).normalize()
      pupil.position.x += (v.x * rx * 0.55 - pupil.position.x) * k
      pupil.position.y += (v.y * ry * 0.55 - pupil.position.y) * k
      eg.scale.set(1 + 0.06 * st.surprise, lid * (1 + 0.1 * st.surprise), 1)
      pupil.scale.set(base.x * (1 - 0.15 * st.surprise), base.y * (1 - 0.15 * st.surprise), base.z)
    })
  })
  return <primitive object={model} />
}
