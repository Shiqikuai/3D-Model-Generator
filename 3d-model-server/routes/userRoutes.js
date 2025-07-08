/**
 * 用户路由模块
 * 处理用户相关的API请求，包括注册和登录功能
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用户注册路由
// POST /api/user/register
// 请求体: { username: string, password: string }
router.post('/register', userController.register);

// 用户登录路由
// POST /api/user/login
// 请求体: { username: string, password: string }
router.post('/login', userController.login);

// 更新用户信息
// PUT /api/user/:id
// 请求体: { username: string, password: string }
router.put('/:id', userController.updateUser);

// 删除用户
// DELETE /api/user/:id
router.delete('/:id', userController.deleteUser);

// 搜索用户
// GET /api/user/search/:id
// 参数: id - 用户ID
// 返回: 用户信息（id、用户名、密码）
router.get('/search/:id?', userController.searchUser);

// 获取用户信息和模型数据
router.get('/profile/:id', userController.getUserProfile);

module.exports = router; 