import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, Sparkles } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { isMobile, quality } from '../util/quality'
import { RainSystem } from './RainSystem'
import { ShootingStars } from './ShootingStars'
import { Celestial } from './Celestial'
import { Effects } from './Effects'

/**
 * シーン全体。少し見下ろすカメラ、控えめな環境光＋ディレクショナルライト、
 * オフラインでも効く Lightformer ベースの環境マップ（映り込み用）、月、霧、
 * 放置で動く水滴・鉄琴バー、そして後処理（色調補正/Vignette）。
 * （大きな水面プレーンは廃止し、暗い空間にバーと雨が浮かぶ構成）
 */
export function Scene() {
  return (
    <Canvas
      shadows={quality.shadows}
      dpr={quality.dpr}
      camera={{ position: [0, 6, 9], fov: 45 }}
      gl={{ antialias: !isMobile, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <color attach="background" args={['#0a131d']} />
      <fog attach="fog" args={['#0a131d', 13, 30]} />

      <ambientLight intensity={0.35} />
      {/* 音板を中心に周回する太陽と月＋追従するディレクショナルライト。 */}
      <Celestial />

      {/* オフラインでも効く環境マップ。金属の水面/バーへ柔らかな映り込みを与える。 */}
      <Environment resolution={256}>
        <color attach="background" args={['#0a131d']} />
        {/* 月明かり: 水面をうっすら照らす光源。 */}
        <Lightformer form="circle" intensity={2.0} position={[2, 7, -6]} scale={[3.5, 3.5, 1]} color="#e6f1ff" />
        <Lightformer intensity={1.2} position={[0, 4, -3]} scale={[10, 4, 1]} color="#2f5e8f" />
        <Lightformer intensity={0.6} position={[-5, 2, 2]} scale={[3, 3, 1]} color="#9fd8ff" />
        <Lightformer intensity={0.5} position={[5, 2, 2]} scale={[3, 3, 1]} color="#ffe39a" />
      </Environment>

      <RainSystem />

      {/* 画面全体に漂う光の粒子。視界を大きく覆う体積に広げる。 */}
      <Sparkles
        count={quality.sparkles}
        scale={[42, 30, 42]}
        position={[0, 8, -2]}
        size={2.6}
        speed={0.25}
        opacity={0.5}
        color="#bfe9ff"
      />

      {/* ランダムなタイミングで流れる流れ星。 */}
      <ShootingStars />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.28}
        minDistance={5}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />

      <Effects />
    </Canvas>
  )
}
