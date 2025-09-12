# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy all source files
COPY . .

# Expose port (Railway injects PORT env, but this is for documentation)
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
