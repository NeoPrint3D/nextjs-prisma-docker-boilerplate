#!/bin/bash

# Variables
sql_slave_user="CREATE USER 'mydb_slave_user'@'%' IDENTIFIED BY 'mydb_slave_pwd'; GRANT REPLICATION SLAVE ON *.* TO 'mydb_slave_user'@'%'; FLUSH PRIVILEGES;"
MASTER_IP="database_master"
MASTER_PASS="S3cret"
SLAVE_PASS="S3cret"

# Create replication user on master
docker exec $MASTER_IP sh -c "mysql -u root -p$MASTER_PASS -e \"$sql_slave_user\""

# Get master status
MS_STATUS=$(docker exec $MASTER_IP sh -c "mysql -u root -p$MASTER_PASS -e 'SHOW MASTER STATUS\G'")
CURRENT_LOG=$(echo "$MS_STATUS" | grep 'File:' | awk '{print $2}')
CURRENT_POS=$(echo "$MS_STATUS" | grep 'Position:' | awk '{print $2}')

# Set up replication on the slave
sql_set_master="CHANGE MASTER TO MASTER_HOST='database_master', MASTER_USER='mydb_slave_user', MASTER_PASSWORD='mydb_slave_pwd', MASTER_LOG_FILE='$CURRENT_LOG', MASTER_LOG_POS=$CURRENT_POS; START SLAVE;"
docker exec database_slave1 sh -c "mysql -u root -p$SLAVE_PASS -e \"$sql_set_master\""

# Check slave status
docker exec database_slave sh -c "mysql -u root -p$SLAVE_PASS -e 'SHOW SLAVE STATUS\G'"
