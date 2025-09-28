FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && npm install --include=dev

# Install platform-specific rollup binary (if needed)
RUN npm install @rollup/rollup-linux-x64-gnu --save-dev || true

# Force rebuild native modules for correct platform
RUN npm rebuild

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "start"]