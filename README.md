# challenge-services

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

## Deploy to AWS ECS

1. Install ECS-CLI
1. Create a ECS cluster configuration locally: `ecs-cli configure --cluster challenge-services --default-launch-type FARGATE --region eu-central-1`
1. `ecs-cli up` creates a cluster. Note down the two created subnets and add them to `ecs-params.yml`
1. `ecs-cli compose --cluster default --file docker-compose.yml service up`

Helpful pages:

- https://medium.com/@peatiscoding/docker-compose-ecs-91b033c8fdb6
- https://www.bogotobogo.com/DevOps/Docker/Docker-ECS-CLI-Docker-Compose-Wordpress-Fargate-Type.php

## Contribute and Test

```
$ git clone git@github.com:leapdao/challenge-services.git
$ cd challenge-services
$ npm i
$ npm run test
```

## License

MIT
