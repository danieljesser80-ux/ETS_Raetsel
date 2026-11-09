// UNA-035/UNA-036: Render-Skip bei unverändertem Zustand und Konfigurations-Cache des Admin-Clients.
const VOLATILE = new Set(['server_now_ms', 'fetchedAtMs']);

export function stateKey(state, extra = '') {
  return JSON.stringify(state, (key, value) => (VOLATILE.has(key) ? undefined : value)) + '|' + extra;
}

export function createConfigCache() {
  let cache = null;
  return {
    rev: () => (cache ? cache.rev : null),
    clear() { cache = null; },
    // Gibt die vollständige Übersicht zurück oder null, wenn die Konfiguration fehlt und neu geladen werden muss.
    merge(o) {
      if (!o || !o.ok) return o;
      if (o.config_unchanged === false) {
        cache = { rev: o.config_rev, words: o.words, point_schedules: o.point_schedules, tasks: o.tasks };
      } else if (o.config_unchanged === true) {
        if (!cache || cache.rev !== o.config_rev) { cache = null; return null; }
      } else {
        return o;
      }
      const counts = o.task_answers || {};
      const { config_unchanged, task_answers, ...rest } = o;
      return {
        ...rest, words: cache.words, point_schedules: cache.point_schedules,
        tasks: cache.tasks.map((t) => ({ ...t, answers: Number(counts[t.id] || 0) })),
      };
    },
  };
}
