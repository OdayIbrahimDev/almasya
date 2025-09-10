#!/bin/bash

# Start Backend
echo "Starting Backend Server..."
cd backend
npm install
pm2 start ecosystem.config.js
cd ..

# Start Frontend
echo "Starting Frontend Server..."
cd frontend
npm install
npm run build
pm2 start ecosystem.config.js
cd ..

# Start Nginx
echo "Starting Nginx..."
sudo nginx -t
sudo systemctl restart nginx

echo "All services started successfully!"
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:3001"
echo "Production: https://almasya.com"
