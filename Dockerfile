FROM node:20-alpine

WORKDIR /app

# Copy package.json và tsconfig để cài trước dependencies
COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install --force

# Copy toàn bộ source code
COPY . .

# Build TypeScript
RUN npm run build

# Chạy app
CMD ["node", "dist/src/main.js"]
