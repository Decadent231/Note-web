# 接口说明文档

统一网关地址：

```text
http://101.201.235.13:8080
```

统一返回结构：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

除登录、注册、发送验证码接口外，其余接口都需要在请求头中携带：

```text
Authorization: Bearer <token>
```

## 一、用户模块 `user`

### 1. 发送注册验证码

- 方法：`POST`
- 地址：`/user/auth/send-code`

请求参数：

```json
{
  "email": "test@example.com"
}
```

### 2. 用户注册

- 方法：`POST`
- 地址：`/user/auth/register`

请求参数：

```json
{
  "email": "test@example.com",
  "password": "123456",
  "code": "123456",
  "nickname": "Yee"
}
```

### 3. 用户登录

- 方法：`POST`
- 地址：`/user/auth/login`

请求参数：

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

返回示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "jwt-token",
    "userInfo": {
      "id": 1,
      "email": "test@example.com",
      "nickname": "Yee"
    }
  }
}
```

### 4. 获取当前用户信息

- 方法：`GET`
- 地址：`/user/users/me`

### 5. 修改用户资料

- 方法：`PUT`
- 地址：`/user/users/profile`

请求参数：

```json
{
  "nickname": "新的昵称"
}
```

### 6. 修改密码

- 方法：`PUT`
- 地址：`/user/users/password`

请求参数：

```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

### 7. 验证密码

- 方法：`POST`
- 地址：`/user/users/verify-password`

请求参数：

```json
{
  "password": "123456"
}
```

返回说明：返回 `true` 或 `false`，用于保险箱二次验证等场景

## 二、笔记模块 `note`

### 1. 分页查询笔记

- 方法：`GET`
- 地址：`/note/notes`

查询参数：

- `current`：页码
- `size`：每页条数
- `keyword`：关键词
- `category`：分类
- `tag`：标签

### 2. 查询单条笔记

- 方法：`GET`
- 地址：`/note/notes/{id}`

### 3. 新增笔记

- 方法：`POST`
- 地址：`/note/notes`

请求参数：

```json
{
  "title": "周报总结",
  "category": "项目管理",
  "tags": "周报,复盘",
  "summary": "本周迭代总结",
  "content": "<p>富文本内容</p>",
  "contentType": "html",
  "templateId": null
}
```

字段说明：

- `contentType`：内容类型，`html`（富文本，默认）/ `markdown`
- `templateId`：可选，选择模板时传入，新建笔记将自动填充模板内容

### 4. 修改笔记

- 方法：`PUT`
- 地址：`/note/notes/{id}`

### 5. 删除笔记（软删除，移入回收站）

- 方法：`DELETE`
- 地址：`/note/notes/{id}`

### 6. 查询回收站

- 方法：`GET`
- 地址：`/note/notes/trash`

### 7. 恢复笔记

- 方法：`PUT`
- 地址：`/note/notes/{id}/restore`

### 8. 彻底删除笔记

- 方法：`DELETE`
- 地址：`/note/notes/{id}/permanent`

### 9. 清空回收站

- 方法：`DELETE`
- 地址：`/note/notes/trash/empty`

### 10. 置顶/取消置顶笔记

- 方法：`PUT`
- 地址：`/note/notes/{id}/pin`

### 11. 收藏/取消收藏笔记

- 方法：`PUT`
- 地址：`/note/notes/{id}/star`

### 12. 查询收藏笔记列表

- 方法：`GET`
- 地址：`/note/notes/starred`

## 二、1 笔记模板

### 1. 查询模板列表

- 方法：`GET`
- 地址：`/note/templates`

返回说明：返回系统预置模板和当前用户自定义模板

### 2. 查询单个模板

- 方法：`GET`
- 地址：`/note/templates/{id}`

### 3. 创建模板

- 方法：`POST`
- 地址：`/note/templates`

请求参数：

```json
{
  "name": "我的模板",
  "contentType": "markdown",
  "content": "# 模板内容"
}
```

### 4. 修改模板

- 方法：`PUT`
- 地址：`/note/templates/{id}`

说明：系统预置模板不可修改/删除

### 5. 删除模板

- 方法：`DELETE`
- 地址：`/note/templates/{id}`

## 二、2 全局搜索

### 1. 全局搜索

- 方法：`GET`
- 地址：`/note/search`

查询参数：

- `keyword`：搜索关键词

返回说明：按笔记、保险箱、待办三个分类返回匹配结果，每类最多 6 条

## 三、密码保险箱

### 1. 查询保险箱列表

- 方法：`GET`
- 地址：`/note/vault-items`

查询参数：

- `keyword`
- `category`

### 2. 查询单条保险箱记录

