import request from '@/utils/request'

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