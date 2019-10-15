// @format
const rimraf = require("rimraf");

const { constants } = require("./bootstrap");

function deleteTestDB() {
  rimraf(constants.DATABASE.NAME, () => console.log("Deleted test database"));
}

after(async () => {
  deleteTestDB();
});

module.exports = deleteTestDB();
