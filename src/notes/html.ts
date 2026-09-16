// Ghi chú lưu dạng HTML tối giản. Ảnh chỉ giữ data-id (blob nằm ở store "images"), src được gắn lại lúc mở.
const ALLOWED_TAGS = new Set(['P', 'DIV', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'CODE', 'PRE', 'UL', 'OL', 'LI', 'IMG', 'A', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'SPAN'])

/** Làm sạch DOM: bỏ thẻ/thuộc tính lạ; img chỉ giữ data-id (+ src blob: nếu có); a chỉ giữ href http(s) */
export function sanitize(root: HTMLElement): void {
  const walk = (el: Element) => {
    for (const child of [...el.children]) {
      if (!ALLOWED_TAGS.has(child.tagName)) { child.replaceWith(...child.childNodes); continue }
      for (const attr of [...child.attributes]) {
        const ok = (child.tagName === 'IMG' && (attr.name === 'data-id' || (attr.name === 'src' && attr.value.startsWith('blob:'))))
          || (child.tagName === 'A' && attr.name === 'href' && /^https?:\/\//.test(attr.value))
        if (!ok) child.removeAttribute(attr.name)
      }
      if (child.tagName === 'A') { child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener') }
      walk(child)
    }
  }
  walk(root)
}

/** Từ DOM editor → { html để lưu, text thuần, danh sách id ảnh } */
export function serialize(editor: HTMLElement): { html: string; text: string; imageIds: string[] } {
  const clone = editor.cloneNode(true) as HTMLElement
  sanitize(clone)
  const imageIds: string[] = []
  clone.querySelectorAll('img').forEach(img => {
    const id = img.getAttribute('data-id')
    if (!id) { img.remove(); return }
    img.removeAttribute('src'); imageIds.push(id)
  })
  return { html: clone.innerHTML, text: editor.innerText.replace(/\s+/g, ' ').trim(), imageIds: [...new Set(imageIds)] }
}

/** Ghi chú có nội dung thật không (bỏ qua khoảng trắng / <br> rỗng) */
export function isEmptyNote(text: string, imageIds: string[]): boolean { return text.trim() === '' && imageIds.length === 0 }