- 方法：`GET`
- 地址：`/note/vault-items/{id}`

### 3. 新增保险箱记录

- 方法：`POST`
- 地址：`/note/vault-items`

请求参数：

```json
{
  "title": "GitHub",
  "category": "开发平台",
  "username": "yee@example.com",
  "password": "StrongPass123",
  "website": "https://github.com",
  "remark": "主工作账号"
}
```

### 4. 修改保险箱记录

- 方法：`PUT`
- 地址：`/note/vault-items/{id}`

### 5. 删除保险箱记录

- 方法：`DELETE`
- 地址：`/note/vault-items/{id}`

## 四、待办事项

### 1. 查询待办列表

- 方法：`GET`
- 地址：`/note/todos`

查询参数：

- `status`
- `priority`
- `keyword`：关键词，搜索标题和描述
- `reminderFilter`：提醒状态筛选，`active`（未过期）/ `expired`（已过期）

### 2. 查询单条待办

- 方法：`GET`
- 地址：`/note/todos/{id}`

### 3. 新增待办

- 方法：`POST`
- 地址：`/note/todos`

请求参数：

```json
{
  "title": "整理接口文档",
  "description": "输出联调版本接口说明",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-04-20",
  "reminderEnabled": true,
  "reminderAt": "2026-04-20T09:00:00",
  "reminderEmail": "notify@example.com"
}
```

字段说明：

- `reminderEnabled`：是否开启提醒
- `reminderAt`：提醒时间，格式为 `yyyy-MM-ddTHH:mm:ss`
- `reminderEmail`：接收邮箱，可为空；为空时后端默认使用当前登录账号邮箱

### 4. 修改待办

- 方法：`PUT`
- 地址：`/note/todos/{id}`

请求参数与新增待办一致。

### 5. 仅修改待办状态

- 方法：`PUT`
- 地址：`/note/todos/{id}/status`

请求参数：

```json
{
  "status": "done"
}
```

### 6. 删除待办

- 方法：`DELETE`
- 地址：`/note/todos/{id}`

## 五、提醒发送说明

- 待办提醒由 `note` 服务定时任务每分钟扫描一次。
- 只有 `reminderEnabled = true`、`reminderSent = false` 且 `reminderAt <= 当前时间` 的待办会触发发送。
- 提醒邮件发送成功后，后端会把 `reminderSent` 更新为 `true`，避免重复发送。

## 六、活动日志

### 1. 查询活动日志

- 方法：`GET`
- 地址：`/note/activity-logs`

查询参数：

- `module`：模块筛选，`note / vault / todo`，可选
- `limit`：返回条数，默认 `30`

### 2. 查询最近活动

- 方法：`GET`
- 地址：`/note/activity-logs/recent`

查询参数：

- `limit`：返回条数，默认 `10`

### 3. 模块操作统计

- 方法：`GET`
- 地址：`/note/activity-logs/stats/modules`

返回说明：返回各模块操作次数，格式 `{ "note": 12, "vault": 5, "todo": 8 }`

### 4. 按天操作统计

- 方法：`GET`
- 地址：`/note/activity-logs/stats/daily`

查询参数：

- `days`：统计天数，默认 `14`

返回说明：返回按日期的操作次数，格式 `{ "2026-05-01": 5, "2026-04-30": 3 }`

## 七、日历日程

### 1. 查询日程列表（按月）

- 方法：`GET`
- 地址：`/note/calendar`

查询参数：

- `year`：年份，必填
- `month`：月份，必填

### 2. 查询日程（按日期范围）

- 方法：`GET`
- 地址：`/note/calendar/range`

查询参数：

- `startDate`：开始日期，格式 `yyyy-MM-dd`
- `endDate`：结束日期，格式 `yyyy-MM-dd`

### 3. 查询今日日程

- 方法：`GET`
- 地址：`/note/calendar/today`

### 4. 查询单条日程

- 方法：`GET`
- 地址：`/note/calendar/{id}`

### 5. 新建日程

- 方法：`POST`
- 地址：`/note/calendar`

请求参数：

```json
{
  "title": "团队周会",
  "description": "本周迭代回顾",
  "startTime": "2026-05-05T10:00:00",
  "endTime": "2026-05-05T11:00:00",
  "allDay": 0,
  "color": "#409eff",
  "location": "会议室A",
  "reminderMinutes": 15
}
```

### 6. 修改日程

- 方法：`PUT`
- 地址：`/note/calendar/{id}`

请求参数与新建一致。

### 7. 删除日程

- 方法：`DELETE`
- 地址：`/note/calendar/{id}`

## 八、知识库 Wiki

