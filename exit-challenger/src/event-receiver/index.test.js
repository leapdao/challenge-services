const EventReceiver = require('./index');

const { exitCheck } = require("../exit-checker");
jest.mock("../exit-checker");

const { retryNoPeriodData } = require("../tasks-queues");
jest.mock("../tasks-queues")

const rsmqMock = () => ({
  receiveMessage: jest.fn().mockResolvedValue({}),
  deleteMessage: jest.fn().mockResolvedValue({})
});

const exitEventMessage = {
  id: 1,
  message: JSON.stringify({
    raw: {
      topics: [
        '0xdd3d84c638a8b94915688bf7497c3d748aaf6deedd859bed9cf79e9047c41df0',
        '0xa57a8dd2b9d531fdf1dd0bde74d7961c8648836e358d26abe92253da113a2b5f',
        '0'
      ]
    }
  })
};

const unknownEventMessage = {
  id: 2,
  message: JSON.stringify({
    raw: {
      topics: [
        '0xa3e120147044f1e92bd63c196ff43f19f1e7cef986eac9872d4e0d99f75c012f',
      ]
    } 
  })
};

const submissionEventMessage = {
  id: 2,
  message: JSON.stringify({
    raw: {
      topics: [
        '0xf986eac9872d4e0d99f75c012fa3e120147044f1e92bd63c196ff43f19f1e7ce',
      ]
    } 
  })
};

describe('event receiver', () => {
  let rsmq;

  beforeEach(() => {
    rsmq = rsmqMock();
    exitCheck.mockReset();
    retryNoPeriodData.mockReset();
    exitCheck.mockResolvedValue({});
    retryNoPeriodData.mockResolvedValue({});
  });

  test('should read all the messages in queue', async () => {
    rsmq.receiveMessage
      .mockResolvedValueOnce(submissionEventMessage)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce(exitEventMessage)
      .mockResolvedValueOnce({});
        
    await new EventReceiver(rsmq, 'submissionQueue', 'exitQueue').run();
    
    expect(rsmq.receiveMessage).toHaveBeenCalledTimes(4);
    expect(rsmq.deleteMessage).toHaveBeenCalledTimes(2);
    expect(rsmq.receiveMessage.mock.calls[0][0]).toEqual({ qname: 'submissionQueue' });
    expect(rsmq.receiveMessage.mock.calls[1][0]).toEqual({ qname: 'submissionQueue' });
    expect(retryNoPeriodData).toHaveBeenCalledTimes(1);
    expect(rsmq.deleteMessage.mock.calls[0][0]).toEqual(
      { qname: 'submissionQueue', id: submissionEventMessage.id }
    );
    expect(rsmq.receiveMessage.mock.calls[2][0]).toEqual({ qname: 'exitQueue' });
    expect(rsmq.receiveMessage.mock.calls[3][0]).toEqual({ qname: 'exitQueue' });
    expect(exitCheck).toHaveBeenCalledTimes(1);
    expect(exitCheck).toHaveBeenCalledWith({ 
      txHash: '0xa57a8dd2b9d531fdf1dd0bde74d7961c8648836e358d26abe92253da113a2b5f',
      outIndex: '0',
    });
    expect(rsmq.deleteMessage.mock.calls[1][0]).toEqual(
      { qname: 'exitQueue', id: exitEventMessage.id }
    );
  });

  test('should discard unsupported messages', async () => {
    rsmq.receiveMessage
      .mockResolvedValue({})  
      .mockResolvedValueOnce(unknownEventMessage);
        
    await new EventReceiver(rsmq, 'submissionQueue', 'exitQueue').run();

    expect(rsmq.deleteMessage).toHaveBeenCalledTimes(1);
    expect(retryNoPeriodData).not.toHaveBeenCalled();
    expect(exitCheck).not.toHaveBeenCalled();
  });

  test('should not discard messages if processing failed', async () => {
    rsmq.receiveMessage
      .mockResolvedValueOnce(submissionEventMessage)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce(exitEventMessage)
      .mockResolvedValueOnce({});

    // mock processing functions return false
    retryNoPeriodData.mockResolvedValue(false);
    exitCheck.mockResolvedValue(false);
        
    await new EventReceiver(rsmq, 'submissionQueue', 'exitQueue').run();

    expect(rsmq.deleteMessage).toHaveBeenCalledTimes(0);
    expect(retryNoPeriodData).toHaveBeenCalled();
    expect(exitCheck).toHaveBeenCalled();
  });



});