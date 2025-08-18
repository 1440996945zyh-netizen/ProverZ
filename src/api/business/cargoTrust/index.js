import request from '@/utils/request'

const api = {

	//已发布修改作业指令
  updateConsigner(params) {
		return request({
			url: '/api/v1/internal/tBusTrust/updateConsigner',
			method: 'put',
			data: params,
		})
	},
  // 获取当前时间班次
  getCurrentShift(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },
	//获取数据列表
	getList(params) {
		return request({
			url: '/api/v1/internal/tBusTrust/getList',
			method: 'get',
			params: params,
		})
	},
	//获取单挑详情
	getDetail(params) {
		return request({
			url: `/api/v1/internal/tBusTrust/getDetail?id=${params}`,
			method: 'get',
		})
	},
}
export default api
