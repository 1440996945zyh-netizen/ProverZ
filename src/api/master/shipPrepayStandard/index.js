import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/mShipPrepayStd/getList',
      method: 'get',
      params: query
    })
  },
  // 查询数据详细id
  getNameById(id) {
    return request({
      url: `/api/v1/internal/mShipPrepayStd/getDetail?id=${id}`,
      method: 'get'
    })
  },


  // 新增数据
  insert(data) {
    return request({
      url: '/api/v1/internal/mShipPrepayStd/add',
      method: 'post',
      data: data
    })
  },

  // 修改数据
  update(data) {
    return request({
      url: '/api/v1/internal/mShipPrepayStd/update',
      method: 'put',
      data: data
    })
  },

  // 删除数据
  deleteById(id) {
    return request({
      url: '/api/v1/internal/mShipPrepayStd/delete/' + id,
      method: 'delete'
    })
  }
}

export default api



