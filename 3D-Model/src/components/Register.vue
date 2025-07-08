<template>
    <div class="register">
        <nav class="navbar">
            <div class="nav-brand">
                <i class="fas fa-user-plus"></i>
                <span>用户注册</span>
            </div>
        </nav>

        <div class="header">
            <h1 class="title">
                <i class="fas fa-user-plus"></i>
                创建您的账户
            </h1>
        </div>

        <div class="main-content">
            <form class="register-form" @submit.prevent="handleRegister">
                <div class="form-group">
                    <label for="username">
                        <i class="fas fa-user"></i>
                        用户名
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username"
                        v-model="username" 
                        placeholder="请输入用户名（4-16个字符，只能包含字母、数字和下划线）"
                        @focus="clearError"
                        @input="debounceValidateUsername"
                        @blur="validateUsername"
                    >
                    <div class="input-hint" v-if="username && !usernameValid">
                        <i class="fas fa-exclamation-circle"></i>
                        用户名必须是4-16个字符，只能包含字母、数字和下划线
                    </div>
                </div>

                <div class="form-group">
                    <label for="password">
                        <i class="fas fa-lock"></i>
                        密码
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        v-model="password" 
                        placeholder="请输入密码（8-20个字符，必须包含字母和数字）"
                        @focus="clearError"
                        @input="debounceValidatePassword"
                        @blur="validatePassword"
                    >
                    <div class="input-hint" v-if="password && !passwordValid">
                        <i class="fas fa-exclamation-circle"></i>
                        密码必须是8-20个字符，必须包含字母和数字
                    </div>
                </div>

                <div class="error-message" v-if="errorMessage">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ errorMessage }}
                </div>

                <button 
                    type="submit"
                    class="action-btn register-btn" 
                    :disabled="isLoading || !isFormValid"
                >
                    <i class="fas fa-user-plus"></i>
                    {{ isLoading ? '注册中...' : '注册' }}
                </button>

                <div class="login-link">
                    已有账户？<router-link to="/login">立即登录</router-link>
                </div>
            </form>
        </div>

        <!-- 添加成功弹窗 -->
        <div class="success-modal" v-if="showSuccessModal">
            <div class="modal-content">
                <div class="modal-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="modal-title">注册成功！</div>
                <div class="modal-message">
                    {{ countdown }}秒后跳转到登录页面...
                </div>
                <div class="modal-progress">
                    <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'UserRegister',
    data() {
        return {
            username: '',
            password: '',
            errorMessage: '',
            isLoading: false,
            usernameValid: false,
            passwordValid: false,
            usernameTimer: null,
            passwordTimer: null,
            countdown: 3,
            countdownTimer: null,
            showSuccessModal: false,
            progressWidth: 100
        }
    },
    computed: {
        isFormValid() {
            return this.usernameValid && this.passwordValid
        }
    },
    methods: {
        clearError() {
            this.errorMessage = ''
        },
        validateUsername() {
            const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/
            this.usernameValid = usernameRegex.test(this.username)
            return this.usernameValid
        },
        validatePassword() {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/
            this.passwordValid = passwordRegex.test(this.password)
            return this.passwordValid
        },
        debounceValidateUsername() {
            if (this.usernameTimer) {
                clearTimeout(this.usernameTimer)
            }
            this.usernameTimer = setTimeout(() => {
                this.validateUsername()
            }, 500)
        },
        debounceValidatePassword() {
            if (this.passwordTimer) {
                clearTimeout(this.passwordTimer)
            }
            this.passwordTimer = setTimeout(() => {
                this.validatePassword()
            }, 500)
        },
        validateForm() {
            if (!this.username) {
                this.errorMessage = '请输入用户名'
                return false
            }
            if (!this.password) {
                this.errorMessage = '请输入密码'
                return false
            }
            if (!this.validateUsername()) {
                this.errorMessage = '用户名格式不正确'
                return false
            }
            if (!this.validatePassword()) {
                this.errorMessage = '密码格式不正确'
                return false
            }
            return true
        },
        async handleRegister() {
            if (!this.validateForm()) return

            this.isLoading = true
            try {
                const response = await axios.post('http://localhost:3000/api/user/register', {
                    username: this.username,
                    password: this.password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (response.status === 201) {
                    this.showSuccessModal = true
                    this.countdown = 3
                    this.progressWidth = 100
                    
                    this.countdownTimer = setInterval(() => {
                        this.countdown--
                        this.progressWidth = (this.countdown / 3) * 100
                        
                        if (this.countdown < 0) {
                            clearInterval(this.countdownTimer)
                            this.showSuccessModal = false
                            this.$router.push('/login')
                        }
                    }, 1000)
                }
            } catch (error) {
                if (error.response) {
                    this.errorMessage = error.response.data.message || '注册失败'
                } else if (error.request) {
                    this.errorMessage = '网络错误，请检查网络连接'
                } else {
                    this.errorMessage = '注册失败，请稍后重试'
                }
                console.error('注册错误:', error)
            } finally {
                this.isLoading = false
            }
        }
    },
    beforeDestroy() {
        if (this.usernameTimer) {
            clearTimeout(this.usernameTimer)
        }
        if (this.passwordTimer) {
            clearTimeout(this.passwordTimer)
        }
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer)
        }
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

.register {
    max-width: 1200px;
    margin: 84px auto 20px;
    padding: 20px;
    position: relative;
    z-index: 1;
}

.register::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        45deg,
        rgba(255, 0, 0, 0.05),
        rgba(255, 165, 0, 0.05),
        rgba(255, 255, 0, 0.05),
        rgba(0, 255, 0, 0.05),
        rgba(0, 255, 255, 0.05),
        rgba(0, 0, 255, 0.05),
        rgba(238, 130, 238, 0.05),
        rgba(255, 0, 0, 0.05)
    );
    background-size: 800% 800%;
    animation: rainbowBackground 20s linear infinite;
    z-index: -2;
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

