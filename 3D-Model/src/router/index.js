// src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import ModelGenerator from '@/components/ModelGenerator.vue'
import UserRegister from '@/components/Register.vue'
import UserLogin from '@/components/Login.vue'
import UserProfile from '@/components/Profile.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: ModelGenerator  // 将模型生成器设置为首页
    },
    {
        path: '/register',
        name: 'UserRegister',
        component: UserRegister
    },
    {
        path: '/login',
        name: 'UserLogin',
        component: UserLogin
    },
    {
        path: '/profile',
        name: 'UserProfile',
        component: UserProfile
    }
]

const router = new VueRouter({
    mode: 'history',
    routes
})

export default router