# Setup database
FROM ubuntu as db-setup
ADD . /app/backend
WORKDIR /app/backend
RUN apt update && apt install -y mysql-client

ARG DATABASE_USERNAME=waitlist
ARG DATABASE_PASSWORD
ARG DATABASE_HOST=localhost
ARG DATABASE_NAME=waitlist

RUN mysql --protocol=tcp -h"${DATABASE_HOST}" -u"${DATABASE_USERNAME}" -p"${DATABASE_PASSWORD}" "${DATABASE_NAME}" < sql/mysql.sql
RUN mysql --protocol=tcp -h"${DATABASE_HOST}" -u"${DATABASE_USERNAME}" -p"${DATABASE_PASSWORD}" "${DATABASE_NAME}" -e 'SHOW TABLES;'


# Static data
FROM alpine AS sde-export
RUN apk add sqlite wget bzip2
RUN mkdir /data
WORKDIR /data
ADD shrink-sde.sh /data/
RUN sh shrink-sde.sh


# Base image: have some deps etc
FROM rust:1.66-alpine AS base
WORKDIR /app/backend
RUN apk add --no-cache musl-dev sqlite
RUN cargo install cargo-chef


# Plan the build: create a list of dependencies
FROM base AS planner
ADD . /app/backend
RUN cargo chef prepare --recipe-path /recipe.json


# Cache dependencies
FROM base AS cacher
ARG PROFILE=release
COPY --from=planner /recipe.json /recipe.json
RUN cargo chef cook --profile ${PROFILE} --no-default-features --features=mysql --recipe-path /recipe.json


# Build the image
FROM base AS builder
COPY --from=cacher /app/backend/target target
COPY --from=cacher $CARGO_HOME $CARGO_HOME
COPY --from=sde-export /data/sqlite-shrunk.sqlite sqlite-shrunk.sqlite
ADD . /app/backend

RUN apk add --no-cache mariadb-client

ARG DATABASE_USERNAME=waitlist
ARG DATABASE_PASSWORD
ARG DATABASE_HOST=localhost
ARG DATABASE_NAME=waitlist

ARG DATABASE_URL=mysql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}?ssl-mode=disabled
ARG PROFILE=release

RUN cargo build --profile ${PROFILE} --no-default-features --features=mysql
RUN cp target/*/tdf_wl /backend


# Final image
FROM alpine
COPY --from=sde-export /data/sqlite-shrunk.sqlite /app/sqlite-shrunk.sqlite
COPY --from=builder /backend /app/backend

WORKDIR /app
COPY data data
ADD Rocket.toml .

ENTRYPOINT /app/backend
EXPOSE 5000
