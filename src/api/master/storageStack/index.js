import request from '@/utils/auth/request'

const api = {
	/**
	 * 获取库场列表
	 * @param {String} id parentId
	 * @returns
	 */
	getbyparentid(id) {
		return request({
			url: `/api/external/storageyard/getbyparentid/${id}`,
			method: 'get',
		})
	},

	// 查询单条库场
	getStorageById(id) {
		return request({
			url: `/api/v1/internal/mStorage/getDetail?id=${id}`,
			method: 'get',
		})
	},

	// 新建库场
	insert(data) {
		return request({
			url: '/api/external/storageyard/insert',
			method: 'post',
			data: data,
		})
	},

	// 修改库场
	update(data) {
		return request({
			url: '/api/external/storageyard/update',
			method: 'put',
			data: data,
		})
	},

	//删除库场
	deletebyid(id) {
		return request({
			url: `/api/external/storageyard/deletebyid/${id}`,
			method: 'delete',
		})
	},

	// ↑ 库场操作
	// ↓ 垛位操作

	//获取垛位列表
	getstorageStackList(params) {
		return request({
			url: `/api/v1/internal/mStorage/getStackList?storageCode=${params.storageCode}&stackName=${params.stackName}`,
			method: 'get',
		})
	},

	// 查询单条垛位记录
	getstorageStackById(id) {
		return request({
			url: `/api/v1/internal/mStorage/getStackDetail?id=${id}`,
			method: 'get',
		})
	},

	// 新建垛位
	insertstorageStack(data) {
		return request({
			url: '/api/v1/internal/mStorage/addStack',
			method: 'post',
			data: data,
		})
	},

	// 修改垛位
	updatestorageStack(data) {
		return request({
			url: '/api/v1/internal/mStorage/updateStack',
			method: 'put',
			data: data,
		})
	},

	//删除垛位
	deletestorageStack(id) {
		return request({
			url: `/api/v1/internal/mStorage/deleteStack/${id}`,
			method: 'delete',
		})
	},
}
export default api
