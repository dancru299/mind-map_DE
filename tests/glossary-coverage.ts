// Chạy: npx tsx tests/glossary-coverage.ts — in các chip chưa có trong glossary
import { join } from 'node:path'
import { buildTree, readGlossary, uncoveredTools } from '../plugins/build-tree'
const dir = join(import.meta.dirname, '..', 'content')
const missing = uncoveredTools(buildTree(dir), readGlossary(dir))
console.log(`${missing.length} chip chưa có định nghĩa`)
console.log(missing.join('\n'))
