FROM zenika/alpine-chrome:with-puppeteer

USER root

RUN apk add --no-cache ttf-liberation

WORKDIR /app

COPY package.json package-lock.json ./
COPY src/pdf/package.json src/pdf/package-lock.json ./src/pdf/

RUN npm ci --production --unsafe-perm

COPY ./ ./

VOLUME [ "/training-material" ]
EXPOSE 8080

WORKDIR /training-material

USER chrome

ENTRYPOINT [ "/app/bin/sensei.js" ]
CMD ["serve"]
