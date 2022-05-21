import { createRouter, createWebHashHistory } from "vue-router";
import Home from '@/components/Home.vue'
import storage from "../utils/storage";
import api from './../api'
import utils from './../utils/utils'

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    redirect: 'welcome',
    meta: { title: '首页' },
    children: [
      {
        name: 'welcome',
        path: 'welcome',
        component: () => import('@/views/Welcome.vue'),
        meta: { title: '欢迎进入Manager' }
      }
    ]
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    name: 'notfound',
    path: '/notfound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

async function loadAsyncRouotes() {
  let userInfo = storage.getItem('userInfo') || {}
  if (userInfo.token) {
    try {
      const { menuList } = await api.permissionList()
      let routes = utils.generateRoute(menuList)
      routes.map((route) => {
        let url = `./../views/${route.component}.vue`
        route.component = () => import( /* @vite-ignore */ url)
        router.addRoute('home', route)
      })
    } catch (error) { }
  }
}

await loadAsyncRouotes()

// 判断当前地址是否可以访问
// function checkPermission(path) {
//   let hasPermission = router.getRoutes().filter(route => route.path == path).length
//   if (hasPermission) {
//     return true
//   } else {
//     return false
//   }
// }

// 路由守卫
router.beforeEach((to, from, next) => {
  if (router.hasRoute(to.name)) {
    document.title = to.meta.title
    next()
  } else {
    next('/notfound')
  }
})

export default router