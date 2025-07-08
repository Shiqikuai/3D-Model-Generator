# My Vue2 Project

这是一个基于 Vue 2.x 的前端项目，集成了 Three.js 3D 渲染、Element UI 组件库等功能。

## 项目特点

- 基于 Vue 2.6.14 开发
- 使用 Element UI 作为 UI 组件库
- 集成 Three.js 用于 3D 渲染
- 使用 GSAP 动画库
- 支持前后端分离开发

## 技术栈

- Vue 2.6.14
- Vue Router 3.6.5
- Element UI 2.15.14
- Three.js 0.161.0
- GSAP 3.12.7
- Axios 1.8.4

## 开发环境要求

- Node.js (推荐使用 LTS 版本)
- npm 或 yarn

## 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## 项目脚本

- `npm run serve` - 启动前端开发服务器
- `npm run build` - 构建生产环境代码
- `npm run lint` - 运行代码检查
- `npm run server` - 启动后端服务器
- `npm run dev` - 同时启动前后端服务

## 项目结构

```
my-vue2-project/
├── public/          # 静态资源
├── src/             # 源代码
├── server/          # 后端服务
├── node_modules/    # 依赖包
├── package.json     # 项目配置
├── vue.config.js    # Vue 配置
└── babel.config.js  # Babel 配置
```

## 开发规范

- 使用 ESLint 进行代码规范检查
- 遵循 Vue 官方风格指南
- 使用 Element UI 组件库进行界面开发

## 浏览器支持

- 支持所有现代浏览器
- 支持 IE 11 及以上版本

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)
