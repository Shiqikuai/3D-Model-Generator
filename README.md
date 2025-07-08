# 3D Model Generator

本项目为一个 3D 模型生成与管理平台，包含前端和后端两部分，支持用户注册、登录、3D模型展示与管理。

## 项目结构

```
├── 3D-Model/           # 前端 Vue3 + Three.js 项目
│   ├── src/            # 前端源码
│   └── server/         # 前端本地开发服务器
├── 3d-model-server/    # 后端 Node.js + Express + MySQL 服务
│   ├── controllers/    # 控制器
│   ├── routes/         # 路由
│   ├── views/          # 视图模板
│   └── config/         # 数据库配置
├── 3d_user_models.sql  # MySQL 数据库建表脚本
└── README.md           # 项目说明
```

## 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/Shiqikuai/3D-Model-Generator.git
cd 3D-Model-Generator
```

### 2. 安装依赖
#### 前端
```bash
cd 3D-Model
npm install
```
#### 后端
```bash
cd ../3d-model-server
npm install
```

### 3. 配置数据库
- 使用 `3d_user_models.sql` 初始化 MySQL 数据库。
- 修改 `3d-model-server/config/database.js`，配置数据库连接信息。

### 4. 启动服务
#### 启动后端
```bash
cd 3d-model-server
node app.js
```
#### 启动前端
```bash
cd ../3D-Model
npm run serve
```

前端默认运行在 http://localhost:8080 ，后端默认运行在 http://localhost:3000。

## 技术栈
- 前端：Vue3, Three.js, Element Plus
- 后端：Node.js, Express, MySQL

## 主要功能
- 用户注册/登录/个人信息管理
- 3D模型上传、展示与管理
- 数据可视化

## 贡献
欢迎 issue 和 PR！ 