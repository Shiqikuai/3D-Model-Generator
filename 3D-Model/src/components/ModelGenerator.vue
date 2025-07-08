<template>
    <div class="model-generator">
        <div class="tooltip" ref="tooltip" :style="tooltipStyle">{{ tooltipText }}</div>
        <nav class="navbar">
            <div class="nav-brand">
                <i class="fas fa-cube"></i>
                <span>3D Model Generator</span>
            </div>
            <div class="nav-actions">
                <button class="nav-btn profile-btn" @click="goToProfile">
                    <i class="fas fa-user-circle"></i>
                    <span>个人信息</span>
                </button>
                <template v-if="isLoggedIn">
                    <div class="user-info-container" @mouseenter="showLogoutMenu = true" @mouseleave="handleMouseLeave">
                        <div class="user-info">
                            <i class="fas fa-user"></i>
                            <span>{{ username }}</span>
                        </div>
                        <div class="logout-menu" v-if="showLogoutMenu" @mouseenter="showLogoutMenu = true"
                            @mouseleave="handleMouseLeave">
                            <button class="logout-btn" @click="handleLogout">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>退出登录</span>
                            </button>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <button class="nav-btn" @click="goToLogin">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>登录</span>
                    </button>
                    <button class="nav-btn" @click="goToRegister">
                        <i class="fas fa-user-plus"></i>
                        <span>注册</span>
                    </button>
                </template>
            </div>
        </nav>

        <div class="header">
            <h1 class="title">
                <i class="fas fa-cube"></i>
                使用TRELLIS将图像转换为3D资产
            </h1>
        </div>

        <!-- 新增轮播区域 -->
        <div class="carousel-section">
            <div class="carousel-container">
                <div class="carousel-header">
                    <h2 class="carousel-title">
                        <i class="fas fa-images"></i>
                        精选3D模型展示
                    </h2>
                    <div class="carousel-controls">
                        <button class="carousel-btn prev-btn" @click="prevModel">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="carousel-btn next-btn" @click="nextModel">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="carousel-content">
                    <div class="carousel-item" v-for="(model, index) in carouselModels" :key="index"
                        :class="{ 'active': currentCarouselIndex === index }">
                        <div class="carousel-model-container" ref="carouselModelContainer"></div>
                        <div class="carousel-model-info">
                            <h3>{{ model.name }}</h3>
                            <p>{{ model.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="instructions">
            <div class="instruction-card hover-card">
                <div class="instruction-step hover-step">
                    <div class="step-icon hover-icon">
                        <i class="fas fa-upload"></i>
                    </div>
                    <p class="hover-text">上传图像并点击"生成"以创建3D资产。如果图像具有透明通道，将用作蒙版。否则，我们将使用rembg移除背景。</p>
                </div>
                <div class="instruction-step hover-step">
                    <div class="step-icon hover-icon">
                        <i class="fas fa-download"></i>
                    </div>
                    <p class="hover-text">如果您对生成的3D资产满意，点击"提取GLB"以提取GLB文件并下载。</p>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="input-section">
                <div class="upload-area" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
                    @drop.prevent="handleDrop" :class="{ 'drag-over': isDragging, 'disabled': isLoading }">
                    <div class="dropzone">
                        <div class="upload-placeholder" v-if="!previewImage && !isPreprocessing">
                            <i class="fas fa-cloud-upload-alt upload-icon"></i>
                            <h3>将图像拖放到此处</h3>
                        </div>
                        <div v-if="isPreprocessing" class="preprocessing-overlay">
                            <div class="loading-spinner"></div>
                            <p class="preprocessing-text">正在处理图片...</p>
                        </div>
                        <img v-if="previewImage && !isPreprocessing" :src="previewImage" class="upload-image" alt="预览图">
                    </div>
                    <div class="upload-controls">
                        <button class="control-btn upload-btn" @click="openFileDialog" title="打开文件"
                            @mouseenter="showTooltip($event, '从本地文件夹选择图片上传')" @mouseleave="hideTooltip"
                            :disabled="isLoading">
                            <i class="fas fa-folder-open"></i>
                        </button>
                        <button class="control-btn upload-btn camera-btn" @click="openCamera" title="拍照"
                            @mouseenter="showTooltip($event, '使用摄像头拍照上传')" @mouseleave="hideTooltip"
                            :disabled="isLoading">
                            <i class="fas fa-camera"></i>
                        </button>
                        <div class="generate-btn-container">
                            <button class="action-btn generate-btn" @click="generateModel"
                                :disabled="!selectedFile || isLoading" :class="{ 'no-animation': selectedFile }">
                                <i class="fas fa-wand-magic-sparkles"></i>
                                {{ isLoading ? '生成中...' : '生成' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="model-section">
                <div class="model-header">
                    <h3 class="section-title breathing-title">
                        <span class="title-text">生成的3D资产</span>
                    </h3>
                    <div class="model-actions">
                        <button :disabled="!model || !isLoggedIn" @click="saveModel">
                            <i class="fas fa-save"></i>
                            <span>保存</span>
                        </button>
                        <button class="action-btn extract-btn" @click="extractGLB" :disabled="!model">
                            <i class="fas fa-cube"></i>
                            <span>提取GLB</span>
                        </button>
                    </div>
                </div>
                <div class="model-area">
                    <div v-if="isLoading" class="generating-overlay">
                        <div class="double-spinner">
                            <div class="spinner-outer"></div>
                            <div class="spinner-inner"></div>
                        </div>
                        <p class="generating-text">正在生成3D模型...</p>
                    </div>
                    <div v-if="errorMessage" class="error-overlay">
                        <i class="fas fa-exclamation-circle error-icon"></i>
                        <p>{{ errorMessage }}</p>
                        <button class="retry-button" @click="generateModel">重试</button>
                    </div>
                </div>
                <div class="model-controls">
                    <button class="control-btn" @click="rotateModel('up')" title="向上旋转">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="control-btn" @click="rotateModel('down')" title="向下旋转">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="control-btn" @click="rotateModel('left')" title="向左旋转">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="control-btn" @click="rotateModel('right')" title="向右旋转">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="control-btn" @click="zoomModel('in')" title="放大">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button class="control-btn" @click="zoomModel('out')" title="缩小">
                        <i class="fas fa-search-minus"></i>
                    </button>
                    <button class="control-btn reset-btn" @click="resetModel" title="重置">
                        <i class="fas fa-sync"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="camera-modal" v-if="showCamera" @click.self="closeCamera">
            <div class="camera-container">
                <video ref="video" autoplay playsinline></video>
                <canvas ref="canvas" style="display: none;"></canvas>
                <div class="camera-controls">
                    <button class="camera-btn capture-btn" @click="capturePhoto">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button class="camera-btn close-btn" @click="closeCamera">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import { Client } from "@gradio/client";

export default {
    name: 'ModelGenerator',
    data() {
        return {
            // 文件上传相关
            selectedFile: null,        // 当前选中的文件
            previewImage: null,        // 预览图片的URL
            isDragging: false,         // 是否正在拖拽文件
            modelGenerated: false,     // 模型是否已生成
            isLoading: false,          // 是否正在加载
            errorMessage: null,        // 错误信息

            // 摄像头相关
            showCamera: false,         // 是否显示摄像头
            stream: null,              // 摄像头媒体流

            // 工具提示相关
            tooltipText: '',           // 工具提示文本
            tooltipStyle: {            // 工具提示样式
                display: 'none',
                position: 'fixed',
                zIndex: 9999
            },

            // API相关
            taskId: null,              // 任务ID
            apiKey: null,              // API密钥
            currentModelPath: null,    // 当前模型路径

            // 用户认证相关
            isLoggedIn: false,         // 是否已登录
            username: '',              // 用户名
            showLogoutMenu: false,     // 是否显示登出菜单

            scene: null,
            camera: null,
            renderer: null,
            controls: null,
            model: null,

            // 添加初始状态保存
            initialModelState: {
                position: null,
                rotation: null,
                scale: null,
                cameraPosition: null
            },

            // 轮播相关数据
            carouselModels: [
                {
                    name: '金冠',
                    path: '/models/金冠.glb',
                    description: '华贵的金冠模型，展现了古代金器的精湛工艺。'
                },
                {
                    name: '瓷瓶',
                    path: '/models/瓷瓶.glb',
                    description: '精美的瓷瓶模型，展示了古代瓷器的独特造型。'
                },
                {
                    name: '木雕佛像',
                    path: '/models/木雕佛像.glb',
                    description: '精致的木雕佛像模型，体现了古代雕刻艺术的高超技艺。'
                }
            ],
            currentCarouselIndex: 0,
            carouselScenes: [],
            carouselCameras: [],
            carouselRenderers: [],
            carouselControls: [],
            carouselAnimationFrame: null,
            carouselAutoRotateInterval: null,
            isCarouselTransitioning: false,
            carouselRotationSpeed: 0.01,
            carouselSpeedMultiplier: 1, // 添加速度乘数
            baseRotationInterval: 7000, // 基础轮播间隔
            isPreprocessing: false,    // 是否正在预处理图片
        }
    },
    created() {
        // 组件创建时检查登录状态
        this.checkLoginStatus();
    },
    mounted() {
        this.initThreeJS()
        // 加载上次渲染的模型
        const lastModelPath = localStorage.getItem('lastModelPath')
        if (lastModelPath) {
            this.loadModel(lastModelPath)
        }
        this.initCarouselModels() // 初始化轮播模型
    },
    methods: {
        /**
         * 检查用户登录状态
         * 从localStorage中获取登录信息和用户名
         */
        checkLoginStatus() {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const username = localStorage.getItem('username');
            if (isLoggedIn && username) {
                this.isLoggedIn = true;
                this.username = username;
            }
        },

        /**
         * 导航到登录页面
         */
        goToLogin() {
            this.$router.push('/login');
        },

        /**
         * 导航到注册页面
         */
        goToRegister() {
            this.$router.push('/register');
        },

        /**
         * 导航到个人资料页面
         */
        goToProfile() {
            this.$router.push('/profile');
        },

        /**
         * 处理文件上传
         * @param {Event} event - 文件上传事件
         */
        handleFileUpload(event) {
            const file = event.target.files[0];
            this.selectedFile = file;
            this.previewImage = URL.createObjectURL(file);
            this.errorMessage = null;
            this.isLoading = false;
        },

        /**
         * 处理文件拖拽进入区域
         */
        handleDragOver() {
            this.isDragging = true;
        },

        /**
         * 处理文件拖拽离开区域
         */
        handleDragLeave() {
            this.isDragging = false;
        },

        /**
         * 处理文件拖放
         * @param {Event} event - 拖放事件
         */
        async handleDrop(e) {
            this.isDragging = false;
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                await this.preprocessImage(file);
            }
        },

        /**
         * 打开文件选择对话框
         */
        async openFileDialog() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await this.preprocessImage(file);
                }
            };
            input.click();
        },

        /**
         * 生成3D模型
         * @param {Event} event - 点击事件
         */
        async generateModel(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            if (!this.selectedFile) return;
            this.isLoading = true;
            this.errorMessage = null;

            try {
                // 创建表单数据并上传文件
                const formData = new FormData();
                formData.append('file', this.selectedFile);

                console.log('开始上传图片...');
                const response = await axios({
                    method: 'post',
                    url: 'https://zhanting.zhiyousx.com/ds_api/co/image',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    },
                    withCredentials: false
                });

                console.log('图片上传响应:', response.data);

                if (response.data.success) {
                    // 保存任务ID和API密钥，开始轮询任务状态
                    this.taskId = response.data.data.taskId;
                    this.apiKey = response.data.data.apiKey;
                    await this.startPolling();
                } else {
                    throw new Error('上传图片失败');
                }
            } catch (error) {
                console.error('处理失败:', error);
                this.errorMessage = '处理失败，请重试';
                this.stopPolling();
            }
        },

        /**
         * 开始轮询任务状态
         */
        async startPolling() {
            this.stopPolling();
            console.log('开始轮询任务状态...');
            await this.checkTaskStatus();
            this.pollingInterval = setInterval(async () => {
                await this.checkTaskStatus();
            }, 15 * 1000);
        },

        /**
         * 停止轮询任务状态
         */
        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        },

        /**
         * 检查任务状态
         */
        async checkTaskStatus() {
            try {
                const response = await axios({
                    method: 'post',
                    url: 'https://zhanting.zhiyousx.com/ds_api/co/file',
                    data: {
                        taskId: this.taskId,
                        filename: new Date().getTime().toString(),
                        apiKey: this.apiKey
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    withCredentials: false
                });

                console.log('任务状态响应:', response.data);

                if (response.data.success) {
                    const taskData = response.data.data.data;
                    if (taskData.progress === 100) {
                        console.log('任务进度达到100%，准备下载模型');
                        if (taskData.output.model) {
                            console.log('获取到模型链接:', taskData.output.model);
                            this.stopPolling();
                            try {
                                await this.downloadModel(taskData.output.model);
                            } catch (error) {
                                console.error('下载模型时出错:', error);
                                this.errorMessage = '下载模型失败，请重试';
                            }
                        }
                    } else if (taskData.status === 'failed') {
                        throw new Error('任务处理失败');
                    }
                }
            } catch (error) {
                console.error('检查任务状态失败:', error);
                this.errorMessage = '检查任务状态失败，请重试';
                this.stopPolling();
            }
        },

        /**
         * 下载模型
         * @param {string} modelUrl - 模型URL
         */
        async downloadModel(modelUrl) {
            try {
                console.log('开始下载模型:', modelUrl);

                // 通过本地API下载模型
                const saveResponse = await axios({
                    method: 'post',
                    url: 'http://localhost:3001/api/download-model',
                    data: {
                        modelUrl: modelUrl
                    }
                });

                if (saveResponse.data.success) {
                    console.log('模型保存成功:', saveResponse.data.fileUrl);

                    // 先更新状态
                    this.currentModelPath = saveResponse.data.fileUrl;
                    this.modelGenerated = true;
                    this.isLoading = false;

                    // 直接加载并渲染新模型，不需要等待 nextTick
                    this.loadModel(this.currentModelPath);
                } else {
                    throw new Error(saveResponse.data.message);
                }
            } catch (error) {
                console.error('保存模型失败:', error);
                this.errorMessage = '保存模型失败，请重试';
                this.isLoading = false;
            }
        },

        /**
         * 提取GLB文件
         */
        async extractGLB() {
            try {
                // 从localStorage获取最后保存的模型路径
                const lastModelPath = localStorage.getItem('lastModelPath');
                if (!lastModelPath) {
                    console.error('No model path found in localStorage');
                    return;
                }

                // 确保使用完整的URL
                const modelUrl = `http://localhost:3001${lastModelPath}`;

                // 使用fetch获取文件
                const response = await fetch(modelUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // 获取文件blob
                const blob = await response.blob();

                // 创建下载链接
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = lastModelPath.split('/').pop() || 'model.glb';

                // 触发下载
                document.body.appendChild(link);
                link.click();

                // 清理
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading model:', error);
            }
        },

        /**
         * 打开摄像头
         */
        async openCamera() {
            try {
                this.closeCamera();

                // 请求摄像头权限
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                });

                this.showCamera = true;
                this.errorMessage = null;

                // 等待DOM更新后设置视频源
                await this.$nextTick();

                const video = this.$refs.video;
                if (video) {
                    video.srcObject = this.stream;
                    video.onloadedmetadata = () => {
                        video.play().catch(error => {
                            console.error('视频播放失败:', error);
                            this.errorMessage = '视频播放失败，请重试';
                            this.closeCamera();
                        });
                    };
                }
            } catch (error) {
                console.error('无法访问摄像头:', error);
                this.errorMessage = '无法访问摄像头，请确保已授予摄像头权限';
                this.showCamera = false;
                this.closeCamera();
            }
        },

        /**
         * 拍照
         */
        async capturePhoto() {
            if (this.stream) {
                const video = this.$refs.video;
                const canvas = this.$refs.canvas;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                
                // 先关闭摄像头
                this.closeCamera();
                
                // 然后处理图片
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], 'captured_photo.png', { type: 'image/png' });
                    await this.preprocessImage(file);
                }, 'image/png');
            }
        },

        /**
         * 关闭摄像头
         */
        closeCamera() {
            if (this.stream) {
                // 停止所有视频轨道
                this.stream.getTracks().forEach(track => {
                    track.stop();
                });
                this.stream = null;
            }

            // 清除视频源
            const video = this.$refs.video;
            if (video) {
                video.srcObject = null;
            }

            this.showCamera = false;
        },

        /**
         * 显示工具提示
         * @param {Event} event - 鼠标事件
         * @param {string} text - 提示文本
         */
        showTooltip(event, text) {
            this.tooltipText = text;
            const rect = event.target.getBoundingClientRect();
            this.tooltipStyle = {
                display: 'block',
                position: 'fixed',
                top: `${rect.top - 45}px`,
                left: `${rect.left + (rect.width / 2)}px`,
                transform: 'translateX(-50%)',
                zIndex: 9999,
                pointerEvents: 'none'
            };
        },

        /**
         * 隐藏工具提示
         */
        hideTooltip() {
            this.tooltipStyle.display = 'none';
        },

        /**
         * 处理用户登出
         */
        handleLogout() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            this.isLoggedIn = false;
            this.username = '';
            this.showLogoutMenu = false;
            window.location.reload();
        },

        /**
         * 处理鼠标离开用户信息区域
         * @param {Event} event - 鼠标事件
         */
        handleMouseLeave(event) {
            const relatedTarget = event.relatedTarget
            if (!relatedTarget ||
                (!relatedTarget.closest('.user-info-container') &&
                    !relatedTarget.closest('.logout-menu'))) {
                this.showLogoutMenu = false
            }
        },

        initThreeJS() {
            // 创建场景
            this.scene = new THREE.Scene()
            this.scene.background = new THREE.Color(0xf8fafc)

            // 创建相机
            const modelArea = this.$el.querySelector('.model-area')
            // 减小视场角，使模型看起来更自然
            this.camera = new THREE.PerspectiveCamera(45, modelArea.clientWidth / modelArea.clientHeight, 0.1, 1000)
            this.camera.position.z = 5

            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(modelArea.clientWidth, modelArea.clientHeight)
            this.renderer.setPixelRatio(window.devicePixelRatio)
            modelArea.appendChild(this.renderer.domElement)

            // 添加轨道控制器
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableDamping = true
            this.controls.dampingFactor = 0.05
            // 限制旋转角度，防止模型翻转
            this.controls.maxPolarAngle = Math.PI / 2
            this.controls.minPolarAngle = 0

            // 增强环境光
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
            this.scene.add(ambientLight)

            // 增强平行光
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
            directionalLight.position.set(1, 1, 1)
            this.scene.add(directionalLight)

            // 添加额外的点光源
            const pointLight1 = new THREE.PointLight(0xffffff, 1.2)
            pointLight1.position.set(-1, 1, 1)
            this.scene.add(pointLight1)

            const pointLight2 = new THREE.PointLight(0xffffff, 1.2)
            pointLight2.position.set(1, -1, -1)
            this.scene.add(pointLight2)

            // 添加第三个点光源
            const pointLight3 = new THREE.PointLight(0xffffff, 1.0)
            pointLight3.position.set(0, 0, 1)
            this.scene.add(pointLight3)

            // 开始动画循环
            this.animate()

            // 添加窗口大小变化监听
            window.addEventListener('resize', this.onWindowResize)
        },

        onWindowResize() {
            const modelArea = this.$el.querySelector('.model-area')
            if (!modelArea) return

            const width = modelArea.clientWidth
            const height = modelArea.clientHeight

            // 保持原始宽高比
            const aspect = width / height
            this.camera.aspect = aspect
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(width, height, false)
        },

        animate() {
            requestAnimationFrame(this.animate)
            this.controls.update()
            this.renderer.render(this.scene, this.camera)
        },

        loadModel(modelPath) {
            console.log('Loading model from path:', modelPath);
            const loader = new GLTFLoader();
            
            // 确保使用完整的URL路径
            const fullPath = modelPath.startsWith('http') ? modelPath : `http://localhost:3001${modelPath}`;
            console.log('Full model path:', fullPath);

            // 保存模型路径到localStorage
            localStorage.setItem('lastModelPath', modelPath);

            // 先清理旧模型
            if (this.model) {
                this.scene.remove(this.model);
                // 清理模型的几何体和材质
                this.model.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(material => material.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                });
                this.model = null;
            }

            loader.load(
                fullPath,
                (gltf) => {
                    this.model = gltf.scene;
                    this.scene.add(this.model);

                    // 计算模型的边界框
                    const box = new THREE.Box3().setFromObject(this.model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);

                    // 计算合适的缩放比例 - 增大缩放倍数
                    const scale = 3.0 / maxDim;
                    this.model.scale.set(scale, scale, scale);

                    // 确保模型居中显示
                    this.model.position.sub(center);

                    // 调整相机位置以更好地显示模型
                    const fov = this.camera.fov * (Math.PI / 180);
                    const cameraZ = Math.abs(maxDim * scale / 2 / Math.tan(fov / 2)) * 1.5;
                    this.camera.position.z = cameraZ;
                    this.controls.target.copy(center);
                    this.controls.update();

                    // 保存初始状态
                    this.initialModelState = {
                        position: this.model.position.clone(),
                        rotation: this.model.rotation.clone(),
                        scale: this.model.scale.clone(),
                        cameraPosition: this.camera.position.clone(),
                        controlsTarget: this.controls.target.clone()
                    };
                },
                (xhr) => {
                    // 进度回调
                    const progress = (xhr.loaded / xhr.total) * 100;
                    console.log(`Loading model: ${progress.toFixed(2)}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    this.errorMessage = '加载模型失败，请重试';
                    this.isLoading = false;
                }
            );
        },

        rotateModel(direction) {
            if (!this.model) return;

            const angle = Math.PI / 4; // 45度
            const duration = 0.5; // 动画持续时间（秒）

            switch (direction) {
                case 'left':
                    gsap.to(this.model.rotation, {
                        y: this.model.rotation.y + angle,
                        duration: duration,
                        ease: "power2.inOut"
                    });
                    break;
                case 'right':
                    gsap.to(this.model.rotation, {
                        y: this.model.rotation.y - angle,
                        duration: duration,
                        ease: "power2.inOut"
                    });
                    break;
                case 'up':
                    gsap.to(this.model.rotation, {
                        x: this.model.rotation.x + angle,
                        duration: duration,
                        ease: "power2.inOut"
                    });
                    break;
                case 'down':
                    gsap.to(this.model.rotation, {
                        x: this.model.rotation.x - angle,
                        duration: duration,
                        ease: "power2.inOut"
                    });
                    break;
            }
        },

        zoomModel(action) {
            if (!this.camera) return;

            const zoomFactor = 0.2;
            const duration = 0.5; // 动画持续时间（秒）
            const targetZ = action === 'in'
                ? this.camera.position.z * (1 - zoomFactor)
                : this.camera.position.z * (1 + zoomFactor);

            gsap.to(this.camera.position, {
                z: targetZ,
                duration: duration,
                ease: "power2.inOut"
            });
        },

        resetModel() {
            if (!this.model || !this.camera || !this.initialModelState.position) return;

            const duration = 0.8; // 动画持续时间（秒）

            // 平滑重置模型状态
            gsap.to(this.model.position, {
                x: this.initialModelState.position.x,
                y: this.initialModelState.position.y,
                z: this.initialModelState.position.z,
                duration: duration,
                ease: "power2.inOut"
            });

            gsap.to(this.model.rotation, {
                x: this.initialModelState.rotation.x,
                y: this.initialModelState.rotation.y,
                z: this.initialModelState.rotation.z,
                duration: duration,
                ease: "power2.inOut"
            });

            gsap.to(this.model.scale, {
                x: this.initialModelState.scale.x,
                y: this.initialModelState.scale.y,
                z: this.initialModelState.scale.z,
                duration: duration,
                ease: "power2.inOut"
            });

            // 平滑重置相机位置
            gsap.to(this.camera.position, {
                x: this.initialModelState.cameraPosition.x,
                y: this.initialModelState.cameraPosition.y,
                z: this.initialModelState.cameraPosition.z,
                duration: duration,
                ease: "power2.inOut",
                onComplete: () => {
                    // 重置控制器目标
                    this.controls.target.copy(this.initialModelState.controlsTarget);
                    this.controls.update();
                }
            });
        },

        /**
         * 初始化轮播3D模型
         */
        initCarouselModels() {
            this.carouselModels.forEach((model, index) => {
                const container = this.$refs.carouselModelContainer[index];
                if (!container) return;

                // 创建场景
                const scene = new THREE.Scene();
                scene.background = new THREE.Color(0xf8fafc);
                this.carouselScenes[index] = scene;

                // 创建相机
                const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
                camera.position.z = 5;
                this.carouselCameras[index] = camera;

                // 创建渲染器
                const renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                container.appendChild(renderer.domElement);
                this.carouselRenderers[index] = renderer;

                // 添加轨道控制器
                const controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.maxPolarAngle = Math.PI / 2;
                controls.minPolarAngle = 0;
                controls.enabled = false; // 禁用手动控制
                this.carouselControls[index] = controls;

                // 添加灯光
                const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
                scene.add(ambientLight);

                const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
                directionalLight.position.set(1, 1, 1);
                scene.add(directionalLight);

                // 加载模型
                const loader = new GLTFLoader();
                const fullPath = model.path.startsWith('http') ? model.path : `http://localhost:3001${model.path}`;

                loader.load(
                    fullPath,
                    (gltf) => {
                        const model = gltf.scene;
                        scene.add(model);

                        // 自动调整相机位置
                        const box = new THREE.Box3().setFromObject(model);
                        const center = box.getCenter(new THREE.Vector3());
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const fov = camera.fov * (Math.PI / 180);
                        const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.4;
                        camera.position.z = cameraZ;
                        controls.target.copy(center);
                        controls.update();
                        model.position.sub(center);

                        // 添加自动旋转
                        model.userData.autoRotate = true;
                    },
                    undefined,
                    (error) => {
                        console.error('Error loading carousel model:', error);
                    }
                );
            });

            // 开始轮播动画
            this.animateCarousel();
            // 启动自动轮播
            this.startAutoRotate();
        },

        /**
         * 启动自动轮播
         */
        startAutoRotate() {
            this.stopAutoRotate(); // 确保先停止现有的轮播
            this.carouselAutoRotateInterval = setInterval(() => {
                if (!this.isCarouselTransitioning) {
                    this.nextModel();
                }
            }, this.baseRotationInterval / this.carouselSpeedMultiplier);
        },

        /**
         * 停止自动轮播
         */
        stopAutoRotate() {
            if (this.carouselAutoRotateInterval) {
                clearInterval(this.carouselAutoRotateInterval);
                this.carouselAutoRotateInterval = null;
            }
        },

        /**
         * 切换到上一个模型
         */
        prevModel() {
            if (this.isCarouselTransitioning) return;
            this.isCarouselTransitioning = true;

            // 点击时加快轮播速度
            this.carouselSpeedMultiplier = 2;
            this.startAutoRotate();

            const oldIndex = this.currentCarouselIndex;
            this.currentCarouselIndex = (this.currentCarouselIndex - 1 + this.carouselModels.length) % this.carouselModels.length;

            this.animateTransition(oldIndex, this.currentCarouselIndex);

            // 3秒后恢复原始速度
            setTimeout(() => {
                this.carouselSpeedMultiplier = 1;
                this.startAutoRotate();
            }, 3000);
        },

        /**
         * 切换到下一个模型
         */
        nextModel() {
            if (this.isCarouselTransitioning) return;
            this.isCarouselTransitioning = true;

            // 点击时加快轮播速度
            this.carouselSpeedMultiplier = 2;
            this.startAutoRotate();

            const oldIndex = this.currentCarouselIndex;
            this.currentCarouselIndex = (this.currentCarouselIndex + 1) % this.carouselModels.length;

            this.animateTransition(oldIndex, this.currentCarouselIndex);

            // 3秒后恢复原始速度
            setTimeout(() => {
                this.carouselSpeedMultiplier = 1;
                this.startAutoRotate();
            }, 3000);
        },

        /**
         * 执行过渡动画
         */
        animateTransition(oldIndex, newIndex) {
            const oldItem = this.$el.querySelector(`.carousel-item:nth-child(${oldIndex + 1})`);
            const newItem = this.$el.querySelector(`.carousel-item:nth-child(${newIndex + 1})`);

            if (!oldItem || !newItem) return;

            // 移除之前的动画类
            oldItem.classList.remove('active', 'next', 'prev');
            newItem.classList.remove('active', 'next', 'prev');

            // 设置初始状态
            if (newIndex > oldIndex) {
                newItem.style.transform = 'translateX(100%) rotateY(-90deg)';
                oldItem.style.transform = 'translateX(0) rotateY(0)';
            } else {
                newItem.style.transform = 'translateX(-100%) rotateY(90deg)';
                oldItem.style.transform = 'translateX(0) rotateY(0)';
            }

            // 使用GSAP创建平滑的过渡动画
            const timeline = gsap.timeline({
                onComplete: () => {
                    this.isCarouselTransitioning = false;
                    oldItem.style.transform = '';
                    newItem.style.transform = '';
                    oldItem.classList.remove('active');
                    newItem.classList.add('active');
                }
            });

            // 淡出当前项
            timeline.to(oldItem, {
                x: newIndex > oldIndex ? '-100%' : '100%',
                rotateY: newIndex > oldIndex ? -90 : 90,
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut"
            });

            // 淡入新项
            timeline.fromTo(newItem,
                {
                    x: newIndex > oldIndex ? '100%' : '-100%',
                    rotateY: newIndex > oldIndex ? -90 : 90,
                    opacity: 0
                },
                {
                    x: 0,
                    rotateY: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.inOut"
                },
                "-=0.4"
            );

            // 添加3D效果
            timeline.to('.carousel-content', {
                rotationY: newIndex > oldIndex ? -5 : 5,
                duration: 0.4,
                ease: "power2.inOut"
            }, "-=0.8");

            timeline.to('.carousel-content', {
                rotationY: 0,
                duration: 0.4,
                ease: "power2.inOut"
            });
        },

        /**
         * 轮播动画
         */
        animateCarousel() {
            this.carouselAnimationFrame = requestAnimationFrame(this.animateCarousel);

            this.carouselModels.forEach((_, index) => {
                if (this.carouselControls[index]) {
                    this.carouselControls[index].update();
                }
                if (this.carouselRenderers[index] && this.carouselScenes[index] && this.carouselCameras[index]) {
                    // 更新模型旋转
                    const scene = this.carouselScenes[index];
                    scene.children.forEach(child => {
                        if (child.userData.autoRotate) {
                            child.rotation.y += this.carouselRotationSpeed;
                        }
                    });
                    this.carouselRenderers[index].render(this.carouselScenes[index], this.carouselCameras[index]);
                }
            });
        },

        async preprocessImage(file) {
            try {
                this.isPreprocessing = true;
                const client = await Client.connect("xinjjj/ImgRoboAssetGen");
                const result = await client.predict("/preprocess_image_fn", {
                    image: file
                });
                
                // 从返回的数据中获取处理后的图片URL
                if (result.data && result.data[0] && result.data[0].url) {
                    this.previewImage = result.data[0].url;
                    // 创建一个新的File对象用于后续处理
                    const response = await fetch(result.data[0].url);
                    const blob = await response.blob();
                    this.selectedFile = new File([blob], 'processed_image.png', { type: 'image/png' });
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                console.error('Image preprocessing failed:', error);
                this.errorMessage = '图片预处理失败，请重试';
            } finally {
                this.isPreprocessing = false;
            }
        },

        /**
         * 保存模型到用户账户
         */
        async saveModel() {
            try {
                const userId = localStorage.getItem('userId');
                const lastModelPath = localStorage.getItem('lastModelPath');
                
                if (!userId || !lastModelPath) {
                    console.error('用户ID或模型路径不存在');
                    return;
                }

                const response = await axios.post(`http://localhost:3000/api/models/${userId}`, {
                    model_path: `public${lastModelPath}`
                });

                if (response.data.success) {
                    console.log('模型保存成功:', response.data);
                } else {
                    console.error('模型保存失败:', response.data.message);
                }
            } catch (error) {
                console.error('保存模型时发生错误:', error);
            }
        },
    },
    beforeDestroy() {
        // 清理Three.js资源
        if (this.renderer) {
            this.renderer.dispose()
        }
        if (this.controls) {
            this.controls.dispose()
        }
        window.removeEventListener('resize', this.onWindowResize)
        // 组件销毁前关闭摄像头和停止轮询
        this.closeCamera();
        this.stopPolling();

        // 清理轮播相关资源
        this.stopAutoRotate();
        if (this.carouselAnimationFrame) {
            cancelAnimationFrame(this.carouselAnimationFrame);
        }
        this.carouselRenderers.forEach(renderer => {
            if (renderer) {
                renderer.dispose();
            }
        });
        this.carouselControls.forEach(controls => {
            if (controls) {
                controls.dispose();
            }
        });
    }
}
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    75% {
        transform: translateX(5px);
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0% {
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    }

    50% {
        box-shadow: 0 4px 25px rgba(76, 175, 80, 0.5);
    }

    100% {
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    }
}