### 1. 查询知识库列表

- 方法：`GET`
- 地址：`/note/wiki/spaces`

### 2. 查询单个知识库

- 方法：`GET`
- 地址：`/note/wiki/spaces/{id}`

### 3. 新建知识库

- 方法：`POST`
- 地址：`/note/wiki/spaces`

请求参数：

```json
{
  "name": "技术笔记",
  "description": "日常开发知识积累",
  "icon": "💻"
}
```

### 4. 修改知识库

- 方法：`PUT`
- 地址：`/note/wiki/spaces/{id}`

请求参数与新建一致。

### 5. 删除知识库

- 方法：`DELETE`
- 地址：`/note/wiki/spaces/{id}`

说明：删除知识库会同时删除其中所有页面。

### 6. 查询知识库下所有页面（平铺）

- 方法：`GET`
- 地址：`/note/wiki/spaces/{spaceId}/pages`

### 7. 查询知识库页面树

- 方法：`GET`
- 地址：`/note/wiki/spaces/{spaceId}/tree`

返回说明：返回树形结构，每个节点包含 `id`、`title`、`parentId`、`children` 数组。

### 8. 查询单个页面

- 方法：`GET`
- 地址：`/note/wiki/pages/{id}`

### 9. 新建页面

- 方法：`POST`
- 地址：`/note/wiki/pages`

请求参数：

```json
{
  "spaceId": 1,
  "parentId": null,
  "title": "Java 并发编程",
  "content": "# 并发编程\n\n## 线程池..."
}
```

### 10. 修改页面

- 方法：`PUT`
- 地址：`/note/wiki/pages/{id}`

### 11. 删除页面

- 方法：`DELETE`
- 地址：`/note/wiki/pages/{id}`

说明：删除页面会同时删除所有子页面。

## 九、文件库

### 1. 上传文件

- 方法：`POST`
- 地址：`/note/files/upload`
- 请求类型：`multipart/form-data`
- 参数：
  - `files`：文件（支持多文件，最多 5 个）
  - `folder`：虚拟文件夹，可选
  - `remark`：备注，可选

### 2. 分页查询文件

- 方法：`GET`
- 地址：`/note/files`

查询参数：

- `current`：页码，默认 `1`
- `size`：每页条数，默认 `15`
- `keyword`：关键词，搜索文件名/备注
- `folder`：文件夹筛选

### 3. 查询单条文件

- 方法：`GET`
- 地址：`/note/files/{id}`

### 4. 下载文件

- 方法：`GET`
- 地址：`/note/files/{id}/download`

说明：支持 `?token=` 参数鉴权（`<a>` 标签下载无法携带 Header）

### 5. 预览文件

- 方法：`GET`
- 地址：`/note/files/{id}/preview`

说明：支持 `image/*`、`application/pdf`、`text/*` 预览，支持 `?token=` 参数鉴权

### 6. 修改文件信息

- 方法：`PUT`
- 地址：`/note/files/{id}`

查询参数：

- `folder`：新文件夹
- `remark`：新备注

### 7. 删除文件

- 方法：`DELETE`
- 地址：`/note/files/{id}`

说明：同时删除磁盘文件和数据库记录

### 8. 查询文件夹列表

- 方法：`GET`
- 地址：`/note/files/folders`

返回说明：返回当前用户所有不重复的文件夹名称

### 9. 存储统计

- 方法：`GET`
- 地址：`/note/files/stats`

返回说明：返回 `{ "fileCount": 10, "totalSize": 1048576 }`

## 十、工作台 Dashboard

### 1. 全模块数据总览

- 方法：`GET`
- 地址：`/note/dashboard/overview`

返回说明：返回笔记数、wiki页面数、待办数、待办完成数、保险箱数、日程数、文件数、文件总大小

### 2. 本周效率报告

- 方法：`GET`
- 地址：`/note/dashboard/weekly-report`

返回说明：返回本周与上周的笔记新增数、待办完成数、操作次数对比

### 3. 知识增长曲线

- 方法：`GET`
- 地址：`/note/dashboard/knowledge-growth`

查询参数：

- `days`：统计天数，默认 `30`

返回说明：返回按日期的笔记+wiki新增数

### 4. 活动热力图

- 方法：`GET`
- 地址：`/note/dashboard/activity-heatmap`

查询参数：

- `days`：统计天数，默认 `90`

返回说明：返回按日期的操作次数，适配 ECharts Calendar Heatmap

### 5. 优先待办列表

- 方法：`GET`
- 地址：`/note/dashboard/top-todos`

查询参数：

- `limit`：返回条数，默认 `5`

返回说明：返回未完成待办按优先级+创建时间排序
