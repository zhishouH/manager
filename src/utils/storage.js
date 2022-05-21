/**
 * Storage 二次封装
*/

import config from './../config'

export default {
  // 设置
  setItem (key, val) {
    let storage = this.getStorage()
    storage[key] = val
    window.localStorage.setItem(config.namespace, JSON.stringify(storage))
  },
  // 获取
  getItem (key) {
    return this.getStorage()[key]
  },
  // 获取变量
  getStorage () {
    return JSON.parse(window.localStorage.getItem(config.namespace) || '{}')
  },
  // 清空一项
  clearItem (key) {
    let storage = this.getItem()[key]
    delete storage[key]
    window.localStorage.setItem(config.namespace, JSON.stringify(storage))
  },
  // 清空所有
  clearAll () {
    window.localStorage.clear()
  }
}