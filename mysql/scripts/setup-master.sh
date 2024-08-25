#!/bin/bash
set -e

# Wait for MySQL to be ready
until mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" --silent; do
    echo "Waiting for MySQL to be ready..."
    sleep 2
done

# Create replication user with necessary privileges
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
    CREATE USER IF NOT EXISTS '$MASTER_USER'@'%' IDENTIFIED BY '$MASTER_PASSWORD';
    GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO '$MASTER_USER'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "Master setup completed"