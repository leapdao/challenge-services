const slackAlert = require("./slackAlert");
const config = require("../../config/default.json");

function reportOnSlack(exit) {
  // exit = { txHash: '0x..', outIndex: '0'}
  const text = `The UTXO ${exit.txHash} with outIndex ${exit.outIndex} has data unavailability problem.`;
  slackAlert(config.reportSlack.slackAlertUrl, config.reportSlack.slackChannel, config.reportSlack.username, text);
}

module.exports = {
  reportOnSlack
};
