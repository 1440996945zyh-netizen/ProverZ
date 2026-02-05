import request from '@/utils/request'

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
			url: '/api/internal/maintainStandard/queryByUnitId',
			method: 'get',
			params: params
		})
	},
	save(data) {
		return request({
			url: '/api/internal/maintainStandard/save',
			method: 'post',
			data
		})
	},
	// 获取润滑保养标准
	queryAll(params) {
		return request({
			url: '/api/internal/maintainStandard/queryAll',
			method: 'get',
			params: params
		})
	},
}
export default api