@keyframes rotateHalo {
    0% {
        transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
    }

    50% {
        transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
    }

    100% {
        transform: translate(-50%, -50%) rotate(360deg) scale(0.8);
    }
}

@keyframes rainbowGradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideIn 0.5s ease-out;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.4em;
    font-weight: 600;
    color: #3182ce;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 8px 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-brand:hover {
    transform: scale(1.05);
    opacity: 0.9;
    background: rgba(49, 130, 206, 0.1);
}

.nav-brand i {
    font-size: 0.9em;
    transition: transform 0.3s ease;
}

.nav-brand:hover i {
    transform: rotate(15deg);
}

.title {
    animation: fadeIn 0.8s ease-out 0.3s backwards;
}

.instruction-card {
    animation: fadeIn 0.8s ease-out 0.4s backwards;
}

.upload-area {
    border: 2px dashed #cbd5e0;
    border-radius: 20px;
    padding: 30px;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    animation: fadeInUp 0.8s ease-out 0.7s backwards;
}

.upload-area::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(49, 130, 206, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.upload-area:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(49, 130, 206, 0.15);
    border-color: #3182ce;
}

.upload-area:hover::before {
    opacity: 1;
}

.upload-area.drag-over {
    border-color: #3182ce;
    transform: scale(1.02);
    box-shadow: 0 8px 30px rgba(49, 130, 206, 0.15);
}

