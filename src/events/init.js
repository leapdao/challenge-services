// @format
const Web3 = require("web3");
const redis = require("redis");
const RSMQPromise = require("rsmq-promise");
const fs = require("fs");
const { promisify } = require("util");
const config = require("config");

const web3 = new Web3(config.get("endpoint"));

function initContracts() {
  const initialized = [];
  const queueNames = [];

  const contracts = config.get("contracts");
  for (let i = 0; i < contracts.length; i++) {
    initialized.push(
      new web3.eth.Contract(contracts[i].ABI, contracts[i].address)
    );
    queueNames.push(contracts[i].queue.name);
  }
  return {
    contracts: initialized,
    queueNames
  };
}

async function initRSMQ(queueNames) {
  const rsmq = new RSMQPromise({
    host: config.get("redis.options.host"),
    port: config.get("redis.options.port"),
    ns: "rsmq"
  });

  // NOTE: On first run, a queue might not exist yet, so we need to create it.
  await initQueues(rsmq, queueNames);

  return rsmq;
}

function initDB() {
  const redisClient = redis.createClient({
    host: config.get("redis.options.host"),
    port: config.get("redis.options.port")
  });

  // NOTE: This is unfortunately how the redis client docs recommend
  // promisifying...
  const db = {
    get: promisify(redisClient.get).bind(redisClient),
    set: promisify(redisClient.set).bind(redisClient),
    quit: promisify(redisClient.quit).bind(redisClient)
  };

  return db;
}

async function init() {
  const { contracts, queueNames } = initContracts();

  return {
    contracts,
    queueNames,
    rsmq: await initRSMQ(queueNames),
    db: initDB(),
    web3: web3
  };
}

async function initQueues(rsmq, queueNames) {
  for (let i = 0; i < queueNames.length; i++) {
    const qname = queueNames[i];

    try {
      await rsmq.getQueueAttributes({ qname });
    } catch (err) {
      console.log(
        `No matching redis queue found for queue name ${qname}. Creating a new one.`
      );
      try {
        await rsmq.createQueue({ qname });
        console.log("Queue successfully created...");
      } catch (err) {
        console.log(err);
        process.exit(1);
      }
    }
  }
}

module.exports = init;
