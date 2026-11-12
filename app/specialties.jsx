import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, DataTexture, DoubleSide, ExtrudeGeometry, LatheGeometry, NearestFilter, RepeatWrapping, RGBAFormat, Shape, TubeGeometry, Vector2, Vector3 } from 'three'
import { Flag, Ink, INK, P, Roof, Toon } from './toon'

const lathe = (pts, segments = 16) => new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), segments)

const sector = (r, from, to, depth) => {
  const s = new Shape()
  s.moveTo(0, 0)
  s.absarc(0, 0, r, from, to, false)
  s.lineTo(0, 0)
  return new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 24 })
}

export const pseudo = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const pattern = (size, opaque, color = () => [255, 255, 255]) => {
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const [r, g, b] = color(x, y)
      data.set([r, g, b, opaque(x, y) ? 255 : 0], i)
    }
  const t = new DataTexture(data, size, size, RGBAFormat)
  t.wrapS = t.wrapT = RepeatWrapping
  t.magFilter = NearestFilter
  t.needsUpdate = true
  return t
}

const LATTICE = pattern(64, (x, y) => x < 6 || x > 57 || y < 4 || y > 59 || Math.abs(x - y) < 4 || Math.abs(x + y - 63) < 4)
const STRIPES = pattern(32, () => true, (x) => (Math.floor(x / 8) % 2 ? [255, 255, 255] : [230, 57, 70]))

const tiled = (texture, rx, ry) => {
  const t = texture.clone()
  t.repeat.set(rx, ry)
  t.needsUpdate = true
  return t
}

const Lattice = ({ geometry, rx = 4, ry = 4, color = '#8d5b3c', children, ...props }) => (
  <mesh geometry={geometry} castShadow {...props}>
    {children}
    <Toon color={color} map={tiled(LATTICE, rx, ry)} alphaTest={0.5} side={DoubleSide} />
  </mesh>
)

const FRY_GRID = Array.from({ length: 30 }, (_, i) => {
  const gx = (i % 6) - 2.5, gz = Math.floor(i / 6) - 2
  const h = 0.24 + pseudo(i + 20) * 0.1
  return { x: gx * 0.026, z: gz * 0.03, h, rx: gz * 0.06 + (pseudo(i + 40) - 0.5) * 0.15, rz: -gx * 0.06 + (pseudo(i + 60) - 0.5) * 0.15, c: pseudo(i + 80) < 0.55 ? '#ffd23f' : '#f2b233' }
})

const Frites = () => (
  <group>
    <group position={[-0.02, 0, 0]}>
      <mesh position-y={0.11} rotation-y={Math.PI / 4} castShadow>
        <cylinderGeometry args={[0.14, 0.095, 0.22, 4, 1, true]} />
        <Toon map={tiled(STRIPES, 4, 1)} side={DoubleSide} />
        <Ink thickness={0.006} />
      </mesh>
      <P color="#e63946" line={0} position-y={0.005} rotation-y={Math.PI / 4}>
        <cylinderGeometry args={[0.095, 0.095, 0.01, 4]} />
      </P>
      {FRY_GRID.map((f, i) => (
        <P key={i} color={f.c} line={0.003} position={[f.x, 0.05 + f.h / 2, f.z]} rotation={[f.rx, 0, f.rz]}>
          <boxGeometry args={[0.022, f.h, 0.022]} />
        </P>
      ))}
    </group>
    <group position={[0.17, 0, 0.1]}>
      <P color="#ffffff" position-y={0.025}>
        <cylinderGeometry args={[0.045, 0.035, 0.05, 16]} />
      </P>
      <P color="#d62828" line={0} position-y={0.049}>
        <cylinderGeometry args={[0.041, 0.041, 0.004, 16]} />
      </P>
    </group>
    <group position={[0.15, 0, -0.08]}>
      <P color="#ffffff" position-y={0.025}>
        <cylinderGeometry args={[0.045, 0.035, 0.05, 16]} />
      </P>
      <P color="#fff3c4" line={0} position-y={0.049}>
        <cylinderGeometry args={[0.041, 0.041, 0.004, 16]} />
      </P>
      <P color="#ffd23f" line={0.003} position={[0.01, 0.09, 0]} rotation-z={-0.35}>
        <boxGeometry args={[0.022, 0.13, 0.022]} />
      </P>
    </group>
    {[[-0.2, 0.12, 0.6], [-0.15, 0.18, 2.1]].map(([x, z, r], i) => (
      <P key={i} color="#ffd23f" line={0.003} position={[x, 0.011, z]} rotation={[0, r, Math.PI / 2]}>
        <boxGeometry args={[0.022, 0.14, 0.022]} />
      </P>
    ))}
  </group>
)

