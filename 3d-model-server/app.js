const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./public/swagger.json');
require('dotenv').config();

const app = express();

// 设置视图引擎
app.set('view engine', 'ejs');
app.set('views', './views');

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 提供静态文件
app.use(express.static('public'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 引入路由
const userRoutes = require('./routes/userRoutes');        // 用户相关路由（注册、登录等）
const dataViewRoutes = require('./routes/dataViewRoutes'); // 数据视图路由（数据视图页面）
const modelRoutes = require('./routes/modelRoutes');      // 3D模型相关路由（模型管理）

// 使用路由
app.use('/api/user', userRoutes);        // 用户API路由，处理用户注册、登录等操作
app.use('/api/models', modelRoutes);     // 3D模型API路由，处理模型的上传、获取等操作
app.use('/', dataViewRoutes);            // 数据视图路由，提供数据视图页面

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 