.upload-area.drag-over::before {
    opacity: 1;
}

.dropzone {
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.3s ease;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    color: #64748b;
    animation: fadeIn 0.5s ease;
}

.upload-placeholder i {
    font-size: 64px;
    color: #3182ce;
    margin-bottom: 10px;
    opacity: 0.8;
    filter: drop-shadow(0 4px 6px rgba(49, 130, 206, 0.2));
    transition: all 0.3s ease;
}

.upload-area:hover .upload-placeholder i {
    transform: scale(1.1);
    opacity: 1;
    filter: drop-shadow(0 6px 8px rgba(49, 130, 206, 0.3));
}

.upload-placeholder h3 {
    font-size: 1.4em;
    font-weight: 500;
    color: #2d3748;
    margin: 0;
    transition: all 0.3s ease;
}

.upload-area:hover .upload-placeholder h3 {
    color: #3182ce;
    transform: translateY(-2px);
}

.upload-image {
    max-width: 100%;
    max-height: 280px;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    background: white;
    padding: 15px;
    border: 2px solid #e2e8f0;
}

.upload-area:hover .upload-image {
    transform: scale(1.03);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
    border-color: #3182ce;
}

.upload-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
    padding: 0 20px;
    animation: fadeIn 0.8s ease-out 0.8s backwards;
}

