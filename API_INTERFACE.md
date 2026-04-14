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
  "content": "<p>富文本内容</p>"
}
```

### 4. 修改笔记

- 方法：`PUT`
- 地址：`/note/notes/{id}`

### 5. 删除笔记

- 方法：`DELETE`
- 地址：`/note/notes/{id}`

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
