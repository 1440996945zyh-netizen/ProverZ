import request from '@/utils/auth/request'

const api = {
  // 列表查询
  getList(params) {
    return request({
      url: '/api/v1/internal/materialSupplier/list',
      method: 'get',
      params,
    })
  },

  // 详情
  getById(id) {
    return request({
      url: '/api/v1/internal/materialSupplier/getById?id=' + id,
      method: 'get',
    })
  },

  // 新增
  add(data) {
    return request({
      url: '/api/v1/internal/materialSupplier/add',
      method: 'post',
      data,
    })
  },

  // 修改
  update(data) {
    return request({
      url: '/api/v1/internal/materialSupplier/update',
      method: 'put',
      data,
    })
  },

  // 删除
  delete(id) {
    return request({
      url: '/api/v1/internal/materialSupplier/delete/' + id,
      method: 'delete',
    })
  },
}

export default api
