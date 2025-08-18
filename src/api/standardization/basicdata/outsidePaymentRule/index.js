import request from '@/utils/request'

const api = {
// 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/getPageList',
      method: 'get',
      params: query
    })
  },

// 查询数据列表
  getProcessName(query) {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/getProcessName',
      method: 'get',
      params: query
    })
  },

// 新增数据
  insert(data) {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/add',
      method: 'post',
      data: data
    })
  },

  // 修改数据
  update(data) {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/update',
      method: 'put',
      data: data
    })
  },

// 查询数据详细id
  getDataById(params) {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/getDetail',
      method: 'get',
      params: params
    })
  },

// 删除数据
  delete(id) {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/delete/' + id,
      method: 'delete'
    })
  },

  // 查询数据列表
  getMainWorkProcessSelectData() {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/getMainWorkProcessSelectData',
      method: 'get',
    })
  },

  // 查询数据列表
  getItemWorkProcessSelectData(query) {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/getItemWorkProcessSelectData',
      method: 'get',
      params: query
    })
  },

  // 查询数据列表
  detailAllList(data) {
    return request({
      url: '/api/v1/internal/tStdOprDetail/addList',
      method: 'post',
      data: data,
    })
  },

  getMingxiList(query) {
    return request({
      url: '/api/v1/internal/tStdOprDetail/getListByCondition',
      method: 'get',
      params: query,
    })
  },

  getOutPayAmount(query) {
    return request({
      url: '/api/v1/internal/tStdOutsidePaymentRule/getOutPayAmount',
      method: 'get',
      params: query,
    })
  },
}

export default api



