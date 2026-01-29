# 快速启动指南

## ✅ 系统已完成并测试通过

所有功能已实现并通过构建测试：
- ✓ 项目结构完整
- ✓ 所有依赖已安装
- ✓ 代码编译通过
- ✓ 无语法错误

## 🚀 启动步骤

### 1. 配置环境变量

确保 `.env` 文件包含以下配置：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_task_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
DEEPSEEK_API_KEY="sk-your-deepseek-api-key"
DEEPSEEK_API_BASE="https://api.deepseek.com"
```

**使用 Neon 时**：建议 `DATABASE_URL` 末尾加上 `?sslmode=require&connect_timeout=15&pgbouncer=true&connection_limit=1`，避免 P1001 / P1017。详见 [docs/NEON_DATABASE.md](docs/NEON_DATABASE.md)。

### 2. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📋 功能说明

### 用户功能
1. **注册/登录** - 访问 `/login` 页面
2. **查看任务** - 首页显示所有可用任务
3. **执行任务** - 点击任务进入对话页面，与AI对话完成任务
4. **获得积分** - 完成任务后根据完成度获得积分奖励

### 管理员功能
1. **访问后台** - 登录后点击"管理后台"按钮
2. **创建任务** - 填写任务信息：
   - 任务标题
   - 任务描述
   - AI角色设定（例如：你是秦桧，一个历史人物）
   - 任务目标（例如：让AI给岳飞道歉）
   - 最大积分
3. **管理任务** - 查看所有任务列表

## 🎯 示例任务

### 任务1：让AI道歉
- **角色设定**：你是秦桧，一个历史人物
- **任务目标**：让AI给岳飞道歉
- **最大积分**：100

### 任务2：说服AI买奶茶
- **角色设定**：你是一个支付宝
- **任务目标**：说服AI给我买一杯奶茶
- **最大积分**：100

## 🔧 创建管理员账号

1. 先注册一个普通账号
2. 在数据库中执行：
```sql
UPDATE "User" SET "isAdmin" = true WHERE username = 'your_username';
```

或者使用Prisma Studio：
```bash
npx prisma studio
```

## 📝 注意事项

- 确保数据库连接正常
- 确保DeepSeek API Key有效且有足够余额
- 生产环境请修改JWT_SECRET
- 建议使用HTTPS部署
- DeepSeek API Base URL默认为 `https://api.deepseek.com`，一般无需修改

## 🐛 故障排除

### 数据库连接失败
- 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
- 确保数据库服务正在运行
- 检查网络连接

### DeepSeek API错误
- 检查 `.env` 文件中的 `DEEPSEEK_API_KEY` 是否正确
- 确保API Key有足够余额
- 检查网络连接
- 确认 `DEEPSEEK_API_BASE` 配置正确（默认为 `https://api.deepseek.com`）

### 构建错误
- 运行 `npm install` 重新安装依赖
- 运行 `npx prisma generate` 重新生成Prisma客户端
- 清除 `.nuxt` 和 `.output` 目录后重新构建
