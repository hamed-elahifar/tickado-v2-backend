FROM oven/bun:1-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application in production
CMD ["bun", "run", "dist/main.js"] 