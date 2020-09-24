FROM node:12-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY ./ ./

VOLUME [ "/training-material" ]
EXPOSE 8080

WORKDIR /training-material

ENTRYPOINT [ "/app/bin/sensei.js" ]
CMD ["serve"]
