#!/bin/bash

# Fetch remote secrets
echo "Fetching remote secrets..."
REMOTE_SECRETS=$(aws secretsmanager get-secret-value --secret-id postreach-secrets --query SecretString --region us-east-1 --output text || echo "{}")

if [ -z "$REMOTE_SECRETS" ] || [ "$REMOTE_SECRETS" = "{}" ]; then
  echo "Failed to fetch remote secrets or secrets are empty"
  exit 1
fi

# Override specific values for local development
LOCAL_OVERRIDES='{
  "REGION": "us-east-1",
  "REDIS_HOST": "localhost",
  "REDIS_PORT": 6379,
  "REDIS_PASSWORD": "redis",
  "AWS_ENDPOINT": "http://localhost:4566",
  "GOOGLE_STRATEGY": "http://localhost:3000/auth/google/callback",
  "FACEBOOK_STRATEGY_CALLBACK": "http://localhost:3000/auth/facebook/callback",
  "FACEBOOK_GROUP_STRATEGY_CALLBACK": "http://localhost:3000/link-page/facebook-group-link/callback", 
  "FACEBOOK_PAGE_STRATEGY_CALLBACK": "http://localhost:3000/link-page/facebook-page/callback",
  "INSTAGRAM_BUSINESS_STRATEGY_CALLBACK": "http://localhost:3000/link-page/instagram-link/callback",
  "LINKEDIN_CALLBACK_URL": "http://localhost:3000/link-page/linkedin-callback",
  "INSTAGRAM_CALLBACK": "http://localhost:3000/link-page/instagram-callback",
  "TWITTER_CALLBACK_URL": "http://localhost:3000/link-page/twitter-callback"
}'

# Merge remote secrets with local overrides
MERGED_SECRETS=$(echo "$REMOTE_SECRETS" | jq -s ".[0] * $LOCAL_OVERRIDES")

echo "Creating AWS Secrets Manager secret..."
if awslocal secretsmanager create-secret \
  --name postreach-secrets \
  --secret-string "$MERGED_SECRETS"; then
  echo "Secret created successfully!"
else
  echo "Failed to create secret"
  exit 1
fi