import { useEffect, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { pitchToY, type Point, type Stroke } from '../score/drawMelody'
import type { Layer } from '../state/layers'

export type DrawOverlayProps = {
  /** 「旋律完了」で全ストロークと画面サイズを渡す。 */
  onComplete: (strokes: Stroke[], size: { w: number; h: number }) => void
  onCancel: () => void
  /** すでにあるレイヤー（重ねがけ用に薄く表示）。 */
  priorLayers: Layer[]
}

/**
 * 既存レイヤーを薄く重ねる折れ線群。
 * 描いた軌跡(strokes)があれば「実際に描いた線」をそのまま再表示する。
 * 無い古いデータは音符列から再構成（等間隔・量子化で実物とは差が出る）。
 */
function priorLines(layer: Layer, w: number, h: number): string[] {
  if (layer.strokes && layer.strokes.length) {
    return layer.strokes
      .filter((s) => s.length >= 2)
      .map((s) => s.map((p) => `${(p.x * w).toFixed(0)},${(p.y * h).toFixed(0)}`).join(' '))
  }
  const poly = layerPolyline(layer, w, h)
  return poly ? [poly] : []
}

/** レイヤーの音符列を、薄く表示するための折れ線（横=順番, 縦=音高）に。和音は先頭音を代表に。 */
function layerPolyline(layer: Layer, w: number, h: number): string {
  const n = layer.notes.length
  if (n < 2) return ''
  const pts: string[] = []
  for (let i = 0; i < n; i++) {
    const note = layer.notes[i].notes[0]
    if (!note) continue
    const x = (i / (n - 1)) * w
    pts.push(`${x.toFixed(0)},${pitchToY(note, h).toFixed(0)}`)
  }
  return pts.join(' ')
}

/** 縦の目安（音の高さ）のガイド線。 */
const PITCH_GUIDES = [
  { f: 0.06, label: '高音' },
  { f: 0.5, label: '中音' },
  { f: 0.94, label: '低音' },
]
const PITCH_LINES = [0.2, 0.35, 0.65, 0.8]

const strokePath = (pts: Point[]): string => pts.map((p) => `${p.x},${p.y}`).join(' ')

/**
 * 画面全体に自由作画でメロディを描く。縦＝音の高さ（上が高音）。
 * 一筆書きではなく、複数本のストロークを自由に描き、「旋律完了」で確定する。
 * ・ストロークを別々に描く＝跳躍（連続音階に縛られない）／横に重ねて描く＝和音。
 * ・点の取り込みは即時、表示は rAF でまとめて更新（長い線でも軽い）。
 */
export function DrawOverlay({ onComplete, onCancel, priorLayers }: DrawOverlayProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [current, setCurrent] = useState<Point[]>([])
  const [infoOpen, setInfoOpen] = useState(false)
  const strokesRef = useRef<Stroke[]>([])
  const curRef = useRef<Point[]>([])
  const drawing = useRef(false)
  const raf = useRef(0)
  const size = useRef({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const scheduleRender = () => {
    if (raf.current) return
    raf.current = requestAnimationFrame(() => {
      raf.current = 0
      setCurrent(curRef.current.slice())
    })
  }

  const start = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    curRef.current = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }]
    scheduleRender()
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return
    curRef.current.push({ x: e.clientX, y: e.clientY, t: e.timeStamp })
    scheduleRender()
  }
  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    if (curRef.current.length >= 2) {
      strokesRef.current = [...strokesRef.current, curRef.current]
      setStrokes(strokesRef.current.slice())
    }
    curRef.current = []
    setCurrent([])
  }

  const undo = () => {
    strokesRef.current = strokesRef.current.slice(0, -1)
    setStrokes(strokesRef.current.slice())
  }
  const complete = () => {
    if (strokesRef.current.length) onComplete(strokesRef.current, size.current)
  }

  const { w, h } = size.current
  const hasStrokes = strokes.length > 0

  return (
    <div className="draw-overlay" onPointerDown={start} onPointerMove={move} onPointerUp={end}>
      <svg width="100%" height="100%">
        {/* 目安軸（縦＝音の高さ） */}
        {PITCH_LINES.map((f) => (
          <line key={`p${f}`} x1={0} y1={h * f} x2={w} y2={h * f} className="guide-line" />
        ))}
        {PITCH_GUIDES.map((g) => (
          <line key={g.f} x1={0} y1={h * g.f} x2={w} y2={h * g.f} className="guide-line-main" />
        ))}
        {PITCH_GUIDES.map((g) => (
          <text key={g.label} x={14} y={h * g.f - 6} className="guide-text">
            {g.label}
          </text>
        ))}

        {/* 重ねがけ用: 既存レイヤーを薄く表示（描いた軌跡があれば実物を再表示） */}
        {priorLayers.flatMap((l) =>
          priorLines(l, w, h).map((pts, i) => (
            <polyline
              key={`${l.id}-${i}`}
              points={pts}
              fill="none"
              stroke={l.color}
              strokeWidth={2}
              strokeOpacity={0.28}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )),
        )}

        {/* 確定済みストローク */}
        {strokes.map((s, i) => (
          <polyline
            key={i}
            points={strokePath(s)}
            fill="none"
            stroke="#bfe9ff"
            strokeWidth={3}
            strokeOpacity={0.85}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {/* 描画中のストローク */}
        <polyline
          points={strokePath(current)}
          fill="none"
          stroke="#eaf4ff"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <button
        className={`draw-info ${infoOpen ? 'on' : ''}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setInfoOpen((o) => !o)}
        aria-label="使い方"
        aria-expanded={infoOpen}
      >
        <Info size={18} />
      </button>
      {infoOpen && (
        <div className="draw-hint" onPointerDown={(e) => e.stopPropagation()}>
          縦＝音の高さ（上が高音）。複数本を自由に描けます（別の線＝跳躍 / 横に重ねて描く＝和音）。描けたら「落書き完了」。
        </div>
      )}

      <div className="draw-actions" onPointerDown={(e) => e.stopPropagation()}>
        <button className="draw-cancel" onClick={onCancel}>
          やめる
        </button>
        <button className="draw-undo" onClick={undo} disabled={!hasStrokes}>
          ひとつ戻す
        </button>
        <button className="draw-done" onClick={complete} disabled={!hasStrokes}>
          落書き完了
        </button>
      </div>
    </div>
  )
}
