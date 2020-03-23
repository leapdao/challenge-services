// Plasma-Checker
const axios = require("axios");
const { Type, Tx } = require("leap-core");
const config = require("../../config/default.json");

const { sendTaskToInvalidExitsQueue } = require("../tasks-queues");

const { leapChainProvider } = config;
const data = {
  jsonrpc: "2.0",
  method: "plasma_getTransactionByPrevOut",
  id: 2
};

async function plasmaCheck(_exit) {
  data.params = [`${_exit.txHash}:${_exit.outIndex}`];
  console.log(data.params);
  const request = await axios({
    method: "post",
    url: leapChainProvider,
    data
  });
  if (request.data.result === null) {
    return Promise.reject(new Error("Still no data available."));
  }
  const nextTxRaw = request.data.result.raw;
  const nextTx = Tx.fromRaw(nextTxRaw);
  if (nextTx.type !== Type.EXIT) {
    const task = {
      exit: _exit,
      spend: nextTx.toJSON()
    };
    await sendTaskToInvalidExitsQueue(task);
  }

  console.log("PLASMA CHECKER JOB COMPLETED");
  return Promise.resolve("Totally completed.");
}

module.exports = {
  plasmaCheck
};
