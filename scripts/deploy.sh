# Build new image and deploy it to registry
# Ask for region and cluster name
ecs-cli configure --cluster challenge-services --default-launch-type FARGATE --region eu-central-1
# Get subnets from command
ecs-cli up --cluster challenge-services
ecs-cli compose --cluster challenge-services --file docker-compose.yml service up
