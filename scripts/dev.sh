#!/bin/bash

# Exit immediately if any command fails
set -e

# Fetch env variables and create the .env file
cat <<EOL > .env

PORT=8000
MONGO_PASS = "S3PCJdBHb20EE8YK"
MONGO_URI = "mongodb+srv://shashi:S3PCJdBHb20EE8YK@dowcluster.x1jc6.mongodb.net/"
JWT_SECRET = "this_is_my_jwt_password" 
AWS_BUCKET_NAME = "summer2025bucket"
AWS_BUCKET_REGION = "ap-south-1"
AWS_ACCESS_KEY = 'AKIAX3DNHNDB46VNI676'
AWS_SECRET_ACCESS_KEY = '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'

EOL
# Ensure SSH key scanning and connection
ssh-keyscan -H $SERVER_IP >> ~/.ssh/known_hosts
# SSH into the remote server and clean the target directory
ssh $USER@$SERVER_IP 'cd /var/www/html/dow/dev/dow_node && rm -rf *'
# Copy code and .env file to the remote server
scp -r * $USER@$SERVER_IP:/var/www/html/dow/dev/dow_node
scp -r .env $USER@$SERVER_IP:/var/www/html/dow/dev/dow_node
# SSH into the remote server and run Docker commands
ssh -o StrictHostKeyChecking=no $USER@$SERVER_IP << EOF
  set -e  # Exit immediately if any command fails
  cd /var/www/html/dow/dev/dow_node || exit 1
  docker build -t dow-dev .
  # Stop and remove any existing container
  docker stop dow-dev || true
  docker rm dow-dev || true
  # Run the new container
  docker run -d -p 3008:8000 --name dow-dev dow-dev
  # Check if the container is running and healthy
  sleep 10  # Wait for a few seconds to let the container start
  if [ \$(docker inspect -f '{{.State.Running}}' dow-dev) != "true" ]; then
    echo "Container failed to start."
    exit 1
  else
    echo "Container started successfully and is running."
  fi
  docker image prune -f
EOF
