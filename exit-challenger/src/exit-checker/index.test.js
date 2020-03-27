// Exit-checker
const axios = require("axios");
jest.mock('axios');

const mockConfig = {
  leapChainProvider: 'http://localhost:3000'
};

const config = require("../../config/default.json");
jest.mock("../../config/default.json", () => mockConfig);

const {
  sendTaskToMaybeInvalidQueue,
  sendTaskToInvalidExitsQueue
} = require("../tasks-queues");

jest.mock("../tasks-queues", () => ({
  sendTaskToMaybeInvalidQueue: jest.fn(),
  sendTaskToInvalidExitsQueue: jest.fn(),
}));

const { exitCheck } = require('./index');

test('exit checker', async () => {
  axios.mockResolvedValue({ data: {
    result: null
  }});

  const exit = {
    txHash: '0xf986eac9872d4e0d99f75c012fa3e120147044f1e92bd63c196ff43f19f1e7ce',
    outIndex: '0',
  };

  expect(await exitCheck(exit)).toBe(1);
  expect(sendTaskToMaybeInvalidQueue).toHaveBeenCalledWith(exit);
  expect(axios.mock.calls[0][0].data).toEqual({ 
    jsonrpc: '2.0',
    method: "plasma_getTransactionByPrevOut",
    id: expect.any(Number),
    params: ['0xf986eac9872d4e0d99f75c012fa3e120147044f1e92bd63c196ff43f19f1e7ce:0'],
  });
  expect(axios).toHaveBeenCalledWith({
    data: expect.any(Object),
    url: mockConfig.leapChainProvider,
    method: 'post'
  });
});

