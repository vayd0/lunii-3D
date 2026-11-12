'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { AdditiveBlending, CatmullRomCurve3, Color, ExtrudeGeometry, LinearSRGBColorSpace, Path, Shape, TOUCH, Vector2, Vector3, WebGLRenderTarget } from 'three'
import gsap from 'gsap'
import regions from './data/regions.json'
import { specialties } from './extras'
import { Decor, project } from './decor'
import { Ink, P, Toon } from './toon'
import { HOME, Mascot, gaze } from './mascot'
import { buildVoiture } from './voiture'
import { Room } from './room'
import { Points, load, save } from './points'
import { Login } from './login'
import { Player, unlockStory } from './player'

const DEPTH = 0.45
const PHONE = typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches
const SHADOW = PHONE ? 1024 : 2048
const SPOT = { power: 190, spread: 35, soft: 0, beam: 100 }
const GREENS = ['#9be27a', '#b4ec8c', '#8fdc84', '#c3f09a', '#a6e690', '#7fd58a', '#b9ea7e', '#94e09b', '#cdf2a4', '#a0e283', '#88d891', '#bdee95', '#acea9c']

function centroid(ring) {
  let a = 0,
    x = 0,
    y = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i],
      [x1, y1] = ring[i + 1]
    const c = x0 * y1 - x1 * y0
    a += c
    x += (x0 + x1) * c
    y += (y0 + y1) * c
  }
  return { area: Math.abs(a / 2), point: [x / (3 * a), y / (3 * a)] }
}

function build({ geometry }) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  let best = { area: 0 }
  const shapes = polygons.map(([outer, ...holes]) => {
    const ring = outer.map(project)
    const c = centroid(ring)
    if (c.area > best.area) best = { ...c, ring }
    const shape = new Shape(ring.map(([x, y]) => ({ x, y })))
    shape.holes = holes.map((h) => new Path(h.map(project).map(([x, y]) => ({ x, y }))))
    return shape
  })
  return { geometry: new ExtrudeGeometry(shapes, { depth: DEPTH, bevelEnabled: false }), center: best.point, ring: best.ring, area: best.area }
}

function Suck({ center, focus, go, delay = 0, lift = 0.9, soft, children }) {
  const ref = useRef()
  useEffect(() => {
    if (!go) return
    const g = ref.current
    const [x, y, z] = focus
    const tl = gsap.timeline({ delay: delay * 0.6 }).timeScale(1.6)
    if (soft) {
      tl.to(g.scale, { x: 0, y: 0, z: 0, duration: 0.9, ease: 'power2.inOut' })
      tl.to(g.position, { x, y: y - 0.3, z, duration: 0.9, ease: 'power2.inOut' }, '<')
      return () => tl.kill()
    }
    tl.to(g.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.22, ease: 'back.in(1.7)' })
    tl.to(g.position, { x, z, duration: 0.3, ease: 'power2.inOut' })
    tl.to(g.position, { y: y + lift, duration: 0.3, ease: 'power2.out' }, '<')
    tl.to(g.rotation, { y: '+=2', duration: 0.5, ease: 'power1.in' }, '<')
    tl.to(g.position, { y: y - 0.8, duration: 0.2, ease: 'power3.in' })
    tl.to(g.scale, { x: 0, y: 0, z: 0, duration: 0.2, ease: 'power2.in' }, '<')
    return () => tl.kill()
  }, [go])
  return (
    <group ref={ref} position={center}>
      <group position={center.map((v) => -v)}>{children}</group>
    </group>
  )
}