const EIFFEL = '#8d5b3c'
const H = 1 / 324
const PROFILE = [[0, 62.45], [20, 48], [40, 39], [57.63, 35.35], [85, 27.5], [115.73, 20.48], [160, 15], [210, 11.5], [276.13, 9.33], [300, 4]]
const section = (from, to) => lathe(PROFILE.filter(([y]) => y >= from && y <= to).map(([y, w]) => [w * H * Math.SQRT2, y * H]), 4)
const SECTIONS = [
  { geometry: section(0, 57.63), rx: 20, ry: 3 },
  { geometry: section(57.63, 115.73), rx: 12, ry: 3 },
  { geometry: section(115.73, 300), rx: 4, ry: 12 },
]
const EDGES = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => ({
  key: `${sx}${sz}`,
  base: new CatmullRomCurve3(PROFILE.filter(([y]) => y <= 57.63).map(([y, w]) => new Vector3(sx * w * H, y * H, sz * w * H))),
  top: new CatmullRomCurve3(PROFILE.filter(([y]) => y >= 57.63 && y <= 276.13).map(([y, w]) => new Vector3(sx * w * H, y * H, sz * w * H))),
}))

const TourEiffel = () => (
  <group>
    {SECTIONS.map(({ geometry, rx, ry }, i) => (
      <Lattice key={i} geometry={geometry} rotation-y={Math.PI / 4} rx={rx} ry={ry} />
    ))}
    {EDGES.map(({ key, base, top }) => (
      <group key={key}>
        <mesh geometry={new TubeGeometry(base, 16, 0.011, 5)} castShadow>
          <Toon color={EIFFEL} />
        </mesh>
        <mesh geometry={new TubeGeometry(top, 40, 0.005, 5)}>
          <Toon color={EIFFEL} />
        </mesh>
      </group>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <group key={i} rotation-y={(i * Math.PI) / 2}>
        <P color={EIFFEL} line={0.004} position={[0, 0, 0.152]} rotation-x={-0.18}>
          <torusGeometry args={[37.12 * H, 0.01, 6, 24, Math.PI]} />
        </P>
      </group>
    ))}
    {[[57.63, 36.5, 0.022], [115.73, 21.5, 0.016], [276.13, 10, 0.014]].map(([y, w, h]) => (
      <P key={y} color="#6e4530" position-y={y * H}>
        <boxGeometry args={[w * 2 * H, h, w * 2 * H]} />
      </P>
    ))}
    <P color="#6e4530" line={0.003} position-y={300 * H + 0.015}>
      <coneGeometry args={[0.014, 0.03, 4]} />
    </P>
    <P color="#5a6577" line={0} position-y={0.97}>
      <cylinderGeometry args={[0.003, 0.004, 0.06, 6]} />
    </P>
  </group>
)

