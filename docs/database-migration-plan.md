# Priority Todo 数据库迁移方案

## 一、当前状态

- **数据存储**：Dexie.js + IndexedDB（纯客户端）
- **特点**：每个用户的浏览器独立存储数据，无法跨设备同步
- **项目路径**：`~/.hermes/work/priority-todo/`

## 二、迁移目标

- **目标数据库**：Cloudflare D1（SQLite）
- **目标架构**：服务端数据库 + API 路由
- **新增功能**：用户登录、数据多设备同步

## 三、迁移方案

直接迁移到 Cloudflare D1，废弃 Dexie，所有数据操作走 API 到 D1。

**优点**：
- 代码简单，无双重数据源
- 数据一致性天然保证

**缺点**：
- 无法离线使用
- 迁移期间用户需要重新登录

---

## 四、架构设计

### 4.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | Next.js 16 | 现有项目 |
| 数据库 | Cloudflare D1 | SQLite 边缘数据库 |
| ORM | Drizzle ORM | 轻量级，支持 D1 |
| 认证 | GitHub OAuth | 用户登录 |
| API | Next.js Route Handlers | `/app/api/*` |
| 部署 | Cloudflare Pages | 现有部署 |

### 4.2 数据模型

```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE,           -- GitHub 用户 ID（用于 OAuth）
  email TEXT UNIQUE NOT NULL,       -- 邮箱（必填）
  name TEXT,                        -- 显示名称
  avatar_url TEXT,                  -- GitHub 头像
  password_hash TEXT,               -- 本地密码（预留）
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 任务表
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  importance INTEGER NOT NULL,
  urgency INTEGER NOT NULL,
  priority_score INTEGER NOT NULL,
  due_date TEXT,
  status TEXT DEFAULT 'active',
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 设置表
CREATE TABLE settings (
  id TEXT PRIMARY KEY, -- 固定为 'user_settings'
  user_id TEXT UNIQUE NOT NULL,
  threshold INTEGER DEFAULT 6,
  default_view TEXT DEFAULT 'quadrant',
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4.3 API 设计

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/api/auth/github` | GitHub OAuth 跳转 |
| GET | `/api/auth/github/callback` | GitHub OAuth 回调 |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/me` | 获取当前用户 |
| POST | `/api/auth/login` | 邮箱密码登录（预留） |
| GET | `/api/tasks` | 获取所有任务 |
| POST | `/api/tasks` | 创建任务 |
| PUT | `/api/tasks/[id]` | 更新任务 |
| DELETE | `/api/tasks/[id]` | 删除任务 |
| PATCH | `/api/tasks/[id]/complete` | 完成任务 |
| GET | `/api/settings` | 获取设置 |
| PUT | `/api/settings` | 更新设置 |
| POST | `/api/data/export` | 导出数据 |
| POST | `/api/data/import` | 导入数据 |

### 4.4 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── github/route.js        # OAuth 跳转
│   │   │   ├── github/callback/route.js
│   │   │   ├── logout/route.js
│   │   │   ├── me/route.js
│   │   │   └── login/route.js         # 预留
│   │   ├── tasks/
│   │   │   ├── route.js
│   │   │   └── [id]/route.js
│   │   ├── settings/route.js
│   │   └── data/
│   │       ├── export/route.js
│   │       └── import/route.js
│   ├── login/
│   │   └── page.jsx
│   └── page.jsx
├── lib/
│   ├── db/
│   │   ├── schema.js         # Drizzle schema
│   │   ├── drizzle.js        # Drizzle client
│   │   └── migrations/       # D1 migrations
│   ├── api/                  # API 客户端
│   │   ├── tasks.js
│   │   └── auth.js
│   └── store/
│       └── taskStore.js
└── components/
    └── ...
```

---

## 五、实施步骤

### 第一阶段：准备工作

1. **创建 Cloudflare D1 数据库**
   ```bash
   wrangler d1 create priority-todo-db
   ```

2. **初始化 Drizzle ORM**
   ```bash
   npm install drizzle-orm
   npm install -D drizzle-kit
   ```

3. **配置 GitHub OAuth App**
   - 在 GitHub Settings → Developer settings → OAuth Apps 创建
   - 设置 callback URL 为 `https://todo.daishengli.top/api/auth/github/callback`

4. **配置 wrangler.toml**
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "priority-todo-db"
   database_id = "your-database-id"
   ```

### 第二阶段：API 开发

5. **创建 Drizzle Schema**
   - 定义 users、tasks、settings 表

6. **实现 GitHub OAuth API**
   - `/api/auth/github` - 跳转 GitHub 授权
   - `/api/auth/github/callback` - 处理回调，创建/查询用户，生成 session
   - `/api/auth/me` - 获取当前用户
   - `/api/auth/logout` - 销毁 session

7. **实现 CRUD API**
   - 任务、设置的增删改查

### 第三阶段：前端改造

8. **创建 API 客户端层**
   - `src/lib/api/tasks.js`
   - `src/lib/api/auth.js`

9. **添加登录页面**
   - `/login` 路由
   - GitHub 登录按钮

10. **替换数据层**
    - 移除 Dexie，全部改用 API 获取数据

### 第四阶段：功能测试

11. **测试验证**
    - 单元测试
    - 端到端测试

---

## 六、登录功能设计

### 6.1 方案选择

| 方案 | 复杂度 | 安全性 | 用户体验 |
|------|--------|--------|----------|
| 邮箱密码 | 中 | 高 | 一般 |
| GitHub OAuth | 中 | 高 | 好 |

**采用**：GitHub OAuth 登录（用户无需注册，直接用 GitHub 账号）
**也考虑**：邮箱密码登录（预留）

### 6.2 登录流程

1. 用户点击"GitHub 登录"
2. 跳转到 GitHub 授权页面
3. 用户授权后回调到 `/api/auth/github/callback`
4. 后端根据 GitHub 用户 ID 创建/查询用户
5. 设置 session cookie
6. 返回首页，已登录状态

---

## 九、参考资料

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Next.js App Router API Routes](https://nextjs.org/docs/app/api-reference)
- [Auth.js 文档](https://authjs.dev/)