function Hole({ r }) {
  return (
    <group rotation-x={-Math.PI / 2}>
      <mesh raycast={() => null} userData={{ hole: true }}>
        <ringGeometry args={[r, r * 1.14, 48]} />
        <meshBasicMaterial color="#7731ff" toneMapped={false} />
      </mesh>
      <mesh position-z={0.002} raycast={() => null} userData={{ hole: true }}>
        <circleGeometry args={[r, 48]} />
        <meshBasicMaterial color="#1a1030" toneMapped={false} />
      </mesh>
      <mesh position-z={0.004} raycast={() => null} userData={{ hole: true }}>
        <circleGeometry args={[r * 0.72, 48]} />
        <meshBasicMaterial color="#05030a" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Region({ feature, color, selected, focus, open, inside, onSelect, onHover, onLeave, hovered, locked, visited }) {
  const ref = useRef()
  const pivot = useRef()
  const special = useRef()
  const hole = useRef()
  const code = feature.properties.code
  const { geometry, center, ring, area } = useMemo(() => build(feature), [feature])
  const r = Math.min(0.6, Math.max(0.25, Math.sqrt(area) * 0.28))
  const at = [center[0], DEPTH, -center[1]]
  const Specialty = specialties[code]
  const active = selected === code
  const enter = (e) => {
    e.stopPropagation()
    if (!selected && !locked) onHover(code, at)
  }
  const leave = (e) => {
    e.stopPropagation()
    onLeave(code)
  }

  useEffect(() => {
    if (selected) return
    const y = hovered ? 0.3 : 0
    if (hovered) gaze.set(...at)
    else if (gaze.x === at[0] && gaze.z === at[2]) gaze.copy(HOME)
    gsap.to(ref.current.position, { y, duration: 0.4, ease: 'power2.out', overwrite: true })
    if (hovered) {
      gsap.fromTo(special.current.rotation, { y: 0 }, { y: Math.PI * 2, duration: 0.9, ease: 'back.out(1.4)', overwrite: true })
      gsap.fromTo(special.current.scale, { x: 1, y: 1, z: 1 }, { x: 1.35, y: 1.35, z: 1.35, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: true })
    }
  }, [hovered])

  const click = (e) => {
    e.stopPropagation()
    if (!selected && !locked) onSelect(code, at, Math.sqrt(area))
  }

  useEffect(() => {
    if (!active) return
    gaze.set(...at)
    gsap.to(ref.current.position, { y: 0, duration: 0.3, overwrite: true })
    gsap.to(special.current.scale, { x: 0, y: 0, z: 0, duration: 0.25, delay: 0.6, ease: 'back.in(2)', overwrite: true })
  }, [active])

  useEffect(() => {
    if (active && open) gsap.fromTo(hole.current.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(2.5)' })
  }, [active, open])

  useEffect(() => {
    if (inside && active) gsap.fromTo(hole.current.scale, { x: 1.2, y: 1.2, z: 1.2 }, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' })
  }, [inside])

  return (
    <>
    <Suck center={at} focus={focus} go={inside} delay={active ? 0 : 0.05 + Math.hypot(at[0] - focus[0], at[2] - focus[2]) * 0.035}>
    <group ref={ref} onPointerEnter={enter} onPointerLeave={leave} onClick={click}>
      <mesh geometry={geometry} rotation-x={-Math.PI / 2} castShadow receiveShadow>
        <Toon attach="material-0" color={color} striped={visited} />
        <Toon attach="material-1" color="#7731ff" />
        <Ink thickness={0.015} />
      </mesh>
      {hovered && !selected && (
        <Html position={[at[0], DEPTH + 1.3, at[2]]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="badge">
            <div>{feature.properties.nom}</div>
          </div>
        </Html>
      )}
      <group ref={special} position={at}>
        <group scale={1.4}>{Specialty && <Specialty />}</group>
      </group>
      <group position-y={DEPTH}>
        <Decor ring={ring} area={area} center={center} seed={Number(code)} striped={visited} />
      </group>
    </group>
    </Suck>
    <group ref={hole} position={[at[0], DEPTH + 0.003, at[2]]} scale={0}>
      <Hole r={r} />
    </group>
    </>
  )
}

const TABLE = { w: 13, d: 11, t: 0.5, x: -0.2, z: 0.3, legs: 3.6 }
const PLANKS = 7
const TABLE_CENTER = [TABLE.x, 0, TABLE.z]

function Beetle(props) {
  const red = '#e8433a'
  return (
    <group {...props}>
      <P color={red} line={0.012} position={[0, 0.22, 0]} scale={[0.3, 0.17, 0.5]}>
        <sphereGeometry args={[1, 24, 16]} />
      </P>
      <P color={red} line={0.012} position={[0, 0.3, -0.04]} scale={[0.24, 0.22, 0.29]}>
        <sphereGeometry args={[1, 24, 16]} />
      </P>
      <P color="#bfe3f4" line={0.008} position={[0, 0.4, -0.04]} scale={[0.245, 0.12, 0.295]}>
        <sphereGeometry args={[1, 24, 16]} />
      </P>
      <P color={red} line={0.01} position={[0, 0.47, -0.05]} scale={[0.2, 0.08, 0.24]}>
        <sphereGeometry args={[1, 24, 16]} />
      </P>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <group key={`${sx}${sz}`} position={[sx * 0.26, 0.11, sz * 0.31]}>
            <P color={red} line={0.01} scale={[0.1, 0.1, 0.15]} position-y={0.04}>
              <sphereGeometry args={[1, 14, 10]} />
            </P>
            <P color="#24262c" line={0.008} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.1, 0.1, 0.07, 14]} />
            </P>
            <P color="#d9dce2" line={0} position-x={sx * 0.036} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.05, 0.05, 0.01, 12]} />
            </P>
          </group>
        ))
      )}
      {[-1, 1].map((sx) => (
        <P key={sx} color="#fff3c4" line={0.006} position={[sx * 0.15, 0.24, 0.46]} scale={0.05}>
          <sphereGeometry args={[1, 10, 8]} />
        </P>
      ))}
      {[1, -1].map((sz) => (
        <P key={sz} color="#c9ced4" line={0.006} position={[0, 0.12, sz * 0.5]} scale={[0.5, 0.03, 0.03]}>
          <boxGeometry />
        </P>
      ))}
    </group>
  )
}

