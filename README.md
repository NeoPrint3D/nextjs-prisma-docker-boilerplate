# NextJS + Prisma + MySQL + Docker Compose Boilerplate

Description:

Welcome to the todo-mysql project! This project utilizes NextJS, MySQL 8, Prisma, and TailwindCSS to create a powerful and efficient task management application. With NextJS 14, expect fast and responsive web pages. MySQL 8 ensures secure and reliable data storage. Prisma simplifies database management and integrates seamlessly with MySQL. TailwindCSS allows easy customization of the application's appearance.

To get started, ensure you have Node.js and npm installed. Follow the development setup instructions below to install dependencies and start the development server. For a production environment, use Docker.

# Setup

Development Stack

- NextJS 14
- MySQL 8
- Prisma
- TailwindCSS

## Development

```bash

--- Start of Terminal 1 ---

npm install

--- End of Terminal 1 ---

--- Start of Terminal 2 ---

docker compose -f docker-compose.dev.yml up

--- End of Terminal 2 ---


--- Start of Terminal 1 ---

npm run db:setup # setups the database with prisma and mysql
npm run dev

--- End of Terminal 1 ---


```

## Production

```bash

docker compose up -d

```

# How to add more replicas

1. Copy This and paste it in docker-compose.yml and docker-compose.dev.yml

```yml
database_slave[SLAVE_NUMBER]:
  image: mysql:8.0.30
  container_name: "database_slave[SLAVE_NUMBER]"
  depends_on:
    database_master:
      condition: service_healthy
  ports:
    - 3308:3306
  volumes:
    - mysqldata_slave[SLAVE_NUMBER]:/var/lib/mysql
    - ./mysql/scripts/setup-slave.sh:/docker-entrypoint-initdb.d/setup-slave.sh
  env_file:
    - .env.database
  networks:
    - mynetwork
  command: >
    --server-id=[SLAVE_NUMBER + 1]
    --default-authentication-plugin=mysql_native_password
    --log_bin=mysql-bin
    --binlog_do_db=my_db
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    interval: 10s
    timeout: 5s
    retries: 5
```

2. Replace all [SLAVE_NUMBER] with the actual desired number
3. Make sure to add the corresponding volume and health check to the docker-compose.yml and docker-compose.dev.yml

```yml
volumes:
  mysqldata_master:
  mysqldata_slave1:
  [ADD HERE]

database_slave[SLAVE_NUMBER]:
    condition: service_healthy
```

5. Add the new replica urls to .env.prod and .env.local

# Security

THIS IS NOT PRODUCTION READY PLEASE USE THIS AS A TEMPLATE OR REFERENCE. I REPEAT DO NOT USE THIS IS PROD WITHOUT THE APPROPRIATE SECURITY MEASURES
