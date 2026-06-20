import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { DirectionalLight, Mesh } from 'three'
import { POND_HALF } from '../config'
import { quality } from '../util/quality'

/**
 * 音板（原点）を中心に、太陽と月が周回する。常に反対側の位相。
 * ディレクショナルライトは太陽に追従し、太陽が高いほど明るい（昼夜のうつろい）。
 */
const ORBIT_R = 8.5
const ORBIT_SPEED = 0.06 // rad/sec（ゆっくり）
const TILT = 0.5 // 軌道面の傾き（奥行きを持たせて周回が分かるように）

export function Celestial() {
  const sun = useRef<Mesh>(null)
  const moon = useRef<Mesh>(null)
  const light = useRef<DirectionalLight>(null)

  useFrame((state) => {
    const a = state.clock.elapsedTime * ORBIT_SPEED
    const cz = Math.sin(TILT)
    const cy = Math.cos(TILT)

    const sy = Math.sin(a) * ORBIT_R * cy
    const sx = Math.cos(a) * ORBIT_R
    const sz = Math.sin(a) * ORBIT_R * cz - 4
    if (sun.current) sun.current.position.set(sx, sy, sz)

    const my = Math.sin(a + Math.PI) * ORBIT_R * cy
    const mx = Math.cos(a + Math.PI) * ORBIT_R
    const mz = Math.sin(a + Math.PI) * ORBIT_R * cz - 4
    if (moon.current) moon.current.position.set(mx, my, mz)

    if (light.current) {
      // 太陽が上なら太陽光、沈んでいる間は月明かり側から弱く。
      const sunUp = sy > 0
      const lx = sunUp ? sx : mx
      const lyRaw = sunUp ? sy : my
      light.current.position.set(lx, Math.max(3, lyRaw), (sunUp ? sz : mz) + 4)
      const h = Math.max(0, sy / ORBIT_R) // 0..1
      light.current.intensity = 0.35 + h * 0.95
      light.current.color.setHex(sunUp ? 0xfff1d6 : 0xbfd0ff)
    }
  })

  return (
    <>
      <directionalLight
        ref={light}
        position={[5, 9, 4]}
        intensity={1.1}
        castShadow={quality.shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-camera-left={-POND_HALF}
        shadow-camera-right={POND_HALF}
        shadow-camera-top={POND_HALF}
        shadow-camera-bottom={-POND_HALF}
      />

      {/* 太陽 */}
      <mesh ref={sun}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ffeaa0" toneMapped={false} />
      </mesh>

      {/* 月 */}
      <mesh ref={moon}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color="#eaf3ff" toneMapped={false} />
      </mesh>
    </>
  )
}
