import request from '@/utils/request'

const api = {
// 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tStdCostAccounting/getPageList',
      method: 'get',
      params: query
    })
  },

// 查询数据列表
  getProcessName(query) {
    return request({
      url: '/api/v1/internal/tStdCostAccounting/getProcessName',
      method: 'get',
      params: query
    })
  },

// 新增数据
  insert(data) {
    return request({
      url: '/api/v1/internal/tStdCostAccounting/add',
      method: 'post',
      data: data
    })
  },

  // 修改数据
  update(data) {
    return request({
      url: '/api/v1/internal/tStdCostAccounting/add',
      method: 'post',
      data: data
    })
  },

// 查询数据详细id
  getDataById(params) {
    return request({
      url: '/api/v1/internal/tStdCostAccounting/getDetail',
      method: 'get',
      params: params
    })
  },


// 删除数据
  delete(id) {
    return request({
      url: '/api/v1/internal/tStdCostAccounting/delete/' + id,
      method: 'delete'
    })
  },

}

export default api



