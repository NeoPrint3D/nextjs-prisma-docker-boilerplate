#!/bin/bash
set -e

# Wait for MySQL to be ready
until mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" --silent; do
    echo "Waiting for MySQL to be ready..."
    sleep 2
done

# Wait for master to be ready
until mysql -h database_master -u mydb_slave_user -pmydb_slave_pwd -e "SELECT 1" &> /dev/null; do
    echo "Waiting for master to be ready..."
    sleep 2
done

# Get master status
MASTER_STATUS=$(mysql -h database_master -u mydb_slave_user -pmydb_slave_pwd -e "SHOW MASTER STATUS\G")
CURRENT_LOG=$(echo "$MASTER_STATUS" | grep File | awk '{print $2}')
CURRENT_POS=$(echo "$MASTER_STATUS" | grep Position | awk '{print $2}')

# Configure slave
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOSQL
CHANGE MASTER TO 
    MASTER_HOST='database_master',
    MASTER_USER='mydb_slave_user',
    MASTER_PASSWORD='mydb_slave_pwd',
    MASTER_LOG_FILE='$CURRENT_LOG',
    MASTER_LOG_POS=$CURRENT_POS;
START SLAVE;
SHOW SLAVE STATUS\G
EOSQL

echo "Slave setup completed"