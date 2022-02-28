FROM alpine
RUN apk add git \
    && apk add yarn \
    && git clone https://github.com/Vlad92msk/portfolio_client.git \
    && cd ./portfolio_client \
    && yarn install --production \
    && yarn next:build

WORKDIR ./portfolio_client
CMD yarn next:start:prod

EXPOSE ${CLIENT_PORT}
