import request from '@/utils/auth/request'

const api = {
	// 查询设备台账信息列表（分页）
	getList(params) {
		return request({
			url: '/api/internal/MEquipmentOperationSum/getList',
			method: 'get',
			params: params,
		})
	},
}
export default api

