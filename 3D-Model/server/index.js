const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const port = 3001;

// 配置跨域
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置静态文件服务
app.use(express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.glb')) {
            res.setHeader('Content-Type', 'model/gltf-binary');
        }
    }
}));

// 确保 models 目录存在
const modelsDir = path.join(__dirname, '../public/models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, modelsDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        cb(null, `model-${timestamp}.glb`);
    }
});

const upload = multer({ storage: storage });

// 代理下载端点
app.post('/api/download-model', async (req, res) => {
    try {
        const { modelUrl } = req.body;
        if (!modelUrl) {
            return res.status(400).json({ success: false, message: 'Model URL is required' });
        }

        // 从腾讯云 COS 下载文件
        const response = await axios({
            method: 'get',
            url: modelUrl,
            responseType: 'stream'
        });

        // 生成文件名
        const timestamp = Date.now();
        const filename = `model-${timestamp}.glb`;
        const relativePath = `public/models/${filename}`;
        const filePath = path.join(__dirname, '..', relativePath);

        // 创建写入流
        const writer = fs.createWriteStream(filePath);

        // 将响应流写入文件
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                res.json({
                    success: true,
                    message: 'Model downloaded and saved successfully',
                    fileUrl: `/models/${filename}`,
                    relativePath: relativePath
                });
                resolve();
            });

            writer.on('error', (err) => {
                console.error('Error writing file:', err);
                res.status(500).json({ success: false, message: 'Error saving model file' });
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error downloading model:', error);
        res.status(500).json({ success: false, message: 'Error downloading model' });
    }
});

// 保存模型的 API 端点
app.post('/api/save-model', upload.single('model'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = `/models/${req.file.filename}`;
        res.json({
            success: true,
            message: 'Model saved successfully',
            fileUrl: fileUrl
        });
    } catch (error) {
        console.error('Error saving model:', error);
        res.status(500).json({ success: false, message: 'Error saving model' });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 