function Table() {
  const { w, d, t, x, z, legs } = TABLE
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: PLANKS }, (_, i) => (
        <mesh key={i} position={[0, -t / 2, -d / 2 + (d / PLANKS) * (i + 0.5)]} receiveShadow castShadow raycast={() => null}>
          <boxGeometry args={[w, t, d / PLANKS - 0.03]} />
          <Toon color={i % 2 ? '#c99a62' : '#bf8d55'} />
          <Ink thickness={0.03} />
        </mesh>
      ))}
      <mesh position-y={-t - 0.2} raycast={() => null}>
        <boxGeometry args={[w - 1, 0.4, d - 1]} />
        <Toon color="#9c6b3f" />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} position={[sx * (w / 2 - 0.9), -t - legs / 2, sz * (d / 2 - 0.9)]} castShadow raycast={() => null}>
          <boxGeometry args={[0.8, legs, 0.8]} />
          <Toon color="#a8743f" />
          <Ink thickness={0.03} />
        </mesh>
      ))}
    </group>
  )
}

const ZERO = [0, 0, 0]
const BEAM = { c: { value: new Color('#ffcf6e') }, k: { value: 1 } }
const BEAM_V = 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 p = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-p.xyz); gl_Position = projectionMatrix * p; }'
const BEAM_F = 'uniform vec3 c; uniform float k; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float edge = pow(1.0 - abs(dot(vN, vV)), 1.5); float a = (0.04 + 0.22 * pow(vUv.y, 1.6)) * (0.35 + edge); gl_FragColor = vec4(c * a * k, 1.0); }'
const FOV = 42
const BASE = Math.hypot(11.4, 11.8)


const HOME_T = new Vector3(-0.2, 0, 0.3)
const TILT = 70

const fitOf = (size) => Math.max(1, 1.05 / (size.width / size.height))

function Touch({ on }) {
  const { camera, controls, size } = useThree()
  const fit = fitOf(size)
  useEffect(() => {
    if (!on || !controls) return
    const d = BASE * fit
    controls.enabled = true
    controls.minDistance = d * 0.6
    controls.maxDistance = d * 1.001
    const clamp = () => {
      const t = controls.target
      const dx = Math.min(HOME_T.x + 3, Math.max(HOME_T.x - 3, t.x)) - t.x, dy = HOME_T.y - t.y, dz = HOME_T.z - t.z
      if (!dx && !dy && !dz) return
      t.x += dx
      t.y += dy
      t.z += dz
      camera.position.x += dx
      camera.position.y += dy
      camera.position.z += dz
    }
    controls.addEventListener('change', clamp)
    return () => {
      controls.removeEventListener('change', clamp)
      controls.enabled = false
      controls.minDistance = 0
      controls.maxDistance = Infinity
    }
  }, [on, controls, fit])
  return null
}

