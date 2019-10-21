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
  for (let i = 0; i < config.contracts.length; i++) {
    contracts.push(
      new web3.eth.Contract(
        config.contracts[i].ABI,
        config.contracts[i].address
      )
    );
  }
  return contracts;
}

async function initRSMQ(password) {
  const rsmq = new RSMQPromise({
    host: config.redis.options.host,
    port: config.redis.options.port,
    ns: "rsmq",
    password
  });

  // NOTE: On first run, a queue might not exist yet, so we need to create it.
  await initQueue(rsmq);

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
  // NOTE: It's important to trim the secret file from whitespaces
  const password = fs.readFileSync("/run/secrets/redis_pass", "utf8").trim();

  return {
    contracts: initContracts(),
    rsmq: await initRSMQ(password),
    db: initDB(password),
    web3: web3
  };
}

async function initQueue(rsmq) {
  try {
    await rsmq.getQueueAttributes({ qname: config.redis.queue.name });
  } catch (err) {
    console.log("No matching redis queue found. Creating a new one");
    try {
      await rsmq.createQueue({ qname: config.redis.queue.name });
      console.log("Queue successfully created...");
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }
}

module.exports = init;
