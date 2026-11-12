import { DataTexture, NearestFilter, RedFormat } from 'three'
import { Outlines } from '@react-three/drei'

export const INK = '#161a24'

export const gradientMap = new DataTexture(new Uint8Array([90, 170, 255]), 3, 1, RedFormat)
gradientMap.minFilter = gradientMap.magFilter = NearestFilter
gradientMap.needsUpdate = true

const addStripes = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vStripe;')
    .replace(
      '#include <project_vertex>',
      '#include <project_vertex>\nvec4 sp = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\nsp = instanceMatrix * sp;\n#endif\nvStripe = (modelMatrix * sp).xyz;'
    )
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vStripe;')
    .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42), step(0.55, fract((vStripe.x + vStripe.z) * 2.2)));')
}

export const Toon = ({ striped, ...props }) => (
  <meshToonMaterial key={striped ? 1 : 0} gradientMap={gradientMap} onBeforeCompile={striped ? addStripes : undefined} {...props} />
)

export const Ink = ({ thickness = 0.008 }) => <Outlines thickness={thickness} color={INK} angle={0} />

export function P({ children, color, line = 0.008, mat, striped, ...props }) {
  return (
    <mesh {...props}>
      {children}
      <Toon color={color} striped={striped} {...mat} />
      {line > 0 && <Ink thickness={line} />}
    </mesh>
  )
}

export const Roof = ({ w, d, h, color, ...props }) => (
  <P color={color} rotation-y={Math.PI / 4} scale={[w / 0.2828, 1, d / 0.2828]} {...props}>
    <coneGeometry args={[0.2, h, 4]} />
  </P>
)

export const Flag = ({ color = '#ffcb3d', ...props }) => (
  <group {...props}>
    <P color="#5a6577" line={0} position-y={0.05}>
      <cylinderGeometry args={[0.004, 0.004, 0.1, 6]} />
    </P>
    <P color={color} line={0.004} position={[0.025, 0.085, 0]}>
      <boxGeometry args={[0.05, 0.03, 0.004]} />
    </P>
  </group>
)

