#!/bin/bash

# Exit on any error
set -e

# Get the directory containing this script
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose -f "docker-compose.yaml" --env-file .env.local down

# Start redis and localstack services
if ! docker-compose -f "docker-compose.yaml" --env-file .env.local up -d redis localstack; then
  echo "Failed to start docker services"
  exit 1
fi

# Wait for localstack to be ready
echo "Waiting for localstack to be ready..."
while ! curl -s "http://localhost:4566/_localstack/health" | grep -q "\"secretsmanager\": \"available\""; do
  if [ $? -ne 0 ]; then
    echo "Failed to check localstack health"
    exit 1
  fi
  sleep 2
done

echo "Localstack is ready"

# Run initialization scripts in sequence
for script in "${SCRIPT_DIR}"/[0-9][0-9]-*.sh; do
  if [ -f "$script" ]; then
    echo "Running $script..."
    if ! bash "$script"; then
      echo "Error running $script"
      exit 1
    fi
  fi
done

echo "Initialization complete"