.control-btn {
    width: 48px;
    height: 48px;
    background: white;
    color: #3182ce;
    border: none;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
}

.control-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(49, 130, 206, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.control-btn:hover {
    transform: translateY(-2px);
    background: #3182ce;
    color: white;
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2);
}

.control-btn:hover::before {
    opacity: 1;
}

.control-btn i {
    font-size: 20px;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.control-btn:hover i {
    transform: scale(1.1);
}

.control-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.generate-btn-container {
    margin: 0;
    display: flex;
    justify-content: center;
    animation: fadeIn 0.8s ease-out 0.9s backwards;
}

.generate-btn {
    min-width: 120px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #00c853, #64dd17);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
    z-index: 1;
}

.generate-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent);
    transition: 0.5s;
    z-index: -1;
}

.generate-btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 50%);
    opacity: 0;
    transition: 0.5s;
    z-index: -1;
}

.generate-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 200, 83, 0.4);
    background: linear-gradient(135deg, #00e676, #76ff03);
}

.generate-btn:hover::before {
    left: 100%;
    transition: 0.5s;
}

.generate-btn:hover::after {
    opacity: 1;
    transform: scale(1.5) rotate(45deg);
}

.generate-btn:hover i {
    transform: scale(1.2) rotate(360deg);
}

