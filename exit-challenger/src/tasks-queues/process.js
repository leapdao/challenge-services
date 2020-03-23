const {
  maybeInvalidQueue,
  invalidExitsQueue,
  challengeTxsQueue
} = require("./index");
const { plasmaCheck } = require("../plasma-checker");
const { challengeSubmit } = require("../challenge-submitter");
const { txSubmitter } = require("../tx-submitter");
const { reportOnSlack } = require("../report-slack");

console.log("Process starting...");
maybeInvalidQueue.process(async job => {
  if (job.attemptsMade === 59) {
    reportOnSlack(job.data);
    job.remove();
  }
  return plasmaCheck(job.data);
});

invalidExitsQueue.process(async job => {
  return challengeSubmit(job.data);
});

challengeTxsQueue.process(async job => {
  return txSubmitter(job.data);
});
