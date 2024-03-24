FROM node:20
WORKDIR /trello-clone
COPY package*.json .
COPY prisma ./prisma/
RUN npm install
CMD ["npm", "run", "dev"]
