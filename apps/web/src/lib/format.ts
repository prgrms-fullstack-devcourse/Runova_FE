export const fmtDuration = (sec: number) => {
  if (!sec) return '0s';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return [h ? `${h}h` : '', m ? `${m}m` : '', s ? `${s}s` : '']
    .filter(Boolean)
    .join(' ');
};
