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
	getDetail(id) {
		return request({
			url: `/api/v1/internal/tSettingAdSearch/getDetail/${id}`,
			method: 'get',
		})
	},

	// 新建
	insert(data) {
		return request({
			url: '/api/v1/internal/tSettingAdSearch/add',
			method: 'post',
			data: data,
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
	delete(id) {
		return request({
			url: `/api/v1/internal/tSettingAdSearch/delete/${id}`,
			method: 'delete',
		})
	},
}

export default api
