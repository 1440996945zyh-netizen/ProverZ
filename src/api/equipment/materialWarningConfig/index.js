import request from '@/utils/auth/request'

const api = {
  getList(data) {
    return request({
      url: '/api/v1/internal/EMaterialWarningConfig/list',
      method: 'post',
      data: data,
    })
  },

  getById(id) {
    return request({
      url: '/api/v1/internal/EMaterialWarningConfig/getById?id=' + id,
      method: 'get',
    })
  },

  save(data) {
    return request({
      url: '/api/v1/internal/EMaterialWarningConfig/save',
      method: 'post',
      data: data,
    })
  },

  // 批量新增
  saveBatch(data) {
    return request({
      url: '/api/v1/internal/EMaterialWarningConfig/saveBatch',
      method: 'post',
      data: data,
    })
  },

  updateStatus(data) {
    return request({
      url: '/api/v1/internal/EMaterialWarningConfig/updateStatus',
      method: 'post',
      data: data,
    })
  },

  delete(id) {
    return request({
      url: '/api/v1/internal/EMaterialWarningConfig/delete/' + id,
      method: 'delete',
    })
  },

  // 批量删除
  deleteBatch(ids) {
    return request({
      url: '/api/v1/internal/EMaterialWarningConfig/deleteBatch',
      method: 'delete',
      data: ids,
    })
  },
}
export default api
