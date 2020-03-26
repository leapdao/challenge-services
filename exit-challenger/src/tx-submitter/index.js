const Web3 = require("web3");
const asyncRedis = require("async-redis");
const config = require("../../config/default.json");

const { rootChainProvider } = config;
const { exitHandlerAddress } = config;
const web3 = new Web3(rootChainProvider);
const password = process.env.PASSWORD;

const client = asyncRedis.createClient({
  host: config.redis.host,
  port: config.redis.port
});

// Rewrite with tracking nonce
let wallet;
// encrypt wallet
const encrypted = require("./keystore/keystore");

if (Object.prototype.toString.call(encrypted) === "[object Object]") {
  const accountObj = web3.eth.accounts.decrypt(encrypted, password);
  web3.eth.accounts.wallet.add(accountObj);
  wallet = web3.eth.accounts.wallet;
} else {
  throw Error("Exit-challenger cannot work without ethereum address");
}

async function txSubmitter(_task) {
  // _task = {challengeMsgData: msgData, exitsCallData: callData}
  const accountForSend = wallet[0];
  // Tracking nonce
  let nonce;
  const nonceFromBlockhain = await web3.eth.getTransactionCount(
    accountForSend.address
  );
  let nonceFromDB = await client.get("nonce");
  if (!nonceFromDB) {
     await client.set("nonce", nonceFromBlockhain);
     nonceFromDB = nonceFromBlockhain;
  }
  nonceFromDB = parseInt(nonceFromDB, 10);

  const msgData = generateMsgData(
    _task.challengeMsgData,
    accountForSend.address
  );
  const callData = generateCallDataForExits(_task.exitsCallData);
  if (nonceFromDB > nonceFromBlockhain) {
    nonce = nonceFromDB;
  } else {
    nonce = await web3.eth.getTransactionCount(accountForSend.address);
  }
  let gasPrice = await web3.eth.getGasPrice();

  if (BigInt(gasPrice) > BigInt("10000000000")) {
    gasPrice = "10000000000";
  }

  const tx = {
    nonce,
    from: accountForSend.address,
    to: exitHandlerAddress,
    data: msgData,
    gasPrice,
    gas: 120000
  };
  console.log(tx);
  const signedTx = await accountForSend.signTransaction(tx);
  console.log(signedTx);
  const signedTxRaw = signedTx.rawTransaction;
  // check if challenge was already done
  const result = await web3.eth.call({
    to: exitHandlerAddress,
    data: callData
  });

  const jsonOutputs = [
    { name: "amount", type: "uint256" },
    { name: "color", type: "uint16" },
    { name: "owner", type: "address" },
    { name: "finalized", type: "bool" },
    { name: "priorityTimestamp", type: "uint32" },
    { name: "stake", type: "uint256" },
    { name: "tokenData", type: "bytes32" },
    { name: "periodRoot", type: "bytes32" }
  ];
  const exitState = web3.eth.abi.decodeParameters(jsonOutputs, result);
  console.log(exitState);

  if (exitState.stake !== "0" && !exitState.finalized) {
    console.log("START SENDING SIGNED TX ", Date.now());
    web3.eth.sendSignedTransaction(signedTxRaw);
    console.log("END SENDING SIGNED TX ", Date.now());
    await client.set("nonce", nonce + 1);
  }

  return Promise.resolve("completed");
}

function generateMsgData(_parameters, address) {
  const parameters = _parameters;
  const jsonInterface = {
    name: "challengeExit",
    type: "function",
    inputs: [
      { name: "_proof", type: "bytes32[]" },
      { name: "_prevProof", type: "bytes32[]" },
      { name: "_outputIndex", type: "uint8" },
      { name: "_inputIndex", type: "uint8" },
      { name: "challenger", type: "address" }
    ]
  };
  parameters.push(address);
  return web3.eth.abi.encodeFunctionCall(jsonInterface, parameters);
}

// Also generate calldata for exitHandler.exits(exitUTXOId) call
function generateCallDataForExits(utxoId) {
  const jsonInterface = {
    name: "exits",
    type: "function",
    inputs: [
      {
        name: "_utxoId",
        type: "bytes32"
      }
    ]
  };
  return web3.eth.abi.encodeFunctionCall(jsonInterface, [utxoId]);
}

module.exports = {
  txSubmitter
};
