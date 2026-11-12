import { useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'
import { Ink, P, Toon } from './toon'

export const project = ([lon, lat]) => [(lon - 2.5) * Math.cos((46.5 * Math.PI) / 180), lat - 46.5]

const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const inside = ([x, y], ring) => {
  let c = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

const far = (p, pts, d) => pts.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > d)
const M = 0.15

const MOUNTAIN_ZONES = [
  { c: [6.6, 45.2], rx: 0.7, ry: 1.0, n: 18 },
  { c: [6.0, 46.6], rx: 0.35, ry: 0.35, n: 4 },
  { c: [7.0, 48.1], rx: 0.2, ry: 0.45, n: 3 },
  { c: [2.8, 45.3], rx: 0.5, ry: 0.5, n: 6 },
  { c: [0.75, 42.85], rx: 2.2, ry: 0.12, n: 14 },
  { c: [9.05, 42.15], rx: 0.12, ry: 0.35, n: 3 },
]

const MOUNTAINS = (() => {
  const random = rng(42)
  return MOUNTAIN_ZONES.flatMap(({ c, rx, ry, n }) => Array.from({ length: n }, () => {
    const a = random() * Math.PI * 2, d = Math.sqrt(random())
    const k = 1 - d * 0.6
    return {
      p: project([c[0] + Math.cos(a) * d * rx, c[1] + Math.sin(a) * d * ry]),
      h: (0.45 + random() * 0.45) * k,
      r: 0.2 + random() * 0.12,
      rot: random() * Math.PI,
      grey: random() < 0.5 ? '#ece6ff' : '#cfc2fb',
    }
  }))
})()
const TERRILS = [[2.77, 50.46, 1], [2.81, 50.455, 1.1], [2.93, 50.42, 0.8], [3.1, 50.38, 0.9], [3.42, 50.37, 0.85], [3.53, 50.35, 1], [2.6, 50.5, 0.75]].map(([lon, lat, s]) => ({ p: project([lon, lat]), s }))

const mountainPoints = [...MOUNTAINS.map((m) => m.p), ...TERRILS.map((t) => t.p)]

function bigTrees(ring, area, center, seed) {
  const random = rng(seed)
  const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1])
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const target = area > 3 ? 1 : 0
  const pts = []
  for (let tries = 0; pts.length < target && tries < 2000; tries++) {
    const p = [minX + random() * (maxX - minX), minY + random() * (maxY - minY)]
    const fits = [[0, 0], [M, 0], [-M, 0], [0, M], [0, -M]].every(([dx, dy]) => inside([p[0] + dx, p[1] + dy], ring))
    if (fits && far(p, [center], 0.45) && far(p, pts, 0.5) && far(p, mountainPoints, 0.2)) pts.push(p)
  }
  return pts.map(([x, y]) => ({ x, z: -y, s: 2.2 + random() * 0.8, color: random() < 0.6 ? '#1fa37a' : '#ffcb3d' }))
}

export function Decor({ ring, area, center, seed, striped }) {
  const trees = useMemo(() => bigTrees(ring, area, center, seed), [ring, area, center, seed])
  const mountains = useMemo(() => MOUNTAINS.filter((m) => inside(m.p, ring) && far(m.p, [center], 0.35)), [ring, center])
  const snowy = mountains.filter((m) => m.h > 0.4)
  const terrils = useMemo(() => TERRILS.filter((t) => inside(t.p, ring)), [ring])

  return (
    <>
      {mountains.length > 0 && (
        <Instances limit={mountains.length} castShadow receiveShadow>
          <coneGeometry args={[1, 1, 4]} />
          <Toon striped={striped} />
          <Ink thickness={0.01} />
          {mountains.map((m, i) => <Instance key={i} position={[m.p[0], m.h / 2, -m.p[1]]} scale={[m.r, m.h, m.r]} rotation-y={m.rot} color={m.grey} />)}
        </Instances>
      )}
      {snowy.length > 0 && (
        <Instances limit={snowy.length}>
          <coneGeometry args={[1, 1, 4]} />
          <Toon color="#ffffff" striped={striped} />
          {snowy.map((m, i) => <Instance key={i} position={[m.p[0], m.h * 0.82 + 0.001, -m.p[1]]} scale={[m.r * 0.36, m.h * 0.36, m.r * 0.36]} rotation-y={m.rot} />)}
        </Instances>
      )}
      {terrils.map((t, i) => (
        <group key={i} position={[t.p[0], 0, -t.p[1]]} scale={t.s}>
          <P color="#3a3540" position-y={0.12} striped={striped}>
            <cylinderGeometry args={[0.035, 0.2, 0.24, 7]} />
          </P>
          <P color="#7fd58a" line={0.004} position-y={0.245} striped={striped}>
            <cylinderGeometry args={[0.036, 0.04, 0.012, 7]} />
          </P>
        </group>
      ))}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <P color="#a0623a" line={0.003} position-y={0.04} striped={striped}>
            <cylinderGeometry args={[0.012, 0.016, 0.08, 6]} />
          </P>
          <P color={t.color} line={0.004} position-y={0.11} striped={striped}>
            <icosahedronGeometry args={[0.055, 0]} />
          </P>
        </group>
      ))}
    </>
  )
}
