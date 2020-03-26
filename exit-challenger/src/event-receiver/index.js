// Event-receiver
// runs every time that event-scanner running
const { exitCheck } = require("../exit-checker");
const { retryNoPeriodData } = require("../tasks-queues");

class EventReceiver {
  constructor(rsmq, submissionQueueName, exitQueueName) {
    this.rsmq = rsmq;
    this.submissionQueueName = submissionQueueName;
    this.exitQueueName = exitQueueName;
  }

  async run() {
    console.log("Starting to receive events...");
    // _eventSignature below is Web3.utils.sha3("Submission(bytes32,uint256,address,bytes32,bytes32)")
    await this.cleanQueue(
      this.submissionQueueName,
      "0xf986eac9872d4e0d99f75c012fa3e120147044f1e92bd63c196ff43f19f1e7ce"
    );
    console.log("Successfully cleaned up queue of operator contract.");
    // _eventSignature below is Web3.utils.sha3("ExitStarted(bytes32,uint8,uint256,address,uint256,bytes32)")
    await this.cleanQueue(
      this.exitQueueName,
      "0xdd3d84c638a8b94915688bf7497c3d748aaf6deedd859bed9cf79e9047c41df0"
    );
    console.log("Successfully cleaned up queue of exitHandler contract.");
  }

  // receive messages while the queue is not empty
  async cleanQueue(_qname, _eventSignature) {
    let message = await this.rsmq.receiveMessage({ qname: _qname });
    while (Object.keys(message).length) {
      const eventFromMessage = JSON.parse(message.message);
      if (eventFromMessage.raw.topics[0] !== _eventSignature) {
        await this.rsmq.deleteMessage({ qname: _qname, id: message.id });
      } else {
        _eventSignature ===
        "0xdd3d84c638a8b94915688bf7497c3d748aaf6deedd859bed9cf79e9047c41df0"
          ? await this.gotExitEvent(eventFromMessage.raw.topics, message.id)
          : await this.gotSubmissionEvent(message.id);
      }
      message = await this.rsmq.receiveMessage({ qname: _qname });
    }
  }

  async gotExitEvent(_exitEventTopics, _messageId) {
    let index = _exitEventTopics[2];
    // not sure about below should outIndex be 'f' or '15' for method plasma_getTransactionByPrevOut?
    index = BigInt(index).toString();
    const exit = {
      txHash: _exitEventTopics[1],
      outIndex: index
    };
    const result = await exitCheck(exit).catch(e => console.log("exit-checker resulted in: ", e));
    if (result) {
      await this.rsmq.deleteMessage({ qname: this.exitQueueName, id: _messageId });
    }
  }

  async gotSubmissionEvent(_messageId) {
    const result = await retryNoPeriodData().catch(e => console.log("retryNoPeriodData resulted in: ", e));
    if (result) {
      await this.rsmq.deleteMessage({ qname: this.submissionQueueName, id: _messageId });
    }
  }
};

module.exports = EventReceiver;
