# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including Tailwind CSS
RUN npm install
RUN npm install -D tailwindcss postcss autoprefixer
RUN npx tailwindcss init -p

# Copy source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "start"]