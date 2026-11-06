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
