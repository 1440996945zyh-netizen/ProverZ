import request from '@/utils/auth/request'

const api = {
// 查询数据列表
  getList(query) {
    return request({
      url: '/api/internal/port/getList',
      method: 'get',
      params: query
    })
  },

// 查询数据详细id
  getPortById(id) {
    return request({
      url: '/api/internal/port/getDetail/' + id,
      method: 'get'
    })
  },


// 新增数据
  insertPort(data) {
    return request({
      url: '/api/internal/port/insert',
      method: 'post',
      data: data
    })
  },

// 修改数据
  updatePort(data) {
    return request({
      url: '/api/internal/port/update',
      method: 'post',
      data: data
    })
  },

// 删除数据
  deleteById(id) {
    return request({
      url: '/api/internal/port/deleteById/' + id,
      method: 'delete'
    })
  }
}

export default api
