FROM zenika/alpine-chrome:with-puppeteer

USER root

RUN git config --system --add safe.directory '*'

RUN apk add --no-cache ttf-liberation

USER chrome

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY ./ ./

VOLUME [ "/training-material" ]
WORKDIR /training-material

EXPOSE 8080

ENV SENSEI_HOST=0.0.0.0
ENTRYPOINT [ "node", "/app/src/cli/cli.js" ]
CMD ["serve"]
