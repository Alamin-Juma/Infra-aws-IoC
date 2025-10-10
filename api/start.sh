#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database with initial data..."
npx prisma db seed

echo "Starting the application..."
exec node index.js