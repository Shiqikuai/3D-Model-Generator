const db = require('../config/database');

// 用户注册
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 检查用户名是否已存在
        const [existingUsers] = await db.query('SELECT id FROM user WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 创建新用户
        const [result] = await db.query(
            'INSERT INTO user (username, password) VALUES (?, ?)',
            [username, password]
        );

        res.status(201).json({
            message: '注册成功',
            userId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const [users] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        const user = users[0];

        // 验证密码
        if (password !== user.password) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        res.json({
            message: '登录成功',
            userId: user.id,
            username: user.username
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;

        // 检查用户是否存在
        const [existingUsers] = await db.query('SELECT id FROM user WHERE id = ?', [id]);
        if (existingUsers.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 如果提供了新密码，则更新
        let updateQuery = 'UPDATE user SET username = ?';
        let queryParams = [username];
        
        if (password) {
            updateQuery += ', password = ?';
            queryParams.push(password);
        }
        
        updateQuery += ' WHERE id = ?';
        queryParams.push(id);

        await db.query(updateQuery, queryParams);
        
        res.json({ message: '用户信息更新成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 删除用户
exports.deleteUser = async (req, res) => {
    let connection;
    try {
        // 获取数据库连接
        connection = await db.getConnection();
        const { id } = req.params;
        console.log('Starting deletion process for user ID:', id);

        // 1. 检查用户是否存在
        const [existingUsers] = await connection.query('SELECT id FROM user WHERE id = ?', [id]);
        if (existingUsers.length === 0) {
            console.log('User not found with ID:', id);
            return res.status(404).json({ message: '用户不存在' });
        }

        // 2. 开始事务
        await connection.beginTransaction();

        try {
            // 3. 检查3d_models表是否存在，如果存在则删除相关数据
            const [tables] = await connection.query("SHOW TABLES LIKE '3d_models'");
            if (tables.length > 0) {
                await connection.query('DELETE FROM 3d_models WHERE user_id = ?', [id]);
                console.log('Deleted 3d_models records for user:', id);
            }
        } catch (modelError) {
            console.log('3d_models table does not exist or error accessing it:', modelError.message);
            // 继续执行，不中断删除过程
        }

        // 4. 删除用户
        await connection.query('DELETE FROM user WHERE id = ?', [id]);
        console.log('Deleted user:', id);

        // 5. 提交事务
        await connection.commit();
        console.log('Transaction committed successfully');
        
        res.json({ message: '用户已成功删除' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        
        // 如果事务已经开始，则回滚
        if (connection) {
            try {
                await connection.rollback();
                console.log('Transaction rolled back');
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }

        // 检查具体的错误类型
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(400).json({ 
                message: '无法删除用户，该用户有关联的数据' 
            });
        } else if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
            res.status(500).json({ 
                message: '操作超时，请稍后重试' 
            });
        } else {
            res.status(500).json({ 
                message: '删除失败',
                error: error.message 
            });
        }
    } finally {
        // 释放连接
        if (connection) {
            try {
                connection.release();
                console.log('Database connection released');
            } catch (releaseError) {
                console.error('Error releasing connection:', releaseError);
            }
        }
    }
};

// 搜索用户
exports.searchUser = async (req, res) => {
    try {
        const id = req.params.id;

        // 如果ID为空，返回所有用户
        if (!id) {
            const [users] = await db.query('SELECT id, username, password FROM user');
            return res.json({
                success: true,
                data: users
            });
        }

        // 检查用户是否存在
        const [users] = await db.query('SELECT id, username, password FROM user WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: '用户不存在' 
            });
        }

        const user = users[0];
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: '服务器错误',
            error: error.message 
        });
    }
};

// 获取用户信息和模型数据
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        // 检查用户是否存在
        const [users] = await db.query('SELECT id, username FROM user WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 获取用户的所有模型
        const [models] = await db.query('SELECT model_path FROM 3d_models WHERE user_id = ?', [userId]);

        res.json({
            success: true,
            data: {
                user: {
                    id: users[0].id,
                    username: users[0].username
                },
                models: models.map(model => model.model_path)
            }
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误',
            error: error.message
        });
    }
}; 