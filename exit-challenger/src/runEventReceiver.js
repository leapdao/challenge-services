// Event-receiver runner script
const RSMQPromise = require("rsmq-promise");
const config = require("../config/default.json");
const { run } = require("./event-receiver");

(async function() {
  const rsmq = new RSMQPromise({
    host: config.redis.host,
    port: config.redis.port
  });
  const exitQueueName = config.exitContractQueueName;
  const submissionQueueName = config.operatorContractQueueName;
  
  await run(rsmq, exitQueueName, submissionQueueName);
  process.exit();
})();
