FROM postgres:16-alpine
WORKDIR /app
COPY ./schema.sql /docker-entrypoint-initdb.d
COPY ./init.sql /docker-entrypoint-initdb.d
EXPOSE 5432



