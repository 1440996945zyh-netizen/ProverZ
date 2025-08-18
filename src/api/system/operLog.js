import request from '@/utils/request'

let path = '/api/internal/sysOperLog'

// 查询角色列表
export function listOperLog(query) {
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
export function getById(operId) {
  return request({
    url: path + '/' + operId,
    method: 'get',
  })
}

