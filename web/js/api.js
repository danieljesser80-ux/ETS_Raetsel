function unwrap(result) {
  const { data, error } = result || {};
  if (error) {
    throw new Error((error && error.message) || 'Verbindungsfehler');
  }
  return data;
}

export function createApi(client) {
  const rpc = async (name, args) => unwrap(await client.rpc(name, args));
  const withCode = (name, extra) => (code, ...rest) =>
    rpc(name, { p_code: code, ...(extra ? extra(...rest) : {}) });

  return {
    async ensureSession() {
      const { data, error } = await client.auth.getSession();
      if (error) throw new Error(error.message || 'Sitzungsfehler');
      if (data && data.session) return;
      const res = await client.auth.signInAnonymously();
      if (res && res.error) throw new Error(res.error.message || 'Anmeldung fehlgeschlagen');
    },
    joinRound: (name) => rpc('join_round', { p_name: name }),
    getState: () => rpc('get_state'),
    submitAnswer: (answer) => rpc('submit_answer', { p_answer: answer }),
    giveUp: (taskId = 'wort') => rpc('give_up', { p_task_id: taskId }),
    gameConfig: () => rpc('game_config'),
    beamerState: (token) => rpc('beamer_state', { p_token: token }),
    startTask: (taskId) => rpc('start_task', { p_task_id: taskId }),
    submitTask: (taskId, answer, choice) =>
      rpc('submit_task_answer', { p_task_id: taskId, p_answer: answer, p_choice: choice ?? null }),
    admin: {
      startRegistration: withCode('admin_start_registration', (seconds) => ({ p_seconds: seconds })),
      closeRegistration: withCode('admin_close_registration'),
      formGroups: withCode('admin_form_groups'),
      setGroupSize: withCode('admin_set_group_size', (min, max) => ({ p_min: min, p_max: max })),
      setGameConfig: withCode('admin_set_game_config', (minutes, difficulty, schedules) => ({
        p_minutes: minutes, p_word_difficulty: difficulty, p_schedules: schedules,
      })),
      setWords: withCode('admin_set_words', (words) => ({ p_words: words })),
      openBeamer: withCode('admin_open_beamer'),
      exportResults: withCode('admin_export'),
      setTask: withCode('admin_set_task', (id, f) => ({
        p_id: id,
        p_title: f.title ?? null,
        p_body: f.body ?? null,
        p_image_url: f.imageUrl ?? null,
        p_solution: f.solution ?? null,
        p_options: f.options ?? null,
        p_correct_option: f.correctOption ?? null,
        p_difficulty: f.difficulty ?? null,
      })),
      overview: withCode('admin_overview', (knownRev) => (knownRev == null ? {} : { p_known_rev: knownRev })),
      importTasks: withCode('admin_import_tasks', (tasks, apply) => ({ p_tasks: tasks, p_apply: apply === true })),
      finish: withCode('admin_finish'),
      reset: withCode('admin_reset'),
    },
  };
}
