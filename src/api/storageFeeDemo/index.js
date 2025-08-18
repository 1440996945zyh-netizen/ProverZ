import request from '@/utils/request'

const api = {
	// 获取列表
  getList(query) {
		return request({
			url: '/api/external/miscbilling/startCalStorage',
			method: 'get',
			params: query,
		})
	},  // 获取当前时间班次
  getCurrentShift(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },
}
export default api
