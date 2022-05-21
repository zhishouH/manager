/** 
 * api 管理 
*/

import request from './../utils/request'

export default {
  // 登录
  loginApi(params) {
    return request({
      url: '/users/login',
      method: 'post',
      data: params,
    })
  },
  // 用户列表
  userList(params) {
    return request({
      url: '/users/list',
      method: 'get',
      data: params,
    })
  },
  // 全部用户列表
  userAllList() {
    return request({
      url: '/users/all/list',
      method: 'get',
      data: {},
    })
  },
  // 用户删除
  userDel(params) {
    return request({
      url: '/users/delete',
      method: 'post',
      data: params,
    })
  },
  // 用户创建/编辑
  userSubmit(params) {
    return request({
      url: '/users/operate',
      method: 'post',
      data: params,
    })
  },
  // 通知数量
  noticeCount() {
    return request({
      url: '/leave/count',
      method: 'get',
      data: {},
    })
  },
  // 菜单列表
  menuList(params) {
    return request({
      url: '/menu/list',
      method: 'get',
      data: params
    })
  },
  // 权限菜单
  permissionList() {
    return request({
      url: '/users/getPermissionList',
      method: 'get',
      data: {}
    })
  },
  // 菜单操作
  menuSubmit(params) {
    return request({
      url: '/menu/operate',
      method: 'post',
      data: params,
    })
  },
  // 所有角色列表
  roleAllList() {
    return request({
      url: '/roles/allList',
      method: 'get',
      data: {},
    })
  },
  // 角色列表
  roleList(params) {
    return request({
      url: '/roles/list',
      method: 'get',
      data: params,
    })
  },
  // 角色操作
  roleOperate(params) {
    return request({
      url: '/roles/operate',
      method: 'post',
      data: params,
    })
  },
  // 更新权限
  updatePermission(params) {
    return request({
      url: '/roles/update/permission',
      method: 'post',
      data: params,
    })
  },
  // 部门列表
  deptList(params) {
    return request({
      url: '/dept/list',
      method: 'get',
      data: params,
    })
  },
  // 部门操作
  deptOperate(params) {
    return request({
      url: '/dept/operate',
      method: 'post',
      data: params,
    })
  },
  applyList(params) {
    return request({
      url: '/leave/list',
      method: 'get',
      data: params,
    })
  },
  leaveOperate(params) {
    return request({
      url: '/leave/operate',
      method: 'post',
      data: params,
    })
  },
  leaveApprove(params) {
    return request({
      url: '/leave/approve',
      method: 'post',
      data: params,
    })
  },
}