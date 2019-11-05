// @format
const { assert } = require("chai");
const rewire = require("rewire");
const sinon = require("sinon");
const Web3 = require("web3");

describe("Challenger", () => {
  it("It should allocate the correct approach for a message", async () => {
    const configuredTopic = Web3.utils.sha3(
      "ExitStarted(bytes32,uint8,uint256,address,uint256,bytes32)"
    );

    const msg = {
      id: "abc",
      message: JSON.stringify({
        transactionHash: "hash",
        raw: {
          topics: [configuredTopic]
        }
      })
    };

    const challenger = rewire("../../src/challenger/run");
    const approach = sinon.fake();
    const deleteMessage = sinon.fake.resolves(1);
    challenger.__set__("initRSMQ", () => {
      return {
        receiveMessage: sinon.fake.resolves(msg),
        deleteMessage
      };
    });
    challenger.__set__("approaches", { [configuredTopic]: approach });

    const allocateTasks = challenger.__get__("allocateTasks");
    await allocateTasks();

    assert(approach.callCount === 1, "A challenge approach must be called");
    assert(
      deleteMessage.callCount === 1,
      "On successful challenge, the message must be deleted"
    );
  });

  it("it should ignore and delete an unrelated message with no configured topic", async () => {
    const configuredTopic = Web3.utils.sha3("Test(uint256,address)");

    const msg = {
      id: "abc",
      message: JSON.stringify({
        transactionHash: "hash",
        raw: {
          topics: [configuredTopic]
        }
      })
    };

    const challenger = rewire("../../src/challenger/run");
    const approach = sinon.fake();
    const deleteMessage = sinon.fake.resolves(1);
    challenger.__set__("initRSMQ", () => {
      return {
        receiveMessage: sinon.fake.resolves(msg),
        deleteMessage
      };
    });
    challenger.__set__("approaches", { ["abc"]: approach });

    const allocateTasks = challenger.__get__("allocateTasks");
    await allocateTasks();

    assert(approach.callCount === 0, "Event must not be challenged");
    assert(deleteMessage.callCount === 1, "Event must be deleted");
  });
});
