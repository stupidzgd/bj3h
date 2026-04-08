# 项目部署操作步骤

## 项目信息
- 服务器: 154.8.152.125
- 前端: React + Antd (路径: /var/www/bj3h)
- 后端: Node.js Express (端口: 3001)
- Web服务器: Nginx (端口: 80)
- 数据库: MySQL (154.8.152.125:3306)

---

## 部署更新步骤

### 前端更新 (步骤1-3)

**步骤1: 构建前端**
```bash
# 本地项目目录执行
npm run build
```

**步骤2: 上传构建文件**
```bash
scp -r ./build/* root@154.8.152.125:/var/www/bj3h/build/
```

**步骤3: 重启 Nginx**
```bash
ssh root@154.8.152.125 "nginx -s reload"
```

---

### 后端更新 (步骤4-7)

**步骤4: 停止后端服务**
```bash
ssh root@154.8.152.125 "pkill -f 'node index.js'"
```

**步骤5: 更新后端代码**
```bash
# 方式A: Git pull
ssh root@154.8.152.125 "cd /var/www/bj3h && git pull"

# 方式B: 手动上传 server 目录
scp -r ./server/* root@154.8.152.125:/var/www/bj3h/server/
```

**步骤6: 安装依赖 (如有更新)**
```bash
ssh root@154.8.152.125 "cd /var/www/bj3h/server && npm install"
```

**步骤7: 启动后端服务**
```bash
ssh root@154.8.152.125 "cd /var/www/bj3h/server && nohup npm start > /tmp/server.log 2>&1 &"
```

---

## 验证步骤

**步骤8: 检查服务状态**
```bash
ssh root@154.8.152.125 "ps aux | grep -E 'node|nginx' | grep -v grep"
ssh root@154.8.152.125 "netstat -tlnp | grep -E '80|3001'"
```

**步骤9: 检查日志**
```bash
ssh root@154.8.152.125 "tail -30 /tmp/server.log"
```

---

## 常用操作汇总

| 操作 | 命令 |
|------|------|
| 停止后端 | `ssh root@154.8.152.125 "pkill -f 'node index.js'"` |
| 启动后端 | `ssh root@154.8.152.125 "cd /var/www/bj3h/server && nohup npm start > /tmp/server.log 2>&1 &"` |
| 重启后端 | `ssh root@154.8.152.125 "pkill -f 'node index.js'; sleep 2; cd /var/www/bj3h/server && nohup npm start > /tmp/server.log 2>&1 &"` |
| 重启Nginx | `ssh root@154.8.152.125 "nginx -s reload"` |
| 查看后端日志 | `ssh root@154.8.152.125 "tail -50 /tmp/server.log"` |
| 查看Nginx日志 | `ssh root@154.8.152.125 "tail -50 /var/log/nginx/error.log"` |

### 2. 更新代码
```bash
# 方式一: Git pull (如果代码已 push 到仓库)
ssh root@154.8.152.125 "cd /var/www/bj3h && git pull"

# 方式二: 本地打包后上传 (如果需要重新构建前端)
# 本地执行: npm run build
# 然后: scp -r ./build/* root@154.8.152.125:/var/www/bj3h/build/
```

### 3. 安装依赖 (如有更新)
```bash
ssh root@154.8.152.125 "cd /var/www/bj3h && npm install"
ssh root@154.8.152.125 "cd /var/www/bj3h/server && npm install"
```

### 4. 重新构建前端 (如有代码改动)
```bash
ssh root@154.154.8.152.125 "cd /var/www/bj3h && npm run build"
```

### 5. 启动服务
```bash
# 启动后端 (后台运行)
ssh root@154.8.152.125 "cd /var/www/bj3h/server && nohup npm start > /tmp/server.log 2>&1 &"

# 检查启动状态
ssh root@154.8.152.125 "ps aux | grep 'node index.js'"
```

---

## 二、常用操作命令

### 查看服务状态
```bash
ssh root@154.8.152.125 "ps aux | grep -E 'node|nginx'"
ssh root@154.8.152.125 "netstat -tlnp | grep -E '80|3001'"
```

### 查看日志
```bash
# 后端日志
ssh root@154.8.152.125 "tail -50 /tmp/server.log"

# Nginx 日志
ssh root@154.8.152.125 "tail -50 /var/log/nginx/error.log"
```

### 重启服务
```bash
# 重启后端
ssh root@154.8.152.125 "pkill -f 'node index.js'; cd /var/www/bj3h/server && nohup npm start > /tmp/server.log 2>&1 &"

# 重启 Nginx
ssh root@154.8.152.125 "nginx -s reload"
```

### 一键重启 (推荐)
```bash
ssh root@154.8.152.125 "pkill -f 'node index.js'; sleep 2; cd /var/www/bj3h/server && nohup npm start > /tmp/server.log 2>&1 &"
```

---

## 三、MySQL 远程连接

已经为 zgd 用户开启远程访问，可用 MySQL Workbench 连接：
- Host: 154.8.152.125
- Port: 3306
- Username: zgd
- Password: Zgd_1219frog

---

## 四、完整部署流程示例

```bash
# 1. 停止服务
ssh root@154.8.152.125 "pkill -f 'node index.js'"

# 2. 更新代码 (Git pull)
ssh root@154.8.152.125 "cd /var/www/bj3h && git pull"

# 3. 重新安装依赖 (如有变更)
ssh root@154.8.152.125 "cd /var/www/bj3h/server && npm install"

# 4. 构建前端
ssh root@154.8.152.125 "cd /var/www/bj3h && npm run build"

# 5. 启动后端
ssh root@154.8.152.125 "cd /var/www/bj3h/server && nohup npm start > /tmp/server.log 2>&1 &"

# 6. 验证
ssh root@154.8.152.125 "ps aux | grep 'node index.js'"
```