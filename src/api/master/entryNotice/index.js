import request from '@/utils/auth/request'

const api = {
  getList(data) {
    return request({
      url: '/api/v1/internal/tStdEnterPortNotice/getList',
      method: 'get',
      params:data
    })
  },
  // 获取列表
  detailByCondition(params) {
    return request({
      url: '/api/v1/internal/tStdEnterPortNotice/detailByCondition',
      method: 'get',
      params:params
    })
  },
  add(data) {
    return request({
      url: '/api/v1/internal/tStdEnterPortNotice/add',
      method: 'post',
      data:data
    })
  },
  delete(data) {
    return request({
      url: '/api/v1/internal/tStdEnterPortNotice/deleteNotice',
      method: 'delete',
      params:data
    })
  }
}
export default api
