// @format
const Web3 = require("web3");
const config = require("config");
const { initRSMQ } = require("../shared/utils");

const approaches = {
  [Web3.utils.sha3(
    "ExitStarted(bytes32,uint8,uint256,address,uint256,bytes32)"
  )]: checkExit
};

(async function() {
  await allocateTasks();
})();

async function allocateTasks() {
  const rsmq = initRSMQ();
  const queueNames = config.get("contracts").map(c => c.queue.name);
  // TODO: Support multiple queues. Currently no need to have...
  const qname = queueNames[0];

  const msg = await getMessage(rsmq, qname);
  console.log("Now checking message with id", msg.id);

  let approach;
  for (let topic of msg.message.raw.topics) {
    if (approaches[topic]) {
      approach = approaches[topic];
      break;
    }
  }

  if (approach) {
    try {
      await approach(msg);
      console.log(
        `Message resulting from transaction hash ${
          msg.message.transactionHash
        } was successfully challenged.`
      );
    } catch (err) {
      console.log(
        `Message resulting from transaction hash ${
          msg.message.transactionHash
        } yielded an error when challenged: .`,
        err
      );
      // TODO: What do we do with this transaction here?
      // IMO, we should store it somewhere as failed, notify the admin and
      // continue logging.
      return;
    }
  } else {
    console.log(
      `Message resulting from transaction hash ${
        msg.message.transactionHash
      } wasn't matched to any relevant topic.`
    );
  }

  await rsmq.deleteMessage({ qname, id: msg.id });
}

async function getMessage(rsmq, qname) {
  let msg = await rsmq.receiveMessage({ qname });
  msg.message = JSON.parse(msg.message);
  return msg;
}

async function checkExit(msg) {
  console.log("checking exits!", msg);
}
