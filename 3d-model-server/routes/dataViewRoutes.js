/**
 * 数据视图路由模块
 * 处理数据查看相关的页面请求，提供数据视图界面
 */

const express = require('express');
const router = express.Router();
const dataViewController = require('../controllers/dataViewController');

// 获取数据视图页面
// GET /database
// 返回: 渲染数据视图页面，包含数据信息和3D模型信息
router.get('/database', dataViewController.getUsers);

module.exports = router; 