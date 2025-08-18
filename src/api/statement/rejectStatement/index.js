import request from '@/utils/request'

const api = {
  // 获取 交接清单 列表
  getList(query) {
    return request({
      url: '/api/external/rejectStatement/getList',
      method: 'get',
      params: query,
    })
  },

}
export default api
