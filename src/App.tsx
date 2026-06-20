import { useEffect, useState } from 'react'
import { Scene } from './scene/Scene'
import { StartOverlay } from './ui/StartOverlay'
import { Controls } from './ui/Controls'
import { resumeAudio, startAudio, suspendAudio } from './audio/synth'

export default function App() {
  const [started, setStarted] = useState(false)

  // 最初のクリック（画面のどこでも）で音声を解禁する（ブラウザの自動再生制限対策）。
  useEffect(() => {
    if (started) return
    const onFirst = () => {
      void startAudio()
      setStarted(true)
    }
    window.addEventListener('pointerdown', onFirst, { once: true })
    return () => window.removeEventListener('pointerdown', onFirst)
  }, [started])

  // タブ非表示で音を止め、復帰で戻す（モバイルの省電力／iOS interrupted 対策）。
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        suspendAudio()
      } else {
        void resumeAudio()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <div className="app">
      <Scene />
      <Controls />
      {!started && <StartOverlay />}
    </div>
  )
}
