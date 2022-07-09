#! /bin/bash

read -p "environment: " DOCK

# p = production, d= development, s = shut down, b = build

if [ "${DOCK}" == 'p' ]
then
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
fi

if [ "${DOCK}" == 'd' ]
then
  docker-compose up -d
fi

if [ "${DOCK}" == 's' ]
then
  docker-compose down
fi

if [ "${DOCK}" == 'b' ]
then
  docker-compose build --no-cache
fi