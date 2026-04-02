FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy all project files
COPY . .

# Expose port (Render will override if needed)
EXPOSE 5000

# Start your server
CMD ["node", "src/server.js"]