function CamRig({ fov, tilt, at, off, onIntro }) {
  const { camera, controls, size } = useThree()
  const fit = fitOf(size)
  const intro = useRef(true)
  useEffect(() => {
    if (off || !controls) return
    const dist = ((BASE * Math.tan((FOV * Math.PI) / 360)) / Math.tan((fov * Math.PI) / 360)) * fit
    const e = (tilt * Math.PI) / 180
    const t = at ? HOME_T.clone().lerp(new Vector3(...at), 0.15) : HOME_T.clone()
    const p = t.clone().add(new Vector3(0, Math.sin(e), Math.cos(e)).multiplyScalar(dist * (at ? 0.92 : 1)))
    camera.fov = fov
    camera.updateProjectionMatrix()
    if (intro.current) {
      intro.current = false
      const path = new CatmullRomCurve3([new Vector3(-30, 7, 14), new Vector3(-16, 7, 20), new Vector3(-5, 11, 17), p])
      const look = new Vector3(-0.2, 3, -3)
      const k = { u: 0 }
      gsap.to(k, {
        u: 1,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.position.copy(path.getPoint(k.u))
          controls.target.copy(look).lerp(t, Math.max(0, (k.u - 0.55) / 0.45) ** 2)
          controls.update()
        },
        onComplete: onIntro,
      })
      return
    }
    gsap.to(controls.target, { x: t.x, y: t.y, z: t.z, duration: 0.8, ease: 'power2.out', overwrite: true })
    gsap.to(camera.position, { x: p.x, y: p.y, z: p.z, duration: 0.8, ease: 'power2.out', overwrite: true, onUpdate: () => controls.update() })
  }, [fov, tilt, at, off, camera, controls, fit])
  return null
}

function Aim({ rig, lamp, bulb, beamRef, power, beam, spread, at, size, grow, off }) {
  const st = useRef({ fade: 1, a: spread })
  useEffect(() => {
    if (!at || !rig.current) return
    gsap.to(rig.current.position, { x: at[0] + 0.2, z: at[2] - 0.3, duration: 0.6, ease: 'power3.out' })
    const a = (Math.atan((0.55 * size + 0.35) / 12.5) * 180) / Math.PI
    gsap.to(st.current, { a, duration: 0.9, ease: 'power3.inOut' })
  }, [at])
  useEffect(() => {
    if (!at) st.current.a = spread
  }, [spread, at])
  useEffect(() => {
    if (off) gsap.to(st.current, { fade: 0, duration: 0.45, ease: 'power2.out' })
  }, [off])

  useFrame((_, dt) => {
    const s = st.current
    if (!lamp.current || !rig.current) return
    const g = rig.current.position
    lamp.current.target.position.set(g.x - 0.2, 0, g.z + 0.3)
    lamp.current.target.updateMatrixWorld()
    const rad = (s.a * Math.PI) / 180
    lamp.current.angle = rad
    const w = Math.tan(rad) / Math.tan((spread * Math.PI) / 180)
    beamRef.current?.scale.set(w, 1, w)
    lamp.current.intensity = grow ? 0 : power * s.fade * Math.min(1.8, Math.max(1, spread / s.a))
    BEAM.k.value = (beam / 100) * s.fade
    rig.current.visible = s.fade > 0.02
    bulb.current?.color.setScalar(0.15 + 0.85 * s.fade)
  })
  return null
}

function Low({ on }) {
  const { camera, controls } = useThree()
  useEffect(() => {
    if (!on || !controls) return
    gsap.killTweensOf([controls.target, camera.position])
    gsap.to(controls.target, { x: TABLE.x, y: 0, z: TABLE.z, duration: 0.7, ease: 'power2.inOut' })
    gsap.to(camera.position, { x: TABLE.x, y: 8.5, z: TABLE.z + 1.2, duration: 0.7, ease: 'power2.inOut', onUpdate: () => controls.update() })
    gsap.to(camera, { fov: 80, duration: 0.7, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() })
  }, [on, camera, controls])
  return null
}

function Focus({ at, onDone }) {
  const { camera, controls } = useThree()
  useEffect(() => {
    if (!at || !controls) return
    const [x, y, z] = at
    gsap.to(controls.target, { x, y, z, duration: 0.8, ease: 'power3.inOut' })
    gsap.to(camera.position, { x, y: y + 3.2, z: z + 2.4, duration: 0.8, ease: 'power3.inOut', onUpdate: () => controls.update(), onComplete: onDone })
  }, [at, camera, controls])
  return null
}

