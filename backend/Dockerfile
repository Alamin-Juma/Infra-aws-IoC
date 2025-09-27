# Node.js API Server
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose the port the app will run on
EXPOSE 8080

# Command to run the application
CMD ["node", "app.js"]