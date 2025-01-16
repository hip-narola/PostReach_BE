# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Expose port from .env
EXPOSE ${PORT}

# Start the app
CMD ["npm", "run", "start:prod"]
