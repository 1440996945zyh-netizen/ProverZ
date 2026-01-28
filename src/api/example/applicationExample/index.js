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
}

export default api