.generate-btn i {
    margin-right: 8px;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.generate-btn:disabled {
    background: linear-gradient(135deg, #a0aec0, #cbd5e0);
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
}

.generate-btn:disabled::before,
.generate-btn:disabled::after {
    display: none;
}

.generate-btn:active {
    transform: translateY(-1px) scale(0.98);
}

.model-generator {
    max-width: 1200px;
    margin: 84px auto 20px;
    padding: 20px;
    position: relative;
    z-index: 1;
}

.model-generator::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg,
            rgba(255, 0, 0, 0.05),
            rgba(255, 165, 0, 0.05),
            rgba(255, 255, 0, 0.05),
            rgba(0, 255, 0, 0.05),
            rgba(0, 255, 255, 0.05),
            rgba(0, 0, 255, 0.05),
            rgba(238, 130, 238, 0.05),
            rgba(255, 0, 0, 0.05));
    background-size: 800% 800%;
    animation: rainbowBackground 20s linear infinite;
    z-index: -2;
}

@keyframes rainbowBackground {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.header {
    margin-bottom: 30px;
    text-align: center;
    animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.title {
    font-size: 2.2em;
    color: #2d3748;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 0;
    padding: 20px 0;
    animation: fadeInUp 0.8s ease-out 0.3s backwards;
}

.title i {
    color: #3182ce;
    font-size: 0.9em;
}

.instructions {
    margin-bottom: 40px;
    animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

.instruction-card {
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    animation: fadeInUp 0.8s ease-out 0.5s backwards;
}

.instruction-step {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    animation: fadeInUp 0.8s ease-out backwards;
}

.instruction-step:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 12px;
}

.instruction-step:nth-child(1) {
    animation: fadeInUp 0.8s ease-out 0.5s backwards;
}

.instruction-step:nth-child(2) {
    animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

.step-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #ebf8ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3182ce;
    animation: fadeInUp 0.8s ease-out backwards;
}

.instruction-step:nth-child(1) .step-icon {
    animation-delay: 0.3s;
}

.instruction-step:nth-child(2) .step-icon {
    animation-delay: 0.5s;
}

.step-icon i {
    font-size: 20px;
}

.instruction-step p {
    margin: 0;
    color: #4a5568;
    line-height: 1.6;
    font-size: 1.05em;
    display: flex;
    align-items: center;
    min-height: 40px;
}

.main-content {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
    animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

.input-section {
    flex: 1;
    min-width: 300px;
    animation: fadeInUp 0.8s ease-out 0.7s backwards;
}

.model-section {
    flex: 1;
    min-width: 300px;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    animation: fadeInUp 0.8s ease-out 0.8s backwards;
    display: flex;
    flex-direction: column;
}

.model-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 0 20px;
    animation: fadeIn 0.8s ease-out 1.1s backwards;
}

.model-area {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    border-radius: 12px;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.model-area canvas {
    width: 100% !important;
    height: 100% !important;
}

.loading-progress {
    font-size: 0.9em;
    color: #3182ce;
    font-weight: 500;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }

    100% {
        opacity: 1;
    }
}

.current-model-name {
    text-align: center;
    margin: 10px 0;
    padding: 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
    border-radius: 8px;
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: fadeInDown 0.5s ease-out;
}

.model-name-text {
    font-size: 1.2em;
    color: #2d3748;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.progress-container {
    width: 200px;
    height: 20px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin-top: 20px;
    position: relative;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3182ce, #4299e1);
    border-radius: 10px;
    transition: width 0.3s ease;
}

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    pointer-events: none;
    white-space: nowrap;
    backdrop-filter: blur(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transform: translateX(-50%);
    transition: all 0.2s ease;
}

.tooltip::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.8);
}

.model-actions {
    display: flex;
    gap: 10px;
    animation: fadeIn 0.8s ease-out 1.2s backwards;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    min-width: 100px;
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    cursor: pointer;
    position: relative;
}

.action-btn i {
    font-size: 18px;
    flex-shrink: 0;
}

