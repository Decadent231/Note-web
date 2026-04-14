# 部署文档

## 1. 前端本地运行

进入项目目录：

```bash
cd note-font
```

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

## 2. 前端生产构建

```bash
npm run build
```

生成后的静态资源位于：

```text
note-font/dist
```

## 3. 前端服务器部署步骤

适合部署到 Nginx。

### 3.1 上传构建产物

将 `dist` 上传到服务器，比如：

```text
/usr/share/nginx/html/note-font
```

### 3.2 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name 101.201.235.13;

    location /note-app/ {
        alias /usr/share/nginx/html/note-font/;
        index index.html;
        try_files $uri $uri/ /note-app/index.html;
    }
}
```

如果你希望根路径直接访问，也可以将 `location /` 指向 `note-font/dist`。

### 3.3 重载 Nginx

```bash
nginx -t
systemctl reload nginx
```

## 4. 后端部署前提

本系统依赖以下后端服务正常运行：

- `gateway`：`8080`
- `user`：`8081`
- `note`：`8083`

推荐由 `gateway` 对外暴露，前端统一访问：

```text
http://101.201.235.13:8080
```

## 5. 服务器部署顺序

1. 部署并启动 `user` 服务
2. 部署并启动 `note` 服务
3. 启动 `gateway`
4. 部署前端静态资源到 Nginx

## 6. 数据库初始化

后端相关 SQL 位于：

```text
money-cloud/sql/user.sql
money-cloud/sql/note.sql
```

我已经同步执行过 `money_cloud_note` 的新结构迁移，当前包含：

- `note`
- `vault_item`
- `todo_item`

## 7. 当前已接入的服务器地址

- 网关：`http://101.201.235.13:8080`
- 数据库主机：`101.201.235.13`

## 8. 常见问题

### 8.1 登录接口 401

检查：

- `user` 服务是否启动
- JWT 是否过期
- 网关 `/user/**` 路由是否正确

### 8.2 笔记 / 保险箱 / 待办接口访问失败

检查：

- `note` 服务是否启动
- 网关 `/note/**` 路由是否正确
- 浏览器是否已携带 `Authorization: Bearer <token>`

### 8.3 刷新页面后登录状态丢失

当前前端已将 token 和用户信息保存到 `localStorage`，如果仍丢失，检查浏览器隐私模式或缓存策略。
