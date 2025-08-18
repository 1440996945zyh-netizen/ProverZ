import request from '@/utils/request'

const api = {
// 获取列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tDisCloseSail/getList',
      method: 'get',
      params: query
    })
  },


// 根据Id查询单条
  getDataById(id) {
    return request({
      url: `/api/v1/internal/tDisCloseSail/getDetail?id=${id}`,
      method: 'get'
    })
  },


// 新建
  insert(data) {
    return request({
      url: '/api/v1/internal/tDisCloseSail/add',
      method: 'post',
      data: data
    })
  },


// 修改
  update(data) {
    return request({
      url: '/api/v1/internal/tDisCloseSail/update',
      method: 'put',
      data: data
    })
  },


  //删除
  delete(id) {
    return request({
      url: `/api/v1/internal/tDisCloseSail/delete/${id}`,
      method: 'delete'
    })
  },
  // 获取列表
  getShipVoyageList(query) {
    return request({
      url: '/api/v1/internal/tDisCloseSail/getShipVoyageList',
      method: 'get',
      params: query
    })
  },

  // 获取列表
  getExport(query) {
    return request({
      url: '/api/v1/internal/tDisCloseSail/export',
      method: 'get',
      responseType: 'blob',
      params: query
    })
  },

}
export default api

