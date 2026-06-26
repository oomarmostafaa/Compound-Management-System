# Stage 1: Build the app
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY src/prisma ./src/prisma/

# Install all dependencies (production + development for Prisma Client generation)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

COPY . .

# Stage 2: Final image
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built prisma client and source code from builder
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/prisma.config.js ./

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
