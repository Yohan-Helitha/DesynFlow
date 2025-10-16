# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Configure npm for robust installs
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 10 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm cache clean --force

# Install dependencies including Tailwind CSS
RUN if [ -f package-lock.json ]; then npm ci --unsafe-perm; else npm install --unsafe-perm; fi
RUN npm install -D tailwindcss postcss autoprefixer --unsafe-perm
RUN npx tailwindcss init -p

# Copy source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "start"]