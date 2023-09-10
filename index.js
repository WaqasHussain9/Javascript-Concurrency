const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

var doTask = (taskName, current) => {
  var begin = Date.now();
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      var end = Date.now();
      var timeSpent = end - begin + "ms";
      console.log(
        "\x1b[36m",
        "[TASK] FINISHED: " + taskName + " in " + timeSpent,
        "\x1b[0m"
      );
      eventEmitter.emit("reduceConcurrency", current);
      resolve(true);
    }, Math.random() * 200);
  });
};

async function init() {
  numberOfTasks = 20;
  const concurrencyMax = 4;
  const taskList = [...Array(numberOfTasks)].map(() =>
    [...Array(~~(Math.random() * 10 + 3))]
      .map(() => String.fromCharCode(Math.random() * (123 - 97) + 97))
      .join("")
  );
  const counter = 0;
  let concurrencyCurrent = 0;
  console.log("[init] Concurrency Algo Testing...");
  console.log("[init] Tasks to process: ", taskList.length);
  console.log("[init] Task list: " + taskList);
  console.log("[init] Maximum Concurrency: ", concurrencyMax, "\n");
  await manageConcurrency(
    taskList,
    counter,
    concurrencyMax,
    concurrencyCurrent
  );
}

async function manageConcurrency(
  taskList,
  counter,
  concurrencyMax,
  concurrencyCurrent
) {
  let concurrencyLimit = concurrencyMax;
  let current = concurrencyCurrent;
  counter = concurrencyMax;

  setInterval(() => {
    // function for changing the concurrency limit on the fly
    concurrencyLimit = 2;
    current = concurrencyLimit;
  }, 400);

  eventEmitter.on("reduceConcurrency", (crnt) => {
    current = crnt - 1;
    console.log("Current", current);
  });

  let started = 0;

  const performTasks = taskList.map((t) => () => {
    console.log(`[EXE] Concurrrency ${current} of ${concurrencyLimit}`);
    console.log(`[EXE] Task count ${started} of ${taskList.length}`);
    console.log(`[TASK] Starting ${t}`);

    return doTask(t, current);
  });

  const results = [];

  const handleConcurrentTasks = () => {
    const i = started++;
    current = current + 1;
    const performTask = performTasks.shift();
    return !performTask
      ? null
      : Promise.allSettled([performTask()]).then((result) => {
          results[i] = result[0];
          return handleConcurrentTasks();
        });
  };

  Promise.all(
    Array.from({ length: concurrencyLimit }, handleConcurrentTasks)
  ).then(() => {
    console.log("All tasks completed successfully!");
  });
}

init();
