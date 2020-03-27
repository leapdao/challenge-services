const Web3 = require("web3");
const config = require("../config/default.json");

const web3 = new Web3(config.rootChainProvider);
const getBlockLatestTime = async _web3 => {
  const block = await _web3.eth.getBlock("latest");
  return block.timestamp;
};

async function init(_web3) {
  try {
    const timestamp = await getBlockLatestTime(_web3);
    console.log(timestamp);
  } catch (e) {
    console.log(0);
  }
}

init(web3);