const keep = (o) => {
  o.userData.p ??= o.position.clone()
  o.userData.s ??= o.scale.clone()
  return o.userData
}

function popOut(tl, o, at, { lift = 1.4, small = 0.1, dur = 0.7 } = {}) {
  const { p, s } = keep(o)
  o.position.set(0, -1, 0)
  o.scale.setScalar(0)
  tl.to(o.position, { y: lift, duration: 0.3, ease: 'power2.out' }, at)
  tl.to(o.scale, { x: s.x * small, y: s.y * small, z: s.z * small, duration: 0.3, ease: 'back.out(2)' }, at)
  tl.to(o.position, { x: p.x, z: p.z, duration: dur, ease: 'power2.inOut' }, at + 0.3)
  tl.to(o.position, { y: p.y, duration: dur, ease: 'back.out(1.6)' }, at + 0.3)
  tl.to(o.scale, { x: s.x, y: s.y, z: s.z, duration: dur, ease: 'power2.inOut' }, at + 0.3)
}

const FOG = new Color().setRGB(0xda / 255, 0xe4 / 255, 0xea / 255, LinearSRGBColorSpace)

function prep(city) {
  const v = buildVoiture(city)
  const seen = new Set()
  v.world.children.forEach((o) => {
    if (!o.isMesh || o === v.dome || seen.has(o.geometry)) return
    seen.add(o.geometry)
    o.geometry.computeBoundingBox()
    const c = o.geometry.boundingBox.getCenter(new Vector3())
    if (c.length() < 1) return
    o.geometry.translate(-c.x, -c.y, -c.z)
    o.position.add(c.multiply(o.scale).applyQuaternion(o.quaternion))
  })
  v.scene.visible = false
  v.road = v.world.children.filter((o) => o.geometry?.parameters?.height >= 2400)
  const road = new Set(v.road)
  v.car.attach(v.char)
  ;[v.car, v.clouds, ...v.world.children].forEach((o) => {
    keep(o)
    if (!road.has(o)) o.scale.setScalar(0)
  })
  v.lights = []
  if (PHONE) v.scene.traverse((o) => o.shadow?.mapSize.set(SHADOW, SHADOW))
  const mats = new Set()
  v.scene.traverse((o) => {
    if (o.isLight) {
      v.lights.push([o, o.intensity])
      o.intensity = 0
    }
    if (o.material) [].concat(o.material).forEach((m) => mats.add(m))
  })
  const ground = new Set()
  v.world.traverse((o) => o.material && o !== v.dome && [].concat(o.material).forEach((m) => ground.add(m)))
  v.spread = { r: { value: 0 }, c: { value: new Vector2() }, h: { value: 0 } }
  mats.forEach((m) => {
    m.toneMapped = false
    const spread = ground.has(m)
    const before = m.onBeforeCompile
    const key = m.customProgramCacheKey() + '-raw'
    m.onBeforeCompile = (sh, r) => {
      before.call(m, sh, r)
      sh.fragmentShader = sh.fragmentShader.replace('#include <colorspace_fragment>', '')
      if (!spread) return
      sh.uniforms.uSpread = v.spread.r
      sh.uniforms.uCenter = v.spread.c
      sh.uniforms.uHole = v.spread.h
      sh.vertexShader = 'varying vec3 vSW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvSW = (modelMatrix * vec4(transformed, 1.0)).xyz;')
      sh.fragmentShader = 'uniform float uSpread;\nuniform float uHole;\nuniform vec2 uCenter;\nvarying vec3 vSW;\n' + sh.fragmentShader.replace('void main() {', 'void main() {\nfloat dS = distance(vSW.xz, uCenter);\nif (dS > uSpread || dS < uHole) discard;')
    }
    m.customProgramCacheKey = () => key + (spread ? '-spread' : '')
    m.needsUpdate = true
  })
  return v
}

const CITIES = ['marseille', 'paris', 'nord']

const pause = () => new Promise((r) => setTimeout(r, 0))

