# Use official Node.js image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# Command to run the app
CMD ["node", "server.js"]