function Beam() {
  const ref = useRef()
  useFrame((_, dt) => (ref.current.rotation.y += dt * 1.5))
  return (
    <group ref={ref} position-y={0.51}>
      <mesh position-x={0.25} rotation-z={Math.PI / 2}>
        <coneGeometry args={[0.07, 0.45, 16, 1, true]} />
        <meshBasicMaterial color="#ffcb3d" transparent opacity={0.35} side={DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

const Phare = () => (
  <group>
    <P color="#9a93a8" position-y={0.04} scale={[1, 0.45, 1]}>
      <dodecahedronGeometry args={[0.18, 0]} />
    </P>
    <P color="#ffffff" line={0.005} position={[0.14, 0.02, 0.1]} scale={[1, 0.3, 1]}>
      <sphereGeometry args={[0.05, 10, 8]} />
    </P>
    {[0, 1, 2, 3].map((i) => (
      <P key={i} color={i % 2 ? '#e63946' : '#ffffff'} line={0.005} position-y={0.1 + i * 0.09 + 0.045}>
        <cylinderGeometry args={[0.07 - (i + 1) * 0.007, 0.07 - i * 0.007, 0.09, 16]} />
      </P>
    ))}
    {[0.19, 0.33].map((y) => (
      <P key={y} color="#2b2d42" line={0} position={[0, y, 0.064 - (y - 0.1) * 0.08]}>
        <boxGeometry args={[0.02, 0.035, 0.01]} />
      </P>
    ))}
    <P color="#2b2d42" position-y={0.47}>
      <cylinderGeometry args={[0.075, 0.075, 0.015, 16]} />
    </P>
    <P color="#2b2d42" line={0} position-y={0.49}>
      <torusGeometry args={[0.07, 0.004, 4, 20]} />
    </P>
    <P color="#ffcb3d" position-y={0.51} mat={{ emissive: '#ffcb3d', emissiveIntensity: 0.8 }}>
      <cylinderGeometry args={[0.035, 0.035, 0.07, 12]} />
    </P>
    <P color="#e63946" position-y={0.575}>
      <coneGeometry args={[0.05, 0.06, 12]} />
    </P>
    <P color="#2b2d42" line={0} position-y={0.62}>
      <sphereGeometry args={[0.01, 8, 6]} />
    </P>
    <Beam />
  </group>
)

const camembertWheel = sector(0.17, 0.55, Math.PI * 2, 0.07)
const camembertSlice = sector(0.17, 0, 0.55, 0.07)

const Cheese = ({ geometry, ...props }) => (
  <mesh geometry={geometry} rotation-x={-Math.PI / 2} castShadow {...props}>
    <Toon attach="material-0" color="#fffdf5" />
    <Toon attach="material-1" color="#f7d774" />
    <Ink thickness={0.006} />
  </mesh>
)

const Camembert = () => (
  <group>
    <P color="#d9a86c" position-y={0.02}>
      <cylinderGeometry args={[0.2, 0.2, 0.04, 28]} />
    </P>
    <Cheese geometry={camembertWheel} position-y={0.04} />
    <Cheese geometry={camembertSlice} position={[Math.cos(0.27) * 0.07, 0.04, -Math.sin(0.27) * 0.07]} />
    <group position={[-0.2, 0.12, -0.12]} rotation={[0.3, 0.4, 1.2]}>
      <P color="#d9a86c">
        <cylinderGeometry args={[0.2, 0.2, 0.03, 28]} />
      </P>
      <P color="#e63946" line={0} position-y={0.016}>
        <cylinderGeometry args={[0.15, 0.15, 0.004, 28]} />
      </P>
      <P color="#fffbef" line={0} position-y={0.019}>
        <cylinderGeometry args={[0.1, 0.1, 0.004, 28]} />
      </P>
    </group>
    <P color="#3cc47c" position={[0.18, 0.03, 0.12]}>
      <icosahedronGeometry args={[0.035, 0]} />
    </P>
    <P color="#e63946" position={[0.2, 0.04, -0.15]}>
      <sphereGeometry args={[0.045, 12, 10]} />
    </P>
    <P color="#7a4a2a" line={0.003} position={[0.2, 0.09, -0.15]}>
      <cylinderGeometry args={[0.004, 0.004, 0.03, 4]} />
    </P>
  </group>
)

const pretzel = new CatmullRomCurve3(
  Array.from({ length: 48 }, (_, i) => {
    const t = (i / 48) * Math.PI * 2
    return new Vector3((Math.sin(t) + 2 * Math.sin(2 * t)) * 0.045, (Math.cos(t) - 2 * Math.cos(2 * t)) * -0.045, -Math.sin(3 * t) * 0.03)
  }),
  true,
)
const SALT = Array.from({ length: 14 }, (_, i) => pretzel.getPoint(i / 14))

const Bretzel = () => (
  <group>
    <group position={[0.12, 0.17, 0.08]} rotation-x={-0.25}>
      <mesh castShadow>
        <tubeGeometry args={[pretzel, 128, 0.028, 10, true]} />
        <Toon color="#b5652b" />
        <Ink thickness={0.006} />
      </mesh>
      {SALT.map((p, i) => (
        <P key={i} color="#ffffff" line={0} position={[p.x, p.y, p.z + 0.027]} rotation={[i, i * 2, 0]}>
          <boxGeometry args={[0.011, 0.011, 0.011]} />
        </P>
      ))}
    </group>
    <group position={[-0.1, 0, -0.06]}>
      <P color="#fffbef" position-y={0.09}>
        <boxGeometry args={[0.18, 0.18, 0.15]} />
      </P>
      {[[-0.075, 0.09, 0.006, 0.18], [0, 0.09, 0.006, 0.18], [0.075, 0.09, 0.006, 0.18]].map(([x, y, w, h]) => (
        <P key={x} color="#6b3f22" line={0} position={[x, y, 0.077]}>
          <boxGeometry args={[w * 2, h, 0.004]} />
        </P>
      ))}
      <P color="#6b3f22" line={0} position={[0, 0.09, 0.077]}>
        <boxGeometry args={[0.18, 0.012, 0.004]} />
      </P>
      {[-1, 1].map((s) => (
        <P key={s} color="#6b3f22" line={0} position={[s * 0.037, 0.045, 0.078]} rotation-z={s * 0.9}>
          <boxGeometry args={[0.01, 0.1, 0.004]} />
        </P>
      ))}
      {[-0.037, 0.037].map((x) => (
        <P key={x} color="#7731ff" line={0.003} position={[x, 0.135, 0.078]}>
          <boxGeometry args={[0.035, 0.04, 0.004]} />
        </P>
      ))}
      <Roof w={0.22} d={0.19} h={0.2} color="#c0392b" position-y={0.28} />
      <group position={[0.04, 0.33, 0]}>
        <P color="#ffffff" line={0.004} position-y={0.03}>
          <sphereGeometry args={[0.022, 10, 8]} />
        </P>
        <P color="#e63946" line={0.003} position={[0.025, 0.035, 0]} rotation-z={-Math.PI / 2}>
          <coneGeometry args={[0.006, 0.03, 6]} />
        </P>
        <P color="#ffffff" line={0.003} position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.012, 8, 6]} />
        </P>
      </group>
    </group>
  </group>
)

const bottle = lathe([[0, 0], [0.07, 0], [0.075, 0.01], [0.075, 0.2], [0.06, 0.24], [0.03, 0.28], [0.025, 0.29], [0.025, 0.37], [0.03, 0.375], [0.03, 0.385], [0, 0.385]])
const glass = lathe([[0, 0], [0.05, 0], [0.05, 0.008], [0.008, 0.016], [0.008, 0.11], [0.03, 0.125], [0.046, 0.165], [0.046, 0.22], [0.043, 0.22], [0.043, 0.166], [0.028, 0.13], [0, 0.128]])
const wine = lathe([[0, 0.128], [0.028, 0.13], [0.042, 0.16], [0.043, 0.17], [0, 0.17]])
const barrel = lathe([[0, 0], [0.075, 0], [0.09, 0.05], [0.095, 0.1], [0.09, 0.15], [0.075, 0.2], [0, 0.2]], 18)

const Vin = () => (
  <group>
    <P color="#4a0d1f" geometry={bottle} position-x={-0.05} />
    <P color="#fffbef" line={0} position={[-0.05, 0.12, 0]} mat={{ side: DoubleSide }}>
      <cylinderGeometry args={[0.077, 0.077, 0.09, 16, 1, true]} />
    </P>
    <P color="#7731ff" line={0} position={[-0.05, 0.12, 0.078]}>
      <boxGeometry args={[0.05, 0.03, 0.004]} />
    </P>
    <P color="#ffcb3d" line={0.004} position={[-0.05, 0.39, 0]}>
      <cylinderGeometry args={[0.032, 0.032, 0.02, 12]} />
    </P>
    <group position={[0.11, 0, 0.08]}>
      <mesh geometry={glass}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.45} side={DoubleSide} />
        <Ink thickness={0.004} />
      </mesh>
      <P color="#8a1538" line={0} geometry={wine} />
    </group>
    <group position={[0.05, 0.095, -0.17]} rotation-z={Math.PI / 2}>
      <P color="#b5762f" geometry={barrel} position-y={-0.1} />
      {[-0.06, 0.06].map((y) => (
        <P key={y} color="#5a6577" line={0} position-y={y} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.09, 0.007, 6, 20]} />
        </P>
      ))}
    </group>
  </group>
)

