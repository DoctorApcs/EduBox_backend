# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (usually 3000 for Next.js)
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]