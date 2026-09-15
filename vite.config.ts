import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { contentPlugin } from './plugins/content-plugin'

export default defineConfig({
  plugins: [react(), contentPlugin()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
