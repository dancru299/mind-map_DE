// IndexedDB tối giản cho dữ liệu người dùng: tiến độ, ghi chú, ảnh. Không tài khoản, không server.
/** Mức nắm vững 0–100 do người dùng tự chấm cho một mục lá */
export interface ProgressRow { id: string; mastery: number; updatedAt: number }
export interface NoteRow { id: string; html: string; text: string; imageIds: string[]; updatedAt: number }
export interface ImageRow { id: string; blob: Blob; createdAt: number }

const NAME = 'de-mindmap', VERSION = 2
const STORES = ['progress', 'notes', 'images'] as const
export type StoreName = typeof STORES[number]

let opening: Promise<IDBDatabase> | null = null
function open(): Promise<IDBDatabase> {
  if (opening) return opening
  opening = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('Trình duyệt không hỗ trợ IndexedDB')); return }
    const req = indexedDB.open(NAME, VERSION)
    req.onupgradeneeded = (ev) => {
      for (const s of STORES) if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s, { keyPath: 'id' })
      if (ev.oldVersion > 0 && ev.oldVersion < 2) { // v1 lưu status 'learned'/'learning' → mastery 100/50
        const store = req.transaction!.objectStore('progress')
        store.openCursor().onsuccess = e => {
          const c = (e.target as IDBRequest<IDBCursorWithValue>).result; if (!c) return
          const v = c.value as { id: string; status?: string; mastery?: number; updatedAt: number }
          if (v.mastery == null) c.update({ id: v.id, mastery: v.status === 'learned' ? 100 : 50, updatedAt: v.updatedAt })
          c.continue()
        }
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('IndexedDB bị chặn bởi tab khác'))
  })
  return opening
}

function run<T>(store: StoreName, mode: IDBTransactionMode, op: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(db => new Promise<T>((resolve, reject) => {
    const req = op(db.transaction(store, mode).objectStore(store))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  }))
}

export const db = {
  get: <T>(store: StoreName, id: string) => run<T | undefined>(store, 'readonly', s => s.get(id) as IDBRequest<T | undefined>),
  getAll: <T>(store: StoreName) => run<T[]>(store, 'readonly', s => s.getAll() as IDBRequest<T[]>),
  put: <T>(store: StoreName, row: T) => run<IDBValidKey>(store, 'readwrite', s => s.put(row)),
  del: (store: StoreName, id: string) => run<undefined>(store, 'readwrite', s => s.delete(id)),
  clear: (store: StoreName) => run<undefined>(store, 'readwrite', s => s.clear()),
}
