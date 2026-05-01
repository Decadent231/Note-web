# 数据库表结构说明

## 1. 用户库 `money_cloud_user`

### 1.1 `sys_user`

用途：系统用户

字段：

- `id`：用户主键
- `email`：邮箱，登录账号
- `password`：BCrypt 加密后的密码
- `nickname`：昵称
- `created_at`：创建时间

### 1.2 `sys_verify_code`

用途：邮箱验证码

字段：

- `id`：主键
- `email`：邮箱
- `code`：验证码
- `expire_time`：过期时间
- `created_at`：创建时间

## 2. 笔记库 `money_cloud_note`

### 2.1 `note`

用途：工作笔记管理

字段：

- `id`：笔记 ID
- `user_id`：所属用户
- `title`：标题
- `category`：分类
- `tags`：标签，逗号分隔
- `summary`：摘要
- `content`：富文本 HTML 内容
- `content_type`：内容类型，`html`（富文本）/ `markdown`（Markdown）
- `pinned`：是否置顶，0=否，1=是
- `starred`：是否收藏，0=否，1=是
- `deleted`：是否在回收站，0=正常，1=已删除
- `deleted_at`：移入回收站的时间
- `created_at`：创建时间
- `updated_at`：更新时间

### 2.2 `vault_item`

用途：账号密码保险箱

字段：

- `id`：主键
- `user_id`：所属用户
- `title`：记录标题
- `category`：分类
- `username`：账号
- `password_encrypted`：AES 加密后的密码
- `website`：网址
- `remark`：备注
- `created_at`：创建时间
- `updated_at`：更新时间

说明：

- 密码不会以明文形式保存到数据库。
- 前端拿到的是后端解密后的展示值，数据库实际保存的是密文。

### 2.3 `todo_item`

用途：待办事项

字段：

- `id`：主键
- `user_id`：所属用户
- `title`：待办标题
- `description`：待办描述
- `status`：状态，`todo / doing / done`
- `priority`：优先级，`low / medium / high`
- `due_date`：截止日期
- `reminder_enabled`：是否开启提醒
- `reminder_at`：提醒时间
- `reminder_email`：提醒接收邮箱，为空时默认使用当前账号邮箱
- `reminder_sent`：提醒是否已发送
- `created_at`：创建时间
- `updated_at`：更新时间

## 3. 说明

- 当前前端所有业务数据都通过后端 API 访问，不会在浏览器直接连接数据库。
- "自动适配表结构"的实际方式，是后端实体、SQL 脚本和线上数据库保持一致。
- 这次已经为 `todo_item` 补齐提醒相关字段，并在数据库中创建提醒查询索引。

## 4. 活动日志表 `activity_log`

用途：记录用户对笔记、保险箱、待办的操作历史，用于 Dashboard 统计和操作审计。

字段：

- `id`：主键
- `user_id`：所属用户
- `module`：模块名，`note / vault / todo`
- `action`：动作，`create / update / delete / restore / export`
- `target_id`：目标记录 ID
- `detail`：补充说明（如标题、状态变更等）
- `created_at`：创建时间

索引：

- `idx_activity_user_created`：按用户+时间查询
- `idx_activity_user_module`：按用户+模块筛选

## 5. 笔记模板表 `note_template`

用途：存储系统预置和用户自定义的笔记模板，新建笔记时可选择模板快速填充内容。

字段：

- `id`：主键
- `user_id`：所属用户（系统模板为 NULL 或固定值）
- `name`：模板名称
- `content_type`：内容类型，`html` / `markdown`
- `content`：模板内容
- `is_system`：是否系统预置，1=系统模板，0=用户自定义
- `created_at`：创建时间
- `updated_at`：更新时间

说明：

- 系统预置了 6 个模板：周报、会议纪要、日报、需求分析、Bug记录、读书笔记
- 系统模板对所有用户可见，不可修改/删除
- 用户自定义模板仅对自己可见，可自由增删改
