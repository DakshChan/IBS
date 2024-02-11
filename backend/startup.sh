#!/bin/bash

# Undo all migrations
echo "Undoing all migrations..."
npx sequelize-cli db:migrate:undo:all

# Apply migrations
echo "Applying migrations..."
npx sequelize-cli db:migrate

# Run development server
echo "Starting development server..."
npm run dev
