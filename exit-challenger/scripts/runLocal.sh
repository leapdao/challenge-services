#!/bin/bash
# Define paths
current_dir=$(pwd)
rem_path="/exit-challenger/scripts"
chall_serv_dir=${current_dir//$rem_path}
add_path="/event-scanner"
scan_dir=$chall_serv_dir$add_path
add_path="/exit-challenger"
exit_chall_dir=$chall_serv_dir$add_path


echo "Event-scanner-receiver is starting..."
export NODE_CONFIG_DIR=$scan_dir/config
export ALLOW_CONFIG_MUTATIONS=true
# correct time is only if blockchain has already > 40000 blocks
# if not change const span value inside js script
time=$(node $current_dir/blockAverageTime.js)
block_time=$(node $current_dir/getLatestBlockTime.js)
end_time=$(( $block_time + 520000 ))
echo "end time $end_time"
echo "Time is $time"
trap "exit" INT
while [ $time ]
do
  node $scan_dir/src/run.js
  node $exit_chall_dir/src/runEventReceiver.js
  sleep $time
  now=$(date +%s)
  echo "Now is $now"
  if [ $now -gt $end_time ]
  then
    time=$(node $current_dir/blockAverageTime.js)
    echo "New time is $time"
    block_time=$(node $current_dir/getLatestBlockTime.js)
    end_time=$(( $block_time + 520000 ))
    echo "New end time is $end_time"
  fi
done

#chmod +x ./run
#nohup ./run > outfile &
