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
  const job = await maybeInvalidQueue.add(_exit, {
    delay: 60000,
    attempts: 60,
    backoff: 60000
  });
}

async function sendTaskToIEQ(_task) {
  const job = await invalidExitsQueue.add(_task);
}

async function sendTaskToCTQ(_task) {
  const job = await challengeTxsQueue.add(_task);
}

// retry failed jobs with reason no period data
async function receivedSubmissionEvent() {
  console.log("I am IN RECIEVED SUBMISSION EVENT");
  const failedTasks = await invalidExitsQueue.getFailed();
  console.log("Failed tasks length: ", failedTasks.length);
  for (let i = 0; i < failedTasks.length; i += 1) {
    if (failedTasks[i].failedReason === "No period data.") {
      const failedTask = failedTasks[i];
      // or failedTask.retry(); instead below
      const job = await invalidExitsQueue.add(failedTask.data);
      await failedTask.remove();
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
