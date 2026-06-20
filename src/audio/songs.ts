/**
 * 著作権フリー（public domain）のメロディ集。曲を選ぶと、雨がこの音符順に
 * 最寄りのバーへ落ちて演奏する。音そのものはサンプラーで正確に鳴らす。
 */
export type SongNote = { note: string | null; beats: number }
export type Song = {
  id: string
  name: string
  /** 1 拍の秒数（テンポ）。 */
  tempo: number
  notes: SongNote[]
}

// 簡易ヘルパ
const n = (note: string, beats = 1): SongNote => ({ note, beats })
const r = (beats = 1): SongNote => ({ note: null, beats })

/** ベートーヴェン「歓喜の歌」（交響曲第9番）。public domain。 */
const odeToJoy: Song = {
  id: 'ode',
  name: '歓喜の歌（ベートーヴェン）',
  tempo: 0.34,
  notes: [
    n('E4'), n('E4'), n('F4'), n('G4'), n('G4'), n('F4'), n('E4'), n('D4'),
    n('C4'), n('C4'), n('D4'), n('E4'), n('E4', 1.5), n('D4', 0.5), n('D4', 2),
    n('E4'), n('E4'), n('F4'), n('G4'), n('G4'), n('F4'), n('E4'), n('D4'),
    n('C4'), n('C4'), n('D4'), n('E4'), n('D4', 1.5), n('C4', 0.5), n('C4', 2),
    r(1),
  ],
}

/** きらきら星（仏民謡 "Ah! vous dirai-je, maman"）。public domain。 */
const twinkle: Song = {
  id: 'twinkle',
  name: 'きらきら星（民謡）',
  tempo: 0.36,
  notes: [
    n('C4'), n('C4'), n('G4'), n('G4'), n('A4'), n('A4'), n('G4', 2),
    n('F4'), n('F4'), n('E4'), n('E4'), n('D4'), n('D4'), n('C4', 2),
    n('G4'), n('G4'), n('F4'), n('F4'), n('E4'), n('E4'), n('D4', 2),
    n('G4'), n('G4'), n('F4'), n('F4'), n('E4'), n('E4'), n('D4', 2),
    n('C4'), n('C4'), n('G4'), n('G4'), n('A4'), n('A4'), n('G4', 2),
    n('F4'), n('F4'), n('E4'), n('E4'), n('D4'), n('D4'), n('C4', 2),
    r(1),
  ],
}

/** メリーさんのひつじ（民謡）。public domain。ペンタトニックに収まる。 */
const mary: Song = {
  id: 'mary',
  name: 'メリーさんのひつじ（民謡）',
  tempo: 0.34,
  notes: [
    n('E4'), n('D4'), n('C4'), n('D4'), n('E4'), n('E4'), n('E4', 2),
    n('D4'), n('D4'), n('D4', 2), n('E4'), n('G4'), n('G4', 2),
    n('E4'), n('D4'), n('C4'), n('D4'), n('E4'), n('E4'), n('E4'), n('E4'),
    n('D4'), n('D4'), n('E4'), n('D4'), n('C4', 2),
    r(1),
  ],
}

/** さくらさくら（日本古謡）。public domain。陰音階（B・F を含む）はそのまま発音。 */
const sakura: Song = {
  id: 'sakura',
  name: 'さくらさくら（日本古謡）',
  tempo: 0.44,
  notes: [
    n('A4'), n('A4'), n('B4', 2), n('A4'), n('A4'), n('B4', 2),
    n('A4'), n('B4'), n('C5'), n('B4'), n('A4'), n('B4'), n('A4', 2),
    n('A4'), n('A4'), n('B4', 2), n('A4'), n('A4'), n('B4', 2),
    n('A4'), n('B4'), n('C5'), n('B4'), n('A4'), n('B4'), n('A4', 2),
    n('B4'), n('A4'), n('F4', 2), n('E4'), n('C5'), n('B4', 1), n('A4', 1),
    n('A4'), n('B4'), n('A4'), n('F4'), n('E4', 2),
    r(1),
  ],
}

export const SONGS: Record<string, Song> = {
  ode: odeToJoy,
  twinkle,
  mary,
  sakura,
}

/** UI 表示順。 */
export const SONG_LIST: Song[] = [odeToJoy, twinkle, mary, sakura]

/** 音名 'C4'/'F#4' を MIDI 番号へ（最寄りバー探索用）。 */
const SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
export function noteToMidi(name: string): number {
  const m = name.match(/^([A-G])(#?)(\d)$/)
  if (!m) return 60
  const [, letter, sharp, oct] = m
  return 12 * (parseInt(oct, 10) + 1) + SEMITONE[letter] + (sharp ? 1 : 0)
}