.generate-btn {
    background: linear-gradient(135deg, #00c853, #64dd17);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
}

.generate-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
    background: linear-gradient(135deg, #00e676, #76ff03);
}

.action-btn:disabled {
    background: linear-gradient(135deg, #a5d6a7, #c5e1a5) !important;
    color: rgba(255, 255, 255, 0.6);
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none;
}

.action-btn:disabled::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: grayscale(0.5) brightness(1.1);
    pointer-events: none;
    border-radius: inherit;
}

@keyframes disabledPulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }

    100% {
        opacity: 1;
    }
}

.action-btn:disabled {
    animation: disabledPulse 2s ease-in-out infinite;
}

.upload-area {
    border: 2px dashed #cbd5e0;
    border-radius: 20px;
    padding: 30px;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    animation: fadeInUp 0.8s ease-out 0.7s backwards;
}

.upload-area::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(49, 130, 206, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.upload-area:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(49, 130, 206, 0.15);
    border-color: #3182ce;
}

.upload-area:hover::before {
    opacity: 1;
}

.upload-area.drag-over {
    border-color: #3182ce;
    transform: scale(1.02);
    box-shadow: 0 8px 30px rgba(49, 130, 206, 0.15);
}

.upload-area.drag-over::before {
    opacity: 1;
}

.dropzone {
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.3s ease;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    color: #64748b;
    animation: fadeIn 0.5s ease;
}

.upload-placeholder i {
    font-size: 64px;
    color: #3182ce;
    margin-bottom: 10px;
    opacity: 0.8;
    filter: drop-shadow(0 4px 6px rgba(49, 130, 206, 0.2));
    transition: all 0.3s ease;
}

.upload-area:hover .upload-placeholder i {
    transform: scale(1.1);
    opacity: 1;
    filter: drop-shadow(0 6px 8px rgba(49, 130, 206, 0.3));
}

.upload-placeholder h3 {
    font-size: 1.4em;
    font-weight: 500;
    color: #2d3748;
    margin: 0;
    transition: all 0.3s ease;
}

.upload-area:hover .upload-placeholder h3 {
    color: #3182ce;
    transform: translateY(-2px);
}

.upload-image {
    max-width: 100%;
    max-height: 280px;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    background: white;
    padding: 15px;
    border: 2px solid #e2e8f0;
}

.upload-area:hover .upload-image {
    transform: scale(1.03);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
    border-color: #3182ce;
}

.upload-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
    padding: 0 20px;
    animation: fadeIn 0.8s ease-out 0.8s backwards;
}

.control-btn {
    width: 48px;
    height: 48px;
    background: white;
    color: #3182ce;
    border: none;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
}

.control-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(49, 130, 206, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.control-btn:hover {
    transform: translateY(-2px);
    background: #3182ce;
    color: white;
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2);
}

.control-btn:hover::before {
    opacity: 1;
}

.control-btn i {
    font-size: 20px;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.control-btn:hover i {
    transform: scale(1.1);
}

.control-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.generate-btn-container {
    margin: 0;
    display: flex;
    justify-content: center;
    animation: fadeIn 0.8s ease-out 0.9s backwards;
}

.generate-btn {
    min-width: 120px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #00c853, #64dd17);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
    z-index: 1;
}

.generate-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent);
    transition: 0.5s;
    z-index: -1;
}

.generate-btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 50%);
    opacity: 0;
    transition: 0.5s;
    z-index: -1;
}

.generate-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 200, 83, 0.4);
    background: linear-gradient(135deg, #00e676, #76ff03);
}

.generate-btn:hover::before {
    left: 100%;
    transition: 0.5s;
}

.generate-btn:hover::after {
    opacity: 1;
    transform: scale(1.5) rotate(45deg);
}

.generate-btn:hover i {
    transform: scale(1.2) rotate(360deg);
}

.generate-btn i {
    margin-right: 8px;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.generate-btn:disabled {
    background: linear-gradient(135deg, #a0aec0, #cbd5e0);
    transform: none;
    box-shadow: none;
}

.generate-btn:disabled::before,
.generate-btn:disabled::after {
    display: none;
}

.generate-btn:active {
    transform: translateY(-1px) scale(0.98);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.section-title {
    position: relative;
    font-size: 1.5em;
    color: #2d3748;
    margin: 0 0 15px;
    padding: 12px 20px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}

/* Remove the rainbow gradient animation */
.section-title::before {
    display: none;
}

/* Remove the rainbow gradient keyframes */
@keyframes rainbowGradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

@keyframes rotateHalo {
    0% {
        transform: translate(-50%, -50%) rotate(0deg) scale(0.8);
    }

    50% {
        transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
    }

    100% {
        transform: translate(-50%, -50%) rotate(360deg) scale(0.8);
    }
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.progress-text {
    font-size: 1.2em;
    color: #3182ce;
    font-weight: 500;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.processed-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
}

.next-step-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #3182ce, #4299e1);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(49, 130, 206, 0.3);
    margin-top: auto;
}

.next-step-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(49, 130, 206, 0.4);
    background: linear-gradient(135deg, #4299e1, #63b3ed);
}

.next-step-btn i {
    font-size: 18px;
    transition: transform 0.3s ease;
}

.next-step-btn:hover i {
    transform: translateX(4px);
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.5s ease-out;
}

.nav-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #3182ce;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-btn:hover {
    background: rgba(49, 130, 206, 0.1);
    transform: scale(1.05);
    opacity: 0.9;
}

.nav-btn i {
    font-size: 16px;
    transition: transform 0.3s ease;
}

.nav-btn:hover i {
    transform: translateX(2px);
}

.user-info-container {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    min-width: 140px;
    width: fit-content;
}

.user-info-container::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: 8px;
    background: transparent;
}

.user-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #3182ce;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    width: 100%;
    box-sizing: border-box;
    min-width: 140px;
}

.user-info i {
    font-size: 18px;
    transition: transform 0.3s ease;
}

.user-info span {
    text-align: center;
    width: fit-content;
    margin: 0;
}

.user-info-container:hover .user-info {
    transform: scale(1.05);
    opacity: 0.9;
    background: rgba(49, 130, 206, 0.1);
}

.user-info-container:hover .user-info i {
    transform: rotate(15deg);
}

.logout-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 8px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: fadeIn 0.2s ease-out;
    z-index: 1000;
    width: 100%;
    box-sizing: border-box;
    min-width: 140px;
}

.logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    width: 100%;
    background: white;
    border: none;
    color: #e53e3e;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.logout-btn:hover {
    background: #fef2f2;
}

.logout-btn i {
    font-size: 18px;
    transition: transform 0.2s ease;
}

.logout-btn:hover i {
    transform: translateX(2px);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.nav-btn.profile-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #3182ce;
}

.nav-btn.profile-btn:hover {
    background: rgba(49, 130, 206, 0.1);
    transform: scale(1.05);
    opacity: 0.9;
}

.nav-btn.profile-btn i {
    font-size: 16px;
    transition: transform 0.3s ease;
}

.nav-btn.profile-btn:hover i {
    transform: translateX(-2px);
}

.camera-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.camera-container {
    position: relative;
    width: 90%;
    max-width: 1200px;
    background: #1a1a1a;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
}

.camera-container video {
    width: 100%;
    height: auto;
    display: block;
    background: #000;
    transform: scaleX(-1);
    /* 镜像翻转，使预览更自然 */
}

.camera-controls {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px;
}

.camera-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
}

.camera-btn i {
    font-size: 24px;
    color: white;
}

.capture-btn {
    background: #3182ce;
    transform: scale(1.2);
}

.capture-btn:hover {
    background: #2c5282;
    transform: scale(1.3);
}

.close-btn {
    background: rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.model-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.model-area {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 400px;
    overflow: hidden;
    border-radius: 12px;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.model-area canvas {
    width: 100% !important;
    height: 100% !important;
}

.loading-overlay,
.error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

.error-icon {
    font-size: 48px;
    color: #e53e3e;
    margin-bottom: 20px;
}

.retry-button {
    padding: 10px 20px;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;
    transition: all 0.3s ease;
}

.retry-button:hover {
    background: #2c5282;
    transform: translateY(-2px);
}

.model-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    position: relative;
}

.model-controls::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    background: linear-gradient(45deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.1));
    z-index: 0;
    pointer-events: none;
}

.model-controls::-webkit-scrollbar {
    display: none;
}

.model-controls .control-btn {
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 15px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    flex-shrink: 0;
    z-index: 1;
}

