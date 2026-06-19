import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { DROP_START_Y, GRAVITY } from '../config'

export type DropProps = {
  id: number
  x: number
  z: number
  /** 着地する高さ（水面、またはバー上ならバー天面）。 */
  landY: number
  onLand: (id: number, x: number, z: number) => void
}

/**
 * 1 滴の水滴。重力で落下し、着地面（水面 or バー天面）に着いたら onLand を 1 度だけ呼ぶ。
 * 位置は ref で直接更新し、毎フレームの React 再レンダリングを避ける。
 */
export function Drop({ id, x, z, landY, onLand }: DropProps) {
  const ref = useRef<Mesh>(null)
  const velocity = useRef(0)
  const landed = useRef(false)

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh || landed.current) return

    velocity.current += GRAVITY * delta
    mesh.position.y -= velocity.current * delta

    if (mesh.position.y <= landY) {
      landed.current = true
      onLand(id, x, z)
    }
  })

  return (
    <mesh ref={ref} position={[x, DROP_START_Y, z]} castShadow>
      <sphereGeometry args={[0.075, 14, 14]} />
      {/* 落下中も光る雫。emissive + toneMapped=false で Bloom がきらめきを拾う。 */}
      <meshStandardMaterial
        color="#cdeeff"
        emissive="#6cb8e6"
        emissiveIntensity={1.6}
        roughness={0.15}
        metalness={0}
        toneMapped={false}
      />
    </mesh>
  )
}
