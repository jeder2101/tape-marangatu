export const Save = {
  KEY: 'tm_save_v1',
  load() {
    try { return JSON.parse(localStorage.getItem(Save.KEY) || 'null'); } catch { return null; }
  },
  save(data) {
    try { localStorage.setItem(Save.KEY, JSON.stringify(data)); return true; } catch { return false; }
  },
  clear() {
    try { localStorage.removeItem(Save.KEY); } catch {}
  },
};
