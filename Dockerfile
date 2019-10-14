FROM node:12

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY ./ ./

VOLUME [ "/app/training-material" ]
EXPOSE 8080

CMD ["npx", "webpack-dev-server", "--host", "0.0.0.0"]
