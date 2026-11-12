import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, ExtrudeGeometry, Shape, Vector3 } from 'three'
import { base, pseudo } from './specialties'
import { INK, P, Roof } from './toon'

const triangle = (w, h) => {
  const s = new Shape()
  s.moveTo(0, 0)
  s.lineTo(w, 0)
  s.lineTo(0, h)
  s.lineTo(0, 0)
  return new ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: false })
}
const mainSail = triangle(0.09, 0.16)
const jib = triangle(-0.06, 0.12)

const Sea = ({ r = 0.14, ...props }) => (
  <group {...props}>
    <P color="#5ac8fa" line={0.004} position-y={0.006}>
      <cylinderGeometry args={[r, r, 0.012, 24]} />
    </P>
    {[0.3, 2.2, 4].map((a) => (
      <P key={a} color="#ffffff" line={0} position={[Math.cos(a) * r * 0.6, 0.013, Math.sin(a) * r * 0.6]} rotation-y={a}>
        <boxGeometry args={[0.04, 0.003, 0.008]} />
      </P>
    ))}
  </group>
)

const Sailboat = (props) => (
  <group {...props}>
    <Sea />
    <group position-y={0.02}>
      <P color="#ffffff" position-y={0.015} scale={[1, 0.6, 0.45]}>
        <sphereGeometry args={[0.09, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </P>
      <P color="#e63946" line={0} position-y={0.016}>
        <boxGeometry args={[0.17, 0.006, 0.075]} />
      </P>
      <P color="#a0623a" line={0.003} position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.2, 6]} />
      </P>
      <P color="#fffbef" line={0.003} geometry={mainSail} position={[0.005, 0.03, 0]} />
      <P color="#7731ff" line={0.003} geometry={jib} position={[-0.005, 0.04, 0]} />
    </group>
  </group>
)

function Seagull({ radius = 0.3, height = 0.6, speed = 0.8 }) {
  const ref = useRef()
  const wings = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ref.current.rotation.y = t * speed
    wings.current.children.forEach((w, i) => (w.rotation.x = (i ? -1 : 1) * (0.3 + Math.sin(t * 8) * 0.4)))
  })
  return (
    <group ref={ref}>
      <group position={[radius, height, 0]}>
        <P color="#ffffff" line={0.003} rotation-x={Math.PI / 2} scale={[1, 1.6, 1]}>
          <sphereGeometry args={[0.018, 10, 8]} />
        </P>
        <P color="#ffcb3d" line={0} position={[0, 0, -0.035]} rotation-x={-Math.PI / 2}>
          <coneGeometry args={[0.006, 0.015, 6]} />
        </P>
        <group ref={wings}>
          {[1, -1].map((s) => (
            <group key={s} rotation-x={s * 0.3}>
              <P color="#d9dbe3" line={0.003} position={[s * 0.035, 0, 0]}>
                <boxGeometry args={[0.06, 0.004, 0.025]} />
              </P>
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}

const Beffroi = (props) => (
  <group {...props}>
    <P color="#c2643c" position-y={0.2}>
      <boxGeometry args={[0.1, 0.4, 0.1]} />
    </P>
    {[0.08, 0.16, 0.24].map((y) => (
      <P key={y} color="#3d2a20" line={0} position={[0, y, 0.051]}>
        <boxGeometry args={[0.02, 0.035, 0.004]} />
      </P>
    ))}
    <P color="#fffbef" line={0.003} position={[0, 0.34, 0.052]} rotation-x={Math.PI / 2}>
      <cylinderGeometry args={[0.03, 0.03, 0.004, 16]} />
    </P>
    <P color={INK} line={0} position={[0.006, 0.345, 0.056]} rotation-z={-0.8}>
      <boxGeometry args={[0.003, 0.02, 0.002]} />
    </P>
    <P color={INK} line={0} position={[0, 0.34, 0.056]} rotation-z={0.3}>
      <boxGeometry args={[0.003, 0.014, 0.002]} />
    </P>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
      <group key={`${x}${z}`} position={[x * 0.05, 0.4, z * 0.05]}>
        <P color="#c2643c" line={0.003} position-y={0.03}>
          <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
        </P>
        <P color="#4a9e8e" line={0.003} position-y={0.08}>
          <coneGeometry args={[0.02, 0.05, 8]} />
        </P>
      </group>
    ))}
    <P color="#c2643c" position-y={0.43}>
      <boxGeometry args={[0.07, 0.06, 0.07]} />
    </P>
    <P color="#4a9e8e" position-y={0.53} rotation-y={Math.PI / 4}>
      <coneGeometry args={[0.055, 0.14, 4]} />
    </P>
    <P color="#ffcb3d" line={0.003} position-y={0.61}>
      <sphereGeometry args={[0.01, 8, 6]} />
    </P>
  </group>
)

