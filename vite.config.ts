import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages は https://oshun5292.github.io/my_travel_app/ 配下で配信されるため、本番ビルドだけ base を付ける。
  // 開発サーバーは従来どおり http://localhost:5173/ で開ける。
  base: command === 'build' ? '/my_travel_app/' : '/',
}))