const Tower = ({ x, z, h }) => (
  <group position={[x, 0, z]}>
    <P color="#f4efe4" position-y={h / 2}>
      <cylinderGeometry args={[0.05, 0.05, h, 12]} />
    </P>
    <P color="#3d4a6b" line={0} position={[0, h * 0.7, 0.049]}>
      <boxGeometry args={[0.018, 0.03, 0.004]} />
    </P>
    <P color="#3d4a6b" position-y={h + 0.08}>
      <coneGeometry args={[0.066, 0.16, 12]} />
    </P>
    <Flag position-y={h + 0.14} />
  </group>
)

const Chateau = () => (
  <group>
    <P color="#f4efe4" position-y={0.09}>
      <boxGeometry args={[0.32, 0.18, 0.2]} />
    </P>
    <Roof w={0.3} d={0.18} h={0.14} color="#3d4a6b" position-y={0.25} />
    {[-0.07, 0.07].map((x) => (
      <P key={x} color="#f4efe4" position={[x, 0.29, 0]}>
        <boxGeometry args={[0.025, 0.08, 0.025]} />
      </P>
    ))}
    {[[-0.16, -0.1], [0.16, -0.1], [-0.16, 0.1], [0.16, 0.1]].map(([x, z]) => (
      <Tower key={`${x}${z}`} x={x} z={z} h={0.26} />
    ))}
    {[-0.08, 0, 0.08].flatMap((x) => [0.06, 0.13].map((y) => (
      <P key={`${x}${y}`} color="#3d4a6b" line={0} position={[x, y, 0.101]}>
        <boxGeometry args={[0.03, 0.04, 0.004]} />
      </P>
    )))}
    <P color="#8b5a2b" line={0.003} position={[0, 0.03, 0.102]}>
      <boxGeometry args={[0.045, 0.06, 0.004]} />
    </P>
    <P color="#5ac8fa" line={0.004} position={[0, 0.005, 0.2]}>
      <boxGeometry args={[0.46, 0.01, 0.08]} />
    </P>
    <P color="#d9a86c" line={0.004} position={[0, 0.015, 0.18]}>
      <boxGeometry args={[0.06, 0.012, 0.12]} />
    </P>
  </group>
)

