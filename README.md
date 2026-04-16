# LeaseWise NYC Back-End

## 已实现

- 可运行的 `Express + MongoDB` REST API
- 基础目录结构：
  - `config/`
  - `data/`
  - `routes/`
  - `middleware/`
  - `tasks/`
- 与 proposal 对齐的路由分组：
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /buildings`
  - `GET /buildings/:id`
  - `GET /portfolios/:ownerName`
  - `POST /watchlist/toggle`
  - `GET+POST /buildings/:id/reviews`
  - `PUT+DELETE /reviews/:id`
  - `GET+POST /shortlists`
  - `POST /shortlists/:id/items`
  - `PATCH /shortlists/:id/items/:buildingId/note`
  - `DELETE /shortlists/:id/items/:buildingId`
  - `DELETE /shortlists/:id`
  - `POST+PUT+DELETE /admin/buildings` （仅管理员）
- MongoDB 单例连接 + 集合访问器
- 数据层：users、buildings、reviews、shortlists
- 手写输入校验工具函数
- express-session 鉴权 + bcryptjs 密码哈希
- xss 包服务端过滤
- `requireAuth` / `requireAdmin` 中间件
- seed 脚本（初始化管理员账号 + 示例建筑）

## 待实现

- 真实前端对接（替换 mock-store）
- 完整业务逻辑（搜索、比较、watchlist 聚合等）
- 完整错误处理与表单校验
- 演示账号与完整 seed 数据
- 生产环境 SESSION_SECRET 配置

## 目录说明

- `app.js`：应用入口，注册中间件和路由，监听 3001 端口
- `config/`：MongoDB 连接单例、集合访问器、配置项
- `data/`：每个集合一个文件，`index.js` 统一导出，`validation.js` 校验
- `routes/`：按功能域拆分，`index.js` 统一注册
- `middleware/`：`requireAuth`、`requireAdmin`
- `tasks/`：`seed.js` 初始化数据库

## 运行

1. `npm install`
2. `npm run seed`（可选，初始化数据库）
3. `npm start`

默认运行在 `http://localhost:3001`。

## 默认 seed 账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | Admin1234! | admin |
