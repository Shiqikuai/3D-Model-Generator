<template>
    <div class="profile">
        <nav class="navbar">
            <div class="nav-brand">
                <i class="fas fa-user-circle"></i>
                <span>个人信息</span>
            </div>
            <div class="nav-actions">
                <button class="nav-btn home-btn" @click="goToHome">
                    <i class="fas fa-home"></i>
                    <span>首页</span>
                </button>
                <template v-if="isLoggedIn">
                    <div class="user-info-container" @mouseenter="showLogoutMenu = true" @mouseleave="handleMouseLeave">
                        <div class="user-info">
                            <i class="fas fa-user"></i>
                            <span>{{ username }}</span>
                        </div>
                        <div class="logout-menu" v-if="showLogoutMenu" @mouseenter="showLogoutMenu = true" @mouseleave="handleMouseLeave">
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
                <i class="fas fa-user-circle"></i>
                个人资料
            </h1>
        </div>

        <div class="main-content">
            <div class="profile-card">
                <div class="user-info">
                    <div class="username elegant-text">{{ user.username }}</div>
                </div>

                <div class="models-section" v-if="models.length > 0">
                    <h3 class="section-title cool-title">
                        <span class="title-text">我的3D模型</span>
                        <span class="title-decoration"></span>
                    </h3>
                    <div class="models-grid">
                        <div v-for="(model, index) in models" :key="index" class="model-card">
                            <div class="model-preview" :ref="'modelContainer' + index">
                                <div class="loading-spinner" v-if="loadingModels[index]">
                                    <div class="spinner"></div>
                                </div>
                            </div>
                            <div class="model-info">
                                <div class="model-name">{{ getModelName(model) }}</div>
                                <a :href="model" class="download-btn cool-download-btn" download>
                                    <i class="fas fa-download"></i>
                                    下载
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="no-models">
                    <i class="fas fa-cube"></i>
                    <p>暂无3D模型</p>
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

