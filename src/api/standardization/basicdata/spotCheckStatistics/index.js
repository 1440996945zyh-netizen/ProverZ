import request from '@/utils/request'
const api = {

  // 获取点检计划报告主页面展示的数据
  getList(query) {
    return request({
      url: '/api/v1/internal/SpotCheckStatistics/getList',
      method: 'get',
      params: query
    })
  },
}
export default api
