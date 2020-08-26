FROM zenika/alpine-chrome:with-puppeteer

USER root

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY pdf.js .

VOLUME /app/pdf

USER chrome

ENTRYPOINT [ "npm", "run" ]
