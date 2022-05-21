/**
 * axios  二次封装
*/

import axios from "axios";
import config from './../config'
import { ElMessage } from 'element-plus'
import router from "./../router";
import storage from './storage'

const TOKEN_INVALID = 'Token认证失败\，请重新登录!'
const NETWORK_ERROR = '网络请求异常，请稍后重试'

// 创建axios实例对象，添加全局配置
const service = axios.create({
  baseURL: config.baseApi,
  timeout: 8000
})

// 请求拦截
service.interceptors.request.use((req) => {
  const headers = req.headers
  const { token = '' } = storage.getItem('userInfo') || {}
  if (!headers.Authorization) headers.authorization = 'Bearer ' + token
  return req
})

// 响应拦截
service.interceptors.response.use((res) => {
  const { code, data, msg } = res.data
  if (code === 200) {
    // 成功
    return data
  } else if (code === 50001) {
    // 过期或者失效
    ElMessage.error(TOKEN_INVALID)
    // 跳转登录页面
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return Promise.reject(TOKEN_INVALID)
  } else {
    // 常规报错
    ElMessage.error(msg || NETWORK_ERROR)
    return Promise(msg || NETWORK_ERROR)
  }
})

// 请求核心函数
function request(options) {
  options.method = options.method || 'get'
  if (options.method.toLowerCase() === 'get') {
    options.params = options.data
  }
  let isMock = config.mock
  // 局部mock开关
  if (typeof options.mock != 'undefined') {
    isMock = options.mock
  }
  // mock
  if (config.env === 'prod') {
    service.defaults.baseURL = config.baseApi
  } else {
    service.defaults.baseURL = isMock ? config.mockApi : config.baseApi
  }
  return service(options)
}
['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
  request[item] = (url, data, options) => {
    return request({
      url,
      data,
      method: item,
      ...options
    })
  }
})

export default request