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
Exit-challenger automatically monitors all the exits on Plasma chain and submits challenges for the invalid ones. By running this tool you help Plasma to stay secure and earn ETH on a side.

Exit-challenger relies on event-scanner to deliver exit events (`ExitStarted` events from `ExitHandler` contract).


## Clone repo

```
$ git clone git@github.com:leapdao/challenge-services.git
$ cd challenge-services
```

## License

MIT