export default {
    name: 'UserProfile',
    data() {
        return {
            user: {
                id: '',
                username: ''
            },
            models: [],
            errorMessage: '',
            loadingModels: {},
            scenes: {},
            renderers: {},
            controls: {},
            resizeHandlers: {},
            isLoggedIn: false,
            username: '',
            showLogoutMenu: false
        }
    },
    methods: {
        checkLoginStatus() {
            const isLoggedIn = localStorage.getItem('isLoggedIn')
            const username = localStorage.getItem('username')
            if (isLoggedIn && username) {
                this.isLoggedIn = true
                this.username = username
            }
        },
        goToLogin() {
            this.$router.push('/login')
        },
        goToRegister() {
            this.$router.push('/register')
        },
        handleLogout() {
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('username')
            localStorage.removeItem('userId')
            this.isLoggedIn = false
            this.username = ''
            this.showLogoutMenu = false
            window.location.reload()
        },
        clearError() {
            this.errorMessage = ''
        },
        getModelName(modelPath) {
            // 从路径中提取文件名，并移除扩展名
            const fileName = modelPath.split('/').pop()
            return fileName.replace(/\.glb$/, '')
        },
        async loadModel(index, modelPath) {
            this.loadingModels[index] = true
            const container = this.$refs[`modelContainer${index}`][0]
            
            try {
                // 创建场景
                const scene = new THREE.Scene()
                scene.background = new THREE.Color(0xf8fafc)
                
                // 创建相机
                const camera = new THREE.PerspectiveCamera(
                    45,
                    container.clientWidth / container.clientHeight,
                    0.1,
                    1000
                )
                camera.position.z = 3
                
                // 创建渲染器
                const renderer = new THREE.WebGLRenderer({ 
                    antialias: true,
                    powerPreference: "high-performance",
                    precision: "highp",
                    alpha: true,
                    stencil: true,
                    depth: true,
                    logarithmicDepthBuffer: true
                })
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
                renderer.setSize(container.clientWidth, container.clientHeight)
                renderer.outputColorSpace = THREE.SRGBColorSpace
                renderer.physicallyCorrectLights = true
                renderer.shadowMap.enabled = true
                renderer.shadowMap.type = THREE.PCFSoftShadowMap
                renderer.toneMapping = THREE.ACESFilmicToneMapping
                renderer.toneMappingExposure = 1.0
                container.appendChild(renderer.domElement)
                
                // 添加轨道控制器
                const controls = new OrbitControls(camera, renderer.domElement)
                controls.enableDamping = true
                controls.dampingFactor = 0.05
                controls.minDistance = 1
                controls.maxDistance = 10
                controls.enablePan = false
                controls.maxPolarAngle = Math.PI / 2
                controls.autoRotate = true
                controls.autoRotateSpeed = 2.0
                
                // 添加环境光和平行光
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
                scene.add(ambientLight)
                
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
                directionalLight.position.set(1, 1, 1)
                directionalLight.castShadow = true
                directionalLight.shadow.mapSize.width = 2048
                directionalLight.shadow.mapSize.height = 2048
                directionalLight.shadow.camera.near = 0.5
                directionalLight.shadow.camera.far = 50
                directionalLight.shadow.bias = -0.0001
                scene.add(directionalLight)
                
                // 添加辅助光
                const fillLight = new THREE.DirectionalLight(0xffffff, 0.6)
                fillLight.position.set(-1, -1, -1)
                scene.add(fillLight)
                
                // 加载模型
                const loader = new GLTFLoader()
                const gltf = await loader.loadAsync(modelPath)
                
                // 调整模型大小和位置
                const model = gltf.scene
                const box = new THREE.Box3().setFromObject(model)
                const center = box.getCenter(new THREE.Vector3())
                const size = box.getSize(new THREE.Vector3())
                
                const maxDim = Math.max(size.x, size.y, size.z)
                const scale = 1.5 / maxDim
                model.scale.setScalar(scale)
                
                model.position.sub(center.multiplyScalar(scale))
                
                // 启用阴影和优化材质
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true
                        node.receiveShadow = true
                        
                        // 优化材质
                        if (node.material) {
                            node.material.roughness = 0.3
                            node.material.metalness = 0.7
                            node.material.envMapIntensity = 1.2
                            node.material.needsUpdate = true
                            
                            // 如果材质有贴图，提高贴图质量
                            if (node.material.map) {
                                node.material.map.anisotropy = 16
                                node.material.map.minFilter = THREE.LinearMipMapLinearFilter
                                node.material.map.magFilter = THREE.LinearFilter
                            }
                        }
                    }
                })
                
                scene.add(model)
                
                // 保存引用以便清理
                this.scenes[index] = scene
                this.renderers[index] = renderer
                this.controls[index] = controls
                
                // 动画循环
                const animate = () => {
                    requestAnimationFrame(animate)
                    controls.update()
                    renderer.render(scene, camera)
                }
                animate()
                
                // 监听窗口大小变化
                window.addEventListener('resize', () => {
                    camera.aspect = container.clientWidth / container.clientHeight
                    camera.updateProjectionMatrix()
                    renderer.setSize(container.clientWidth, container.clientHeight)
                })
                
            } catch (error) {
                console.error('加载模型失败:', error)
                container.innerHTML = '<div class="error-message">加载模型失败</div>'
            } finally {
                this.loadingModels[index] = false
            }
        },
        handleMouseLeave(event) {
            // 检查鼠标是否移到了 logout-menu 上
            const relatedTarget = event.relatedTarget
            if (!relatedTarget || 
                (!relatedTarget.closest('.user-info-container') && 
                 !relatedTarget.closest('.logout-menu'))) {
                this.showLogoutMenu = false
            }
        },
        goToHome() {
            this.$router.push('/');
        }
    },
    async created() {
        this.checkLoginStatus()
        try {
            // 检查登录状态
            const isLoggedIn = localStorage.getItem('isLoggedIn')
            const userId = localStorage.getItem('userId')
            
            if (!isLoggedIn || !userId) {
                this.errorMessage = '请先登录'
                return
            }

            const response = await axios.get(`http://localhost:3000/api/user/profile/${userId}`)
            if (response.data.success) {
                this.user = response.data.data.user
                // 处理模型路径，确保从 public/models 目录加载
                this.models = response.data.data.models.map(model => {
                    // 如果已经是完整的 public/models 路径，直接使用
                    if (model.startsWith('public/models/')) {
                        return model.replace('public', '')
                    }
                    // 如果只是文件名，添加 /models/ 前缀
                    return `/models/${model}`
                })
                
                // 加载所有模型
                this.$nextTick(() => {
                    this.models.forEach((model, index) => {
                        this.loadModel(index, model)
                    })
                })
            } else {
                this.errorMessage = '获取用户信息失败'
            }
        } catch (error) {
            console.error('获取用户信息失败:', error)
            this.errorMessage = '获取用户信息失败，请刷新页面重试'
        }
    },
    beforeDestroy() {
        // 清理 Three.js 资源
        Object.keys(this.renderers).forEach(index => {
            const renderer = this.renderers[index]
            const scene = this.scenes[index]
            const controls = this.controls[index]
            
            if (renderer) {
                renderer.dispose()
                renderer.forceContextLoss()
            }
            if (scene) {
                scene.traverse(object => {
                    if (object instanceof THREE.Mesh) {
                        object.geometry.dispose()
                        if (object.material.map) object.material.map.dispose()
                        object.material.dispose()
                    }
                })
            }
            if (controls) {
                controls.dispose()
            }
        })
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
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
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
        transform: translateY(20px);
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

.profile {
    max-width: 1200px;
    margin: 84px auto 20px;
    padding: 20px;
    position: relative;
    z-index: 1;
}

.profile::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        45deg,
        rgba(255, 0, 0, 0.1),
        rgba(255, 165, 0, 0.1),
        rgba(255, 255, 0, 0.1),
        rgba(0, 255, 0, 0.1),
        rgba(0, 255, 255, 0.1),
        rgba(0, 0, 255, 0.1),
        rgba(238, 130, 238, 0.1),
        rgba(255, 0, 0, 0.1)
    );
    background-size: 400% 400%;
    animation: rainbowBackground 15s linear infinite;
    z-index: -2;
}

