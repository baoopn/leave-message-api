FROM node:22.3.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Bind to port 3000
EXPOSE 3000

# Command to run the app
CMD [ "node", "index.js" ]
