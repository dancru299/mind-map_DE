// Icon nét mảnh dùng chung cho menu / nút
const I = ({ d, fill }: { d: string; fill?: boolean }) => <svg viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
export const IcNote = () => <I d="M5 4h11l3 3v13H5zM8 12h8M8 16h5" />
export const IcCheck = () => <I d="M5 12l4 4L19 7" />
export const IcDot = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor" /></svg>
export const IcOpen = () => <I d="M9 6l6 6-6 6" />
export const IcOpenAll = () => <I d="M4 6h16M4 12h10M4 18h6" />
export const IcLink = () => <I d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
export const IcTarget = () => <I d="M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
export const IcExport = () => <I d="M12 4v11M7 10l5 5 5-5M5 20h14" />
export const IcImport = () => <I d="M12 15V4M7 9l5-5 5 5M5 20h14" />
export const IcTrash = () => <I d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
export const IcMore = () => <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
