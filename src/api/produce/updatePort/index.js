import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/external/updatePortStorage/getList',
      method: 'get',
      params: query
    })
  },


  // 修改数据
  update(data) {
    return request({
      url: '/api/external/updatePortStorage/update',
      method: 'put',
      data: data
    })
  },
}

export default api



