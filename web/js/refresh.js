export function createRefreshLoop({
  load, apply, onError,
  setTimer = setTimeout, clearTimer = clearTimeout,
}) {
  let active = null;
  let queued = false;
  let generation = 0;
  let paused = false;
  let stopped = false;
  let running = false;
  let timer = null;
  let failures = 0;

  function cancelTimer() {
    if (timer !== null) clearTimer(timer);
    timer = null;
  }

  function schedule() {
    cancelTimer();
    if (!running || stopped || paused) return;
    const delay = failures ? Math.min(2000 * (2 ** Math.min(failures, 4)), 30000) : 2000;
    timer = setTimer(() => {
      timer = null;
      request();
    }, delay);
  }

  function request() {
    if (stopped) return Promise.resolve();
    if (paused) {
      paused = false;
      failures = 0;
      cancelTimer();
    }
    if (failures && timer !== null) return active || Promise.resolve();
    if (active) {
      queued = true;
      return active;
    }
    cancelTimer();
    const version = generation;
    let result;
    try {
      result = load();
    } catch (error) {
      result = Promise.reject(error);
    }
    active = Promise.resolve(result).then((value) => {
      if (version !== generation || stopped || paused) return;
      apply(value);
      failures = 0;
    }).catch((error) => {
      if (version !== generation || stopped || paused) return;
      failures++;
      queued = false;
      onError(error);
    }).finally(() => {
      active = null;
      if (queued && !stopped && !paused && !failures) {
        queued = false;
        return request();
      }
      schedule();
    });
    return active;
  }

  function invalidate() {
    generation++;
    paused = true;
    queued = false;
    cancelTimer();
  }

  return {
    request,
    invalidate,
    start() {
      if (running && !stopped) return;
      stopped = false;
      running = true;
      paused = false;
      failures = 0;
      schedule();
    },
    stop() {
      stopped = true;
      running = false;
      invalidate();
    },
  };
}
