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

sh db.sh

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

# Security

THIS IS NOT PRODUCTION READY PLEASE USE THIS AS A TEMPLATE OR REFERENCE. I REPEAT DO NOT USE THIS IS PROD WITHOUT THE APPROPRIATE SECURITY MEASURES
