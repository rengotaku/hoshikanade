import type { SongNote } from '../audio/songs'

/** 描いた軌跡の 1 点（正規化座標 0..1。解像度に依存しないので再表示で実物を描ける）。 */
export type NormPoint = { x: number; y: number }

/**
 * 「なぞって作曲」のレイヤー。各レイヤーは 1 本の旋律で、有効なものを同時ループ再生する。
 * 追加・有効/無効・削除ができる。イミュータブルに新配列へ差し替えて購読者へ通知する。
 *
 * strokes は描いた軌跡そのもの（正規化済み）。再表示で「実際に描いた線」を見せる用途。
 * 再生・楽譜化は notes（量子化済み）を使うので、strokes は表示専用・任意。
 */
export type Layer = {
  id: number
  notes: SongNote[]
  enabled: boolean
  color: string
  strokes?: NormPoint[][]
  /** この旋律の演奏速度 0..1（0.5=標準）。旋律ごとに個別調整できる。 */
  tempo: number
}

const DEFAULT_TEMPO = 0.5

const COLORS = ['#7fd1e6', '#e6b07f', '#9fe07f', '#c98ad8', '#e68a9f', '#d8c87f', '#8a9fe6']

let layers: Layer[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function getLayers(): Layer[] {
  return layers
}

export function subscribeLayers(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function addLayer(notes: SongNote[], strokes?: NormPoint[][], tempo = DEFAULT_TEMPO): void {
  if (!notes.length) return
  const color = COLORS[(nextId - 1) % COLORS.length]
  layers = [...layers, { id: nextId++, notes, enabled: true, color, strokes, tempo }]
  emit()
}

export function setLayerTempo(id: number, tempo: number): void {
  const t = Math.max(0, Math.min(1, tempo))
  layers = layers.map((l) => (l.id === id ? { ...l, tempo: t } : l))
  emit()
}

export function toggleLayer(id: number): void {
  layers = layers.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l))
  emit()
}

export function removeLayer(id: number): void {
  layers = layers.filter((l) => l.id !== id)
  emit()
}

/** インポート用：レイヤー一式を差し替える。 */
export function setLayers(
  items: { notes: SongNote[]; enabled?: boolean; strokes?: NormPoint[][]; tempo?: number }[],
): void {
  layers = items
    .filter((it) => Array.isArray(it.notes) && it.notes.length)
    .map((it) => {
      const color = COLORS[(nextId - 1) % COLORS.length]
      const tempo = typeof it.tempo === 'number' ? Math.max(0, Math.min(1, it.tempo)) : DEFAULT_TEMPO
      return {
        id: nextId++,
        notes: it.notes,
        enabled: it.enabled !== false,
        color,
        strokes: it.strokes,
        tempo,
      }
    })
  emit()
}
