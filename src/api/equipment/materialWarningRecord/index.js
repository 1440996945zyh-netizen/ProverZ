import request from '@/utils/auth/request'

const api = {
  getList(params) {
    return request({
      url: '/api/v1/internal/EMaterialWarningRecord/list',
      method: 'post',
      params: params,
    })
  },

  getById(id) {
    return request({
      url: '/api/v1/internal/EMaterialWarningRecord/getById?id=' + id,
      method: 'get',
    })
  },

  handleBatch(data) {
    return request({
      url: '/api/v1/internal/EMaterialWarningRecord/handleBatch',
      method: 'post',
      data,
    })
  },
}
export default api
