const moderationWorkers = new Set();

export function moderateText(text) {
  return new Promise((resolve) => {
    const worker = new Worker(
      new URL("../worker.js", import.meta.url)
    );

    moderationWorkers.add(worker);

    let finished = false;

    const finish = (result) => {
      if (finished) {
        return;
      }

      finished = true;

      worker.terminate();
      moderationWorkers.delete(worker);

      resolve(result);
    };

    worker.addEventListener(
      "message",
      (event) => {
        finish(
          event.data || {
            allowed: false,
            error: "Moderation could not be completed. Please try again."
          }
        );
      },
      { once: true }
    );

    worker.addEventListener(
      "error",
      () => {
        finish({
          allowed: false,
          error: "Moderation could not be completed. Please try again."
        });
      },
      { once: true }
    );

    worker.postMessage({
      type: "check-comment",
      text
    });
  });
}

export function cancelAllModeration() {
  moderationWorkers.forEach((worker) => {worker.terminate();});
  moderationWorkers.clear();
}