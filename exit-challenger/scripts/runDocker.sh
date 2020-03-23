#!/bin/bash
current_dir=$(pwd)
echo "$current_dir"
echo "Event-scanner-receiver is starting..."
export NODE_CONFIG_DIR=/home/usr/event-scanner-receiver/scanner/config
export ALLOW_CONFIG_MUTATIONS=true
# correct time is only if blockchain has already > 40000 blocks
# if not change const span value inside js script
time=$(node $current_dir/receiver/scripts/blockAverageTime.js)
block_time=$(node $current_dir/receiver/scripts/getLatestBlockTime.js)
end_time=$(( $block_time + 520000 ))
echo "Endtime $end_time"
echo "Time is $time"
trap "exit" INT
while [ $time ]
do
  node /home/usr/event-scanner-receiver/scanner/src/run.js
  node /home/usr/event-scanner-receiver/receiver/src/runEventReceiver.js
  sleep $time
  now=$(date +%s)
  echo "Now is $now"
  if [ $now -gt $end_time ]
  then
    time=$(node $current_dir/receiver/scripts/blockAverageTime.js)
    echo "New time is $time"
    block_time=$(node $current_dir/receiver/scripts/getLatestBlockTime.js)
    end_time=$(( $block_time + 520000 ))
    echo "New end time is $end_time"
  fi

done

#chmod +x ./run
#nohup ./run > outfile &
