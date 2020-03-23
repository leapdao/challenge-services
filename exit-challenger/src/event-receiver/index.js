// Event-receiver
// runs every time that event-scanner running
const RSMQPromise = require("rsmq-promise");
const { exitCheck } = require("../exit-checker");
const { retryNoPeriodData } = require("../tasks-queues");
const config = require("../../config/default.json");

const rsmq = new RSMQPromise({
  host: config.redis.host,
  port: config.redis.port
});
const exitQueueName = config.exitContractQueueName;
const submissionQueueName = config.operatorContractQueueName;

async function run() {
  console.log("Starting to receive events...");
  // _eventSignature below is Web3.utils.sha3("Submission(bytes32,uint256,address,bytes32,bytes32)")
  await cleanQueue(
    submissionQueueName,
    "0xf986eac9872d4e0d99f75c012fa3e120147044f1e92bd63c196ff43f19f1e7ce"
  );
  console.log("Successfully cleaned up queue of operator contract.");
  // _eventSignature below is Web3.utils.sha3("ExitStarted(bytes32,uint8,uint256,address,uint256,bytes32)")
  await cleanQueue(
    exitQueueName,
    "0xdd3d84c638a8b94915688bf7497c3d748aaf6deedd859bed9cf79e9047c41df0"
  );
  console.log("Successfully cleaned up queue of exitHandler contract.");
  process.exit();
}
// receive messages while the queue is not empty
async function cleanQueue(_qname, _eventSignature) {
  let message = await rsmq.receiveMessage({ qname: _qname });
  while (Object.keys(message).length) {
    const eventFromMessage = JSON.parse(message.message);
    if (eventFromMessage.raw.topics[0] !== _eventSignature) {
      await rsmq.deleteMessage({ qname: _qname, id: message.id });
    } else {
      _eventSignature ===
      "0xdd3d84c638a8b94915688bf7497c3d748aaf6deedd859bed9cf79e9047c41df0"
        ? await gotExitEvent(eventFromMessage.raw.topics, message.id)
        : await gotSubmissionEvent(message.id);
    }
    message = await rsmq.receiveMessage({ qname: _qname });
  }
}

async function gotExitEvent(_exitEventTopics, _messageId) {
  let index = _exitEventTopics[2];
  // not sure about below should outIndex be 'f' or '15' for method plasma_getTransactionByPrevOut?
  index = BigInt(index).toString();
  const exit = {
    txHash: _exitEventTopics[1],
    outIndex: index
  };
  const result = await exitCheck(exit);
  if (result) {
    await rsmq.deleteMessage({ qname: exitQueueName, id: _messageId });
  }
}

async function gotSubmissionEvent(_messageId) {
  const result = await retryNoPeriodData();
  if (result) {
    await rsmq.deleteMessage({ qname: submissionQueueName, id: _messageId });
  }
}

module.exports = {
  run
};
