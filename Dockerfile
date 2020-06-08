FROM node:12-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY ./ ./

VOLUME [ "/training-material" ]
EXPOSE 8080

ENTRYPOINT [ "npm",  "start", "--silent", "--" ]
CMD ["--host", "0.0.0.0", "--env.material=/training-material"]