function Chevalement(props) {
  const wheel = useRef()
  useFrame((_, dt) => (wheel.current.rotation.z += dt))
  return (
    <group {...props}>
      <P color="#7a7f8c" line={0.004} position-y={0.03}>
        <boxGeometry args={[0.12, 0.06, 0.08]} />
      </P>
      {[-1, 1].map((s) => (
        <P key={s} color="#c0392b" line={0.003} position={[s * 0.035, 0.15, 0]} rotation-z={s * 0.18}>
          <boxGeometry args={[0.012, 0.22, 0.012]} />
        </P>
      ))}
      <P color="#c0392b" line={0.003} position={[0.06, 0.12, 0]} rotation-z={-0.6}>
        <boxGeometry args={[0.01, 0.2, 0.01]} />
      </P>
      <group ref={wheel} position-y={0.26}>
        <P color="#2b2d42" line={0.003}>
          <torusGeometry args={[0.035, 0.006, 6, 16]} />
        </P>
        {[0, 1, 2].map((i) => (
          <P key={i} color="#2b2d42" line={0} rotation-z={(i * Math.PI) / 3}>
            <boxGeometry args={[0.07, 0.004, 0.004]} />
          </P>
        ))}
      </group>
    </group>
  )
}

const Baguette = (props) => (
  <group {...props}>
    <P color="#e0a85a" rotation-z={Math.PI / 2}>
      <capsuleGeometry args={[0.022, 0.26, 4, 10]} />
    </P>
    {[-0.09, -0.03, 0.03, 0.09].map((x) => (
      <P key={x} color="#f6d9a0" line={0} position={[x, 0.02, 0]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.04, 0.006, 0.01]} />
      </P>
    ))}
  </group>
)

const Croissant = (props) => (
  <group {...props}>
    <P color="#e8a13c" rotation-x={Math.PI / 2} scale={[1, 1, 0.8]}>
      <torusGeometry args={[0.045, 0.024, 8, 16, Math.PI * 1.25]} />
    </P>
    {[0.4, 1.1, 1.8, 2.5, 3.2].map((a) => (
      <P key={a} color="#c97a22" line={0} position={[Math.cos(a) * 0.045, 0.012, Math.sin(a) * 0.045]} rotation-y={-a}>
        <boxGeometry args={[0.005, 0.02, 0.05]} />
      </P>
    ))}
  </group>
)

const Crepes = (props) => (
  <group {...props}>
    <P color="#ffffff" line={0.004} position-y={0.005}>
      <cylinderGeometry args={[0.085, 0.07, 0.01, 20]} />
    </P>
    {[0, 1, 2, 3].map((i) => (
      <P key={i} color={i % 2 ? '#f0c27b' : '#e8b263'} line={0.003} position-y={0.016 + i * 0.01} rotation-y={i}>
        <cylinderGeometry args={[0.065, 0.065, 0.008, 18]} />
      </P>
    ))}
    <P color="#5c2e14" line={0} position-y={0.056} scale={[1, 0.3, 1]}>
      <sphereGeometry args={[0.04, 14, 8]} />
    </P>
    <P color="#fff3b0" line={0.003} position-y={0.064}>
      <boxGeometry args={[0.025, 0.012, 0.025]} />
    </P>
  </group>
)

