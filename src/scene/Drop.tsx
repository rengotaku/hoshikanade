import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import {
  AdditiveBlending,
  DataTexture,
  DoubleSide,
  MeshBasicMaterial,
  PlaneGeometry,
  RGBAFormat,
  type BufferGeometry,
  type Group,
  type Material,
  type Mesh,
} from 'three'
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

/** 流れ星の光跡用：頭(下端)が明・尾(上端)が透明になる縦グラデーション（alphaMap 用）。全ドロップで共有。 */
function makeTrailAlpha(): DataTexture {
  const n = 64
  const data = new Uint8Array(n * 4)
  for (let i = 0; i < n; i++) {
    // i=0 が下端(頭)=明、i=n-1 が上端(尾)=透明。二乗で尾を細く長く減衰。
    const a = Math.pow(1 - i / (n - 1), 1.6)
    const v = Math.round(a * 255)
    data[i * 4] = v
    data[i * 4 + 1] = v
    data[i * 4 + 2] = v
    data[i * 4 + 3] = 255
  }
  const tex = new DataTexture(data, 1, n, RGBAFormat)
  tex.flipY = false
  tex.needsUpdate = true
  return tex
}

// 下端(頭)を原点に、上方向へ伸びる縦の板（光跡）。全ドロップで共有。
const TRAIL_GEO = new PlaneGeometry(1, 1).translate(0, 0.5, 0)
const TRAIL_MAT = new MeshBasicMaterial({
  color: '#cfeaff',
  alphaMap: makeTrailAlpha(),
  transparent: true,
  blending: AdditiveBlending,
  depthWrite: false,
  toneMapped: false,
  side: DoubleSide,
})

/** 光跡の幅（ワールド）。細い筋にして「流れ星」らしく。 */
const TRAIL_WIDTH = 0.16

/**
 * 落ちる星 1 つ。重力で落下し、着地面（波紋面 or バー天面）に着いたら onLand を 1 度だけ呼ぶ。
 * 見た目は「流れ星」：発光する頭＋落下軸に沿ってまっすぐ伸び尾に向かって減衰する光跡。
 * （drei Trail の経路追従だと頭が丸く尾がうねって “おたまじゃくし” になるため、直線グラデーション方式にする。）
 */
export function Drop({ id, x, z, startY, landY, geometry, material, onLand }: DropProps) {
  const initialY = startY ?? DROP_START_Y
  const group = useRef<Group>(null)
  const trail = useRef<Mesh>(null)
  const velocity = useRef(0)
  const landed = useRef(false)

  useFrame((_, delta) => {
    const g = group.current
    if (!g || landed.current) return

    // 落下速度スライダーに応じた重力（落下中の星もリアルタイムに反映）。
    velocity.current += levelToGravity(settings.fallSpeed) * delta
    g.position.y -= velocity.current * delta

    // 光跡は速いほど長く（頭は原点、尾が上へ伸びる）。
    if (trail.current) {
      const len = Math.min(5, 0.5 + velocity.current * 0.14)
      trail.current.scale.set(TRAIL_WIDTH, len, 1)
    }

    if (g.position.y <= landY) {
      landed.current = true
      onLand(id, x, z)
    }
  })

  return (
    <group ref={group} position={[x, initialY, z]}>
      {/* 光跡：縦のまま Y 軸まわりだけカメラに向く（うねらない直線の筋） */}
      <Billboard lockX lockZ>
        <mesh ref={trail} geometry={TRAIL_GEO} material={TRAIL_MAT} />
      </Billboard>
      {/* 発光する頭 */}
      <mesh geometry={geometry} material={material} />
    </group>
  )
}
