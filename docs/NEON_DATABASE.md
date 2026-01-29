# 使用 Neon 数据库连接说明

出现 **P1001: Can't reach database server** 或 **P1017: Server has closed the connection** 时，通常不是数据库宕机，而是下面原因。

## 1. 必须开启 SSL

Neon 只接受 SSL 连接。在 `.env` 的 `DATABASE_URL` 里**必须**带上：

- `?sslmode=require`

如果当前是：

```txt
postgresql://user:pass@ep-rapid-base-ahdykuyf-pooler.c-3.us-east-1.aws.neon.tech:5432/neondb
```

请改成（注意保留你自己的用户名、密码等）：

```txt
postgresql://user:pass@ep-rapid-base-ahdykuyf-pooler.c-3.us-east-1.aws.neon.tech:5432/neondb?sslmode=require
```

推荐再加上连接超时（更稳定）：

```txt
postgresql://user:pass@ep-rapid-base-ahdykuyf-pooler.c-3.us-east-1.aws.neon.tech:5432/neondb?sslmode=require&connect_timeout=15
```

## 2. 冷启动导致超时（最可能）

Neon 免费版在**约 5 分钟无请求**后会把计算实例挂起，第一次连接需要几秒「唤醒」，Prisma 默认连接超时只有 5 秒，容易报 P1001。

**做法：** 在 `DATABASE_URL` 里增加 `connect_timeout=15`（或更大，单位秒），例如：

```txt
postgresql://user:password@ep-rapid-base-ahdykuyf-pooler.c-3.us-east-1.aws.neon.tech:5432/neondb?sslmode=require&connect_timeout=15
```

如果仍有超时，可以试 `connect_timeout=30`。

## 3. Pooler + 连接限制（避免 P1017）

Neon 的 pooler 在空闲或高频请求时可能回收连接，导致 Prisma 报 **P1017**。

**做法：** 在 `DATABASE_URL` 里加上 `pgbouncer=true&connection_limit=1`，示例：

```txt
postgresql://user:password@ep-rapid-base-ahdykuyf-pooler.c-3.us-east-1.aws.neon.tech:5432/neondb?sslmode=require&connect_timeout=15&pgbouncer=true&connection_limit=1
```

## 推荐 .env 示例（Neon）

把下面的 `user`、`password` 等换成你在 Neon 控制台里看到的实际值：

```env
# 末尾建议带 ?sslmode=require&connect_timeout=15&pgbouncer=true&connection_limit=1
DATABASE_URL="postgresql://user:password@ep-rapid-base-ahdykuyf-pooler.c-3.us-east-1.aws.neon.tech:5432/neondb?sslmode=require&connect_timeout=15&pgbouncer=true&connection_limit=1"
```

修改保存后，再执行：

```bash
npx prisma db push
```

## 若仍连不上：用「直连」做 db push

Neon 有两类地址：

- **Pooler（带 -pooler）**：`ep-xxx-pooler.xxx.aws.neon.tech`，适合应用跑 SQL
- **直连（不带 -pooler）**：`ep-xxx.xxx.aws.neon.tech`，适合执行 `prisma db push` / `prisma migrate`

你当前用的是 pooler 地址。可以试一下用**直连**只跑一次 `db push`：

1. 在 Neon 控制台点 **Connect**，选择 **Direct connection**（或把连接串里的 host 从带 `-pooler` 改成不带 `-pooler` 的同一项目地址）。
2. 把该直连地址**同样**加上 `?sslmode=require&connect_timeout=15`，临时写入 `.env` 的 `DATABASE_URL`（或新开一个环境变量，只在这条命令里用）。
3. 执行：

   ```bash
   npx prisma db push
   ```
4. 成功后，把 `.env` 里的 `DATABASE_URL` 改回原来的 **pooler** 地址（仍带 `?sslmode=require&connect_timeout=15`），日常开发和应用都用 pooler 即可。

## 小结

- 数据库服务正常时，P1001 多半是：**没加 SSL** 或 **冷启动超时**。
- 若报 P1017，可在 `DATABASE_URL` 加上 **`pgbouncer=true&connection_limit=1`**。
- 推荐组合：**`?sslmode=require&connect_timeout=15&pgbouncer=true&connection_limit=1`**。
