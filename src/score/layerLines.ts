import type { Layer } from '../state/layers'
import { pitchToY } from './drawMelody'

/**
 * レイヤーを「折れ線（SVG polyline points 文字列）の配列」にする。表示専用。
 * - 描いた軌跡(strokes, 正規化座標)があれば、それを画面サイズ(w,h)へ戻して実物の線を描く。
 * - 軌跡が無い古いデータは音符列から再構成（横=順番 / 縦=音高、和音は先頭音を代表）。
 */
export function layerLines(layer: Layer, w: number, h: number): string[] {
  if (layer.strokes && layer.strokes.length) {
    return layer.strokes
      .filter((s) => s.length >= 2)
      .map((s) => s.map((p) => `${(p.x * w).toFixed(0)},${(p.y * h).toFixed(0)}`).join(' '))
  }
  const n = layer.notes.length
  if (n < 2) return []
  const pts: string[] = []
  for (let i = 0; i < n; i++) {
    const note = layer.notes[i].notes[0]
    if (!note) continue
    const x = (i / (n - 1)) * w
    pts.push(`${x.toFixed(0)},${pitchToY(note, h).toFixed(0)}`)
  }
  return pts.length >= 2 ? [pts.join(' ')] : []
}
