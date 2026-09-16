import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { db, type ImageRow, type NoteRow, type ProgressRow } from './db'

export interface NoteMeta { updatedAt: number; preview: string }
interface Ctx {
  ready: boolean
  progress: Map<string, ProgressRow>
  notes: Map<string, NoteMeta>
  setMastery: (id: string, mastery: number) => Promise<void>
  setManyMastery: (ids: string[], mastery: number) => Promise<void>
  loadNote: (id: string) => Promise<NoteRow | undefined>
  saveNote: (row: NoteRow) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  putImage: (blob: Blob) => Promise<string>
  getImage: (id: string) => Promise<Blob | undefined>
  exportAll: () => Promise<Blob>
  importAll: (file: File) => Promise<{ progress: number; notes: number; images: number }>
  clearAll: () => Promise<void>
}
const UserDataCtx = createContext<Ctx | null>(null)

const preview = (text: string) => text.slice(0, 90)

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState<Map<string, ProgressRow>>(new Map())
  const [notes, setNotes] = useState<Map<string, NoteMeta>>(new Map())

  const reload = useCallback(async () => {
    const [p, n] = await Promise.all([db.getAll<ProgressRow>('progress'), db.getAll<NoteRow>('notes')])
    setProgress(new Map(p.map(r => [r.id, r])))
    setNotes(new Map(n.map(r => [r.id, { updatedAt: r.updatedAt, preview: preview(r.text) }])))
  }, [])
  useEffect(() => { reload().catch(e => console.warn('Không đọc được dữ liệu học:', e)).finally(() => setReady(true)) }, [reload])

  const setMastery = useCallback(async (id: string, mastery: number) => {
    mastery = Math.max(0, Math.min(100, Math.round(mastery)))
    if (mastery > 0) { const row = { id, mastery, updatedAt: Date.now() }; await db.put('progress', row); setProgress(m => new Map(m).set(id, row)) }
    else { await db.del('progress', id); setProgress(m => { const n = new Map(m); n.delete(id); return n }) }
  }, [])
  const setManyMastery = useCallback(async (ids: string[], mastery: number) => {
    mastery = Math.max(0, Math.min(100, Math.round(mastery))); const now = Date.now()
    for (const id of ids) { if (mastery > 0) await db.put('progress', { id, mastery, updatedAt: now }); else await db.del('progress', id) }
    setProgress(m => { const n = new Map(m); for (const id of ids) { if (mastery > 0) n.set(id, { id, mastery, updatedAt: now }); else n.delete(id) } return n })
  }, [])

  const loadNote = useCallback((id: string) => db.get<NoteRow>('notes', id), [])
  const saveNote = useCallback(async (row: NoteRow) => {
    const prev = await db.get<NoteRow>('notes', row.id)
    await db.put('notes', row)
    setNotes(m => new Map(m).set(row.id, { updatedAt: row.updatedAt, preview: preview(row.text) }))
    // dọn ảnh không còn được tham chiếu
    for (const old of prev?.imageIds ?? []) if (!row.imageIds.includes(old)) await db.del('images', old).catch(() => {})
  }, [])
  const deleteNote = useCallback(async (id: string) => {
    const prev = await db.get<NoteRow>('notes', id)
    await db.del('notes', id)
    for (const img of prev?.imageIds ?? []) await db.del('images', img).catch(() => {})
    setNotes(m => { const n = new Map(m); n.delete(id); return n })
  }, [])
  const putImage = useCallback(async (blob: Blob) => { const id = crypto.randomUUID(); await db.put<ImageRow>('images', { id, blob, createdAt: Date.now() }); return id }, [])
  const getImage = useCallback(async (id: string) => (await db.get<ImageRow>('images', id))?.blob, [])

  const exportAll = useCallback(async () => {
    const [p, n, i] = await Promise.all([db.getAll<ProgressRow>('progress'), db.getAll<NoteRow>('notes'), db.getAll<ImageRow>('images')])
    const images = await Promise.all(i.map(async r => ({ id: r.id, type: r.blob.type, createdAt: r.createdAt, base64: await blobToBase64(r.blob) })))
    return new Blob([JSON.stringify({ app: 'de-mindmap', version: 1, exportedAt: new Date().toISOString(), progress: p, notes: n, images })], { type: 'application/json' })
  }, [])
  const importAll = useCallback(async (file: File) => {
    const data = JSON.parse(await file.text()) as { app?: string; progress?: ProgressRow[]; notes?: NoteRow[]; images?: { id: string; type: string; createdAt: number; base64: string }[] }
    if (data.app !== 'de-mindmap') throw new Error('File không phải bản xuất của ứng dụng này')
    for (const r of data.progress ?? []) {
      const old = r as ProgressRow & { status?: string }
      await db.put('progress', { id: old.id, mastery: old.mastery ?? (old.status === 'learned' ? 100 : 50), updatedAt: old.updatedAt })
    }
    for (const r of data.notes ?? []) await db.put('notes', r)
    for (const r of data.images ?? []) await db.put<ImageRow>('images', { id: r.id, blob: base64ToBlob(r.base64, r.type), createdAt: r.createdAt })
    await reload()
    return { progress: data.progress?.length ?? 0, notes: data.notes?.length ?? 0, images: data.images?.length ?? 0 }
  }, [reload])
  const clearAll = useCallback(async () => { await Promise.all([db.clear('progress'), db.clear('notes'), db.clear('images')]); await reload() }, [reload])

  const value = useMemo<Ctx>(() => ({
    ready, progress, notes,
    setMastery, setManyMastery, loadNote, saveNote, deleteNote, putImage, getImage, exportAll, importAll, clearAll,
  }), [ready, progress, notes, setMastery, setManyMastery, loadNote, saveNote, deleteNote, putImage, getImage, exportAll, importAll, clearAll])
  return <UserDataCtx.Provider value={value}>{children}</UserDataCtx.Provider>
}

export function useUserData(): Ctx {
  const c = useContext(UserDataCtx); if (!c) throw new Error('useUserData ngoài UserDataProvider'); return c
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res((r.result as string).split(',')[1]); r.onerror = () => rej(r.error); r.readAsDataURL(blob) })
}
function base64ToBlob(b64: string, type: string): Blob {
  const bin = atob(b64), arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type })
}