const Biscuit = (props) => (
  <group {...props}>
    <P color="#e0a85a" line={0.005}>
      <boxGeometry args={[0.32, 0.035, 0.24]} />
    </P>
    {Array.from({ length: 8 }, (_, i) => -0.14 + i * 0.04).flatMap((x) => [-0.12, 0.12].map((z) => (
      <P key={`x${x}${z}`} color="#e0a85a" line={0.004} position={[x, 0, z]}>
        <cylinderGeometry args={[0.02, 0.02, 0.035, 10]} />
      </P>
    )))}
    {Array.from({ length: 6 }, (_, i) => -0.1 + i * 0.04).flatMap((z) => [-0.16, 0.16].map((x) => (
      <P key={`z${x}${z}`} color="#e0a85a" line={0.004} position={[x, 0, z]}>
        <cylinderGeometry args={[0.02, 0.02, 0.035, 10]} />
      </P>
    )))}
    {[[-0.16, -0.12], [0.16, -0.12], [-0.16, 0.12], [0.16, 0.12]].map(([x, z]) => (
      <P key={`c${x}${z}`} color="#d39a4c" line={0.004} position={[x, 0, z]}>
        <cylinderGeometry args={[0.036, 0.036, 0.035, 12]} />
      </P>
    ))}
    {Array.from({ length: 24 }, (_, i) => (
      <P key={`d${i}`} color="#8a4f1c" line={0} position={[-0.1 + (i % 6) * 0.04, 0.018, -0.06 + Math.floor(i / 6) * 0.04]}>
        <cylinderGeometry args={[0.007, 0.007, 0.004, 6]} />
      </P>
    ))}
  </group>
)

const PetitBeurre = () => (
  <group>
    <Biscuit position-y={0.02} />
    <Biscuit position={[0.06, 0.07, 0.04]} rotation={[0.08, 0.5, -0.12]} />
    <P color="#ffffff" position={[-0.2, 0.06, 0.16]}>
      <cylinderGeometry args={[0.04, 0.035, 0.12, 14]} />
    </P>
    <P color="#fffbef" line={0} position={[-0.2, 0.115, 0.16]}>
      <cylinderGeometry args={[0.036, 0.036, 0.004, 14]} />
    </P>
  </group>
)

