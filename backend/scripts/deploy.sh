#!/bin/bash
set -e

REGISTRIES_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "prod/registries" \
  --region $AWS_REGION \
  --query SecretString \
  --output text)
AWS_REGION=eu-north-1
BACKEND_REGISTRY=$(echo $REGISTRIES_JSON | jq -r '.BACKEND_REGISTRY')
IMAGE=$BACKEND_REGISTRY:latest

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --pasword-sdtin $BACKEND_REGISTRY
 docker pull $IMAGE
 if [$(docker ps -a -q -f name=backend-container) ]; then
 docker stop backend-container
 docker rm backend-container
 fi

 aws secretsmanager --get-secret-value --secret-id "prod/db-secrets" --region $AWS_REGION --query  SecretString  --output text | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env

 docker  run -d  -p 5000:5000 --name backend-container --env-file .env  --restart on-failure $IMAGE

 docker prune -f
