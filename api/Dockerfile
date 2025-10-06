# Use the official Node.js image as the base image
FROM node:22-alpine

# Install required dependencies for Chromium
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  npm \
  udev \
  dumb-init

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including Prisma
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npx prisma generate

# Skip Puppeteer downloading Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port 9000
EXPOSE 9000

# Start the application
CMD ["npm", "run", "dev"]