.profile::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        135deg,
        rgba(255, 0, 0, 0.05),
        rgba(255, 165, 0, 0.05),
        rgba(255, 255, 0, 0.05),
        rgba(0, 255, 0, 0.05),
        rgba(0, 255, 255, 0.05),
        rgba(0, 0, 255, 0.05),
        rgba(238, 130, 238, 0.05),
        rgba(255, 0, 0, 0.05)
    );
    background-size: 400% 400%;
    animation: rainbowBackground 20s linear infinite reverse;
    z-index: -1;
    opacity: 0.5;
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
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
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

.main-content {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

.profile-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(226, 232, 240, 0.8);
    width: 100%;
    max-width: 900px;
    box-sizing: border-box;
    animation: fadeInUp 0.8s ease-out 0.7s backwards;
    backdrop-filter: blur(10px);
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

.profile-form {
    animation: fadeInUp 0.8s ease-out 0.9s backwards;
}

.form-group {
    margin-bottom: 2rem;
    width: 100%;
    box-sizing: border-box;
}

.form-group label {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
    color: #2c3e50;
    font-weight: 500;
    font-size: 1.1rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 1rem 1.2rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    background-color: rgba(255, 255, 255, 0.8);
    box-sizing: border-box;
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.error-message {
    color: #e74c3c;
    margin-bottom: 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem;
    background-color: rgba(231, 76, 60, 0.1);
    border-radius: 8px;
    animation: fadeIn 0.3s ease-out;
}

.action-btn {
    width: 100%;
    padding: 1.2rem;
    background: linear-gradient(135deg, #00c853, #64dd17);
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 2rem;
}

.action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
    background: linear-gradient(135deg, #00e676, #76ff03);
}

.action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    opacity: 0.7;
}

.models-section {
    margin-top: 30px;
    animation: fadeInUp 0.8s ease-out 0.9s backwards;
}

.section-title {
    position: relative;
    font-size: 1.8em;
    color: #2d3748;
    margin-bottom: 30px;
    padding-bottom: 15px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cool-title {
    background: linear-gradient(
        90deg,
        #3182ce,
        #2c5282,
        #3182ce
    );
    background-size: 200% auto;
    color: white;
    padding: 15px 30px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(49, 130, 206, 0.3);
    animation: gradientFlow 3s ease infinite;
    position: relative;
    overflow: hidden;
}

.cool-title::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
    );
    animation: shine 3s infinite;
}

.title-text {
    position: relative;
    z-index: 1;
    font-weight: 600;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.title-decoration {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: white;
    border-radius: 2px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.models-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 20px;
}

.model-card {
    background: white;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    min-width: 0;
    position: relative;
    overflow: hidden;
}

.model-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        45deg,
        rgba(255, 0, 0, 0.1),
        rgba(255, 165, 0, 0.1),
        rgba(255, 255, 0, 0.1),
        rgba(0, 255, 0, 0.1),
        rgba(0, 255, 255, 0.1),
        rgba(0, 0, 255, 0.1),
        rgba(238, 130, 238, 0.1),
        rgba(255, 0, 0, 0.1)
    );
    background-size: 400% 400%;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
}

