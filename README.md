# event-scanner

> A JavaScript tool to scan smart contract events on Ethereum

## Configuration

To create a config, do the following:

```
$ mv config/default_template.json config/default.json
```

Fill in all the relevant information. The template file contains a rough
documentation of the fields.

In `config/crontab`, define the frequency with which the service should scan
for new blocks.

## Installation

1. To build and run the container: `docker-compose up --build`

## Contribute and Test

Before running the tests, you'll have to run through the configuration described
above.

```
$ git clone git@github.com:leapdao/challenge-services.git
$ cd challenge-services
$ npm i
$ npm run test
```

## License

MIT
