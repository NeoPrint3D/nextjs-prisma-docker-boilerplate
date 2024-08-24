#!/bin/bash
set -e

# Wait for MySQL to be ready
until mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" --silent; do
    echo "Waiting for MySQL to be ready..."
    sleep 2
done

# Create replication user with necessary privileges
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
    CREATE USER IF NOT EXISTS 'mydb_slave_user'@'%' IDENTIFIED BY 'mydb_slave_pwd';
    GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'mydb_slave_user'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "Master setup completed"