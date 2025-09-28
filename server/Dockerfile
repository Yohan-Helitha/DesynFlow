# Use official Node.js image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install system libraries required for puppeteer/Chromium
RUN apt-get update && apt-get install -y \
	wget \
	ca-certificates \
	fonts-liberation \
	libappindicator3-1 \
	libasound2 \
	libatk-bridge2.0-0 \
	libatk1.0-0 \
	libcups2 \
	libdbus-1-3 \
	libgdk-pixbuf2.0-0 \
	libnspr4 \
	libnss3 \
	libx11-xcb1 \
	libxcomposite1 \
	libxdamage1 \
	libxrandr2 \
	xdg-utils \
	--no-install-recommends

# Install dependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# Command to run the app
CMD ["node", "server.js"]

