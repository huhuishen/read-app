# 添加测试数据（文章 / 用户 / 评论）实施计划

## Summary

为项目添加一份可按需触发、可重复执行的测试数据播种能力：通过一个**仅管理员可调用**的 API 端点 `POST /api/dev/seed`，在 MongoDB 中生成 **20 个测试用户、300 篇文章（跨 10 个月份）、约 400+ 条评论**，并重建首页所需的分类预览与标签计数，使首页展示 300 篇文章（10 个月份 × 每月 30 篇预览）。重新执行时先删除上次播种的测试数据再重新生成（幂等）。

## Current State Analysis

- 数据库为 MongoDB，经自定义 `MongoLiteClient` 封装（[db.ts](file:///d:/dev/reading/read-app/src/lib/models/db.ts)）。集合：`users` / `articles` / `comments` / `categories` / `tags` / `settings`。
- **无任何 seed 脚本**。仅 `initDb()` 内的 `ensureDefaultAdminUser()` 会创建默认管理员 `admin / admin`。
- 首页 `/`（[+page.ts](file:///d:/dev/reading/read-app/src/routes/(unauth)/+page.ts) + [+page.svelte](file:///d:/dev/reading/read-app/src/routes/(unauth)/+page.svelte)）逻辑：
  - 调用 `GET /api/categories/home`（[home/+server.ts](file:///d:/dev/reading/read-app/src/routes/api/categories/home/+server.ts)）。
  - 该接口取 `show:true` 的分类，按 `year:-1, month:-1` 排序，**limit 10**。
  - 首页对每个分类渲染其 `previewArticles`（全部渲染）。
  - 因此「首页文章数 = ∑ 各分类 previewArticles 长度」。要达到 300，可用 10 个月份分类 × 每分类 30 条预览 = 300。
- 文章 `category` 字段由 `getContestInfoByDate(date)`（[articles.ts](file:///d:/dev/reading/read-app/src/lib/models/articles.ts)）按日期生成 `{year, month, period:"yyyy-MM", voteEnd}`，`period` 即月份征文期标识，是首页分组的依据。
- 文章类型关键字段（[articles.ts:45-84](file:///d:/dev/reading/read-app/src/lib/models/articles.ts#L45-L84)）：`id, version, isLatest, title, authorId, author, content, coverImage, summary, tags, status("草稿"|"待审核"|"published"|"下架"), stats{view,mark,comment,vote,rate,rateSum,rateCount,readSeconds}, category{year,month,period,voteEnd}`。
- 评论类型（[comments.ts:39-52](file:///d:/dev/reading/read-app/src/lib/models/comments.ts#L39-L52)）：`articleId, articleTitle, parentId(null=一级), userId, user, content, rating, likes, liked, replies, replyTo, quote`。
- 用户类型（[users.ts](file:///d:/reading/read-app/src/lib/models/users.ts)）：含 `id, email, name, password(hash), roles[], profile{theme,avatarColor}, activated, activateToken, activateExpireAt, bio, tags, readSeconds, underlineCount, underlineReplyCount, commentCount`。`email`、`id` 有唯一索引。
- `CollectionWrapper.insertOne/insertMany`（[collection.ts:109,129](file:///d:/dev/reading/read-app/src/lib/mongolite/collection.ts#L109)）会**强制覆盖 `createdAt = now`**；`updateOne/checkUpdate` 会注入 `updatedAt=now`。`bulkWrite` 直接透传，不注入时间戳——用于批量设置自定义 `createdAt`。
- `Categories.buildPreview(name, size, show)`（[categories.ts:143](file:///d:/dev/reading/read-app/src/lib/models/categories.ts#L143)）按 `category.period` 重算 `previewArticles`（limit size）与 `articleCount`，并 upsert 分类文档。`Tags.buildCount(name)`（[tags.ts:49](file:///d:/dev/reading/read-app/src/lib/models/tags.ts#L49)）按文章数重算标签计数。
- 服务端模块依赖 SvelteKit 虚拟模块（`$env/dynamic/private`、`$app/navigation`），故 seed 逻辑须在 SvelteKit 运行时内执行（API 端点），不走独立 Node 脚本。
- 已有 `withApi` / `requireRole(event, 'administrator')` 鉴权工具（见 [monthly-task/+server.ts](file:///d:/dev/reading/read-app/src/routes/api/monthly-task/+server.ts)）。

## Decisions（已与用户确认）

- 触发方式：**管理员 API 端点** `POST /api/dev/seed`（按需调用，不污染 `initDb` 启动流程）。
- 重复执行策略：**先删后插**。所有 seed 文档打标记 `isSeed:true`，重跑时删除 `articles/comments/users/categories` 中 `isSeed:true` 的文档后重新生成；`tags` 不删除，仅重算计数。
- 「首页文章 300 条」实现：生成 300 篇 `status:"published"` 文章，分布在最近 10 个月（含当月）；对每个月份 `period` 调用 `buildPreview(period, 30, true)`，使 10 个分类各 30 条预览 → 首页合计 300 条。
- `coverImage` 留空 `""`（符合 schema，避免引入外部图片依赖）。
- seed 用户密码统一 `password`（bcrypt 哈希），邮箱 `seedN@test.local`。

## Proposed Changes

### 1. 新建 `src/lib/models/seed.ts`（核心播种逻辑，服务端模块）

导出 `seedTestData(opts?: { months?: number; perMonth?: number })`，默认 `months=10, perMonth=30`（=300 篇）。流程：

1. `await initDb()`（确保连接）。
2. **清理上次 seed**：并行 `deleteMany({ isSeed: true })` 于 `Articles` / `Comments` / `Users` / `Categories`（均 `as any` 以绕过类型，因 `isSeed` 不在 schema 类型中；MongoDB schemaless 允许）。
3. **生成 20 个测试用户**：`id = crypto.randomUUID()`，`email = seed{i}@test.local`，`name = 测试用户{i}`，`password = bcrypt.hash("password", SALT_ROUNDS)`（从 `$lib/config` 导入 `SALT_ROUNDS`），`roles` 混合（2 author / 3 critic / 15 user），`activated:true`，`profile:{theme:"light",avatarColor:""}`，`activateToken:""`，`activateExpireAt:new Date(0)`，`bio:""`，`tags:""`，计数归零，`isSeed:true`。`Users.insertMany(users as any)`。
4. **在内存中构造 300 篇文章**（不立即写库）：
   - 月份循环 `m = 0..months-1`：`date = new Date(now.getFullYear(), now.getMonth()-m, 15)`；`info = getContestInfoByDate(date)`；`period = info.period`。
   - 每月 `perMonth` 篇：`id = nanoid()`（自 `$lib/util/client`），`version:0`，`isLatest:true`，`status:"published"`，`authorId/author` 取自随机 seed 用户，`title`（如 `《{{书名}}》读后感 · {{period}} #{{n}}`），`content`（数段中文测试正文，从模板池拼接），`summary`（截取前若干字），`coverImage:""`，`tags`（从标签池随机取 1-3 个），`category:{year:info.year, month:info.month, period:info.period, voteEnd:info.voteEnd}`，`stats` 基础随机值（view/mark/vote/readSeconds 随机；comment/rateSum/rateCount 暂 0，待第 5 步填入），`isSeed:true`。
   - 同时记录每篇文章的预期 `createdAt`（月份内随机日），稍后用 `bulkWrite` 写入（因 `insertMany` 会强制覆盖为 now）。
5. **在内存中生成评论**：对约 60% 的文章生成 1-4 条一级评论，`articleId/articleTitle` 指向上述文章，`userId/user` 取自随机 seed 用户，`content`（评论模板池），`rating`（1-5，部分为 0），`likes` 随机，`parentId:null`，`liked:false`，`replies:[]`，`replyTo:""`，`quote:""`，`isSeed:true`。
   - 累计每篇文章 `commentCount`、`rateSum`、`rateCount`，回填到第 4 步文章 `stats`；`rate = rateCount>0 ? (rateSum/rateCount)*2 : 0`。
6. **写库**：`Articles.insertMany(articles as any)` → `Comments.insertMany(comments as any)`。
7. **批量修正文章 `createdAt/updatedAt`**：`Articles.bulkWrite`（透传，不注入），每个 `updateOne: { filter:{id}, update:{ $set:{ createdAt, updatedAt } } }`，使文章散布于各自月份（更真实，且不集中在同一时刻）。
8. **重建分类预览**：对涉及的每个 `period` 调用 `await Categories.buildPreview(period, perMonth, true)`，再 `Categories.updateOne({ name: period }, { $set:{ isSeed:true } } as any)` 打标记（便于重跑清理）。
9. **重建标签计数**：对标签池中每个标签 `await Tags.buildCount(tag)`。
10. 返回统计 `{ users:20, articles:300, comments, periods:[...] }`。

要点 / 约束：
- `isSeed` 字段不在现有类型中：构造文档时以 `& { isSeed:true }` 联合，传给 `insertMany/deleteMany/bulkWrite` 时 `as any`。
- 不调用 `Comments.add`（它会再 `updateOne` 文章与用户计数、查文章标题），直接 `insertMany` + 内存预算 stats，避免 N 次额外查询；用户 `commentCount` 由第 11 步统一更新（可选）。
- （可选）第 11 步：`Users.bulkWrite` 按 seed 用户被引用次数更新 `commentCount`，保证个人页统计正确。纳入实现。
- 文件内注释使用中文，与项目风格一致。

### 2. 新建 `src/routes/api/dev/seed/+server.ts`（管理员触发端点）

```ts
import { seedTestData } from "$lib/models/seed";
import { requireRole, withApi } from "$lib/util/apiHandler";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = withApi(async (event) => {
    requireRole(event, "administrator");
    const months = Number(event.url.searchParams.get("months") ?? 10);
    const perMonth = Number(event.url.searchParams.get("perMonth") ?? 30);
    const result = await seedTestData({ months, perMonth });
    return json(result);
});
```

- 支持查询参数 `months` / `perMonth` 覆盖默认值（如 `?months=12&perMonth=25`）。
- 仅 `administrator` 可调用（未登录或无权限由 `requireRole` 拒绝）。

### 3. 在 `src/routes/api/test.http` 追加调用示例

追加一段（登录 admin 后复制其 Cookie，或浏览器登录后直接访问）：

```http
### 播种测试数据（需先以 admin 登录获取 cookie）
POST {{host}}/api/dev/seed?months=10&perMonth=30
Cookie: token={{adminCookie}}
```

（具体变量风格沿用现有 `test.http`；实现时读取该文件后匹配其格式。）

## Assumptions

- 运行环境已有可连通的 MongoDB（`MONGODB_URI`，默认 `mongodb://127.0.0.1:27017`，库名 `test`）。
- 默认管理员 `admin / admin` 已存在（由 `ensureDefaultAdminUser` 保证），用于调用端点。
- 首页一次渲染 300 张卡片可接受（测试用途）；如需分页，可后续调整 `perMonth`。
- `getContestInfoByDate` 对历史月份同样适用（仅计算 `period`/`voteEnd`，不依赖当前时间约束）。
- `Categories.buildPreview` 无 sort（natural order），预览顺序不强制——满足「展示」即可。
- seed 数据与真实数据通过 `isSeed:true` 隔离；`tags` 不删除但会按剩余文章重算计数。

## Verification

1. 启动 `npm run dev`，以 `admin / admin` 登录。
2. 触发播种：浏览器访问或 `curl -X POST -b "token=<adminCookie>" "http://localhost:5173/api/dev/seed?months=10&perMonth=30"`，预期返回 `{ users:20, articles:300, comments:..., periods:[10项] }`。
3. 访问首页 `/`：应显示 10 个月份分类，每个分类 30 篇文章卡片，合计 300。
4. 进入任一文章详情：评论列表应显示对应 seed 评论；评分 `rate` 与评论 `rating` 一致。
5. 管理后台 `/dashboard/articles`：文章列表应含 300 篇 seed 文章；`/dashboard/users` 应含 20 个 seed 用户。
6. 幂等性：再次调用端点，文章/评论/用户总数应保持稳定（先删后插，不累积）。
7. `npm run check` 通过（类型检查）。
