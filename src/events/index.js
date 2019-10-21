// @format
const allSettled = require("promise.allsettled");

const config = require("../../config");
const init = require("./init");

async function run() {
  const { db, web3, rsmq, contracts } = await init();
  const addresses = contracts.map(c => c.options.address);
  const localHeights = await getLocalHeights(db, addresses);
  const diffs = await getDifferences(web3, localHeights);

  for (let i = 0; i < contracts.length; i++) {
    const contract = contracts[i];
    const localHeight = localHeights[i];
    const diff = diffs[i];

    if (diff < 0) {
      throw new Error("Local block height is higher than node block height");
    } else if (diff === 0) {
      console.log("Nothing to scan...");
      // noop
    } else {
      console.log(
        `Contract ${
          contract.options.address
        } is at local height ${localHeight} (diff: ${diff})`
      );
      const events = await scan(contract, localHeight, diff);
      if (events.length <= 0) {
        console.log(`No new events for contract ${contract.options.address}`);
      } else {
        try {
          await send(rsmq, events);
        } catch (err) {
          console.log("Failed to send all events", err);
        }
      }
      console.log(
        `Successfully wrote ${events.length} events to queue for contract: ${
          contract.options.address
        }.`
      );
      await db.set(`${contract.options.address}_height`, localHeight + diff);
    }
  }
  await teardown(db, rsmq);
}

async function teardown(db, rsmq) {
  console.log("Shutting down...");
  try {
    await db.quit();
    await rsmq.quit();
    process.exit();
  } catch (err) {
    console.log("An error occurred quitting the redis connection", err);
    process.exit(1);
  }
}

async function send(rsmq, events) {
  const p = events.map(e => {
    return rsmq.sendMessage({
      qname: config.redis.queue.name,
      message: JSON.stringify(e)
    });
  });

  return await Promise.all(p);
}

async function scan(contract, localHeight, diff) {
  return await contract.getPastEvents("allEvents", {
    fromBlock: localHeight,
    toBlock: localHeight + diff
  });
}

async function getDifferences(web3, localHeights) {
  const remoteHeight = (await web3.eth.getBlock("latest")).number;
  return localHeights.map(h => remoteHeight - h);
}

async function getLocalHeights(db, addresses) {
  const queries = addresses.map(a => `${a}_height`);

  // NOTE: If values have not been set yet in redis, then it returns
  // the value as null on a get. We want to set all these values to zero
  // initially
  const results = await allSettled(queries.map(q => db.get(q)));
  const heights = results.map(
    r => (r.status === "fulfilled" && !r.value ? 0 : parseInt(r.value, 10))
  );

  return heights;
}

module.exports = {
  run
};
