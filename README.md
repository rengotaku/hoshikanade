# ripple garden

放置系3Dアンビエント。夜空を思わせる暗い宇宙空間に、光の星がきらめきながら降り、着いた場所に波紋が広がる。並べた鉄琴バーに星が当たると、ペンタトニックの優しい音が鳴り、当たった場所が光る。太陽と月が音板を周回し、流れ星が時おり横切る。操作は不要——眺めているだけで、毎回ちがう情景と音楽が生まれるジェネラティブ・ミュージック箱庭。

![screenshot](docs/screenshot.png)

## 起動方法

```bash
npm install
npm run dev      # または: make run
```

`make help` で全タスク（run / build / preview / smoke / typecheck / clean）を表示。

ブラウザが開いたら、最初に一度クリックして音を有効にする（ブラウザの自動再生制限のため）。映像はクリック前から自動で動く。右下のボタンでミュート切り替え。

その他のスクリプト：

```bash
npm run build      # 型チェック + 本番ビルド
npm run typecheck  # 型チェックのみ
npm run preview    # ビルド結果のプレビュー
npm run smoke      # ヘッドレス Chromium で WebGL/シェーダの実行時エラーを検査
```

## 技術スタック

- Vite + React + TypeScript
- React Three Fiber (`@react-three/fiber`) + `@react-three/drei`
- `@react-three/postprocessing`（Bloom・色調補正・Vignette）
- Tone.js（音、初回クリック時に動的読み込み）

## できること

- **波紋シミュレーション**：GPU 上の波動方程式（高さ場 FBO の ping-pong）で着地面そのものが波打つ。星の着地点に波が立ち、淵で静かに減衰する。
- **生成され続ける星**：高所のランダムな位置から、ゆらぎのある間隔で発光する星が長い軌跡を引いて落ち続ける（放置で自動生成）。
- **マリンバの鉄琴バー**：横一列に並べた 7 本のバーにペンタトニック音階を割り当て。星が当たると、その位置に応じて左右へ定位した温かい音が鳴り、バーが発光する。
- **音域スライダー**：鳴る音域の幅をスライダーで調整。左=6本(約1オクターブ・高音中心で静か)〜右=17本(約3オクターブ・多彩)。バーの本数・色・横位置・星の散る範囲が自動で追従する。
- **アンビエントな音響**：マリンバの単音の下に、極低速で揺れるパッドのドローン。Reverb→EQ→Compressor→Limiter のマスターチェーンで整音。タブ非表示で自動停止・復帰。
- **夜空の情景**：音板を周回する太陽と月、時おり横切る流れ星、画面に漂う光の粒子、月明かりの映り込み、緩やかな自動回転カメラ、フォグと色調補正で落ち着いた雰囲気に。
- **楽譜の書き出し**：鳴った音を記録し、右下パネルのボタンで五線譜（SVG）としてダウンロードできる。

## 構成

```
src/
  config.ts              シーン全体の調整パラメータ（水面・バー・波）
  audio/synth.ts         Tone.js の音響エンジン（遅延読み込み）
  water/
    waterField.ts        シム状態の共有オブジェクト
    WaterSim.tsx         GPU 波動方程式（ping-pong FBO）
    WaterPlane.tsx       高さ場から変位・法線を作る水面マテリアル
  state/settings.ts      実行時設定（星の量・自動スライド）
  audio/recorder.ts      鳴った音の記録（楽譜書き出し用）
  score/
    toAbc.ts             音→ABC記譜への変換
    downloadScore.ts     abcjs で五線譜SVGを生成して保存
  scene/
    Scene.tsx            Canvas・カメラ・ライト・環境・月・後処理
    Effects.tsx          Bloom / 色調補正 / Vignette
    RainSystem.tsx       星の生成・着地判定・波紋への波注入・発音の統括
    Drop.tsx             落ちる星 1 つの落下（光の玉・長い軌跡）
    Splash.tsx           バー命中時の星の飛沫
    XylophoneBar.tsx     鉄琴バー（発光）
  ui/
    StartOverlay.tsx     音解禁のための初回クリック
    Controls.tsx         星の量・音域スライダー・自動スライド・楽譜DL・ミュート
```

波紋は手描きのリングではなく、水面シミュレーション（高さ場の波動方程式）が
水面そのものを波立たせることで表現している。

## 既知の制約 / 今後

- 水面は高さ場ベースの簡易シミュレーションで、屈折・本格的なコースティクスは未実装。
- オブジェクトはコードで固定配置（設置 UI・複数種類・成長要素は未実装）。
