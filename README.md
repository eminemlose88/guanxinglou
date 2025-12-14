# 观星楼2 部署说明

## 技术栈
- 静态页面：HTML/CSS/JS（深色主题，卡片栅格）
- 认证与数据：Supabase（Auth + Postgres + RLS）
- 部署与后端集成：Vercel（Serverless API 路由）

## 环境变量（Vercel）
- `SUPABASE_URL`：你的 Supabase 实例 URL
- `SUPABASE_ANON_KEY`：Supabase 公钥（客户端使用）
- `SUPABASE_SERVICE_ROLE_KEY`：Service Role Key（后端函数使用，保密）

## API 路由
- `GET /api/profiles`：返回已发布的资料列表
- `POST /api/profiles`：创建资料（后端使用 Service Role 插入）
- `GET /api/config`：注入客户端 Supabase 配置（仅返回公钥与 URL）

## 本地开发
```bash
npm install
```
使用任意静态服务器打开 `index.html` 预览页面；`api/*` 仅在 Vercel 环境生效。

## 数据库
在 Supabase SQL 编辑器运行 `supabase/schema.sql`，创建 `profiles` 表与 RLS 策略。

## 登录
- 客户端使用 Supabase Auth `signInWithPassword`（手机号自动加 +86 前缀）
- 未登录访问 `must-read.html` / `selection.html` 会跳转登陆页

## 部署到 Vercel
1. 推送到 GitHub 仓库
2. Vercel 导入仓库，设置环境变量
3. 部署完成后即可访问

