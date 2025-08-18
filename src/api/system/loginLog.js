import request from '@/utils/request'

let path = '/api/internal/sysOperLog'

// 查询列表
export function listOperLog(query) {
  return request({
    url: '/api/v1/internal/sysLoginLog/getList',
    method: 'get',
    params: query 
  })
} 

export function getById(operId) {
  return request({
    url: '/api/v1/internal/sysLoginLog/getDetail/'+operId,
    method: 'get',
  })
}