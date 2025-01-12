# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy necessary files into the container
COPY docker dist/app
COPY server server
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Expose the port your server uses
EXPOSE 6200

# Define volumes for persistent storage
VOLUME ["/uploads", "/timelines"]

# Start the server
CMD ["bun", "run", "server/index.ts"]
