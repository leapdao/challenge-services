//@format
const { run } = require("./events");

(async function() {
  console.log("Running event-scanner...");
  await run();
  console.log("Exiting event-scanner...");
})();
