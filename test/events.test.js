// @format
const { assert } = require("chai");
const rewire = require("rewire");
const sinon = require("sinon");

describe("Event Scanner", () => {
  it("should set a block height in the database if none is defined for given contract address", async () => {
    const db = {
      get: sinon
        .stub()
        .onCall(0)
        .resolves(null)
        .onCall(1)
        .resolves("42")
        .onCall(2)
        .resolves(null),
      set: sinon.fake.resolves("Saved")
    };
    const getLocalHeights = rewire("../src/events").__get__("getLocalHeights");

    const contracts = [
      {
        options: {
          address: "abc"
        }
      },
      {
        options: {
          address: "abc2"
        }
      },
      {
        options: {
          address: "abc3"
        }
      }
    ];
    const heights = await getLocalHeights(db, contracts);

    assert(
      db.set.callCount === 2 && db.set.lastArg === "0",
      "Two default values for height should be written to the database"
    );
    assert.deepEqual(
      heights,
      [0, 42, 0],
      "Middle value should be 42, rest zero"
    );
  });
});