async function warm(gl, scene, camera, v, rt, rig) {
  scene.add(v.scene)
  const culled = []
  scene.traverse((o) => {
    if (!o.frustumCulled) return
    culled.push(o)
    o.frustumCulled = false
  })
  v.scene.visible = true
  rig.visible = false
  await gl.compileAsync(scene, camera)
  await pause()
  const prev = gl.getRenderTarget()
  gl.setRenderTarget(rt)
  gl.render(scene, camera)
  gl.setRenderTarget(prev)
  v.scene.visible = false
  rig.visible = true
  scene.remove(v.scene)
  culled.forEach((o) => (o.frustumCulled = true))
}

function Preload({ pool, rig, onReady }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    const rt = new WebGLRenderTarget(1, 1)
    let stop = false
    ;(async () => {
      for (const c of CITIES) {
        await pause()
        if (stop) return
        pool[c] ??= prep(c)
        await pause()
        if (stop) return
        await warm(gl, scene, camera, pool[c], rt, rig.current)
      }
      rt.dispose()
      if (!stop) requestAnimationFrame(() => requestAnimationFrame(onReady))
    })()
    return () => {
      stop = true
    }
  }, [])
  return null
}

function Voiture({ go, at, hole: holeR, ours, v }) {
  const { scene, camera, controls } = useThree()

  useEffect(() => {
    if (!go) return
    v.scene.position.set(at[0], at[1] + 0.01, at[2])
    v.scene.visible = true
    v.lights.forEach(([l, i]) => (l.intensity = i))
    ours.forEach((l) => l.current && (l.current.intensity = 0))
    scene.fog.near = v.fog[0]
    scene.fog.far = v.fog[1]
    const tl = gsap.timeline().timeScale(1.5)
    const hole = new Vector3(...at)
    v.spread.c.value.set(hole.x, hole.z)
    v.spread.r.value = 0
    tl.to(v.spread.r, { value: v.reach, duration: 2.6, ease: 'expo.in' }, 0)
    const sky = v.dome.material.uniforms.uLight
    sky.value = 0
    scene.fog.color.setRGB(0, 0, 0)
    tl.to(sky, { value: 1, duration: 1.8, ease: 'power2.inOut', onUpdate: () => scene.fog.color.copy(FOG).multiplyScalar(sky.value) }, 0.5)
    ;[v.dome, v.clouds].forEach((o) => {
      const { s } = keep(o)
      tl.to(o.scale, { x: s.x, y: s.y, z: s.z, duration: 1.3, ease: 'power2.out' }, 0)
    })
    popOut(tl, v.car, 0.6, { dur: 0.6 })
    const rims = new Set()
    scene.traverse((m) => m.userData.hole && rims.add(m.parent.parent))
    v.spread.h.value = holeR
    tl.to(v.spread.h, { value: 0, duration: 0.25, ease: 'back.in(2)' }, 1.1)
    rims.forEach((g) => tl.to(g.scale, { x: 0, y: 0, z: 0, duration: 0.25, ease: 'back.in(2)' }, 1.1))
    const skip = new Set([...v.movers, ...v.road, v.dome])
    v.world.children
      .filter((o) => !skip.has(o))
      .forEach((o) => {
        const { p, s } = keep(o)
        const t = Math.max(0.3, 2.6 * (1 + Math.log2(Math.max(Math.hypot(p.x, p.z), 5) / 1600) / 10) - 0.1)
        o.position.set(p.x, p.y - 8, p.z)
        tl.to(o.position, { y: p.y, duration: 0.5, ease: 'back.out(1.8)' }, t)
        tl.to(o.scale, { x: s.x, y: s.y, z: s.z, duration: 0.4, ease: 'power2.out' }, t)
      })
    v.movers.forEach((o, i) => {
      const { s } = keep(o)
      tl.to(o.scale, { x: s.x, y: s.y, z: s.z, duration: 0.22, ease: 'back.out(2.5)' }, 1.0 + (i % 10) * 0.025)
    })

    const target = v.camTarget.clone().add(hole)
    const yaw = 0.8, pitch = -0.02, r = 4.2
    const end = target.clone().add(new Vector3(r * Math.cos(pitch) * Math.sin(yaw), r * Math.sin(pitch), r * Math.cos(pitch) * Math.cos(yaw)))
    const path = new CatmullRomCurve3([camera.position.clone(), hole.clone().add(new Vector3(-22, 28, 30)), hole.clone().add(new Vector3(-12, 10, 16)), end])
    const look0 = controls.target.clone()
    const look1 = hole.clone().add(new Vector3(0, 1.5, 0))
    const fov0 = camera.fov
    const cam = { u: 0 }
    tl.to(cam, {
      u: 1,
      duration: 4.4,
      ease: 'sine.inOut',
      onUpdate: () => {
        const u = cam.u
        camera.position.copy(path.getPoint(u))
        controls.target.copy(look0).lerp(look1, Math.min(1, u * 2)).lerp(target, Math.max(0, u * 2 - 1))
        camera.fov = fov0 + (52 - fov0) * u
        camera.updateProjectionMatrix()
        controls.update()
      },
    }, 0.2)
    return () => tl.kill()
  }, [go])

  useFrame(({ clock }) => v.update(clock.elapsedTime, performance.now()))

  return <primitive object={v.scene} />
}