.register-form {
    background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000);
    background-size: 800% 800%;
    animation: rainbowBackground 15s linear infinite;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    width: 100%;
    max-width: 500px;
    min-width: 400px;
    box-sizing: border-box;
    animation: fadeInUp 0.8s ease-out 0.7s backwards, rainbowBackground 15s linear infinite;
    position: relative;
    overflow: hidden;
}

.register-form::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    z-index: 0;
}

.form-group, .error-message, .action-btn, .login-link {
    position: relative;
    z-index: 1;
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

.form-group input {
    width: 100%;
    padding: 1rem 1.2rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    background-color: rgba(255, 255, 255, 0.8);
    box-sizing: border-box;
}

.form-group input:focus {
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

.login-link {
    text-align: center;
    margin-top: 2rem;
    color: #666;
    font-size: 1.1rem;
}

.login-link a {
    color: #3182ce;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.login-link a:hover {
    color: #2c5282;
    text-decoration: underline;
}

@media (max-width: 768px) {
    .title {
        font-size: 1.5rem;
    }
    
    .register-form {
        padding: 1.5rem;
    }
}

.input-hint {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fadeIn 0.3s ease-out;
}

.input-hint i {
    font-size: 0.9rem;
}

.form-group input:invalid {
    border-color: #e74c3c;
}

.form-group input:valid {
    border-color: #2ecc71;
}

.success-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: modalFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    text-align: center;
    min-width: 300px;
    max-width: 400px;
    animation: modalContentFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-icon {
    font-size: 3rem;
    color: #2ecc71;
    margin-bottom: 1rem;
    animation: bounceIn 0.5s ease-out;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
}

.modal-message {
    font-size: 1.1rem;
    color: #4a5568;
    margin-bottom: 1.5rem;
}

.modal-progress {
    height: 4px;
    background-color: #e2e8f0;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 1rem;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #2ecc71, #27ae60);
    transition: width 1s linear;
}

@keyframes modalFadeIn {
    from {
        background-color: rgba(0, 0, 0, 0);
    }
    to {
        background-color: rgba(0, 0, 0, 0.5);
    }
}

@keyframes modalContentFadeIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes bounceIn {
    0% {
        transform: scale(0.3);
        opacity: 0;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
    80% {
        transform: scale(0.9);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style> 