import request from '@/utils/auth/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/internal/print/getList',
			method: 'get',
			params: query,
		})
	},

	// 查询单条
	getDetail(id) {
		return request({
			url: `/api/internal/print/getDetail/${id}`,
			method: 'get',
		})
	},

	// 新建
	insert(data) {
		return request({
			url: '/api/internal/print/insert',
			method: 'post',
			data: data,
		})
	},
	// 修改
	update(data) {
		return request({
			url: '/api/internal/print/update',
			method: 'post',
			data: data,
		})
	},

	//删除
	delete(id) {
		return request({
			url: `/api/internal/print/deleteById/${id}`,
			method: 'delete',
		})
	},

	// 获取列表
	getModelTypeList(query) {
		return request({
			url: '/api/internal/print/getModelTypeList',
			method: 'get',
			params: query,
		})
	},

	// // ↑ 泊位操作
	// // ↓ 揽庄操作

	// //获取泊位揽庄列表
	// getBollardList(params) {
	// 	return request({
	// 		url: `/api/v1/internal/mBerth/getBollardList?berthId=${params.berthId}&bollardName=${params.bollardName}`,
	// 		method: 'get',
	// 	})
	// },

	// // 查询单条泊位揽庄记录
	// getBollardById(id) {
	// 	return request({
	// 		url: `/api/v1/internal/mBerth/getBollardDetail?id=${id}`,
	// 		method: 'get',
	// 	})
	// },

	// // 新建泊位揽庄
	// insertBollard(data) {
	// 	return request({
	// 		url: '/api/v1/internal/mBerth/addBollard',
	// 		method: 'post',
	// 		data: data,
	// 	})
	// },

	// // 修改泊位揽庄
	// updateBollard(data) {
	// 	return request({
	// 		url: '/api/v1/internal/mBerth/updateBollard',
	// 		method: 'put',
	// 		data: data,
	// 	})
	// },

	// //删除泊位揽庄
	// deleteBollard(id) {
	// 	return request({
	// 		url: `/api/v1/internal/mBerth/deleteBollard/${id}`,
	// 		method: 'delete',
	// 	})
	// },
}
export default api
