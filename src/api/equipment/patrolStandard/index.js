import request from '@/utils/auth/request'

const api = {
  getList(params) {
    return request({
      url: '/api/internal/patrolStandard/getList',
      method: 'get',
      params,
    })
  },

  getById(id) {
    return request({
      url: '/api/internal/patrolStandard/getById?id=' + id,
      method: 'get',
    })
  },

  add(data) {
    return request({
      url: '/api/internal/patrolStandard/add',
      method: 'post',
      data,
    })
  },

  update(data) {
    return request({
      url: '/api/internal/patrolStandard/update',
      method: 'put',
      data,
    })
  },

  delete(id) {
    return request({
      url: '/api/internal/patrolStandard/delete',
      method: 'delete',
      params: { id },
    })
  },
}

export default api
