import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroState } from './heroState'

const RIPPLES = 12

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uRipples[${RIPPLES}];
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vRipple;

  float waves(vec2 p, float t) {
    float h = 0.0;
    h += sin(p.x * 0.55 + t * 0.7) * 0.07;
    h += sin(p.y * 0.85 - t * 0.95 + p.x * 0.35) * 0.055;
    h += sin((p.x + p.y) * 1.7 + t * 1.5) * 0.02;
    h += sin((p.x - p.y * 0.6) * 3.1 - t * 2.2) * 0.008;
    return h;
  }
  float ripples(vec2 p) {
    float h = 0.0;
    for (int i = 0; i < ${RIPPLES}; i++) {
      vec3 r = uRipples[i];
      float age = uTime - r.z;
      if (age < 0.0 || age > 4.5) continue;
      float d = distance(p, r.xy);
      float k = d - age * 1.35;
      h += 0.075 * sin(k * 10.0) * exp(-k * k * 5.0) * exp(-age * 0.85) / (1.0 + d * 1.2);
    }
    return h;
  }
  float height(vec2 p) { return waves(p, uTime) + ripples(p); }

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    // plane is rotated so local xy maps to world xz; displace along local z (= world up)
    vec2 p = position.xy;
    float e = 0.06;
    float h = height(p);
    float hx = height(p + vec2(e, 0.0));
    float hy = height(p + vec2(0.0, e));
    vec3 displaced = position + vec3(0.0, 0.0, h);
    vec3 nLocal = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));
    vNormal = normalize(mat3(modelMatrix) * nLocal);
    vRipple = ripples(p);
    vWorld = (modelMatrix * vec4(displaced, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uDip;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vRipple;

  float caustic(vec2 p, float t) {
    float a = sin(p.x * 2.3 + sin(p.y * 1.7 + t * 0.9) * 1.4);
    float b = sin(p.y * 2.1 + sin(p.x * 1.9 - t * 0.8) * 1.4);
    return pow(1.0 - abs(a * b), 6.0);
  }

  void main() {
    vec3 surface = vec3(0.902, 0.902, 0.875);   // #e6e6df
    vec3 shallow = vec3(0.624, 0.718, 0.769);   // #9fb7c4
    vec3 mid     = vec3(0.173, 0.365, 0.451);   // #2c5d73
    vec3 v = normalize(cameraPosition - vWorld);
    vec3 n = normalize(vNormal);
    float dist = length(cameraPosition - vWorld);
    vec3 col;

    if (gl_FrontFacing) {
      // above the waterline — bright, milky sea seen from slightly above
      float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);
      vec3 sun = normalize(vec3(-0.35, 0.75, -0.9));
      float spec = pow(max(dot(reflect(-sun, n), v), 0.0), 160.0);
      float glint = pow(max(dot(reflect(-sun, n), v), 0.0), 18.0) * 0.12;
      col = mix(shallow * 0.92, surface * 1.04, clamp(fres * 1.1 + 0.28, 0.0, 1.0));
      col += caustic(vWorld.xz * 0.9, uTime) * 0.05;
      col += vRipple * 1.6 * vec3(0.95, 1.0, 1.0);
      col += spec * 0.9 + glint;
      col = mix(col, surface, smoothstep(5.0, 24.0, dist));
    } else {
      // below — Snell's window: bright overhead, darker toward the horizon
      n = -n;
      float up = clamp(abs(v.y), 0.0, 1.0);
      float win = smoothstep(0.35, 0.9, up);
      col = mix(mid * 1.25, vec3(0.93, 0.97, 0.96), win);
      col += caustic(vWorld.xz * 1.2 + n.xz * 2.0, uTime * 1.3) * 0.18 * win;
      col = mix(col, shallow, smoothstep(3.0, 16.0, dist));
    }
    gl_FragColor = vec4(col, 1.0);
  }
`

function Water() {
  const mesh = useRef<THREE.Mesh>(null)
  const { camera, size } = useThree()
  const small = size.width < 768
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const last = useRef({ x: 999, z: 999, t: 0, i: 0 })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDip: { value: 0 },
      uRipples: { value: Array.from({ length: RIPPLES }, () => new THREE.Vector3(0, 0, -100)) },
    }),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t
    const p = heroState.progress
    uniforms.uDip.value = p

    // camera dips below the waterline, then the surface tilts and rises away
    const dip = THREE.MathUtils.smoothstep(p, 0.05, 0.55)
    const away = THREE.MathUtils.smoothstep(p, 0.45, 1)
    camera.position.set(0, THREE.MathUtils.lerp(1.45, -1.15, dip), THREE.MathUtils.lerp(4.2, 3.2, dip))
    camera.rotation.set(THREE.MathUtils.lerp(-0.3, 0.32, dip) + away * 0.18, 0, 0)
    if (mesh.current) {
      mesh.current.position.y = away * 2.6
      mesh.current.rotation.x = -Math.PI / 2 + away * 0.22
    }

    // cursor ripples (only while the surface is in view)
    const ptr = heroState.pointer
    if (ptr.moved && p < 0.4) {
      ptr.moved = false
      ndc.set(ptr.x, ptr.y)
      ray.setFromCamera(ndc, camera)
      plane.constant = -(mesh.current?.position.y ?? 0)
      if (ray.ray.intersectPlane(plane, hit)) {
        const l = last.current
        const moved = Math.hypot(hit.x - l.x, hit.z - l.z)
        if (moved > 0.35 && t - l.t > 0.07) {
          // world (x, z) → local plane (x, y): rotation −90° about x and the mesh sits at z = −6
          uniforms.uRipples.value[l.i].set(hit.x, -6 - hit.z, t)
          l.i = (l.i + 1) % RIPPLES
          l.x = hit.x
          l.z = hit.z
          l.t = t
        }
      }
    }
  })

  const seg = small ? 140 : 220
  return (
    <mesh ref={mesh} rotation-x={-Math.PI / 2} position={[0, 0, -6]}>
      <planeGeometry args={[44, 36, seg, seg]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default function WaterCanvas({ active, onReady }: { active: boolean; onReady: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.05, far: 60, position: [0, 1.45, 4.2] }}
      onCreated={() => requestAnimationFrame(onReady)}
      aria-hidden
    >
      <Water />
    </Canvas>
  )
}
