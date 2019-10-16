# event-scanner

> A JavaScript tool to scan smart contract events on Ethereum

## Configuration

To create a config, do the following:

```
$ mv config/index_template.json config/index.json
```

Fill in all the relevant information. The template file contains a rough
documentation of the fields.

This service uses a redis instance to store its local block height and uses it
as a queue (rsmq). We use Docker Secrets to propagate the redis password.
Generate a secure password and store it in `config/redis_pass.txt`.

In `config/crontab`, define the frequency with which the service should scan
for new blocks.

## Installation

1. To build and run the container: `docker-compose up --build`

## Contribute and Test

```
$ git clone git@github.com:leapdao/challenge-services.git
$ cd challenge-services
$ npm i
$ npm run test
```

## License

MIT
