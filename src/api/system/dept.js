import request from '@/utils/auth/request'

let path = '/api/internal/sysDept'
// 查询部门列表
export function listDept(query) {
  return request({
    url: path + '/getList',
    method: 'get',
    params: query
  })
}
// 查询部门详细
export function getDept(id) {
  return request({
    url: path + `/getDetail/${id}`,
    method: 'get'
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: path,
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: path,
    method: 'put',
    data: data
  })
}

// 删除部门
export function delDept(id) {
  return request({
    url: path + '/delete/' + id,
    method: 'delete'
  })
}

 // 根据部门级别查询部门列表
export function getListByLevel(deptLevel) {
  return request({
    url: path + '/getListByLevel',
    method: 'get',
    params: { deptLevel }
  })
}

 // 根据父部门ID查询部门列表
export function getListByParentId(parentId) {
  return request({
    url: path + '/getListByParentId',
    method: 'get',
    params: { parentId }
  })
}