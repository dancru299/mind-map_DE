import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { TreeNode } from '../content/types'
import { colorOf } from '../content/load'
import { useUserData } from '../store/UserData'
import { useWindowGeometry, type Dir } from '../ui/useWindowGeometry'
import { compressImage, imageFiles } from './images'
import { isEmptyNote, sanitize, serialize } from './html'

interface Props { node: TreeNode; onClose: () => void; onGo: (n: TreeNode) => void }
const DIRS: Dir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
const fmtTime = (t: number) => new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

function initialGeo() {
  const panel = document.querySelector('.panel')?.getBoundingClientRect()
  const w = 440, h = 380, right = panel && panel.left > 500 ? panel.left : window.innerWidth
  return { x: right - w - 24, y: window.innerHeight - h - 24, w, h }
}

/** Cửa sổ ghi chú nổi: text + ảnh (dán / kéo thả), tự lưu, kéo di chuyển, co giãn 8 hướng */
export function NoteWindow({ node, onClose, onGo }: Props) {
  const data = useUserData()
  const { geo, startDrag, startResize, reset } = useWindowGeometry('de-mm-notewin', initialGeo)
  const editor = useRef<HTMLDivElement>(null)
  const urls = useRef<Map<string, string>>(new Map())
  const timer = useRef<number | undefined>(undefined)
  const dirty = useRef(false)
  const [state, setState] = useState<'loading' | 'idle' | 'saving' | 'saved'>('loading')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [empty, setEmpty] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current)
    const el = editor.current; if (!el || !dirty.current) return
    dirty.current = false
    const { html, text, imageIds } = serialize(el)
    setState('saving')
    if (isEmptyNote(text, imageIds)) { if (data.notes.has(node.id)) await data.deleteNote(node.id) }
    else await data.saveNote({ id: node.id, html, text, imageIds, updatedAt: Date.now() })
    setSavedAt(Date.now()); setState('saved')
  }, [data, node.id])
  const schedule = useCallback(() => {
    dirty.current = true; setState('idle')
    setEmpty(!editor.current || (editor.current.innerText.trim() === '' && !editor.current.querySelector('img')))
    window.clearTimeout(timer.current); timer.current = window.setTimeout(() => { flush() }, 700)
  }, [flush])

  // Mở ghi chú của node: nạp HTML đã lưu, gắn lại src cho ảnh
  useEffect(() => {
    let cancelled = false
    const el = editor.current; if (!el) return
    setState('loading'); el.innerHTML = ''
    data.loadNote(node.id).then(async row => {
      if (cancelled || !el) return
      if (row) {
        el.innerHTML = row.html; sanitize(el)
        for (const img of [...el.querySelectorAll('img')]) {
          const id = img.getAttribute('data-id'); const blob = id ? await data.getImage(id) : undefined
          if (cancelled) return
          if (blob) { const u = URL.createObjectURL(blob); urls.current.set(id!, u); img.src = u }
          else { const s = document.createElement('span'); s.className = 'img-missing'; s.textContent = '[ảnh không còn]'; img.replaceWith(s) }
        }
        setSavedAt(row.updatedAt)
      } else setSavedAt(null)
      setEmpty(!row || isEmptyNote(row.text, row.imageIds)); setState(row ? 'saved' : 'idle')
    })
    return () => {
      cancelled = true; flush()
      urls.current.forEach(u => URL.revokeObjectURL(u)); urls.current.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id])

  const insertImage = useCallback(async (file: File) => {
    const el = editor.current; if (!el) return
    setState('saving')
    const blob = await compressImage(file), id = await data.putImage(blob), u = URL.createObjectURL(blob)
    urls.current.set(id, u); el.focus()
    document.execCommand('insertHTML', false, `<img data-id="${id}" src="${u}"><br>`)
    schedule()
  }, [data, schedule])

  const onPaste = (e: React.ClipboardEvent) => {
    const files = imageFiles(e.clipboardData)
    if (files.length) { e.preventDefault(); files.forEach(insertImage); return }
    const text = e.clipboardData.getData('text/plain')
    if (text) { e.preventDefault(); document.execCommand('insertText', false, text) }   // bỏ HTML lạ từ web/Word
  }
  const onDrop = (e: React.DragEvent) => { const files = imageFiles(e.dataTransfer); if (files.length) { e.preventDefault(); files.forEach(insertImage) } }
  const cmd = (c: string, v?: string) => (e: React.MouseEvent) => { e.preventDefault(); editor.current?.focus(); document.execCommand(c, false, v); schedule() }
  const wrapCode = (e: React.MouseEvent) => {
    e.preventDefault(); editor.current?.focus()
    const sel = window.getSelection()?.toString() || 'code'
    document.execCommand('insertHTML', false, `<code>${sel.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))}</code>&nbsp;`); schedule()
  }
  const removeNote = async () => {
    if (!confirm(`Xoá toàn bộ ghi chú của "${node.title}"?`)) return
    window.clearTimeout(timer.current); dirty.current = false
    if (editor.current) editor.current.innerHTML = ''
    await data.deleteNote(node.id); setEmpty(true); setSavedAt(null); setState('idle')
  }
  const close = async () => { await flush(); onClose() }

  const statusText = state === 'loading' ? 'Đang mở…' : state === 'saving' ? 'Đang lưu…' : state === 'idle' && dirty.current ? 'Chưa lưu' : savedAt ? `Đã lưu ${fmtTime(savedAt)}` : 'Chưa có ghi chú'

  return createPortal(
    <div className={'notewin' + (collapsed ? ' collapsed' : '')} role="dialog" aria-label={`Ghi chú: ${node.title}`}
      style={{ left: geo.x, top: geo.y, width: geo.w, height: collapsed ? undefined : geo.h, '--lc': colorOf(node) } as CSSProperties}
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); close() } }}>
      <div className="nw-head" onPointerDown={startDrag} onDoubleClick={() => setCollapsed(c => !c)}>
        <i className="nw-stripe" />
        <button className="nw-title" title="Đi tới mục này" onPointerDown={e => e.stopPropagation()} onClick={() => onGo(node)}>{node.title}</button>
        <span className="nw-status">{statusText}</span>
        <button className="nw-btn" title={collapsed ? 'Mở rộng' : 'Thu gọn'} onPointerDown={e => e.stopPropagation()} onClick={() => setCollapsed(c => !c)} aria-label="Thu gọn">
          <svg viewBox="0 0 24 24"><path d={collapsed ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'} /></svg>
        </button>
        <button className="nw-btn" title="Đóng (Esc)" onPointerDown={e => e.stopPropagation()} onClick={close} aria-label="Đóng"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
      </div>
      {!collapsed && <>
        <div className="nw-tools">
          <button onMouseDown={cmd('bold')} title="Đậm (Ctrl+B)"><b>B</b></button>
          <button onMouseDown={cmd('italic')} title="Nghiêng (Ctrl+I)"><i>I</i></button>
          <button onMouseDown={wrapCode} title="Mã"><code>{'<>'}</code></button>
          <button onMouseDown={cmd('insertUnorderedList')} title="Danh sách">• —</button>
          <button onMouseDown={cmd('formatBlock', 'h3')} title="Tiêu đề">H</button>
          <span className="sp" />
          <label className="nw-img" title="Chèn ảnh từ máy">
            <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m21 15-5-5-8 8" /></svg>
            <input type="file" accept="image/*" multiple onChange={e => { [...(e.target.files ?? [])].forEach(insertImage); e.target.value = '' }} />
          </label>
          <button onMouseDown={e => { e.preventDefault(); removeNote() }} title="Xoá ghi chú" className="danger" disabled={empty}>
            <svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
          </button>
          <button onMouseDown={e => { e.preventDefault(); reset() }} title="Đưa cửa sổ về vị trí mặc định" className="ghost">⟲</button>
        </div>
        <div className="nw-body" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
          <div ref={editor} className="nw-editor" contentEditable suppressContentEditableWarning spellCheck={false}
            onInput={schedule} onPaste={onPaste} onBlur={() => flush()}
            onClick={e => { const t = e.target as HTMLElement; if (t.tagName === 'IMG') t.classList.toggle('full') }} />
          {empty && state !== 'loading' && <div className="nw-placeholder">Gõ ghi chú của bạn. Dán ảnh bằng Ctrl+V hoặc kéo thả vào đây.</div>}
        </div>
        {DIRS.map(d => <div key={d} className={`rz rz-${d}`} onPointerDown={startResize(d)} />)}
      </>}
    </div>, document.body)
}
