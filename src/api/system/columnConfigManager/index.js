import request from '@/utils/auth/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/v1/internal/tSettingAdSearch/getList',
			method: 'get',
			params: query,
		})
	},

	// 查询单条
	getDetail(data) {
		return request({
			url: `/api/v1/internal/tSettingAdSearch/getDetail`,
			method: 'get',
			params: data,
		})
	},

	// 新建
	insert(data) {
		return request({
			url: '/api/v1/internal/tSettingAdSearch/add',
			method: 'post',
			data,
		})
	},
	// 修改
	update(data) {
		return request({
			url: '/api/v1/internal/tSettingAdSearch/update',
			method: 'post',
			data: data,
		})
	},

	//删除
	delete(data) {
		return request({
			url: `/api/v1/internal/tSettingAdSearch/delete`,
			method: 'delete',
			params: data, // 注意：DELETE请求用params而不是data
		})
	},
}

export default api