const Cow = (props) => (
  <group {...props}>
    <P color="#ffffff" position-y={0.075}>
      <boxGeometry args={[0.14, 0.07, 0.07]} />
    </P>
    {[[-0.03, 0.08, 0.036, 0.04], [0.035, 0.07, 0.036, 0.03], [0.01, 0.09, -0.036, 0.045]].map(([x, y, z, w], i) => (
      <P key={i} color="#6b3f22" line={0} position={[x, y, z]}>
        <boxGeometry args={[w, 0.035, 0.004]} />
      </P>
    ))}
    {[[-0.05, -0.025], [0.05, -0.025], [-0.05, 0.025], [0.05, 0.025]].map(([x, z]) => (
      <P key={`${x}${z}`} color="#ffffff" line={0.003} position={[x, 0.02, z]}>
        <boxGeometry args={[0.018, 0.04, 0.018]} />
      </P>
    ))}
    <P color="#ffffff" position={[0.085, 0.1, 0]}>
      <boxGeometry args={[0.05, 0.05, 0.05]} />
    </P>
    <P color="#ffb4c6" line={0.003} position={[0.113, 0.09, 0]}>
      <boxGeometry args={[0.012, 0.028, 0.04]} />
    </P>
    {[-1, 1].map((s) => (
      <group key={s}>
        <P color="#fffbef" line={0.002} position={[0.085, 0.135, s * 0.02]} rotation-x={s * -0.5}>
          <coneGeometry args={[0.006, 0.025, 6]} />
        </P>
        <P color={INK} line={0} position={[0.111, 0.11, s * 0.013]}>
          <sphereGeometry args={[0.005, 6, 4]} />
        </P>
      </group>
    ))}
    <P color="#ffb4c6" line={0.003} position={[-0.01, 0.035, 0]}>
      <sphereGeometry args={[0.018, 8, 6]} />
    </P>
    <P color="#ffffff" line={0.002} position={[-0.075, 0.07, 0]} rotation-z={0.4}>
      <cylinderGeometry args={[0.003, 0.003, 0.06, 4]} />
    </P>
  </group>
)

const House = ({ color = '#fffbef', roof = '#c0392b', ...props }) => (
  <group {...props}>
    <P color={color} position-y={0.06}>
      <boxGeometry args={[0.12, 0.12, 0.1]} />
    </P>
    <P color="#6b3f22" line={0} position={[0, 0.06, 0.051]}>
      <boxGeometry args={[0.12, 0.01, 0.004]} />
    </P>
    {[-0.04, 0.04].map((x) => (
      <P key={x} color="#5ac8fa" line={0} position={[x, 0.09, 0.052]}>
        <boxGeometry args={[0.025, 0.025, 0.004]} />
      </P>
    ))}
    <Roof w={0.15} d={0.13} h={0.14} color={roof} position-y={0.19} />
  </group>
)

const spiral = new CatmullRomCurve3(
  Array.from({ length: 30 }, (_, i) => {
    const a = i * 0.45, r = 0.004 + i * 0.0014
    return new Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
  }),
)

const Escargot = (props) => (
  <group {...props}>
    <P color="#f0d9b5" position={[0.01, 0.012, 0]} rotation-z={Math.PI / 2}>
      <capsuleGeometry args={[0.012, 0.08, 4, 8]} />
    </P>
    <P color="#c98b4a" position={[0, 0.05, 0]} scale={[1, 1, 0.75]}>
      <sphereGeometry args={[0.042, 16, 12]} />
    </P>
    <mesh position={[0, 0.05, 0.032]}>
      <tubeGeometry args={[spiral, 60, 0.0035, 5]} />
      <meshBasicMaterial color="#6b3f22" />
    </mesh>
    {[-1, 1].map((s) => (
      <group key={s} position={[0.055, 0.02, s * 0.008]} rotation-z={-0.3}>
        <P color="#f0d9b5" line={0} position-y={0.02}>
          <cylinderGeometry args={[0.003, 0.003, 0.04, 4]} />
        </P>
        <P color={INK} line={0} position-y={0.042}>
          <sphereGeometry args={[0.006, 6, 4]} />
        </P>
      </group>
    ))}
  </group>
)

