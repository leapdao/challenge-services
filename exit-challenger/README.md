## Exit-challenger

Exit-challenger is a tool written in Javascript that can earn ETH by participating in Plasma Leap Exit game.

## Configuration
To create a config, do the following:
```
$ cp config/default_template.json config/default.json
```
Fill in all the relevant information. The template file contains a rough documentation of the fields, but take a look at configuration requirements below.

### Configuration Requirements
1. Event-scanner config must have:
- "redis" field should be set and should be the same in exit-challenger config;
- "endpoint" field should be set and should be the same as "rootChainProvider" in exit-challenger config;
- "contracts" field should have two objects in array: operator contract and exitHandler contract;
2. Exit-challenger config must have:
- "leapChainProvider" field should be filled with full URL of the Plasma Leap Node
- "redis" field should be filled and should be the same as in event-scanner config;
- "rootChainProvider" field should be filled with full URL and should be the same as in event-scanner "endpoint"
- "exitHandlerAddress" field should be filled and should be the same as in exitHandler contract object in event-scanner
- "exitContractQueueName" and "operatorContractQueueName" should be filled and should be the same as queues names in related contracts objects in event-scanner
- "reportSlack" field every key should be filled with corresponding value, if there is no need to report on Slack leave all keys with values as empty strings (like in default_template.json)

Example how two configs can be looking for docker:
event-scanner/config/default.json
```json
{
  "endpoint": "https://rinkeby.infura.io/v3/${your-infura-key}",
  "redis": {
    "options": {
      "host": "redis",
      "port": 6379
    }
  },
  "contracts": [{
    "address": "0x26a937302cc6A0A7334B210de06136C8C61BA885",
    "ABI": [{"constant":false,"inputs":[{"name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newImplementation","type":"address"},{"name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"implementation","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"data","type":"bytes"}],"name":"applyProposal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_implementation","type":"address"},{"name":"_data","type":"bytes"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousAdmin","type":"address"},{"indexed":false,"name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"implementation","type":"address"}],"name":"Upgraded","type":"event"}],
    "queue": {
      "name": "0x26a937302cc6A0A7334B210de06136C8C61BA885_exitHandler"
    }
  },
  {
    "address": "0xb3356900d56F39c79Bfdc2b625d15B1b5b9262a9",
    "ABI": [{"constant":false,"inputs":[{"name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newImplementation","type":"address"},{"name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"implementation","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"data","type":"bytes"}],"name":"applyProposal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_implementation","type":"address"},{"name":"_data","type":"bytes"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousAdmin","type":"address"},{"indexed":false,"name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"implementation","type":"address"}],"name":"Upgraded","type":"event"}],
    "queue": {
      "name": "0xb3356900d56F39c79Bfdc2b625d15B1b5b9262a9_operator"
    }
  }]
}

```
exit-challenger/config/default.json
```json
{
  "redis" : {
    "host": "redis",
    "port": 6379
  },
  "exitContractQueueName": "0x26a937302cc6A0A7334B210de06136C8C61BA885_exitHandler",
  "operatorContractQueueName": "0xb3356900d56F39c79Bfdc2b625d15B1b5b9262a9_operator",
  "leapChainProvider": "https://testnet-node.leapdao.org",
  "rootChainProvider": "https://rinkeby.infura.io/v3/${your-infura-key}",
  "exitHandlerAddress": "0x26a937302cc6A0A7334B210de06136C8C61BA885",
  "reportSlack": {
    "slackAlertUrl": "",
    "slackChannel": "",
    "username": ""
  }
}
```

## Before run
1. Paste your encrypted private key in format "keystore v3 standard" (file name should be "keystore.json") inside "exit-challenger/src/tx-submitter/keystore/" folder or use "encryption.js" script in this folder to encrypt your private key with password - the file in format "keystore v3 standard" will be created automatically inside necessary directory.
Example how to use script:
```sh
cd challenge-services/exit-challenger/src/tx-submitter/keystore
PRIV_KEY=0x86bd05de62f4d29a96db6ed004de2ebd0e39940dc0f2f99fdfe38271b9152901 PASSWORD='my password' node encryption.js
```

2. Edit Dockerfile-process, line 'ENV PASSWORD=' should be filled with password that you've used when you encrypted your private key.

## Installation with Docker

After complete configuration part you are able to build and run your docker images and containers.

### Build and run container
To build and run:
```sh
docker-compose up --build
```
To start containers in the background add `-d` flag to the command above.

To exit process:
```sh
docker-compose down
```
To run again after exit:
```sh
docker-compose up
```

To manipulate redis database from redis-client (e.g., to reset to zero contracts heights):
```sh
docker exec -it redis redis-cli
```
To manipulate with node (e.g., to access queues):
```sh
sudo docker exec -it exit-challenger node
```
To access queues inside node:
```Node
const Bull = require('bull');
const invalidExitsQueue = new Bull('ie_queue', {redis: {host: 'redis', port: 6379}});
const maybeInvalidExitsQueue = new Bull('mi_queue', {redis: {host: 'redis', port: 6379}});
const challengeTxsQueue = new Bull('ct_queue', {redis: {host: 'redis', port: 6379}});
```

### Enjoy
Remember that your ethereum address should have some ETH to send transactions.

## Install and run exit-challenger locally without docker

- First step is to clone repository from github:

```sh
git clone git@github.com:leapdao/challenge-services.git
```
- Second step is to install and run [redis-server](https://redis.io/download).

- Third step is to set up configuration due to the configuration requirements above. Remember that you need to specify your local redis server host as `127.0.0.1` instead `redis` (e.i., in the example for docker). Remember about adding your encrypted ethereum private key (if you want to use encryption script, firstly install dependencies).

- Fourth step is to install dependencies in both subdirectories:

```sh
cd challenge-services/exit-challenger
npm install
cd challenge-services/event-scanner
npm install
```

- Fifth step is to run exit-challenger process:

Paste password that you've used to encrypt your ethereum private key instead 'my password'.
```sh
cd challenge-services/exit-challenger/src/tasks-queues
PASSWORD='my password' nohup node process.js > outfile &
```

- Sixth step is to run event-scanner and event-receiver:

Important to run script inside specific directory, like below.
```sh
cd challenge-services/exit-challenger/scripts
chmod +x runLocal.sh
nohup ./runLocal.sh > outfile &
```

That's it.
