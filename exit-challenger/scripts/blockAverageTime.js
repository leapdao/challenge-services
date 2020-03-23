const Web3 = require("web3");
const config = require("../config/default.json");

const web3 = new Web3(config.rootChainProvider);
const getBlockAverageTime = async web3 => {
  const span = 40000;
  const blockNumber = await web3.eth.getBlockNumber();
  const b1 = await web3.eth.getBlock(blockNumber);
  const b2 = await web3.eth.getBlock(Math.max(0, blockNumber - span));
  return (b1.timestamp - b2.timestamp) / (b1.number - b2.number);
};

async function init(_web3) {
  try {
    const interval = Math.max(1, await getBlockAverageTime(_web3));
    console.log(interval);
  } catch (e) {
    console.log(13);
  }
}

init(web3);
