// @format
const { assert } = require("chai");
const rewire = require("rewire");
const sinon = require("sinon");

describe("Init", () => {
  it("should return initialized web3 contracts and queue names", () => {
    const expected = {
      address: "0x0000000000000000000000000000000000000000",
      ABI: [
        {
          constant: true,
          inputs: [],
          name: "name",
          outputs: [
            {
              name: "",
              type: "string"
            }
          ],
          payable: false,
          stateMutability: "view",
          type: "function"
        }
      ],
      queue: {
        name: "queue"
      }
    };

    const events = rewire("../../src/events/init");
    events.__set__("config", {
      contracts: [expected]
    });

    const initContracts = events.__get__("initContracts");
    const { contracts, queueNames } = initContracts();

    assert.deepEqual(queueNames, [expected.queue.name]);
    assert(contracts[0].options.address === expected.address);
  });

  it("should create a queue if it doesn't exist yet", async () => {
    const initQueue = rewire("../../src/events/init").__get__("initQueue");
    const rsmqStub = {
      getQueueAttributes: sinon.fake.throws(),
      createQueue: sinon.fake.resolves(1)
    };

    const expectedQueueName = "queue_name";
    await initQueue(rsmqStub, [expectedQueueName]);

    assert(rsmqStub.getQueueAttributes.callCount === 1);
    assert(rsmqStub.createQueue.callCount === 1);
    assert.deepEqual(rsmqStub.createQueue.lastArg, {
      qname: expectedQueueName
    });
  });
});
