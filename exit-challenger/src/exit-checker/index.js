// Exit-checker
const axios = require("axios");
const { Type, Tx } = require("leap-core");
const config = require("../../config/default.json");
const {
  sendTaskToMaybeInvalidQueue,
  sendTaskToInvalidExitsQueue
} = require("../tasks-queues");

const { leapChainProvider } = config;
const data = {
  jsonrpc: "2.0",
  method: "plasma_getTransactionByPrevOut",
  id: 2
};

async function exitCheck(_exit) {
  data.params = [`${_exit.txHash}:${_exit.outIndex}`];
  const request = await axios({
    method: "post",
    url: leapChainProvider,
    data
  });
  if (request.data.result === null) {
    console.log("I AM GOING TO SEND EXIT TO MIQ");
    await sendTaskToMaybeInvalidQueue(_exit);
  } else {
    const nextTxRaw = request.data.result.raw;
    const nextTx = Tx.fromRaw(nextTxRaw);
    if (nextTx.type !== Type.EXIT) {
      const task = {
        exit: _exit,
        spend: nextTx.toJSON()
      };
      await sendTaskToInvalidExitsQueue(task);
    }
  }
  return 1;
}

module.exports = {
  exitCheck
};
