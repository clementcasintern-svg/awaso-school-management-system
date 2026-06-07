FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Use a lightweight web server (serve)
RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
