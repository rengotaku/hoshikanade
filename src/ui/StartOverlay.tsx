import { Volume2 } from 'lucide-react'

/**
 * 音声解禁前に、画面右上へふわっと小さく出る案内。
 * クリックは画面のどこでもよい（解禁の処理は App 側の最初のクリックで行う）。
 */
export function StartOverlay() {
  return (
    <div className="start-hint-toast" role="status">
      <Volume2 size={14} />
      クリックで音を有効化
    </div>
  )
}
