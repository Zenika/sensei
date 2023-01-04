FROM zenika/alpine-chrome:with-puppeteer

USER root

RUN git config --system --add safe.directory '*'

RUN apk add --no-cache ttf-liberation

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production --unsafe-perm \
    && chown -R 0:0 /app/node_modules

COPY ./ ./

VOLUME [ "/training-material" ]
ENV SENSEI_HOST=0.0.0.0
EXPOSE 8080

WORKDIR /training-material

USER chrome

ENTRYPOINT [ "node", "/app/src/cli/cli.js" ]
CMD ["serve"]
