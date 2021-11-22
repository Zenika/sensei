FROM zenika/alpine-chrome:with-puppeteer

USER root

RUN apk add --no-cache ttf-liberation

# Force git to use HTTPS instead of SSH, which is simpler because there is no
# key setup. This is only useful if package.json has dependencies that are
# pulled using git.
RUN git config --global url."https://".insteadOf ssh://

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production --unsafe-perm

COPY ./ ./

VOLUME [ "/training-material" ]
ENV SENSEI_HOST=0.0.0.0
EXPOSE 8080

WORKDIR /training-material

USER chrome

ENTRYPOINT [ "/app/bin/sensei.js" ]
CMD ["serve"]
