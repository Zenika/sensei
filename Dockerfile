FROM zenika/alpine-chrome:with-puppeteer

USER root

RUN apk add --no-cache ttf-liberation

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production --unsafe-perm

COPY ./ ./

VOLUME [ "/training-material" ]
ENV SENSEI_HOST=0.0.0.0
EXPOSE 8080

WORKDIR /training-material

USER chrome

ENTRYPOINT [ "node", "/app/src/cli/cli.js" ]
CMD ["serve"]