.model-controls .control-btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 70%);
    opacity: 0;
    transition: 0.5s;
    z-index: 1;
}

.model-controls .control-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent);
    transition: 0.5s;
    z-index: 1;
}

.model-controls .control-btn:hover {
    transform: translateY(-5px) scale(1.1);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.model-controls .control-btn:hover::before {
    opacity: 1;
    transform: rotate(180deg);
}

.model-controls .control-btn:hover::after {
    left: 100%;
}

.model-controls .control-btn:hover i {
    transform: scale(1.2);
    color: rgba(255, 255, 255, 1);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.model-controls .control-btn i {
    font-size: 20px;
    position: relative;
    z-index: 2;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: rgba(255, 255, 255, 0.9);
}

.model-controls .control-btn:active {
    transform: translateY(-2px) scale(0.95);
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
}

/* 重置按钮特殊样式 */
.model-controls .reset-btn {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.model-controls .reset-btn:hover {
    background: linear-gradient(135deg, #f87171, #ef4444);
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

/* 缩放按钮特殊样式 */
.model-controls .control-btn[title*="放大"],
.model-controls .control-btn[title*="缩小"] {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
}

.model-controls .control-btn[title*="放大"]:hover,
.model-controls .control-btn[title*="缩小"]:hover {
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
}

/* 旋转按钮特殊样式 */
.model-controls .control-btn[title*="旋转"] {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.model-controls .control-btn[title*="旋转"]:hover {
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

/* 禁用状态 */
.model-controls .control-btn:disabled {
    background: linear-gradient(135deg, #9ca3af, #6b7280);
    transform: none !important;
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.6;
}

.model-controls .control-btn:disabled::before,
.model-controls .control-btn:disabled::after {
    display: none;
}

.model-controls .control-btn:disabled i {
    color: rgba(255, 255, 255, 0.5);
    transform: none !important;
}

.extract-btn {
    background: linear-gradient(135deg, #805ad5, #6b46c1);
    color: white;
    box-shadow: 0 4px 15px rgba(128, 90, 213, 0.3);
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    z-index: 1;
}

.extract-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent);
    transition: 0.5s;
    z-index: -1;
}

.extract-btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 50%);
    opacity: 0;
    transition: 0.5s;
    z-index: -1;
}

.extract-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(128, 90, 213, 0.4);
    background: linear-gradient(135deg, #9f7aea, #805ad5);
}

.extract-btn:hover::before {
    left: 100%;
    transition: 0.5s;
}

.extract-btn:hover::after {
    opacity: 1;
    transform: scale(1.5) rotate(45deg);
}

.extract-btn:hover i {
    transform: scale(1.2) rotate(360deg);
}

.extract-btn i {
    margin-right: 8px;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.extract-btn:disabled {
    background: linear-gradient(135deg, #a0aec0, #cbd5e0);
    transform: none;
    box-shadow: none;
}

.extract-btn:disabled::before,
.extract-btn:disabled::after {
    display: none;
}

.extract-btn:active {
    transform: translateY(-1px) scale(0.98);
}

.upload-controls .control-btn.upload-btn {
    width: 54px;
    height: 54px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    z-index: 1;
}

.upload-controls .control-btn.upload-btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 60%);
    opacity: 0;
    transition: 0.5s;
    transform: translate(-50%, -50%) rotate(0deg);
}

.upload-controls .control-btn.upload-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent);
    transition: 0.5s;
}

.upload-controls .control-btn.upload-btn:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.upload-controls .control-btn.upload-btn:hover::before {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(180deg);
}

.upload-controls .control-btn.upload-btn:hover::after {
    left: 100%;
}

.upload-controls .control-btn.upload-btn:hover i {
    transform: scale(1.2) rotate(15deg);
    color: rgba(255, 255, 255, 1);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.upload-controls .control-btn.upload-btn i {
    font-size: 22px;
    position: relative;
    z-index: 2;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: rgba(255, 255, 255, 0.9);
}

.upload-controls .control-btn.upload-btn:active {
    transform: translateY(-2px) scale(0.95);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}

.upload-controls .control-btn.upload-btn.camera-btn {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.upload-controls .control-btn.upload-btn.camera-btn:hover {
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.upload-controls .control-btn.upload-btn:disabled {
    background: linear-gradient(135deg, #9ca3af, #6b7280);
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.6;
}

.upload-controls .control-btn.upload-btn:disabled::before,
.upload-controls .control-btn.upload-btn:disabled::after {
    display: none;
}

.upload-controls .control-btn.upload-btn:disabled i {
    color: rgba(255, 255, 255, 0.5);
    transform: none;
}

.hover-card {
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    animation: fadeInUp 0.8s ease-out 0.5s backwards;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.hover-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(49, 130, 206, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 0;
}

.hover-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(49, 130, 206, 0.15);
    border-color: #3182ce;
}

.hover-card:hover::before {
    opacity: 1;
}

.hover-step {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 0;
    animation: fadeInUp 0.8s ease-out backwards;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
}

.hover-step:hover {
    transform: translateX(10px);
}

.hover-step:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 12px;
}

.hover-step:nth-child(1) {
    animation: fadeInUp 0.8s ease-out 0.5s backwards;
}

.hover-step:nth-child(2) {
    animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

.hover-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #ebf8ff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3182ce;
    animation: fadeInUp 0.8s ease-out backwards;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.hover-icon::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, #3182ce, #4299e1);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.hover-step:hover .hover-icon {
    transform: scale(1.1) rotate(5deg);
    background: #3182ce;
    color: white;
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
}

.hover-step:hover .hover-icon::before {
    opacity: 1;
}

.hover-step:nth-child(1) .hover-icon {
    animation-delay: 0.3s;
}

.hover-step:nth-child(2) .hover-icon {
    animation-delay: 0.5s;
}

.hover-icon i {
    font-size: 20px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
}

.hover-step:hover .hover-icon i {
    transform: scale(1.2);
}

.hover-text {
    margin: 0;
    color: #4a5568;
    line-height: 1.6;
    font-size: 1.05em;
    display: flex;
    align-items: center;
    min-height: 40px;
    transition: all 0.3s ease;
    position: relative;
}

.hover-step:hover .hover-text {
    color: #3182ce;
    transform: translateX(5px);
}

.hover-text::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #3182ce, #4299e1);
    transition: width 0.3s ease;
}

.hover-step:hover .hover-text::after {
    width: 100%;
}

.breathing-title {
    position: relative;
    font-size: 1.5em;
    color: #2d3748;
    margin: 0 0 15px;
    padding: 12px 20px;
    border-radius: 12px;
    background: transparent;
    border: none;
    animation: float 3s ease-in-out infinite;
}

.breathing-title::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    background: linear-gradient(45deg, #3182ce, #4299e1);
    opacity: 0;
    z-index: -1;
    animation: breathe 3s ease-in-out infinite;
}

.breathing-title::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 14px;
    background: linear-gradient(45deg, #3182ce, #4299e1);
    z-index: -2;
    filter: blur(8px);
    opacity: 0.5;
    animation: glow 3s ease-in-out infinite;
}

.title-text {
    position: relative;
    z-index: 1;
    display: inline-block;
    animation: textFloat 3s ease-in-out infinite;
}

@keyframes breathe {

    0%,
    100% {
        opacity: 0.1;
        transform: scale(1);
    }

    50% {
        opacity: 0.2;
        transform: scale(1.02);
    }
}

@keyframes glow {

    0%,
    100% {
        opacity: 0.3;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(1.02);
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-5px);
    }
}

@keyframes textFloat {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-2px);
    }
}

.carousel-section {
    margin: 2rem 0;
    position: relative;
    perspective: 1000px;
}

.carousel-container {
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(226, 232, 240, 0.5);
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
}

.carousel-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(49, 130, 206, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
}

.carousel-container:hover::before {
    opacity: 1;
}

.carousel-container::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(49, 130, 206, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 0;
}

.carousel-container:hover::after {
    opacity: 0.5;
}

.carousel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    position: relative;
    z-index: 2;
}

.carousel-title {
    font-size: 1.8em;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 15px;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
}

.carousel-title::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #3182ce, transparent);
    border-radius: 2px;
}

.carousel-title i {
    color: #3182ce;
    font-size: 1.4em;
    filter: drop-shadow(0 2px 4px rgba(49, 130, 206, 0.3));
}

.carousel-controls {
    display: flex;
    gap: 15px;
    position: relative;
}

