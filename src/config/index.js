/**
 * 环境配置封装
*/

const env = import.meta.env.MODE || 'prod'
const Envconfig = {
  dev: {
    baseApi: '/api',
    mockApi: 'https://www.fastmock.site/mock/57f7ffdd89a6b434a9865a23e054238e/api'
  },
  test: {
    baseApi: '/',
    mockApi: '/'
  },
  prod: {
    baseApi: '/',
    mockApi: '/'
  }
}

export default {
  env,
  mock: false,
  namespace: 'manager',
  ...Envconfig[env]
}