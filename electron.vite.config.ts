import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'fs'
import type { Plugin } from 'vite'

/** Copy tcp-connect.js helper to the main process output directory */
function copyTcpConnectPlugin(): Plugin {
  return {
    name: 'copy-tcp-connect',
    closeBundle() {
      copyFileSync(
        resolve('src/main/tcp-connect.js'),
        resolve('out/main/tcp-connect.js')
      )
    }
  }
}

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    },
    plugins: [copyTcpConnectPlugin()]
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
