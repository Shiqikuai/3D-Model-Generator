// src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router' // 导入路由配置
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@fortawesome/fontawesome-free/css/all.css'

Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  router, // 将路由实例注入到 Vue 实例中
  render: h => h(App)
}).$mount('#app')