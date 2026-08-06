#!/bin/bash
set -e
AWS_REGION=eu-north-1


REGISTRIES_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "prod/registries" \
  --region $AWS_REGION \
  --query SecretString \
  --output text)
FRONTEND_REGISTRY=$(echo $REGISTRIES_JSON | jq -r '.FRONTEND_REGISTRY')
IMAGE=$FRONTEND_REGISTRY:latest

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $FRONTEND_REGISTRY
 docker pull $IMAGE
 if [ $(docker ps -a -q -f name=frontend-container) ]; then 
 docker stop frontend-container
 docker rm frontend-container 
 fi

 aws secretsmanager get-secret-value --secret-id "prod/db-secrets" --region $AWS_REGION --query  SecretString  --output text | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env
 
 docker  run -d  -p 80:80 --name frontend-container --env-file .env  --restart on-failure $IMAGE

 docker image  prune -f 
  