const Vines = (props) => (
  <group {...props}>
    {[-0.05, 0.05].flatMap((z) => [-0.09, -0.03, 0.03, 0.09].map((x) => (
      <group key={`${x}${z}`} position={[x, 0, z]}>
        <P color="#7a4a2a" line={0} position-y={0.03}>
          <cylinderGeometry args={[0.004, 0.004, 0.06, 4]} />
        </P>
        <P color="#3cc47c" line={0.003} position-y={0.06}>
          <icosahedronGeometry args={[0.024, 0]} />
        </P>
        <P color="#6a2c91" line={0} position={[0.012, 0.045, 0.015]}>
          <sphereGeometry args={[0.008, 6, 4]} />
        </P>
      </group>
    )))}
  </group>
)

const Garden = (props) => (
  <group {...props}>
    <P color="#f3e3c3" line={0.003} position-y={0.004}>
      <boxGeometry args={[0.04, 0.008, 0.2]} />
    </P>
    {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
      <P key={`${x}${z}`} color="#2e9e5b" line={0.003} position={[x * 0.065, 0.015, z * 0.05]}>
        <boxGeometry args={[0.08, 0.03, 0.07]} />
      </P>
    )))}
    {[-1, 1].map((x) => (
      <P key={x} color="#2e9e5b" line={0.003} position={[x * 0.035, 0.05, 0.13]}>
        <coneGeometry args={[0.018, 0.08, 8]} />
      </P>
    ))}
  </group>
)

const BERLINGOTS = ['#e63946', '#ffcb3d', '#7731ff', '#3cc47c', '#5ac8fa']

const Berlingots = (props) => (
  <group {...props}>
    {BERLINGOTS.map((c, i) => (
      <P key={c} color={c} line={0.003} position={[(pseudo(i + 600) - 0.5) * 0.12, 0.022, (pseudo(i + 700) - 0.5) * 0.12]} rotation={[pseudo(i) * 3, pseudo(i + 1) * 3, 0]}>
        <tetrahedronGeometry args={[0.03, 0]} />
      </P>
    ))}
  </group>
)

const Surf = (props) => (
  <group {...props}>
    <P color="#f3e3c3" line={0.004} position-y={0.005} scale={[1, 0.15, 1]}>
      <cylinderGeometry args={[0.12, 0.12, 0.06, 20]} />
    </P>
    <P color="#5ac8fa" line={0.004} position={[0.04, 0.02, -0.03]} rotation={[0, 0.4, 0]}>
      <torusGeometry args={[0.06, 0.022, 8, 16, Math.PI * 1.2]} />
    </P>
    {[0.2, 0.9, 1.6].map((a) => (
      <P key={a} color="#ffffff" line={0.002} position={[0.04 + Math.cos(a + 0.4) * 0.06, 0.02 + Math.sin(a) * 0.06, -0.03]}>
        <sphereGeometry args={[0.012, 8, 6]} />
      </P>
    ))}
    <group position={[-0.05, 0.11, 0.03]} rotation={[0.15, 0, 0.2]}>
      <P color="#ffcb3d" scale={[0.35, 1, 0.1]}>
        <sphereGeometry args={[0.11, 16, 12]} />
      </P>
      <P color="#7731ff" line={0} position-z={0.011}>
        <boxGeometry args={[0.012, 0.2, 0.004]} />
      </P>
    </group>
  </group>
)

const Rugby = (props) => (
  <group {...props}>
    <P color="#8b4a2b" position-y={0.035} scale={[1.5, 1, 1]}>
      <sphereGeometry args={[0.035, 16, 12]} />
    </P>
    {[-0.015, 0, 0.015].map((x) => (
      <P key={x} color="#ffffff" line={0} position={[x, 0.07, 0]}>
        <boxGeometry args={[0.004, 0.004, 0.018]} />
      </P>
    ))}
    <P color="#ffffff" line={0} position-y={0.069}>
      <boxGeometry args={[0.045, 0.003, 0.004]} />
    </P>
  </group>
)

const Skis = (props) => (
  <group {...props}>
    <P color="#ffffff" line={0.003} position-y={0.008} scale={[1, 0.3, 1]}>
      <sphereGeometry args={[0.06, 12, 8]} />
    </P>
    {[[-0.012, 0.25, '#e63946'], [0.012, -0.25, '#7731ff']].map(([x, r, c]) => (
      <P key={c} color={c} line={0.003} position={[x, 0.09, 0]} rotation-z={r}>
        <boxGeometry args={[0.018, 0.2, 0.006]} />
      </P>
    ))}
    {[-0.04, 0.04].map((x) => (
      <P key={x} color="#5a6577" line={0} position={[x, 0.07, 0.02]} rotation-z={x * 3}>
        <cylinderGeometry args={[0.003, 0.003, 0.15, 4]} />
      </P>
    ))}
  </group>
)

