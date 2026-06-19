import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // ベンダーを分割してキャッシュ効率を上げる。Tone は startAudio() で動的読み込み。
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          postprocessing: ['@react-three/postprocessing', 'postprocessing'],
        },
      },
    },
  },
})
