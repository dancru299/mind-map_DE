import { useCallback, useEffect, useState } from 'react'

/** Đọc/đổi URL bằng History API — đủ cho một trang, không cần router */
export function useHistory() {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const h = () => setPath(window.location.pathname)
    window.addEventListener('popstate', h); return () => window.removeEventListener('popstate', h)
  }, [])
  const navigate = useCallback((to: string, replace = false) => {
    if (to === window.location.pathname) return
    window.history[replace ? 'replaceState' : 'pushState'](null, '', to); setPath(to)
  }, [])
  return { path, navigate }
}
