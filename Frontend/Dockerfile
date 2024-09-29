FROM node:20.17.0-slim

WORKDIR /app

COPY dist .

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-p", "3000"]

