# Note Web

`Note Web` 是一个前后端分离的个人效率管理系统前端，项目目录名为 `note-font`，基于 `Vue 3 + Vite + Element Plus + Pinia + Axios` 开发，对接 `money-cloud` 的 `user` 和 `note` 微服务。

## 功能概览

- 用户注册、邮箱验证码、登录、退出
- 工作笔记管理：分类、标签、摘要、富文本编辑、分页查询、软删除、回收站
- Markdown 编辑器：左右分栏编辑+实时预览、代码高亮、快捷工具栏
- 笔记置顶与收藏：一键置顶/取消置顶、一键收藏/取消收藏、置顶排序优先
- 笔记模板系统：6 个系统预置模板（周报、会议纪要、日报、需求分析、Bug记录、读书笔记）+ 用户自定义模板，新建笔记时一键填充
- 全局搜索 Ctrl+K：搜索笔记、保险箱、待办，分类展示，键盘导航，直达目标
- 密码保险箱：分类、搜索、加密密码展示、网址跳转、密码生成器、访问二次验证
- 待办事项 TODO：新增、编辑、删除、状态切换、优先级、截止日期
- 待办看板视图：列表 ↔ 看板自由切换，三栏拖拽切换状态，列表视图支持状态下拉切换
- 待办搜索与筛选：按关键词、提醒状态（活跃/已过期）
- 待办提醒：支持提醒时间、提醒邮箱，到点由后端自动发送邮件
- 用户资料管理：获取当前用户信息、修改昵称、修改密码
- 工作台 Dashboard：ECharts 图表统计、活动趋势、模块分布、今日提醒、操作记录
- 操作活动日志：记录所有模块操作历史，支持按模块筛选
- 日历日程管理：月视图/周视图切换、事件创建编辑删除、全天事件、颜色标签、地点、点击日期快速创建
- 知识库 Wiki：多知识库空间管理、树形目录导航、无限层级子页面、页面内容编辑、自动保存
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
- ECharts + vue-echarts
- markdown-it
- highlight.js

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
│     ├─ trash         # 笔记回收站
│     ├─ activity      # 操作活动日志
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

- `user`：注册、登录、当前用户、用户资料、密码验证
- `note`：笔记、密码保险箱、待办事项、活动日志

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
