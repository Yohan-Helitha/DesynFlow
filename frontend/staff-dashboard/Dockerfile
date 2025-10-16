FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Configure npm for robust installs and clear cache
RUN npm config set registry https://registry.npmjs.org/ \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 10 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm cache clean --force

# Install dependencies (fix for alpine rollup issue)
RUN if [ -f package-lock.json ]; then npm ci --include=dev --unsafe-perm; else npm install --include=dev --unsafe-perm; fi

# Install platform-specific rollup binary
RUN npm install @rollup/rollup-linux-x64-gnu --save-dev

# Force rebuild native modules for correct platform
RUN npm rebuild

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "start"]
