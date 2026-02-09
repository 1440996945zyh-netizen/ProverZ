import request from '@/utils/auth/request'

const api = {
	// 查询特种设备列表（分页）
	getList(params) {
		return request({
			url: '/api/v1/internal/specialEquipment/list',
			method: 'get',
			params: params,
		})
	},
}

export default api

