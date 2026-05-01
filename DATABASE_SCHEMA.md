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

## 6. 日历日程表 `calendar_event`

用途：存储用户创建的日程事件，支持月视图/周视图查询、全天事件、颜色标签、地点。

字段：

- `id`：主键
- `user_id`：所属用户
- `title`：事件标题
- `description`：事件描述，可为空
- `start_time`：开始时间
- `end_time`：结束时间，可为空
- `all_day`：是否全天事件，1=是，0=否
- `color`：颜色标签，如 `#409eff`
- `location`：地点，可为空
- `reminder_minutes`：提前提醒分钟数，可为空
- `todo_item_id`：关联的待办 ID，可为空
- `created_at`：创建时间
- `updated_at`：更新时间

索引：

- `idx_event_user_time`：按用户+时间查询
- `idx_event_user_created`：按用户+创建时间排序

## 7. 知识库空间表 `wiki_space`

用途：知识库空间，一个用户可以有多个知识库空间。

字段：

- `id`：主键
- `user_id`：所属用户
- `name`：知识库名称
- `description`：描述，可为空
- `icon`：图标（emoji），默认 📋
- `created_at`：创建时间
- `updated_at`：更新时间

索引：

- `idx_space_user`：按用户查询

## 8. 知识库页面表 `wiki_page`

用途：知识库中的页面，支持无限层级树形结构。

字段：

- `id`：主键
- `user_id`：所属用户
- `space_id`：所属知识库空间
- `parent_id`：父页面 ID，NULL 表示顶级页面
- `title`：页面标题
- `content`：页面内容（长文本）
- `content_type`：内容类型，`markdown`（默认）/ `html`（富文本）
- `sort_order`：排序字段
- `created_at`：创建时间
- `updated_at`：更新时间

索引：

- `idx_page_space`：按知识库查询
- `idx_page_parent`：按父页面查询子节点
- `idx_page_user_space`：按用户+知识库查询

## 9. 文件库表 `file_asset`

用途：文件库元数据，实际文件存储在服务器本地目录 `/data/note-files/{userId}/`。

字段：

- `id`：主键
- `user_id`：所属用户
- `original_name`：原始文件名
- `stored_name`：存储文件名（UUID 重命名）
- `relative_path`：相对路径（`userId/storedName`）
- `file_size`：文件大小（字节）
- `mime_type`：MIME 类型
- `extension`：文件扩展名
- `folder`：虚拟文件夹
- `remark`：备注
- `created_at`：创建时间
- `updated_at`：更新时间

索引：

- `idx_file_user`：按用户查询
- `idx_file_folder`：按用户+文件夹筛选
- `idx_file_created`：按用户+创建时间排序

说明：

- 文件不存储在数据库中，仅保存元数据。实际文件存放在服务器磁盘。
- 危险文件扩展名（exe/bat/cmd/sh 等）会被拒绝上传。
- 默认最大文件大小 50MB，可通过环境变量 `FILE_MAX_SIZE_MB` 配置。
- 存储路径可通过环境变量 `FILE_STORAGE_PATH` 配置，默认 `/data/note-files`。

## 10. 笔记-文件关联表 `note_file`

用途：笔记与文件的多对多关联关系。

字段：

- `id`：主键
- `note_id`：笔记ID
- `file_id`：文件ID
- `created_at`：创建时间

索引：

- `uk_note_file`：唯一索引 `(note_id, file_id)`，防止重复关联
- `idx_nf_note`：按笔记ID查询关联文件
- `idx_nf_file`：按文件ID查询关联笔记

说明：

- 同一个文件可以关联多篇笔记。
- 同一篇笔记可以关联多个文件。
- 删除笔记或文件时，关联记录不自动级联删除（可手动清理）。
- 迁移脚本：`note_upgrade_20260501_v5.sql`

## 11. 知识库页面-文件关联表 `wiki_page_file`

用途：知识库页面与文件库的多对多关联关系。

字段：

- `id`：主键
- `page_id`：知识库页面ID
- `file_id`：文件ID
- `created_at`：创建时间

索引：

- `uk_wiki_page_file`：唯一索引 `(page_id, file_id)`，防止重复关联
- `idx_wpf_page`：按页面ID查询关联文件
- `idx_wpf_file`：按文件ID查询关联知识库页面

说明：

- 同一个文件可以关联多个知识库页面。
- 同一个页面可以关联多个文件。
- 迁移脚本：`note_upgrade_20260501_v6.sql`
