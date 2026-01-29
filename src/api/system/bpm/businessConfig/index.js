import request from '@/utils/auth/request'

const api = {
	// 分页查询BPM业务配置列表
	getList(query) {
		return request({
			url: '/api/internal/bpmBusinessConfig/getList',
			method: 'get',
			params: query,
		})
	},

	// 新增BPM业务配置
	insert(data) {
		return request({
			url: '/api/internal/bpmBusinessConfig/insert',
			method: 'post',
			data: data,
		})
	},

	// 修改BPM业务配置
	update(data) {
		return request({
			url: '/api/internal/bpmBusinessConfig/update',
			method: 'post',
			data: data,
		})
	},

	// 根据ID删除BPM业务配置
	deleteById(id) {
		return request({
			url: '/api/internal/bpmBusinessConfig/deleteById/' + id,
			method: 'delete',
		})
	},

	// 根据ID查询BPM业务配置详情
	getDetail(id) {
		return request({
			url: '/api/internal/bpmBusinessConfig/getDetail/' + id,
			method: 'get',
		})
	},
}

export default api
