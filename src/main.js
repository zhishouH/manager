import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import * as Icons from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import request from './utils/request'
import storage from './utils/storage'
import api from './api'

console.log("环境变量=>", import.meta.env);

const app = createApp(App)

app.directive('has', {
  beforeMount: (el, binding) => {
    // 获取按钮权限
    let actionList = storage.getItem('actionList')
    let value = binding.value
    // 盘点列表中是否有对应的权限标识 
    let hasPermission = actionList.includes(value)
    if (!hasPermission) {
      el.style = 'display:none'
      setTimeout(() => {
        el.parentNode.removeChild(el)
      }, 0)
    }
  }
})

// 全局注册Elment-plus Icons 全局组件
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key])
})
// 全局挂载 axios
app.config.globalProperties.$request = request
// 全局挂载 storage
app.config.globalProperties.$storage = storage
// 全局挂载 api
app.config.globalProperties.$api = api

app.use(router).use(store).use(ElementPlus, { size: 'small' }).mount('#app')
