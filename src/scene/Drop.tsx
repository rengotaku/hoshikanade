import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { BufferGeometry, Material, Mesh } from 'three'
import { DROP_START_Y, levelToGravity } from '../config'
import { settings } from '../state/settings'

export type DropProps = {
  id: number
  x: number
  z: number
  /** 落下開始の高さ（既定は上空。曲演奏ではバーの少し上から）。 */
  startY?: number
  /** 着地する高さ（水面、またはバー上ならバー天面）。 */
  landY: number
  geometry: BufferGeometry
  material: Material
  onLand: (id: number, x: number, z: number) => void
}

/**
 * 落ちる星 1 つ。重力で落下し、着地面（波紋面 or バー天面）に着いたら onLand を 1 度だけ呼ぶ。
 * 落下中は速度に応じて縦に伸びた軌跡の形になる（モーションストレッチ）。
 * 位置・スケールは ref で直接更新し、毎フレームの React 再レンダリングを避ける。
 */
export function Drop({ id, x, z, startY, landY, geometry, material, onLand }: DropProps) {
  const initialY = startY ?? DROP_START_Y
  const ref = useRef<Mesh>(null)
  const velocity = useRef(0)
  const landed = useRef(false)

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh || landed.current) return

    // 落下速度スライダーに応じた重力（落下中の星もリアルタイムに反映）。
    velocity.current += levelToGravity(settings.fallSpeed) * delta
    mesh.position.y -= velocity.current * delta

    // 落下中の星は円ではなく細い縦筋（軌跡）に。速いほど細長く、遅いほど丸く。
    const stretch = Math.min(6.5, 1 + velocity.current * 0.18)
    const thin = Math.min(1, 0.7 / Math.sqrt(stretch))
    mesh.scale.set(thin, stretch, thin)

    if (mesh.position.y <= landY) {
      landed.current = true
      onLand(id, x, z)
    }
  })

  return (
    <mesh ref={ref} position={[x, initialY, z]} geometry={geometry} material={material} castShadow />
  )
}
