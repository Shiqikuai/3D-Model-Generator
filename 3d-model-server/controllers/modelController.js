const db = require('../config/database');

// 获取用户的3D模型
exports.getUserModels = async (req, res) => {
    try {
        const userId = req.params.userId;

        // 如果userId为空，返回所有3D模型
        if (!userId) {
            const [models] = await db.query('SELECT * FROM 3d_models');
            return res.json({
                success: true,
                data: models.map(model => ({
                    user_id: model.user_id,
                    model_path: model.model_path
                }))
            });
        }

        // 检查用户是否存在
        const [users] = await db.query('SELECT id FROM user WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 获取指定用户的3D模型
        const [models] = await db.query('SELECT model_path FROM 3d_models WHERE user_id = ?', [userId]);
        
        res.json({
            success: true,
            data: models.map(model => ({
                user_id: userId,
                model_path: model.model_path
            }))
        });
    } catch (error) {
        console.error('Error in getUserModels:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
};

// 创建新的3D模型
exports.createModel = async (req, res) => {
    try {
        const { userId } = req.params;
        const { model_path } = req.body;

        // 检查用户是否存在
        const [users] = await db.query('SELECT id FROM user WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 创建新模型
        const [result] = await db.query(
            'INSERT INTO 3d_models (user_id, model_path) VALUES (?, ?)',
            [userId, model_path]
        );

        res.status(201).json({
            success: true,
            message: '模型创建成功',
            data: {
                id: result.insertId,
                user_id: userId,
                model_path: model_path
            }
        });
    } catch (error) {
        console.error('Error in createModel:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
};

// 删除3D模型
exports.deleteModel = async (req, res) => {
    try {
        const { modelId } = req.params;

        // 检查模型是否存在
        const [models] = await db.query('SELECT id FROM 3d_models WHERE id = ?', [modelId]);
        if (models.length === 0) {
            return res.status(404).json({
                success: false,
                message: '模型不存在'
            });
        }

        // 删除模型
        await db.query('DELETE FROM 3d_models WHERE id = ?', [modelId]);

        res.json({
            success: true,
            message: '模型删除成功'
        });
    } catch (error) {
        console.error('Error in deleteModel:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
}; 