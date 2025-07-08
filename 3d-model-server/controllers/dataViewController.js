const db = require('../config/database');

exports.getUsers = async (req, res) => {
    try {
        // 获取所有用户数据
        const [users] = await db.query('SELECT id, username, password FROM user');
        
        // 获取所有3D模型数据
        const [models] = await db.query('SELECT * FROM 3d_models');

        res.render('users', { 
            users: users,
            models: models
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
}; 