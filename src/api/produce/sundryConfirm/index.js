import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/sundryConfirm/getList',
      method: 'get',
      params: query
    })
  },
  // 确认
  confirm(params) {
    return request({
      url: '/api/v1/internal/sundryConfirm/confirm',
      method: 'put',
      params,
    })
  },
  // 撤销
  revokeConfirm(params) {
    return request({
      url: '/api/v1/internal/sundryConfirm/revokeConfirm',
      method: 'put',
      params,
    })
  },
}

export default api