.model-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.model-card:hover::before {
    opacity: 1;
    animation: rainbowGradient 8s linear infinite;
}

.model-preview {
    width: 100%;
    height: 200px;
    background: #f8fafc;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    z-index: 2;
}

.model-card:hover .model-preview {
    transform: scale(1.02);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3182ce;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.error-message {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
    font-size: 0.9em;
    padding: 10px;
    text-align: center;
}

.model-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    position: relative;
    z-index: 2;
}

.model-name {
    font-weight: 500;
    color: #2d3748;
    transition: all 0.3s ease;
}

.model-card:hover .model-name {
    color: #3182ce;
    transform: translateX(5px);
}

.download-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #3182ce, #2c5282);
    color: white;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.9em;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.download-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
    );
    transition: 0.5s;
}

.download-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.2)
    );
    opacity: 0;
    transition: 0.3s;
}

.download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
    background: linear-gradient(135deg, #2c5282, #3182ce);
}

.download-btn:hover::before {
    left: 100%;
}

.download-btn:hover::after {
    opacity: 1;
}

.download-btn i {
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
}

.download-btn:hover i {
    transform: translateY(-2px);
}

.download-btn span {
    position: relative;
    z-index: 1;
}

.no-models {
    text-align: center;
    padding: 40px 0;
    color: #64748b;
}

.no-models i {
    font-size: 48px;
    margin-bottom: 10px;
}

.no-models p {
    font-size: 1.1em;
}

@media (max-width: 768px) {
    .title {
        font-size: 1.5rem;
    }
    
    .profile-card {
        padding: 1.5rem;
    }

    .section-title {
        font-size: 1.5em;
        padding: 10px 20px;
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

.nav-btn.home-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #3182ce;
}

.nav-btn.home-btn:hover {
    background: rgba(49, 130, 206, 0.1);
    transform: scale(1.05);
    opacity: 0.9;
}

.nav-btn.home-btn i {
    font-size: 16px;
    transition: transform 0.3s ease;
}

.nav-btn.home-btn:hover i {
    transform: translateX(-2px);
}

@keyframes neonPulse {
    from {
        text-shadow: 0 0 5px #fff,
                     0 0 10px #fff,
                     0 0 15px #3182ce,
                     0 0 20px #3182ce,
                     0 0 25px #3182ce,
                     0 0 30px #3182ce,
                     0 0 35px #3182ce;
    }
    50% {
        text-shadow: 0 0 10px #fff,
                     0 0 20px #fff,
                     0 0 30px #3182ce,
                     0 0 40px #3182ce,
                     0 0 50px #3182ce,
                     0 0 60px #3182ce,
                     0 0 70px #3182ce;
    }
    100% {
        text-shadow: 0 0 5px #fff,
                     0 0 10px #fff,
                     0 0 15px #3182ce,
                     0 0 20px #3182ce,
                     0 0 25px #3182ce,
                     0 0 30px #3182ce,
                     0 0 35px #3182ce;
    }
}

.username {
    font-size: 3em;
    font-weight: 600;
    color: #2d3748;
    text-align: center;
    margin: 30px 0;
    padding: 0;
    position: relative;
    display: inline-block;
    letter-spacing: 1px;
}

.username::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3182ce, #2c5282);
    border-radius: 2px;
    transition: width 0.3s ease;
}

.username:hover::after {
    width: 100px;
}

.elegant-text {
    font-family: 'Arial', sans-serif;
    text-transform: capitalize;
    animation: subtleFloat 3s ease-in-out infinite;
}

@media (max-width: 768px) {
    .username {
        font-size: 2.2em;
    }
}

@keyframes subtleFloat {
    0% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-5px);
    }
    100% {
        transform: translateY(0);
    }
}

@keyframes gradientFlow {
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

@keyframes shine {
    0% {
        background-position: -100% 0;
    }
    100% {
        background-position: 200% 0;
    }
}
</style>