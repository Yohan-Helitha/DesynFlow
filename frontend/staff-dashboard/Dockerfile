
# Simple Dockerfile for Vite dev server (no Nginx)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev
COPY . .

# Expose Vite dev server port
EXPOSE 5173

CMD ["npm", "run", "dev"]
