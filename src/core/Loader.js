export class Loader {
  static async json(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`Falha ao carregar ${path}: HTTP ${r.status}`);
    return r.json();
  }
  static async tryJson(path, fallback = null) {
    try { return await Loader.json(path); } catch { return fallback; }
  }
}
