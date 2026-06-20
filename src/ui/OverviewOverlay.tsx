import { Pencil, X } from 'lucide-react'
import { layerLines } from '../score/layerLines'
import type { Layer } from '../state/layers'

export type OverviewOverlayProps = {
  layers: Layer[]
  onClose: () => void
  /** 落書きをタップで、その落書きの編集へジャンプ。 */
  onEdit: (id: number) => void
}

/**
 * すべての落書きを各色で重ねて一覧する閲覧オーバーレイ。
 * 各落書きの行（または線）から、その落書きの再編集へジャンプできる。
 */
export function OverviewOverlay({ layers, onClose, onEdit }: OverviewOverlayProps) {
  const w = window.innerWidth
  const h = window.innerHeight

  return (
    <div className="overview-overlay">
      <svg width="100%" height="100%" className="overview-svg">
        {layers.flatMap((l) =>
          layerLines(l, w, h).map((pts, i) => (
            <polyline
              key={`${l.id}-${i}`}
              points={pts}
              fill="none"
              stroke={l.color}
              strokeWidth={3}
              strokeOpacity={l.enabled ? 0.85 : 0.35}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )),
        )}
      </svg>

      <button className="controls-close overview-close" onClick={onClose} aria-label="閉じる">
        <X size={16} />
      </button>

      <div className="overview-legend">
        <div className="overview-title">すべての落書き</div>
        {layers.length === 0 && <div className="overview-empty">まだ落書きがありません。</div>}
        {layers.map((l, i) => (
          <button
            key={l.id}
            className={`overview-item ${l.enabled ? '' : 'off'}`}
            onClick={() => onEdit(l.id)}
          >
            <span className="layer-dot" style={{ background: l.color }} />
            <span className="overview-item-name">落書き {i + 1}</span>
            <Pencil size={14} />
          </button>
        ))}
      </div>
    </div>
  )
}
