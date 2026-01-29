# AI任务系统

一个基于Nuxt.js的AI任务系统，管理员可以发布任务，用户通过与AI对话完成任务并获得积分。

## 功能特性

- 用户注册和登录
- 管理员发布任务（设定AI角色和任务目标）
- 用户与AI对话完成任务
- AI自动评估任务完成情况
- 积分奖励系统
- 简洁美观的UI界面

## 技术栈

- **框架**: Nuxt.js 3
- **数据库**: PostgreSQL (通过Prisma ORM)
- **AI模型**: DeepSeek Chat
- **认证**: JWT
- **密码加密**: bcryptjs

## 环境要求

- Node.js 18+
- PostgreSQL数据库
- DeepSeek API Key

## 安装步骤

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
复制 `.env.example` 为 `.env` 并填写以下配置：
```
DATABASE_URL="postgresql://user:password@localhost:5432/ai_task_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
DEEPSEEK_API_KEY="sk-your-deepseek-api-key"
DEEPSEEK_API_BASE="https://api.deepseek.com"
```

   **使用 Neon 时**：建议 `DATABASE_URL` 末尾加上 `?sslmode=require&connect_timeout=15&pgbouncer=true&connection_limit=1`，否则容易报 P1001 / P1017。详见 [docs/NEON_DATABASE.md](docs/NEON_DATABASE.md)。

3. 初始化数据库：
```bash
npx prisma generate
npx prisma db push
```

4. 创建管理员用户（可选）：
可以通过注册页面注册，然后在数据库中手动将 `isAdmin` 字段设置为 `true`。

5. 启动开发服务器：
```bash
npm run dev
```

访问 http://localhost:3000

## 使用说明

### 管理员操作

1. 登录后访问 `/admin` 页面
2. 填写任务信息：
   - 任务标题
   - 任务描述
   - AI角色设定（例如：你是秦桧，一个历史人物）
   - 任务目标（例如：让AI给岳飞道歉）
   - 最大积分
3. 点击"创建任务"

### 用户操作

1. 注册/登录账号
2. 在首页查看任务列表
3. 点击"开始任务"进入任务页面
4. 与AI对话，尝试达成任务目标
5. 点击"提交任务"让AI评估完成情况
6. 根据完成度获得积分奖励

## 项目结构

```
├── server/
│   ├── api/          # API路由
│   ├── utils/        # 工具函数（数据库、认证、AI）
│   └── middleware/   # 中间件
├── pages/            # 页面
├── composables/      # 组合式函数
├── assets/           # 静态资源
└── prisma/           # 数据库schema
```

## 注意事项

- 确保数据库连接正常
- 确保DeepSeek API Key有效且有足够余额
- 生产环境请修改JWT_SECRET
- 建议使用HTTPS部署

## DeepSeek API配置

系统使用DeepSeek API，需要：
1. 在 [DeepSeek官网](https://www.deepseek.com/) 注册账号
2. 获取API Key
3. 在 `.env` 文件中配置 `DEEPSEEK_API_KEY`
4. `DEEPSEEK_API_BASE` 默认为 `https://api.deepseek.com`，一般无需修改
