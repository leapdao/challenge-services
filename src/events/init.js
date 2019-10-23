// @format
const Web3 = require("web3");
const redis = require("redis");
const RSMQPromise = require("rsmq-promise");
const fs = require("fs");
const { promisify } = require("util");

const config = require("../../config");
const web3 = new Web3(config.endpoint);

function initContracts() {
  const contracts = [];
  const queueNames = [];
  for (let i = 0; i < config.contracts.length; i++) {
    contracts.push(
      new web3.eth.Contract(
        config.contracts[i].ABI,
        config.contracts[i].address
      )
    );
    queueNames.push(config.contracts[i].queue.name);
  }
  return {
    contracts,
    queueNames
  };
}

async function initRSMQ(password, queueNames) {
  const rsmq = new RSMQPromise({
    host: config.redis.options.host,
    port: config.redis.options.port,
    ns: "rsmq",
    password
  });

  // NOTE: On first run, a queue might not exist yet, so we need to create it.
  await initQueue(rsmq, queueNames);

  console.log("hi");
  return rsmq;
}

function initDB(password) {
  const redisClient = redis.createClient({
    host: config.redis.options.host,
    port: config.redis.options.port,
    password
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
  console.log(process.env.REDIS_PASS);
  const password = process.env.REDIS_PASS;
  const { contracts, queueNames } = initContracts();

  return {
    contracts,
    queueNames,
    rsmq: await initRSMQ(password, queueNames),
    db: initDB(password),
    web3: web3
  };
}

async function initQueue(rsmq, queueNames) {
  for (let i = 0; i < queueNames.length; i++) {
    const queueName = queueNames[i];

    try {
      await rsmq.getQueueAttributes({ qname: queueName });
    } catch (err) {
      console.log(
        `No matching redis queue found for queue name ${queueName}. Creating a new one.`
      );
      try {
        await rsmq.createQueue({ qname: queueName });
        console.log("Queue successfully created...");
      } catch (err) {
        console.log(err);
        process.exit(1);
      }
    }
  }
}

module.exports = init;
