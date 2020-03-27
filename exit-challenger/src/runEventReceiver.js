// Event-receiver runner script
const RSMQPromise = require("rsmq-promise");
const config = require("../config/default.json");
const EventReceiver = require("./event-receiver");

(async function() {
  const rsmq = new RSMQPromise({
    host: config.redis.host,
    port: config.redis.port
  });
  const exitQueueName = config.exitContractQueueName;
  const submissionQueueName = config.operatorContractQueueName;

  await new EventReceiver(rsmq, submissionQueueName, exitQueueName).run();
  process.exit();
})();
