import request from '@/utils/auth/request'

let path = '/api/internal/sysRole'

// 查询角色列表
export function listRole(query) {
  return request({
    url: path + '/getList',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: path + '/getById/' + roleId,
    method: 'get'
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: path + '/insert',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: path + '/update',
    method: 'put',
    data: data
  })
}

// 角色数据权限
export function dataScope(data) {
  return request({
    url: path + '/dataScope',
    method: 'put',
    data: data
  })
}

// 角色状态修改
export function changeRoleStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: path + '/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(idList) {
  return request({
    url: path + '/deleteById/' + idList,
    method: 'delete'
  })
}

// 查询角色已授权和未授权用户列表
export function allocatedOrUnallocatedList(params) {
  return request({
    url: path + '/allocatedOrUnallocatedList',
    method: 'get',
    params: params
  })
}

// 添加、取消用户授权
export function authUserInsertDelete(data) {
  return request({
    url: path + '/authUserInsertDelete',
    method: 'post',
    data: data
  })
}



// 根据角色ID查询部门树结构
export function getDeptTree(roleId) {
  return request({
    url: path + '/getDeptTree',
    method: 'get',
    params: {
      roleId: roleId
    }
  })
}


// 根据角色ID查询菜单下拉树结构
export function getMenuTree(roleId) {
  return request({
    url:  path + '/getMenuTree',
    method: 'get',
    params: {
      roleId: roleId
    }
  })
}