import request from '@/utils/auth/request'

const api = {
	// 查询设备类型分类树形列表
	partsTree(params) {
		return request({
			url: '/api/v1/internal/equipmentType/partsTree',
			method: 'get',
			params: params
		})
	},
	// 根据id查询设备类型分类
	queryByUnitId(params) {
		return request({
			url: '/api/internal/inspectionStandard/queryByUnitId',
			method: 'get',
			params: params
		})
	},
	save(data) {
		return request({
			url: '/api/internal/inspectionStandard/save',
			method: 'post',
			data
		})
	},
	// 查询标准数据
	queryAll(params) {
		return request({
			url: '/api/internal/inspectionStandard/queryAll',
			method: 'get',
			params: params
		})
	},
}
export default api

