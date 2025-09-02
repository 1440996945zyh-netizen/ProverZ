import request from '@/utils/auth/request'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/api/internal/router/getRouters',
    method: 'get'
  })
}