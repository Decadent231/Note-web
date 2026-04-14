# Note Web

`Note Web` 是一个前后端分离的个人效率管理系统前端，项目目录名为 `note-font`，基于 `Vue 3 + Vite + Element Plus + Pinia + Axios` 开发，对接 `money-cloud` 的 `user` 和 `note` 微服务。

## 功能概览

- 用户注册、邮箱验证码、登录、退出
- 工作笔记管理：分类、标签、摘要、富文本编辑、分页查询
- 密码保险箱：分类、搜索、加密密码展示、网址跳转
- 待办事项 TODO：新增、编辑、删除、状态切换、优先级、截止日期
- 待办提醒：支持提醒时间、提醒邮箱，到点由后端自动发送邮件
- 用户资料管理：获取当前用户信息、修改昵称、修改密码
- 深浅主题切换与响应式布局

## 技术栈

- Vue 3
- Vite
- Element Plus
- Pinia
- Vue Router
- Axios
- Vue Quill
- Day.js

## 项目结构

```text
note-font
├─ public
├─ src
│  ├─ api            # 接口封装
│  ├─ layout         # 系统主布局
│  ├─ router         # 路由与守卫
│  ├─ stores         # Pinia 状态管理
│  ├─ styles         # 全局样式
│  ├─ utils          # 本地存储等工具
│  └─ views
│     ├─ auth
│     ├─ dashboard
│     ├─ notes
│     ├─ vault
│     ├─ todo
│     └─ profile
├─ API_INTERFACE.md
├─ DATABASE_SCHEMA.md
├─ DEPLOY_GUIDE.md
├─ package.json
├─ vite.config.js
└─ README.md
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认开发地址：

```text
http://localhost:5174
```

## 生产构建

```bash
npm run build
```

构建产物位于：

```text
dist/
```

## API 配置

当前请求入口在 [src/api/http.js](./src/api/http.js)：

- 默认 `baseURL` 读取 `VITE_API_BASE`
- 如果未设置，则走当前域名同源路径

Vite 基础路径配置在 [vite.config.js](./vite.config.js)：

```text
/note-font/
```

这意味着生产环境通常通过以下地址访问：

```text
http://your-host/note-font/
```

## 后端对接

当前前端主要对接两个后端模块：

- `user`：注册、登录、当前用户、用户资料
- `note`：笔记、密码保险箱、待办事项

网关建议入口：

```text
http://101.201.235.13:8080
```

如果使用 Nginx 反向代理并让前端与网关同域部署，可以直接保持 `VITE_API_BASE` 为空。

如果需要显式指定后端地址，可在启动前设置：

```bash
set VITE_API_BASE=http://101.201.235.13:8080
```

Linux:

```bash
export VITE_API_BASE=http://101.201.235.13:8080
```

## 登录态说明

- 登录成功后，后端返回 JWT Token
- 前端会将 Token 保存在本地存储
- Axios 请求拦截器会自动追加：

```text
Authorization: Bearer <token>
```

后端据此识别当前请求属于哪个用户

## 待办提醒说明

- 创建或编辑待办时可以开启提醒
- 开启后可设置提醒时间和接收邮箱
- 如果提醒邮箱留空，后端默认使用当前账号邮箱
- 到达提醒时间后，由 `note` 服务定时任务自动发送邮件

## 部署文档

- 部署说明：[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
- 接口文档：[API_INTERFACE.md](./API_INTERFACE.md)
- 数据库说明：[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## 关联仓库

- 后端：`Monee-dev`
- Android 客户端：`Monee-app`
