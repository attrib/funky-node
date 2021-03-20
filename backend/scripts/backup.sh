#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd $DIR/..

docker-compose stop
docker-compose run --rm -v $(realpath $DIR/../data/backups):/backups neo4j neo4j-admin dump --to=/backups/$(date +%F)-neo4j.dump --database=neo4j
docker-compose up -d