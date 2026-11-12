'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { base } from '../specialties'

function Item() {
  const params = useSearchParams()
  const Specialty = base[params.get('code') ?? '11']
  const az = Number(params.get('az') ?? 0.6)
  const el = Number(params.get('el') ?? 0.5)
  const d = Number(params.get('d') ?? 2)
  const y = Number(params.get('y') ?? 0.3)
  return (
    <Canvas shadows camera={{ position: [Math.sin(az) * Math.cos(el) * d, y + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d], fov: 35 }} style={{ background: '#f4efff' }}>
      <hemisphereLight args={['#ffffff', '#f4efff', 1.4]} />
      <directionalLight position={[6, 10, 4]} intensity={1.6} castShadow />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[0.8, 48]} />
        <meshToonMaterial color="#b4ec8c" />
      </mesh>
      <Specialty />
      <OrbitControls target={[0, y, 0]} />
    </Canvas>
  )
}

export default function Preview() {
  return (
    <Suspense>
      <Item />
    </Suspense>
  )
}
