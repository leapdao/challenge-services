// @format
const RSMQPromise = require("rsmq-promise");
const config = require("config");

function initRSMQ() {
  const rsmq = new RSMQPromise({
    host: config.get("redis.options.host"),
    port: config.get("redis.options.port"),
    ns: "rsmq"
  });

  return rsmq;
}

module.exports = {
  initRSMQ
};