const GRAPES = [[4, 0.3, 0.07], [4, 0.24, 0.065], [3, 0.18, 0.055], [3, 0.12, 0.045], [2, 0.07, 0.03], [1, 0.03, 0]].flatMap(([n, y, r], row) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + row
    return [Math.cos(a) * r, y + 0.02, Math.sin(a) * r]
  }),
)

const Canele = (props) => (
  <group {...props}>
    <P color="#6b2d0e" position-y={0.04}>
      <cylinderGeometry args={[0.045, 0.055, 0.08, 10]} />
    </P>
    <P color="#c47a2c" line={0.003} position-y={0.082}>
      <cylinderGeometry args={[0.04, 0.045, 0.008, 10]} />
    </P>
    <P color="#3b1606" line={0} position-y={0.087}>
      <cylinderGeometry args={[0.012, 0.012, 0.004, 8]} />
    </P>
  </group>
)

const Raisin = () => (
  <group>
    {GRAPES.map((p, i) => (
      <P key={i} color={i % 3 ? '#6a2c91' : '#8a4bb8'} line={0.004} position={p}>
        <icosahedronGeometry args={[0.042, 1]} />
      </P>
    ))}
    <P color="#ffffff" line={0} position={[0.02, 0.34, 0.06]}>
      <sphereGeometry args={[0.01, 6, 4]} />
    </P>
    <P color="#7a4a2a" line={0.003} position-y={0.4}>
      <cylinderGeometry args={[0.008, 0.012, 0.08, 6]} />
    </P>
    <mesh position={[-0.06, 0.42, 0]}>
      <tubeGeometry args={[new CatmullRomCurve3([new Vector3(0.05, -0.02, 0), new Vector3(0, 0, 0.02), new Vector3(-0.03, 0.03, -0.01), new Vector3(-0.01, 0.06, 0)]), 20, 0.004, 4]} />
      <Toon color="#3cc47c" />
    </mesh>
    <P color="#3cc47c" position={[0.08, 0.4, 0]} rotation={[0.3, 0, -0.5]} scale={[1, 0.15, 1]}>
      <cylinderGeometry args={[0.09, 0.09, 0.1, 5]} />
    </P>
    <Canele position={[0.17, 0, 0.1]} />
    <Canele position={[0.2, 0, -0.04]} />
  </group>
)

const cassoleFoot = lathe([[0, 0], [0.1, 0], [0.105, 0.015], [0.12, 0.02], [0.14, 0.07], [0, 0.07]], 28)
const cassoleBody = lathe([[0.14, 0.07], [0.17, 0.13], [0.2, 0.2], [0.215, 0.225], [0.205, 0.232], [0.195, 0.215], [0.19, 0.19]], 28)

const BEANS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + pseudo(i + 300) * 0.3, d = 0.11 + pseudo(i + 350) * 0.06
  return [Math.cos(a) * d, 0.215, Math.sin(a) * d, pseudo(i + 400) * Math.PI]
})

const BUBBLES = Array.from({ length: 9 }, (_, i) => {
  const a = pseudo(i + 500) * Math.PI * 2, d = Math.sqrt(pseudo(i + 550)) * 0.17
  return [Math.cos(a) * d, 0.214, Math.sin(a) * d, 0.012 + pseudo(i + 600) * 0.012]
})

