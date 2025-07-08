/**
 * 3D模型路由模块
 * 处理3D模型相关的API请求，包括获取用户模型等功能
 */

const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');

// 获取3D模型列表
// GET /api/models/:userId?
// 参数: userId - 用户ID（可选）
// 返回: 若userId为空，返回所有3D模型路径列表；若userId存在，返回该用户的所有3D模型路径列表
router.get('/:userId?', modelController.getUserModels);

// 创建新的3D模型
// POST /api/models/:userId
// 参数: userId - 用户ID
// 请求体: { model_path: string } - 模型路径
// 返回: 创建的模型信息
router.post('/:userId', modelController.createModel);

// 删除3D模型
// DELETE /api/models/:modelId
// 参数: modelId - 模型ID
// 返回: 删除操作的结果
router.delete('/:modelId', modelController.deleteModel);

module.exports = router; 