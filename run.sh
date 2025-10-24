@echo off
cd backend
start cmd /k "uvicorn main:app --reload"
cd ..
cd frontend
start cmd /k "npm start"
