// Tasks queue module.exports
const Bull = require("bull");
const config = require("../../config/default.json");

const options = {
  redis: {
    host: config.redis.host,
    port: config.redis.port
  },
  limiter: {
    max: 10000,
    duration: 5000,
    bounceBack: false
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false
  }
};

const maybeInvalidQueue = new Bull("mi_queue", options);
const invalidExitsQueue = new Bull("ie_queue", options);
const challengeTxsQueue = new Bull("ct_queue", options);

async function sendExitToMIQ(_exit) {
  return maybeInvalidQueue.add(_exit, {
    delay: 60000,
    attempts: 60,
    backoff: 60000
  });
}

async function sendTaskToIEQ(_task) {
  return invalidExitsQueue.add(_task);
}

async function sendTaskToCTQ(_task) {
  return challengeTxsQueue.add(_task);
}

// retry failed jobs with reason no period data
async function receivedSubmissionEvent() {
  console.log("Submission event was received...");
  console.log("Starting to retry tasks with no period data...");
  const failedTasks = await invalidExitsQueue.getFailed();
  console.log("Failed tasks length: ", failedTasks.length);
  for (let i = 0; i < failedTasks.length; i += 1) {
    if (failedTasks[i].failedReason === "No period data.") {
      const failedTask = failedTasks[i];
      const jobData = failedTask.data;
      await failedTask.remove();
      // for Plasma where Submissions appears less than one time per minute use object parameter ({delay: 60000, attempts: 3, backoff: 60000})
      // Otherwise remove object parameter or use await failedTask.retry() instead
      const job = await invalidExitsQueue.add(jobData, {
        delay: 60000,
        attempts: 3,
        backoff: 60000
      });
      // await failedTask.moveToCompleted('ok', true, true);
    }
  }
  return 1;
}

module.exports = {
  sendTaskToInvalidExitsQueue: sendTaskToIEQ,
  sendTaskToMaybeInvalidQueue: sendExitToMIQ,
  sendTaskToChallengeTxsQueue: sendTaskToCTQ,
  retryNoPeriodData: receivedSubmissionEvent,
  maybeInvalidQueue,
  invalidExitsQueue,
  challengeTxsQueue
};
