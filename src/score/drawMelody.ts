import type { SongNote } from '../audio/songs'
import { poolNoteAt } from '../config'

/** 描画点（画面座標）。 */
export type Point = { x: number; y: number; t: number }

/** 1 音あたりの再生時間（秒）＝テンポ。custom 曲のテンポもこれに合わせる。 */
export const MELODY_STEP_SEC = 0.36
/** 1 音あたりの横方向の目安ピクセル（横に長く描くほど音数が増える）。 */
const PX_PER_NOTE = 56

/** 横位置 x での線の縦位置 y（左→右の描線を想定。最初に x をまたぐ区間を線形補間）。 */
function yAtX(points: Point[], x: number): number {
  let nearestY = points[0].y
  let nearestD = Infinity
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const lo = Math.min(a.x, b.x)
    const hi = Math.max(a.x, b.x)
    if (x >= lo && x <= hi) {
      const span = b.x - a.x
      const f = Math.abs(span) > 1e-6 ? (x - a.x) / span : 0
      return a.y + (b.y - a.y) * f
    }
    const da = Math.abs(a.x - x)
    const db = Math.abs(b.x - x)
    if (Math.min(da, db) < nearestD) {
      nearestD = Math.min(da, db)
      nearestY = da < db ? a.y : b.y
    }
  }
  return nearestY
}

/**
 * なぞった線をメロディに変換する（ピアノロール方式）。
 * 横位置＝時間（左→右）、縦位置＝音の高さ（上が高音）。
 * 横に描いた幅を等間隔に区切り、各位置の高さ → 音にマップする。
 * ペンタトニックに量子化されるので外れた音にならない。
 */
export function pointsToMelody(points: Point[], height: number): SongNote[] {
  if (points.length < 2 || height <= 0) return []
  let minX = Infinity
  let maxX = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
  }
  const width = Math.max(1, maxX - minX)
  const count = Math.max(4, Math.min(96, Math.round(width / PX_PER_NOTE)))
  const step = width / Math.max(1, count - 1)

  const notes: SongNote[] = []
  for (let k = 0; k < count; k++) {
    const x = minX + step * k
    // 横方向に少し平均してジッタを均す（なめらかな音運び）。
    let sy = 0
    let ns = 0
    for (let s = -2; s <= 2; s++) {
      sy += yAtX(points, x + (step * s) / 4)
      ns++
    }
    const frac = 1 - Math.max(0, Math.min(1, sy / ns / height)) // 上=高音
    notes.push({ note: poolNoteAt(frac), beats: 1 })
  }
  return notes
}
