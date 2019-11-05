//@format
const { run } = require("./scan");

(async function() {
  console.log("Running event-scanner...");
  await run();
  console.log("Exiting event-scanner...");
})();
