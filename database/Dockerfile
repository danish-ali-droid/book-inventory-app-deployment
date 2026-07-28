FROM postgres:16-alpine
WORKDIR /app
COPY ./schema.sql /docker-entrypoint-initdb.d
COPY ./init.sql /docker-entrypoint-initdb.d
ENV POSTGRES_USER=${DB_USER} \
      POSTGRES_PASSWORD=${DB_PASSWORD} \
      POSTGRES_DB=${DB_NAME}
EXPOSE 5432