.carousel-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    border: none;
    color: #3182ce;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    z-index: 1;
}

.carousel-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, #3182ce, #63b3ed);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
}

.carousel-btn::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
}

.carousel-btn i {
    font-size: 22px;
    position: relative;
    z-index: 2;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.carousel-btn:hover {
    transform: scale(1.1) translateY(-3px);
    box-shadow: 0 8px 20px rgba(49, 130, 206, 0.3);
    color: white;
}

.carousel-btn:hover::before {
    opacity: 1;
}

.carousel-btn:hover::after {
    opacity: 0.5;
}

.carousel-btn:hover i {
    transform: scale(1.2) rotate(360deg);
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 添加按钮点击效果 */
.carousel-btn:active {
    transform: scale(0.95) translateY(-1px);
    box-shadow: 0 4px 10px rgba(49, 130, 206, 0.2);
}

/* 添加按钮脉冲动画 */
@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(49, 130, 206, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(49, 130, 206, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(49, 130, 206, 0);
    }
}

.carousel-btn {
    animation: pulse 2s infinite;
}

/* 添加按钮波纹效果 */
.carousel-btn .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
}

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

/* 添加按钮悬浮时的边框动画 */
.carousel-btn::before {
    border-radius: 50%;
    background: linear-gradient(45deg, transparent, rgba(49, 130, 206, 0.1), transparent);
    background-size: 200% 200%;
    animation: borderRotate 3s linear infinite;
}

@keyframes borderRotate {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

/* 添加按钮悬浮时的光晕效果 */
.carousel-btn::after {
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
    filter: blur(5px);
    transition: all 0.4s ease;
}

.carousel-btn:hover::after {
    transform: scale(1.5);
    opacity: 0.8;
}

.carousel-content {
    position: relative;
    height: 450px;
    overflow: hidden;
    border-radius: 15px;
    background: white;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
    perspective: 1000px;
}

.carousel-content:hover {
    transform: translateY(-5px);
}

.carousel-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    will-change: transform, opacity;
    transform-style: preserve-3d;
    backface-visibility: hidden;
}

.carousel-item.active {
    opacity: 1;
    z-index: 1;
    transform: translateZ(0);
}

.carousel-item.next {
    transform: translateX(100%) rotateY(-90deg);
    opacity: 0;
}

.carousel-item.prev {
    transform: translateX(-100%) rotateY(90deg);
    opacity: 0;
}

.carousel-model-container {
    flex: 1;
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform-style: preserve-3d;
    transition: transform 0.5s ease;
}

.carousel-item:hover .carousel-model-container {
    transform: translateZ(20px);
}

@keyframes slideInRight {
    0% {
        transform: translateX(100%) rotateY(-90deg);
        opacity: 0;
    }
    100% {
        transform: translateX(0) rotateY(0);
        opacity: 1;
    }
}

@keyframes slideInLeft {
    0% {
        transform: translateX(-100%) rotateY(90deg);
        opacity: 0;
    }
    100% {
        transform: translateX(0) rotateY(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    0% {
        transform: translateX(0) rotateY(0);
        opacity: 1;
    }
    100% {
        transform: translateX(-100%) rotateY(-90deg);
        opacity: 0;
    }
}

@keyframes slideOutLeft {
    0% {
        transform: translateX(0) rotateY(0);
        opacity: 1;
    }
    100% {
        transform: translateX(100%) rotateY(90deg);
        opacity: 0;
    }
}

.carousel-model-info {
    padding: 20px;
    background: white;
    border-radius: 15px;
    margin-top: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: translateY(0);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease-out 0.8s forwards;
}

.carousel-item:hover .carousel-model-info {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.carousel-model-info::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3182ce, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.carousel-item:hover .carousel-model-info::before {
    opacity: 1;
}

.carousel-model-info h3 {
    font-size: 1.3em;
    color: #2d3748;
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
}

.carousel-model-info h3::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 20px;
    background: linear-gradient(to bottom, #3182ce, #63b3ed);
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(49, 130, 206, 0.2);
}

.carousel-model-info p {
    color: #4a5568;
    margin: 0;
    line-height: 1.6;
    font-size: 1em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
    100% {
        transform: translateY(0px);
    }
}

.carousel-item.active .carousel-model-container {
    animation: float 3s ease-in-out infinite;
}

.header {
    opacity: 0;
    transform: translateY(-20px);
    animation: fadeInUp 0.8s ease-out 0.2s forwards;
}

.carousel-section {
    margin: 2rem 0;
    position: relative;
    perspective: 1000px;
    opacity: 0;
    transform: translateY(-20px);
    animation: fadeInUp 0.8s ease-out 0.4s forwards;
}

.main-content {
    opacity: 0;
    transform: translateY(-20px);
    animation: fadeInUp 0.8s ease-out 0.6s forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 为每个轮播项添加延迟动画 */
.carousel-item {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-item.active {
    opacity: 1;
    transform: translateY(0);
    animation: slideIn 0.8s ease-out forwards;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 为轮播按钮添加延迟动画 */
.carousel-controls {
    opacity: 0;
    transform: translateY(10px);
    animation: fadeInUp 0.8s ease-out 0.8s forwards;
}

/* 为轮播标题添加延迟动画 */
.carousel-title {
    opacity: 0;
    transform: translateX(-20px);
    animation: slideInRight 0.8s ease-out 0.6s forwards;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* 为模型信息添加延迟动画 */
.carousel-model-info {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s ease-out;
}

.carousel-item.active .carousel-model-info {
    opacity: 1;
    transform: translateY(0);
    animation: fadeInUp 0.8s ease-out 0.8s forwards;
}

/* 为上传区域添加延迟动画 */
.upload-area {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease-out 0.8s forwards;
}

/* 为生成按钮添加延迟动画 */
.generate-btn-container {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease-out 1s forwards;
}

/* 为模型控制按钮添加延迟动画 */
.model-controls {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease-out 1.2s forwards;
}

/* 为错误信息添加延迟动画 */
.error-overlay {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease-out 0.8s forwards;
}

/* 为加载动画添加延迟 */
.loading-overlay {
    opacity: 0;
    transform: scale(0.8);
    animation: fadeInScale 0.8s ease-out 0.8s forwards;
}

@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.upload-icon {
    transition: all 0.3s ease;
}

.upload-icon:hover {
    transform: translateY(-5px) rotate(10deg);
    color: #4CAF50;
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.preprocessing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    z-index: 10;
    animation: fadeIn 0.3s ease;
}

.preprocessing-text {
    margin-top: 20px;
    font-size: 1.2em;
    color: #3182ce;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        opacity: 0.6;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.6;
    }
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(49, 130, 206, 0.1);
    border-radius: 50%;
    border-top-color: #3182ce;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.model-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    min-width: 100px;
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    cursor: pointer;
    position: relative;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    z-index: 1;
}

.model-actions button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent);
    transition: 0.5s;
    z-index: -1;
}

.model-actions button::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 50%);
    opacity: 0;
    transition: 0.5s;
    z-index: -1;
}

.model-actions button:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.model-actions button:hover::before {
    left: 100%;
    transition: 0.5s;
}

.model-actions button:hover::after {
    opacity: 1;
    transform: scale(1.5) rotate(45deg);
}

.model-actions button:hover i {
    transform: scale(1.2) rotate(360deg);
}

.model-actions button i {
    font-size: 18px;
    flex-shrink: 0;
    margin-right: 8px;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.model-actions button:disabled {
    background: linear-gradient(135deg, #a0aec0, #cbd5e0);
    transform: none;
    box-shadow: none;
}

.model-actions button:disabled::before,
.model-actions button:disabled::after {
    display: none;
}

.generating-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    z-index: 10;
    animation: fadeIn 0.3s ease;
}

.double-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
}

.spinner-outer {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 4px solid rgba(49, 130, 206, 0.1);
    border-radius: 50%;
    border-top-color: #3182ce;
    animation: spin 1.5s linear infinite;
}

.spinner-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50%;
    height: 50%;
    margin: -25% 0 0 -25%;
    border: 4px solid rgba(49, 130, 206, 0.1);
    border-radius: 50%;
    border-top-color: #3182ce;
    animation: spin 1s linear infinite reverse;
}

.generating-text {
    font-size: 1.2em;
    color: #3182ce;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    animation: pulse 2s infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0% {
        opacity: 0.6;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.6;
    }
}
</style>