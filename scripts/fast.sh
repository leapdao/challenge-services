#!/bin/bash

while true; do
  node /usr/src/event-scanner/src/event-scanner/run.js
  node /usr/src/event-scanner/src/challenger/run.js
  sleep 5;
done
