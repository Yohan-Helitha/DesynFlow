# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Configure npm for robust installs
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 10 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm cache clean --force

# Install all dependencies from package.json (this includes our new React 19 compatible deps)
RUN npm install --include=dev --unsafe-perm

# Initialize Tailwind CSS (only if config doesn't exist)
RUN npx tailwindcss init -p || true

# Copy source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "start"]