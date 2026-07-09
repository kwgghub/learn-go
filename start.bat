@echo off
echo 正在启动 Go 后端服务...
cd backend
start cmd /k "go run main.go"

echo 正在启动前端开发服务器...
cd ../frontend
start cmd /k "npm run dev"

echo 服务启动完成！
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:8080
pause