const Petanque = (props) => (
  <group {...props}>
    {[[0, 0], [0.05, 0.03], [-0.03, 0.05]].map(([x, z], i) => (
      <P key={i} color="#b8bcc6" line={0.003} position={[x, 0.02, z]}>
        <sphereGeometry args={[0.02, 12, 10]} />
      </P>
    ))}
    <P color="#e07a3f" line={0.002} position={[0.02, 0.008, -0.04]}>
      <sphereGeometry args={[0.008, 8, 6]} />
    </P>
  </group>
)

const Cigale = (props) => (
  <group {...props}>
    <P color="#6b4f3a" line={0.002} rotation-x={Math.PI / 2}>
      <capsuleGeometry args={[0.008, 0.022, 4, 8]} />
    </P>
    {[-1, 1].map((s) => (
      <P key={s} color="#d9f1ff" line={0.002} position={[s * 0.01, 0.006, -0.008]} rotation-y={s * 0.3} scale={[0.4, 0.08, 1]}>
        <sphereGeometry args={[0.025, 8, 6]} />
      </P>
    ))}
  </group>
)

const Chataignes = (props) => (
  <group {...props}>
    <P color="#3cc47c" position-y={0.03}>
      <icosahedronGeometry args={[0.035, 0]} />
    </P>
    {[[0.05, 0.02], [0.03, -0.045], [-0.045, 0.04]].map(([x, z], i) => (
      <group key={i} position={[x, 0.018, z]} rotation-y={i * 2}>
        <P color="#7a3e1d" line={0.003} scale={[1, 0.8, 0.7]}>
          <sphereGeometry args={[0.022, 10, 8]} />
        </P>
        <P color="#d9b08c" line={0} position-y={-0.012} scale={[1, 0.3, 0.7]}>
          <sphereGeometry args={[0.019, 10, 6]} />
        </P>
      </group>
    ))}
  </group>
)

const scene = (Main, extras) => () => (
  <>
    <Main />
    {extras}
  </>
)

export const specialties = {
  11: scene(base[11], [<Baguette key="b" position={[0.25, 0.025, 0.12]} rotation-y={0.5} />, <Croissant key="c" position={[-0.22, 0.02, 0.15]} />]),
  24: scene(base[24], <Garden position={[0, 0, 0.34]} />),
  27: scene(base[27], [<Escargot key="e" position={[-0.22, 0, 0.12]} />, <Vines key="v" position={[0.05, 0, 0.3]} />]),
  28: scene(base[28], <Cow position={[-0.05, 0, 0.32]} rotation-y={0.4} />),
  32: scene(base[32], [<Beffroi key="b" position={[0.32, 0, -0.05]} />, <Chevalement key="c" position={[-0.3, 0, -0.15]} />]),
  44: scene(base[44], <House position={[-0.32, 0, 0.12]} color="#ffe2b0" roof="#7731ff" />),
  52: scene(base[52], <Berlingots position={[0.24, 0, -0.15]} />),
  53: scene(base[53], [<Sailboat key="s" position={[-0.32, 0, 0.1]} />, <Crepes key="c" position={[0.25, 0, 0.12]} />, <Seagull key="g" />]),
  75: scene(base[75], [<Surf key="s" position={[-0.3, 0, 0.12]} />]),
  76: scene(base[76], <Rugby position={[0.27, 0, 0.08]} rotation-y={0.6} />),
  84: scene(base[84], <Skis position={[-0.3, 0, 0.18]} />),
  93: scene(base[93], [<Petanque key="p" position={[0.22, 0, 0.3]} />, <Cigale key="c" position={[0.2, 0.09, 0.145]} />]),
  94: scene(base[94], [<Chataignes key="c" position={[0.12, 0, 0.2]} />, <Sailboat key="s" position={[-0.2, 0, 0.15]} scale={0.7} />]),
}
