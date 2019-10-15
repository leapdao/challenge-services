// @format
const Web3 = require("web3");
const levelup = require("levelup");
const leveldown = require("leveldown");
const allSettled = require("promise.allsettled");

const config = require("./config");
const web3 = new Web3(config.endpoint);

async function run() {
  const { db, contracts } = init();
  const heights = await getHeights(db, contracts);
}

async function getHeights(db, contracts) {
  const queries = contracts.map(c => `${c.options.address}_height`);
  let p = queries.map(q => db.get(q));

  // NOTE: levelup is throwing an error if a key is not available yet.
  // We use the new ESNext compliant `allSettled` functionality to
  // filter by keys that haven't been defined yet and ...
  const results = await allSettled(p);
  const heights = results.map(r => (r.status === "rejected" ? 0 : parseInt(r.value, 10)));

  // ... we define all values that throw errors.
  p = heights.reduce(
    (acc, curr, i) =>
      // NOTE: We're using `concat` instead of `push` here to return the
      // update array to the reduce function.
      curr === 0 ? acc.concat([contracts[i].options.address]) : acc,
    []
  ).map(c => db.put(`${c}_height`, "0"));
  await Promise.all(p)

  return heights;
}

function init() {
  const contracts = [];
  for (let i = 0; i < config.contracts.length; i++) {
    contracts.push(
      new web3.eth.Contract(
        config.contracts[i].ABI,
        config.contracts[i].address
      )
    );
  }
  return {
    contracts,
    db: levelup(leveldown(config.database.path))
  };
}

run();
