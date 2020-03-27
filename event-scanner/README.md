# challenge-services

> A JavaScript tool to ensure validity of a LeapDAO plasma chain.

## Configuration

To create a config, do the following:

```
$ cp config/default_template.json config/default.json
```

Fill in all the relevant information. The template file contains a rough
documentation of the fields.

This service uses a redis instance to store its local block height and uses it
as a queue (rsmq).

In `config/crontab`, define the frequency with which the service should scan
for new blocks.

## Installation

1. To build and run the container: `docker-compose up --build`

## Running the service in the cloud

For internal purposes, this repository includes a file called
`docker-compose-aws.yml`.  This can be used to run the service on an AWS EC2
instance. A `containrrr/watchtower` services was added to continously update
the challenge-services instance in case a new version is a available in the
container repository. To run this file, do

```
$ docker-compose --file docker-compose-aws.yml up -d
```

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
