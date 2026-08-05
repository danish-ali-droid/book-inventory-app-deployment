#!/bin/bash
set -e
AWS_REGION=${{secrets.AWS_REGION}}
BACKEND_REGISTORY=${{secrets.BACKEND_ECR_REGISTORY}}
IMAGE=${{FRONTEND_ECR_REGISTORY}}:latest

aws ecr login --region $AWS_REGION | docker login --username AWS --pasword-sdtin $BACKEND_REGISTORY
aws ecr login --region $AWS_REGION | docker login --username AWS --pasword-stdin $FRONTEND_REGISTORY
 docker pull $IMAGE
 if [$(docker ps -a -q -f name=frontend-container) ]; then
 docker stop frontend-container
 docker rm frontend-container
 fi

 aws secretsmanager --get-secret-value --secret-id "prod/db-secrets" --region $AWS_REGION --query  SecretString  --output text | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > .env

 docker  run -d  -p 5000:5000 --name frontend-container --env-file .env  --restart on-failure $IMAGE

 docker prune -f
