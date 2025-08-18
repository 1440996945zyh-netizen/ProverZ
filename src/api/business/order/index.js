import request from '@/utils/request'

const api = {
// 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tBusOrder/getList',
      method: 'get',
      params: query
    })
  },

// 修改数据
  update(data) {
    return request({
      url: '/api/v1/internal/tBusOrder/update',
      method: 'put',
      data: data
    })
  },

  // 查询数据详细id
  getDetailById(query) {
    return request({
      url: '/api/v1/internal/tBusOrder/getDetail',
      method: 'get',
      params: query
    })
  },

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}

export default api



