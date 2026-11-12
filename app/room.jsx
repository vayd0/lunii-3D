import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { P, Toon } from './toon'

const FLOOR = -4.1
const RUG = { w: 26, d: 18 }

function rugTexture() {
  const W = 2600, H = 1800, u = W / RUG.w
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.fillStyle = '#5fcf4a'
  g.fillRect(0, 0, W, H)
  g.fillStyle = '#4cbf3a'
  for (let i = 0; i < 60; i++) {
    g.beginPath()
    g.arc((i * 977) % W, (i * 613) % H, 40 + (i % 5) * 18, 0, Math.PI * 2)
    g.fill()
  }
  g.fillStyle = '#2fb5f5'
  g.beginPath()
  g.moveTo(0, H * 0.78)
  g.bezierCurveTo(W * 0.25, H * 0.68, W * 0.4, H * 0.95, W * 0.62, H * 0.86)
  g.bezierCurveTo(W * 0.8, H * 0.78, W * 0.9, H * 0.95, W, H * 0.9)
  g.lineTo(W, H)
  g.lineTo(0, H)
  g.fill()

  const R = 2.1 * u
  const road = 1.3 * u
  const rings = [[W * 0.24, H * 0.32], [W * 0.76, H * 0.32], [W * 0.5, H * 0.62]]
  const paths = [
    [[0, H * 0.32], [W, H * 0.32]],
    [[W * 0.24, 0], [W * 0.24, H * 0.32], [W * 0.5, H * 0.62]],
    [[W * 0.76, 0], [W * 0.76, H * 0.32], [W * 0.5, H * 0.62]],
    [[W * 0.5, H * 0.62], [W * 0.5, H]],
    [[0, H * 0.62], [W, H * 0.62]],
  ]
  const stroke = (w, col, dash) => {
    g.lineWidth = w
    g.strokeStyle = col
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.setLineDash(dash || [])
    paths.forEach((p) => {
      g.beginPath()
      p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
      g.stroke()
    })
    rings.forEach(([x, y]) => {
      g.beginPath()
      g.arc(x, y, R, 0, Math.PI * 2)
      g.stroke()
    })
  }
  stroke(road + 0.2 * u, '#f4f1ea')
  stroke(road, '#6b6f78')
  stroke(0.08 * u, '#ffffff', [0.4 * u, 0.4 * u])
  g.setLineDash([])
  rings.forEach(([x, y]) => {
    g.fillStyle = '#f4f1ea'
    g.beginPath()
    g.arc(x, y, R - road / 2 - 0.1 * u, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#5fcf4a'
    g.beginPath()
    g.arc(x, y, R - road / 2 - 0.2 * u, 0, Math.PI * 2)
    g.fill()
    ;['#ff6b6b', '#ffcb3d', '#7731ff'].forEach((col, i) => {
      g.fillStyle = col
      g.beginPath()
      g.arc(x + Math.cos(i * 2.1) * 0.35 * u, y + Math.sin(i * 2.1) * 0.35 * u, 0.18 * u, 0, Math.PI * 2)
      g.fill()
    })
  })
  ;[[W * 0.37, H * 0.32], [W * 0.63, H * 0.32], [W * 0.5, H * 0.8]].forEach(([x, y], k) => {
    g.fillStyle = '#ffffff'
    for (let i = -2; i <= 2; i++) {
      if (k < 2) g.fillRect(x - 0.08 * u + i * 0.001, y - road / 2 + (i + 2) * (road / 5) + 6, 0.5 * u, road / 10)
      else g.fillRect(x - road / 2 + (i + 2) * (road / 5) + 6, y - 0.25 * u, road / 10, 0.5 * u)
    }
  })
  const houses = [
    [0.08, 0.1, '#ff8f6b'], [0.4, 0.12, '#ffd36b'], [0.6, 0.1, '#7fb8ff'], [0.9, 0.12, '#ff9fd0'],
    [0.08, 0.48, '#b49bff'], [0.36, 0.46, '#ffb36b'], [0.66, 0.47, '#6bd6c8'], [0.92, 0.48, '#ffd36b'],
    [0.2, 0.72, '#ff8f6b'], [0.8, 0.7, '#7fb8ff'],
  ]
  houses.forEach(([x, y, col]) => {
    const hx = x * W, hy = y * H, s = 0.9 * u
    g.fillStyle = col
    g.fillRect(hx - s / 2, hy - s / 2, s, s)
    g.fillStyle = '#c0483a'
    g.beginPath()
    g.moveTo(hx - s * 0.6, hy - s / 2)
    g.lineTo(hx, hy - s)
    g.lineTo(hx + s * 0.6, hy - s / 2)
    g.fill()
    g.fillStyle = '#ffffff'
    g.fillRect(hx - s * 0.15, hy, s * 0.3, s * 0.5)
  })
  g.fillStyle = '#2f9a3e'
  for (let i = 0; i < 40; i++) {
    const x = ((i * 733) % 1000) / 1000, y = ((i * 397) % 1000) / 1000
    if (Math.abs(y - 0.32) < 0.08 || Math.abs(y - 0.62) < 0.08 || y > 0.74) continue
    g.beginPath()
    g.arc(x * W, y * H, 0.28 * u, 0, Math.PI * 2)
    g.fill()
  }
  g.lineWidth = 0.35 * u
  g.strokeStyle = '#ff3d8b'
  g.strokeRect(0.17 * u, 0.17 * u, W - 0.35 * u, H - 0.35 * u)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 8
  return t
}

const BLOCKS = ['#ff6b6b', '#ffcb3d', '#4fc3f7', '#7cd67a', '#b49bff', '#ff9f43']

export function Room() {
  const rug = useMemo(rugTexture, [])
  const none = () => null
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR - 0.01} receiveShadow raycast={none}>
        <planeGeometry args={[60, 50]} />
        <Toon color="#f0b56e" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-0.2, FLOOR + 0.01, 1.5]} receiveShadow raycast={none}>
        <planeGeometry args={[RUG.w, RUG.d]} />
        <meshToonMaterial map={rug} />
      </mesh>
      <mesh position={[0, FLOOR + 9, -18]} receiveShadow raycast={none}>
        <planeGeometry args={[60, 18]} />
        <Toon color="#ffc93c" />
      </mesh>
      <mesh position={[0, FLOOR + 1.6, -17.95]} raycast={none}>
        <planeGeometry args={[60, 3.2]} />
        <Toon color="#ff8fab" />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 22, FLOOR + 9, 4]} rotation-y={-s * Math.PI / 2} receiveShadow raycast={none}>
            <planeGeometry args={[50, 18]} />
            <Toon color="#5fb8ff" />
          </mesh>
          <mesh position={[s * 21.95, FLOOR + 1.6, 4]} rotation-y={-s * Math.PI / 2} raycast={none}>
            <planeGeometry args={[50, 3.2]} />
            <Toon color="#ff5fa2" />
          </mesh>
        </group>
      ))}
      <group position={[9, FLOOR + 9, -17.9]}>
        <P color="#ffffff" line={0.02} raycast={none}>
          <boxGeometry args={[7.4, 5.6, 0.3]} />
        </P>
        <mesh position-z={0.17} raycast={none}>
          <planeGeometry args={[6.6, 4.8]} />
          <meshBasicMaterial color="#8fd8ff" toneMapped={false} />
        </mesh>
        <P color="#ffffff" line={0} position-z={0.2} raycast={none}>
          <boxGeometry args={[0.25, 4.8, 0.1]} />
        </P>
        <P color="#ffffff" line={0} position-z={0.2} raycast={none}>
          <boxGeometry args={[6.6, 0.25, 0.1]} />
        </P>
      </group>
      <group position={[-10, FLOOR + 10, -17.8]}>
        {Array.from({ length: 9 }, (_, i) => (
          <P key={i} color={BLOCKS[i % BLOCKS.length]} line={0.01} position={[i * 1.4 - 5.6, -Math.sin((i / 8) * Math.PI) * 0.9, 0]} rotation-z={Math.PI} raycast={none}>
            <coneGeometry args={[0.5, 1, 3]} />
          </P>
        ))}
      </group>
      <group position={[-14, FLOOR, -16.5]}>
        {[2.2, 4.6].map((y) => (
          <P key={y} color="#ffffff" line={0.015} position={[0, y, 0]} raycast={none}>
            <boxGeometry args={[7, 0.25, 2]} />
          </P>
        ))}
        {[-1, 1].map((s) => (
          <P key={s} color="#ffffff" line={0.015} position={[s * 3.4, 2.4, 0]} raycast={none}>
            <boxGeometry args={[0.25, 4.8, 2]} />
          </P>
        ))}
        {BLOCKS.map((col, i) => (
          <P key={col} color={col} line={0.012} position={[-2.6 + i * 1.05, i % 2 ? 2.75 : 5.1, 0]} rotation-y={i * 0.4} raycast={none}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
          </P>
        ))}
      </group>
      <group position={[15, FLOOR, -12]}>
        <P color="#ffcb3d" line={0.02} position-y={1.6} raycast={none}>
          <boxGeometry args={[5, 3.2, 3]} />
        </P>
        <P color="#ff6b6b" line={0.02} position-y={3.3} rotation-x={-0.25} raycast={none}>
          <boxGeometry args={[5.2, 0.3, 3.2]} />
        </P>
      </group>
      <P color="#4fc3f7" line={0.02} position={[12, FLOOR + 1.3, 7]} raycast={none}>
        <sphereGeometry args={[1.3, 24, 16]} />
      </P>
      {[[-12, 6, 0.3], [-11, 7.6, 1.1], [-10.6, 6.2, 2], [11, 0, 0.6]].map(([x, z, r], i) => (
        <P key={i} color={BLOCKS[(i * 2) % BLOCKS.length]} line={0.012} position={[x, FLOOR + 0.5, z]} rotation-y={r} raycast={none}>
          <boxGeometry args={[1, 1, 1]} />
        </P>
      ))}
      <P color={BLOCKS[4]} line={0.012} position={[-11.4, FLOOR + 1.5, 6.6]} rotation-y={0.7} raycast={none}>
        <boxGeometry args={[1, 1, 1]} />
      </P>
    </group>
  )
}
