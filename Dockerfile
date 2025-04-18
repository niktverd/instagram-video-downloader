FROM node:18-slim

# Install ffmpeg and other dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build

# Create directory for videos if it doesn't exist
RUN mkdir -p videos-working-directory

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["npm", "start"] 