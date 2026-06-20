import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import { AdditiveBlending, Vector3, type Mesh, type MeshBasicMaterial } from 'three'

type StarSpec = {
  id: number
  start: [number, number, number]
  vel: Vector3
}

const randRange = (a: number, b: number) => a + Math.random() * (b - a)
const LIFETIME = 2.0

/** ランダムな間隔で夜空を流れる、きらびやかな流れ星（長い軌跡つき）。 */
export function ShootingStars() {
  const [stars, setStars] = useState<StarSpec[]>([])
  const timer = useRef(randRange(2, 4))
  const nextId = useRef(0)

  useFrame((_, delta) => {
    timer.current -= delta
    if (timer.current <= 0) {
      timer.current = randRange(3.5, 9) // 次の流れ星まで
      const id = nextId.current++
      const fromLeft = Math.random() < 0.5
      const startX = fromLeft ? randRange(-16, -9) : randRange(9, 16)
      const start: [number, number, number] = [startX, randRange(8, 15), randRange(-12, 3)]
      const speed = randRange(10, 15) // ゆっくりめ＝軌跡が長く見える
      const dir = new Vector3(fromLeft ? 1 : -1, randRange(-0.4, -0.18), randRange(-0.08, 0.08)).normalize()
      setStars((prev) => [...prev, { id, start, vel: dir.multiplyScalar(speed) }])
    }
  })

  const remove = (id: number) => setStars((prev) => prev.filter((s) => s.id !== id))

  return (
    <>
      {stars.map((s) => (
        <ShootingStar key={s.id} spec={s} onDone={remove} />
      ))}
    </>
  )
}

function ShootingStar({ spec, onDone }: { spec: StarSpec; onDone: (id: number) => void }) {
  const head = useRef<Mesh>(null)
  const age = useRef(0)

  useFrame((_, delta) => {
    const m = head.current
    if (!m) return
    age.current += delta
    const t = age.current / LIFETIME
    if (t >= 1) {
      onDone(spec.id)
      return
    }
    m.position.addScaledVector(spec.vel, delta)
    // 出現〜消滅でなめらかに明滅（中盤が最も明るい）。
    const glow = Math.sin(Math.min(1, t * 1.15) * Math.PI)
    const mat = m.material as MeshBasicMaterial
    mat.opacity = glow
    const s = 0.06 + glow * 0.06
    m.scale.setScalar(s)
  })

  return (
    <Trail
      width={3.5}
      length={9}
      color={'#dff2ff'}
      decay={1}
      attenuation={(w) => w * w}
    >
      <mesh ref={head} position={[...spec.start]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          toneMapped={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </Trail>
  )
}
