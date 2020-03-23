// Challenge submitter
const Web3 = require("web3");
const { Tx, Util, helpers, Outpoint } = require("leap-core");
const config = require("../../config/default.json");

const { leapChainProvider } = config;
const leapWeb3 = helpers.extendWeb3(new Web3(leapChainProvider));

const {
  sendTaskToChallengeTxsQueue,
  sendTaskToInvalidExitsQueue
} = require("../tasks-queues");

async function challengeSubmit(_task) {
  // _task = { exit: exit, spend: nextTx }
  const txsData = await generateTxsData(_task);
  const status = await periodDataStatus(txsData);
  if (status) {
    const parametersArray = await generateParameters(txsData);
    const exitUTXOId = generateExitUTXOId(_task.exit);
    const task = {
      challengeMsgData: parametersArray,
      exitsCallData: exitUTXOId
    };
    await sendTaskToChallengeTxsQueue(task);
  } else {
    return Promise.reject(new Error("No period data."));
  }
  return Promise.resolve("Task completed.");
}

async function generateTxsData(_invalidExitTask) {
  const spendingTxObject = Tx.fromJSON(_invalidExitTask.spend);
  const { exit } = _invalidExitTask;
  const spendTxData = await leapWeb3.eth.getTransaction(
    spendingTxObject.hash()
  );
  const exitTxData = await leapWeb3.eth.getTransaction(exit.txHash);
  return {
    spendTxObject: spendingTxObject,
    spendTxData,
    exitTxData
  };
}

async function periodDataStatus(_txsData) {
  const periodDataSpend = await leapWeb3.getPeriodByBlockHeight(
    _txsData.spendTxData.blockNumber
  );
  const periodDataExit = await leapWeb3.getPeriodByBlockHeight(
    _txsData.exitTxData.blockNumber
  );
  console.log(periodDataExit);
  console.log(periodDataSpend);
  if (periodDataExit && periodDataSpend) {
    return true;
  }
  return false;
}

async function generateParameters(_txsData) {
  // Construct proofs (spend and exit).
  const spendProof = await helpers.getProof(leapWeb3, _txsData.spendTxData, {
    excludePrevHashFromProof: true
  });
  const exitProof = await helpers.getProof(leapWeb3, _txsData.exitTxData, {
    excludePrevHashFromProof: true
  });
  // Construct input and output indexes
  let inputIndex;
  let outputIndex;
  for (let i = 0; i < _txsData.spendTxObject.inputs.length; i++) {
    const input = _txsData.spendTxObject.inputs[i];
    if (Util.toHexString(input.prevout.hash) == _txsData.exitTxData.hash) {
      inputIndex = i;
      outputIndex = input.prevout.index;
      break;
    }
  }

  return [spendProof, exitProof, inputIndex.toString(), outputIndex.toString()];
}

function generateExitUTXOId(exitEvent) {
  // Construct parameter for exitHandler.exits() call
  const hash = exitEvent.txHash;
  const index = parseInt(exitEvent.outIndex);

  const outPoint = new Outpoint(hash, index);

  return outPoint.getUtxoId();
}

module.exports = {
  challengeSubmit
};
