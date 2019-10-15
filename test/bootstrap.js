// @format
const rewire = require("rewire");

const constants = {
  DATABASE: {
    NAME: "testdb"
  }
};

// NOTE: We set the database path to "test", as we don't want tests to run
// on a clean database each time.
let main = rewire("../src/main");
main.__set__("config.database.path", constants.DATABASE.NAME);

module.exports = {
  constants
};
