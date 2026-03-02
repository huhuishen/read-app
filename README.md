# read-app 团队开发文档

本文件用于团队协作，包含项目架构、目录职责、运行与部署、API 约定。

## 1. 项目概览

`read-app` 是一个基于 SvelteKit 的全栈阅读应用，包含以下模块：

- 公开阅读区：首页、分类、关于页、登录、注册
- 登录后功能：文章阅读、写作编辑、个人主页
- 管理后台：用户、文章、分类、数据库管理
- 同仓 API：`/api/*` 路由提供服务端能力

技术栈：

- 前端与全栈框架：SvelteKit 2 + Svelte 5
- 数据库：MongoDB
- 认证：JWT + HttpOnly Cookie
- 部署适配器：`@sveltejs/adapter-node`

## 2. 架构图

```mermaid
flowchart TD
    U[浏览器] --> R[SvelteKit 路由层]

    subgraph Web[应用层]
      R --> A[(unauth) 公共页面]
      R --> B[(auth) 受保护页面]
      R --> C[/api/* 接口]
    end

    C --> H[withApi 与 safe]
    H --> M[models 服务层]
    M --> L[mongolite 封装]
    L --> DB[(MongoDB)]

    B --> S[(token cookie)]
    C --> S
```

## 3. 目录职责

```text
src/
  routes/
    (unauth)/               公共页面（首页、登录注册、about、分类浏览）
    (auth)/                 登录后页面（阅读器、写作、profile、dashboard）
    api/                    后端接口（BFF）
  lib/
    components/             可复用 UI 组件
    models/                 业务模型与数据访问
    mongolite/              MongoDB 轻量封装
    util/                   工具函数（API、错误处理、缓存等）
    server/                 服务流程（备份、恢复）
    stores/                 前端状态
    styles/                 全局样式与设计变量
static/
  uploads/                  上传资源目录（默认）
backup/                     备份目录（默认）
```

## 4. 请求与权限流程

- 访问 `(auth)` 路由时，未登录用户会被重定向到登录页。
- `(unauth)` 布局会尝试解析 token，并把用户信息注入页面数据。
- API 通过 `withApi` 读取 cookie 并写入 `event.locals.user`。
- 登录成功后写入 `token` cookie；登出时删除该 cookie。

## 5. 本地运行

### 5.1 环境要求

- Node.js 20 或更高版本
- npm 或 pnpm
- MongoDB 实例

### 5.2 安装依赖

```bash
npm install
```

### 5.3 启动开发环境

```bash
npm run dev
```

### 5.4 类型与语法检查

```bash
npm run check
```

### 5.5 构建与预览

```bash
npm run build
npm run preview
```

## 6. 环境变量

当前代码使用以下环境变量：

- `MONGODB_URI`：MongoDB 连接地址
- `MONGODB_CONNECT_TIMEOUT`：连接超时（毫秒）
- `JWT_SECRET`：JWT 签名密钥
- `PATH_BACKUP`：备份目录
- `UPLOAD_DIR`：上传目录

示例：

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_CONNECT_TIMEOUT=5000
JWT_SECRET=replace_this_in_production
PATH_BACKUP=D:\\data\\read-app\\backup
UPLOAD_DIR=static/uploads
```

## 7. 部署说明（Node）

当前使用 `adapter-node`，推荐部署步骤：

1. 安装依赖：`npm ci`
2. 产物构建：`npm run build`
3. 启动服务：`node build`

推荐搭配：

- 进程托管：PM2 或 systemd
- 反向代理：Nginx 或 Caddy
- 强制 HTTPS，并配置生产环境密钥与数据库地址

## 8. API 约定

### 8.1 命名与方法

- 统一前缀：`/api`
- 使用资源化命名，优先复数名词
- 查询使用 GET，写入使用 POST/PATCH/PUT/DELETE

### 8.2 鉴权约定

- 登录接口：`POST /api/users/login`
- 登录态：HttpOnly `token` cookie
- 需要登录的接口检查 `locals.user`
- 管理员接口检查 `locals.user.roles` 是否包含 `administrator`

### 8.3 响应结构建议

成功响应：

```json
{
  "ok": true,
  "data": {},
  "message": ""
}
```

失败响应：

```json
{
  "ok": false,
  "message": "错误信息"
}
```

推荐状态码：

- 200/201：成功
- 400：参数错误
- 401：未登录或无权限
- 404：资源不存在
- 500：服务端异常

### 8.4 常用接口（当前）

用户：

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/logout`
- `GET /api/users/me`

文章：

- `GET /api/articles`
- `POST /api/articles`
- `GET /api/articles/[id]`
- `POST /api/articles/[id]`
- `PUT /api/articles/[id]`

分类与榜单：

- `GET /api/categories`
- `GET /api/categories/[name]`
- `GET /api/categories/[name]/articles`
- `GET /api/categories/[name]/votes`

运维：

- `POST /api/backup`
- `POST /api/restore`
- `POST /api/monthly-task`

## 9. 数据与服务层约定

- `lib/models/*`：承载业务数据读写
- `lib/server/*`：承载可复用服务流程
- 路由层：参数解析、鉴权、调用 service、返回 HTTP

## 10. 协作规范（建议）

- 新增 API 时，把数据库细节下沉到 `models` 或 `server`。
- 提交前至少执行 `npm run check`。
- 关键流程需手测：登录、首页阅读、文章编辑与保存。

## 11. 已知问题

- 项目中仍有部分历史页面存在中文乱码，建议分批修复。
- 部分接口返回字段尚未统一（`message` / `error` 混用）。
- 备份恢复接口建议增加管理员权限校验与审计日志。
