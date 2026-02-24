import request from '@/utils/auth/request'

const api = {
	// 查询BPM应用示例列表
	getAllList(query) {
		return request({
			url: '/api/internal/bpmApplicationExample/getAllList',
			method: 'get',
			params: query,
		})
	},

	// 分页查询BPM应用示例列表
	getList(query) {
		return request({
			url: '/api/internal/bpmApplicationExample/getList',
			method: 'get',
			params: query,
		})
	},

	// 新增BPM应用示例
	insert(data) {
		return request({
			url: '/api/internal/bpmApplicationExample/insert',
			method: 'post',
			data: data,
		})
	},

	// 修改BPM应用示例
	update(data) {
		return request({
			url: '/api/internal/bpmApplicationExample/update',
			method: 'post',
			data: data,
		})
	},

	// 删除BPM应用示例
	deleteById(id) {
		return request({
			url: '/api/internal/bpmApplicationExample/deleteById/' + id,
			method: 'delete',
		})
	},

	// 根据ID查询BPM应用示例
	getDetail(id) {
		return request({
			url: '/api/internal/bpmApplicationExample/getDetail/' + id,
			method: 'get',
		})
	},
	//根据业务id查询BPM绑定流程定义id
	getProcDefId(query) {
		return request({
			url: '/api/internal/bpmBusinessConfig/getProcDefId',
			method: 'get',
			params: query,
		})
	},
	// 提交耗材付款申请
	submitConsumablesPayment(data) {
		return request({
			url: '/api/internal/bpmApplicationExample/submitConsumablesPayment',
			method: 'post',
			data: data,
		})
	},
	// 提交商业付款申请
	submitCommercialPayment(data) {
		return request({
			url: '/api/internal/bpmApplicationExample/submitCommercialPayment',
			method: 'post',
			data: data,
		})
	},

	submitUnificationPayment(data) {
		return request({
			url: '/api/internal/bpmApplicationExample/submitUnificationPayment',
			method: 'post',
			data: data,
		})
	},
}

export default api