function Game({ onPick, onBack, visited, authed }) {
  const fov = FOV
  const tilt = TILT
  const spot = SPOT
  const [sel, setSel] = useState(null)
  const [open, setOpen] = useState(false)
  const [inside, setInside] = useState(false)
  const [car, setCar] = useState(false)
  const [hot, setHot] = useState(null)
  const [camAt, setCamAt] = useState(null)
  const [live, setLive] = useState(false)
  const away = useRef()
  const enterMap = () => clearTimeout(away.current)
  const leaveMap = () => {
    setHot(null)
    clearTimeout(away.current)
    away.current = setTimeout(() => setCamAt(null), 400)
  }
  const hoverRegion = (code, at) => {
    clearTimeout(away.current)
    setHot(code)
    setCamAt(at)
  }
  const leaveRegion = (code) => setHot((c) => (c === code ? null : c))
  const [loaded, setLoaded] = useState(false)
  const pool = useRef({}).current
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!car) return
    const id = setTimeout(() => setGone(true), 1000)
    return () => clearTimeout(id)
  }, [car])

  const [ready, setReady] = useState(false)
  const hemi = useRef()
  const sun = useRef()
  const lamp = useRef()
  const bulb = useRef()
  const rig = useRef()
  const beamRef = useRef()
  const city = { 11: 'paris', 32: 'nord' }[sel?.code] || 'marseille'
  const focus = sel?.at || ZERO

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 2500)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <Canvas shadows dpr={[1, PHONE ? 1.25 : 1.5]} camera={{ position: [-30, 7, 14], fov: FOV, far: 4000 }} style={{ background: inside ? '#000' : 'radial-gradient(circle, #ffffff 0%, #f4efff 60%, #e6dcff 100%)', filter: authed ? 'none' : 'blur(3px)', transform: authed ? 'none' : 'scale(1.03)', transition: 'filter 0.8s, transform 0.8s' }}>
        <fog attach="fog" args={[FOG, 1e5, 2e5]} />
        {(
          <group ref={rig} visible={!car}>
            <spotLight
              ref={lamp}
              position={[-0.2, 13, 0.3]}
              color="#ffd58a"
              intensity={spot.power}
              angle={(spot.spread * Math.PI) / 180}
              penumbra={spot.soft / 100}
              distance={40}
              decay={1.6}
              castShadow
              shadow-mapSize={[SHADOW, SHADOW]}
              shadow-bias={-0.0004}
            />
            <mesh ref={beamRef} position={[-0.2, 6.5, 0.3]} raycast={() => null} renderOrder={5} visible={spot.beam > 0}>
              <coneGeometry args={[Math.tan((spot.spread * Math.PI) / 180) * 13, 13, 48, 1, true]} />
              <shaderMaterial transparent depthWrite={false} blending={AdditiveBlending} side={2} uniforms={BEAM} vertexShader={BEAM_V} fragmentShader={BEAM_F} />
            </mesh>
            <mesh position={[-0.2, 13.4, 0.3]} raycast={() => null} visible={!car}>
              <coneGeometry args={[1.1, 1.2, 24, 1, true]} />
              <meshToonMaterial color="#2b2b33" side={2} />
            </mesh>
            <mesh position={[-0.2, 12.9, 0.3]} raycast={() => null} visible={!car}>
              <sphereGeometry args={[0.35, 16, 12]} />
              <meshBasicMaterial ref={bulb} color="#fff2c4" toneMapped={false} />
            </mesh>
            <mesh position={[-0.2, 17, 0.3]} raycast={() => null} visible={!car}>
              <cylinderGeometry args={[0.03, 0.03, 7, 6]} />
              <meshBasicMaterial color="#222" />
            </mesh>
          </group>
        )}
        <hemisphereLight ref={hemi} args={['#c9c2e8', '#3a2f4a', 0.45]} />
        <directionalLight
          ref={sun}
          position={[6, 10, 4]}
          intensity={0.25}
          shadow-mapSize={[SHADOW, SHADOW]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <group visible={!gone}>
        <group onPointerEnter={enterMap} onPointerLeave={leaveMap}>
        {regions.features.map((f, i) => (
          <Region key={f.properties.code} feature={f} color={GREENS[i % GREENS.length]} selected={sel?.code} focus={focus} open={open} inside={inside} onSelect={(code, at, size) => {
            unlockStory()
            setSel({ code, at, size })
            onPick(code)
          }} onHover={hoverRegion} onLeave={leaveRegion} hovered={hot === f.properties.code} locked={!live} visited={visited.includes(f.properties.code)} />
        ))}
        </group>
        <Suck center={TABLE_CENTER} focus={focus} go={inside} delay={0} soft>
          <Room />
        </Suck>
        <Suck center={TABLE_CENTER} focus={focus} go={inside} delay={0.2} soft>
            <Table />
            <Beetle position={[-4.6, 0, 3.6]} rotation-y={0.7} scale={1.3} />
            <group position={[-0.2, -1.4, -7.3]}>
              <Mascot dive={sel?.at} onHole={() => setOpen(true)} onDone={() => setInside(true)} />
            </group>
        </Suck>
        </group>
        <CamRig fov={fov} tilt={tilt} at={camAt} off={!!sel || !loaded || !authed} onIntro={() => setLive(true)} />
        <Aim rig={rig} lamp={lamp} bulb={bulb} beamRef={beamRef} power={spot.power} beam={spot.beam} spread={spot.spread} at={sel?.at} size={sel?.size} grow={car} off={inside} />
        <Low on={!!sel} />
        <Focus at={inside ? sel.at : null} onDone={() => setCar(true)} />
        {ready && !loaded && <Preload pool={pool} rig={rig} onReady={() => setLoaded(true)} />}
        {loaded && <Voiture key={city} v={pool[city]} go={car} at={sel?.at} hole={sel ? Math.min(0.6, Math.max(0.25, sel.size * 0.28)) * 1.14 : 0} ours={[hemi, sun]} />}
        <OrbitControls makeDefault enabled={false} enableRotate={false} screenSpacePanning={false} touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }} target={[-0.2, 3, -3]} />
        <Touch on={PHONE && live && !sel && !camAt} />
      </Canvas>
      {car && <Player />}
      {sel && (
        <button className="back" onClick={onBack}>
          ← Retour
        </button>
      )}
      <div className={`loader${loaded ? ' done' : ''}`}>
        <div className="loader-white">
          <div className="loader-anim">
            <img src="/loading.gif" alt="Chargement" />
            <video src="/loading.mp4" autoPlay loop muted playsInline disablePictureInPicture disableRemotePlayback controls={false} aria-hidden="true" ref={(el) => { if (!el) return; el.muted = true; el.play().catch(() => {}) }} onPlaying={(e) => {
              e.currentTarget.classList.add('on')
              requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
            }} />
          </div>
        </div>
      </div>
    </>
  )
}

export default function Scene() {
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const [visited, setVisited] = useState([])
  const [authed, setAuthed] = useState(false)
  useEffect(() => setVisited(load('lunii-regions', [])), [])
  const pick = (code) => {
    if (visited.includes(code)) return
    const next = [...visited, code]
    save('lunii-regions', next)
    setVisited(next)
    setHits((n) => n + 1)
  }
  const back = () => {
    gaze.copy(HOME)
    setRound((n) => n + 1)
  }
  return (
    <>
      <Game key={round} onPick={pick} onBack={back} visited={visited} authed={authed} />
      {authed && <Points hit={hits} />}
      {!authed && <Login onDone={() => setAuthed(true)} />}
    </>
  )
}
