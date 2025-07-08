# 3d-model-server

这是一个基于 Node.js 和 Express 的 3D 模型服务器后端项目，提供 3D 模型数据的管理、存储和访问接口。

## 功能特点

- Express 框架构建的 RESTful API
- MySQL 数据库存储 3D 模型元数据
- 文件上传和存储系统
- 模型版本控制
- 用户认证和权限管理
- 跨域支持
- 请求日志和错误处理
- Swagger API 文档

## 技术栈

- Node.js
- Express.js
- MySQL
- bcryptjs (密码加密)
- Swagger (API 文档)
- EJS (模板引擎)

## 安装

1. 克隆项目
```bash
git clone [your-repository-url]
cd 3d-model-server
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制 `.env.example` 文件为 `.env`，并修改以下配置：
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=3d_models_db
JWT_SECRET=your_jwt_secret
UPLOAD_DIR=./uploads
```

4. 启动项目
```bash
# 开发环境（带热重载）
npm run dev

# 生产环境
npm start
```

## 项目结构

```
├── app.js              # 主应用文件
├── config/            # 配置文件
│   ├── database.js    # 数据库配置
│   └── swagger.js     # API 文档配置
├── controllers/       # 控制器
│   ├── modelController.js
│   ├── userController.js
│   └── authController.js
├── routes/           # 路由
│   ├── modelRoutes.js
│   ├── userRoutes.js
│   └── authRoutes.js
├── models/           # 数据模型
├── middleware/       # 中间件
│   ├── auth.js
│   └── upload.js
├── public/          # 静态文件
└── .env             # 环境变量
```

## API 文档

访问 `http://localhost:3000/api-docs` 查看完整的 API 文档。

主要 API 端点：
- `/api/models` - 3D 模型管理
- `/api/users` - 用户管理
- `/api/auth` - 认证相关

## 开发指南

1. 确保已安装 Node.js (v14+) 和 MySQL (v8+)
2. 创建数据库：
```sql
CREATE DATABASE 3d_models_db;
```
3. 运行数据库迁移（如果适用）
4. 启动开发服务器

## 贡献

欢迎提交 Pull Request 或创建 Issue。在提交代码前，请确保：
1. 代码符合项目规范
2. 添加了必要的测试
3. 更新了相关文档

## 许可证

MIT License 