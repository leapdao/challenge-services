## challenge-services

> A JavaScript tools to ensure validity of a LeapDAO plasma chain.

### Content

This repository contains tools to provide MVP Plasma challenge games.
Each tool is in its own subdirectory with README file. Tools can be run separately or together, depending on your needs.

## Tools

### Event-scanner
Event-scanner scans Ethereum network for contract events (configurable) and push these events into message queues for other services to consume.
Redis-server is used for message queues.

### Exit-challenger
Purpose is to prevent double spends in Plasma by analyzing for ExitStarted event of ExitHandler contract (tool use event-scanner to receive events from the message queue) and by challenging the invalid exits. In this way tool helps Plasma with double spend problem and earns ETH for person who is running it.


## Clone repo

```
$ git clone git@github.com:leapdao/challenge-services.git
$ cd challenge-services
```

## License

MIT
