export function taskPreparation(task) {
  const missing = [];
  const solution = String(task.solution ?? '').trim();
  if (!solution) {
    missing.push('Lösung fehlt');
  }
  if (task.needs_choice) {
    const options = (task.options || []).map((name) => String(name).trim());
    if (options.length !== 4 || options.some((name) => !name)
        || new Set(options.map((name) => name.toLowerCase())).size !== 4) {
      missing.push('Vier verschiedene Vornamen fehlen');
    }
    const correct = String(task.correct_option ?? '').trim();
    if (!correct || !options.some((name) => name.toLowerCase() === correct.toLowerCase())) {
      missing.push('Der richtige Name aus den vier Vornamen fehlt');
    }
  }
  if (['schach', 'sudoku', 'geo-saeule', 'geo-baum'].includes(task.id)
      && !String(task.image_url ?? '').trim()) {
    missing.push('Bildadresse fehlt');
  }
  return missing;
}

export function roundPreparation(overview) {
  const missing = [];
  const min = overview.group_min;
  const max = overview.group_max;
  const validSize = Number.isInteger(min) && Number.isInteger(max) && min >= 1 && max <= 14 && min <= max;
  if (!validSize) missing.push('Gruppengröße ungültig');
  const words = overview.words;
  const validWords = Array.isArray(words) && words.length > 0
    && words.every((word) => typeof word === 'string' && /^[A-Z]{1,9}$/.test(word))
    && new Set(words).size === words.length;
  if (!validWords) missing.push('Wortliste fehlt oder ist ungültig');
  if (validWords && validSize) {
    const count = (overview.players || []).length;
    let sizes = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    if (count >= min) {
      const candidates = [];
      for (let k = Math.ceil(count / max); k <= Math.floor(count / min); k++) {
        candidates.push({ k, distance: Math.abs(count / k - (min + max) / 2) });
      }
      candidates.sort((a, b) => a.distance - b.distance || b.k - a.k);
      if (!candidates.length) missing.push('Teilnehmerzahl passt nicht zur Gruppengröße');
      else {
        const k = candidates[0].k;
        sizes = [...new Set([Math.floor(count / k), Math.ceil(count / k)])];
      }
    }
    for (const size of sizes) {
      if (!words.some((word) => size === 1 || (word.length >= size && word.length <= Math.min(2 * size, 9)))) {
        missing.push(`Kein passendes Wort für Gruppengröße ${size}`);
      }
    }
  }
  if (!Number.isInteger(overview.game_minutes) || overview.game_minutes < 1 || overview.game_minutes > 35791394) {
    missing.push('Spieldauer ungültig');
  }
  if (!['leicht', 'mittel', 'schwer'].includes(overview.word_difficulty)) missing.push('Gruppenwort-Schwierigkeit fehlt');
  for (const level of ['leicht', 'mittel', 'schwer']) {
    const points = overview.point_schedules?.[level];
    if (!Array.isArray(points) || points.length !== 9 || points.some((value, i) =>
      !Number.isInteger(value) || value < 0 || value > 10000 || (i > 0 && value > points[i - 1]))) {
      missing.push(`Punktestaffel ${level} ungültig`);
    }
  }
  if (overview.automatic_end_ready !== true) missing.push('Automatisches Spielende: Supabase Cron noch nicht eingerichtet');
  if (!overview.tasks?.length) missing.push('Aufgaben fehlen');
  for (const task of overview.tasks || []) {
    for (const problem of taskPreparation(task)) missing.push(`${task.title}: ${problem}`);
    if (!['leicht', 'mittel', 'schwer'].includes(task.difficulty)) missing.push(`${task.title}: Schwierigkeit fehlt`);
  }
  return missing;
}
