# event-scanner

> A JavaScript tool to scan smart contract events on Ethereum

## Configuration

To create a config, do the following:

```
$ mv config/index_template.json config/index.json
```

Fill in all the relevant information. The template file contains a rough
documentation of the fields.

Additionally, in `config/crontab`, define the frequency with which the
service should scan for new blocks.

## Installation

1. Build the container using: `sudo docker build --rm -t event-scanner .`
1. And to run it in the foreground: `sudo docker run -t -i event-scanner`

## Contribute and Test

```
$ git clone git@github.com:leapdao/challenge-services.git
$ cd challenge-services
$ npm i
$ npm run test
```

## License

MIT