function Steam() {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.4 + i / 3) % 1
      c.position.y = 0.3 + t * 0.3
      c.scale.setScalar(0.6 + t)
      c.material.opacity = 0.8 * (1 - t)
    })
  })
  return (
    <group ref={ref}>
      {[-0.03, 0.02, 0].map((x, i) => (
        <mesh key={i} position-x={x}>
          <sphereGeometry args={[0.03, 10, 8]} />
          <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

const Cassoulet = () => (
  <group>
    <P color="#c99a62" position-y={0.015}>
      <cylinderGeometry args={[0.27, 0.27, 0.03, 32]} />
    </P>
    <group position-y={0.03}>
      <P color="#e3a173" geometry={cassoleFoot} />
      <P color="#a8431f" geometry={cassoleBody} mat={{ side: DoubleSide }} />
      <P color="#d9973f" line={0} position-y={0.2}>
        <cylinderGeometry args={[0.194, 0.19, 0.02, 28]} />
      </P>
      {BUBBLES.map(([x, y, z, r], i) => (
        <P key={`b${i}`} color="#8a4a1c" line={0} position={[x, y, z]} scale={[1, 0.3, 1]}>
          <sphereGeometry args={[r, 8, 6]} />
        </P>
      ))}
      {BEANS.map(([x, y, z, r], i) => (
        <P key={i} color="#fff1d6" line={0.003} position={[x, y, z]} rotation-y={r} scale={[1.5, 0.8, 1]}>
          <sphereGeometry args={[0.02, 10, 8]} />
        </P>
      ))}
      {[[0.03, -0.06, 0.3], [-0.06, 0.02, 1.4], [0.07, 0.06, 2.4]].map(([x, z, r], i) => (
        <group key={`s${i}`} position={[x, 0.225, z]} rotation={[0, r, 0.25]}>
          <P color="#7a2e1b" line={0.004} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 14]} />
          </P>
          <P color="#e08a7a" line={0} position-x={0.0305} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.026, 0.026, 0.002, 14]} />
          </P>
        </group>
      ))}
      <group position={[-0.07, 0.25, -0.06]} rotation={[0.55, 0.5, 0.4]}>
        <P color="#b5652b" scale={[1, 1.35, 1]}>
          <sphereGeometry args={[0.05, 14, 12]} />
        </P>
        <P color="#fffbef" line={0.004} position-y={0.1}>
          <cylinderGeometry args={[0.01, 0.012, 0.08, 8]} />
        </P>
        {[-1, 1].map((s) => (
          <P key={s} color="#fffbef" line={0.003} position={[s * 0.01, 0.145, 0]}>
            <sphereGeometry args={[0.014, 8, 6]} />
          </P>
        ))}
      </group>
    </group>
    <group position={[0.2, 0.04, 0.1]} rotation={[-Math.PI / 2, 0, 0.9]}>
      <P color="#d9a86c" line={0.004} position-y={0.1}>
        <boxGeometry args={[0.018, 0.22, 0.01]} />
      </P>
      <P color="#d9a86c" line={0.004} scale={[1, 1.4, 0.4]}>
        <sphereGeometry args={[0.028, 10, 8]} />
      </P>
    </group>
    <Steam />
  </group>
)

const Peak = ({ x, z, r, h }) => (
  <group position={[x, 0, z]}>
    <P color="#cfc2fb" position-y={h / 2}>
      <coneGeometry args={[r, h, 6]} />
    </P>
    <P color="#ffffff" line={0.004} position-y={h * 0.85}>
      <coneGeometry args={[r * 0.3 + 0.004, h * 0.3, 6]} />
    </P>
  </group>
)

const MontBlanc = () => (
  <group>
    <Peak x={0} z={-0.05} r={0.24} h={0.6} />
    <Peak x={0.17} z={0.02} r={0.15} h={0.36} />
    <Peak x={-0.16} z={0.04} r={0.13} h={0.3} />
    <Flag position={[0, 0.6, -0.05]} color="#7731ff" />
    <group position={[0.06, 0, 0.2]} rotation-y={-0.4}>
      <P color="#a0623a" position-y={0.04}>
        <boxGeometry args={[0.1, 0.08, 0.08]} />
      </P>
      <Roof w={0.13} d={0.11} h={0.07} color="#6b3f22" position-y={0.115} />
      <Roof w={0.1} d={0.08} h={0.045} color="#ffffff" line={0.003} position-y={0.13} />
      <P color="#ffcb3d" line={0} position={[0, 0.045, 0.041]} mat={{ emissive: '#ffcb3d', emissiveIntensity: 0.5 }}>
        <boxGeometry args={[0.025, 0.025, 0.004]} />
      </P>
    </group>
  </group>
)

const STEMS = [[0, 0], [0.025, 0.015], [-0.025, 0.012], [0.012, -0.022], [-0.015, -0.02]]

