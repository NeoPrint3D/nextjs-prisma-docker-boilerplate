docker run \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=password \
    -e MYSQL_DATABASE=prisma \
    -v db_data:/var/lib/mysql \
    mysql:8