# event-scanner

> A JavaScript tool to scan smart contract events on Ethereum

## Installation and Configuration

1. In `config/crontab` define the frequency the service should scan
for new blocks.
1. Build the container using: `sudo docker build --rm -t event-scanner .`
1. And to run it in the foreground: `sudo docker run -t -i event-scanner`

## License

MIT