const Lavande = () => (
  <group>
    {[-0.12, 0, 0.12].map((z) => (
      <group key={z} position={[-0.05, 0, z]}>
        <P color="#8a5a3b" line={0.004} position-y={0.015}>
          <boxGeometry args={[0.32, 0.03, 0.07]} />
        </P>
        {[-0.11, 0, 0.11].map((x) => (
          <group key={x} position={[x, 0.03, 0]}>
            {STEMS.map(([sx, sz], i) => (
              <group key={i} position={[sx, 0, sz]} rotation={[sz * 6, 0, -sx * 6]}>
                <P color="#4f8a3c" line={0} position-y={0.05}>
                  <cylinderGeometry args={[0.004, 0.004, 0.1, 4]} />
                </P>
                <P color={i % 2 ? '#8f6bd8' : '#7731ff'} line={0.003} position-y={0.12}>
                  <capsuleGeometry args={[0.012, 0.04, 2, 6]} />
                </P>
              </group>
            ))}
          </group>
        ))}
      </group>
    ))}
    <group position={[0.2, 0, -0.05]}>
      <P color="#f3e3c3" position-y={0.05}>
        <boxGeometry args={[0.1, 0.1, 0.12]} />
      </P>
      <Roof w={0.12} d={0.14} h={0.05} color="#e07a3f" position-y={0.125} />
      {[-0.03, 0.03].map((z) => (
        <P key={z} color="#5ac8fa" line={0} position={[-0.051, 0.06, z]}>
          <boxGeometry args={[0.004, 0.03, 0.022]} />
        </P>
      ))}
    </group>
    <group position={[0.2, 0, 0.13]}>
      <P color="#8a6a4a" line={0.003} position-y={0.04}>
        <cylinderGeometry args={[0.01, 0.014, 0.08, 6]} />
      </P>
      <P color="#8aa65a" line={0.004} position-y={0.1} scale={[1, 0.75, 1]}>
        <icosahedronGeometry args={[0.05, 0]} />
      </P>
    </group>
  </group>
)

const TourGenoise = () => (
  <group>
    <P color="#9a93a8" position-y={0.04} scale={[1, 0.4, 1]}>
      <dodecahedronGeometry args={[0.2, 0]} />
    </P>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2
      return (
        <P key={i} color="#ffffff" line={0.004} position={[Math.cos(a) * 0.2, 0.01, Math.sin(a) * 0.2]} scale={[1, 0.3, 1]}>
          <sphereGeometry args={[0.035, 8, 6]} />
        </P>
      )
    })}
    <P color="#d8c9a8" position-y={0.24}>
      <cylinderGeometry args={[0.1, 0.12, 0.34, 12]} />
    </P>
    <P color="#cbb994" line={0} position-y={0.16}>
      <torusGeometry args={[0.114, 0.006, 4, 24]} />
    </P>
    <P color="#cbb994" position-y={0.42}>
      <cylinderGeometry args={[0.125, 0.105, 0.04, 12]} />
    </P>
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2
      return (
        <P key={i} color="#cbb994" line={0.004} position={[Math.cos(a) * 0.11, 0.46, Math.sin(a) * 0.11]} rotation-y={-a}>
          <boxGeometry args={[0.03, 0.04, 0.04]} />
        </P>
      )
    })}
    <P color="#5c3a1e" line={0.003} position={[0, 0.3, 0.108]}>
      <boxGeometry args={[0.035, 0.06, 0.01]} />
    </P>
    <group position-y={0.44}>
      <P color="#5a6577" line={0} position-y={0.07}>
        <cylinderGeometry args={[0.004, 0.004, 0.14, 6]} />
      </P>
      <P color="#ffffff" line={0.004} position={[0.04, 0.115, 0]}>
        <boxGeometry args={[0.08, 0.055, 0.004]} />
      </P>
      <P color={INK} line={0} position={[0.04, 0.115, 0.003]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.014, 0.014, 0.002, 12]} />
      </P>
    </group>
  </group>
)

export const base = {
  11: TourEiffel,
  24: Chateau,
  27: Vin,
  28: Camembert,
  32: Frites,
  44: Bretzel,
  52: PetitBeurre,
  53: Phare,
  75: Raisin,
  76: Cassoulet,
  84: MontBlanc,
  93: Lavande,
  94: TourGenoise,
}
