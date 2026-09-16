// Vite plugin: `import tree from 'virtual:content'` → cây JSON dựng lúc build; dev server tự reload khi content/ đổi
import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'
import { buildTree, listMarkdownFiles, readGlossary, readRoute } from './build-tree'

const ID = 'virtual:content', RESOLVED = '\0' + ID

export function contentPlugin(contentDir = 'content'): Plugin {
  const dir = resolve(contentDir)
  return {
    name: 'de-mindmap-content',
    resolveId(id) { return id === ID ? RESOLVED : null },
    load(id) {
      if (id !== RESOLVED) return null
      for (const f of listMarkdownFiles(dir)) this.addWatchFile(f)
      this.addWatchFile(resolve(dir, 'lo-trinh.yaml'))
      const gdir = resolve(dir, 'glossary')
      if (existsSync(gdir)) for (const f of readdirSync(gdir)) if (/\.ya?ml$/.test(f)) this.addWatchFile(resolve(gdir, f))
      const tree = buildTree(dir)
      return `export const tree = ${JSON.stringify(tree)};\nexport const route = ${JSON.stringify(readRoute(dir, tree))};\nexport const glossary = ${JSON.stringify(readGlossary(dir))};`
    },
    configureServer(server) {
      server.watcher.add(dir)
      const onChange = (path: string) => {
        if (!path.startsWith(dir)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', onChange); server.watcher.on('unlink', onChange); server.watcher.on('change', onChange)
    },
  }
}
