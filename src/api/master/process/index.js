import request from '@/utils/auth/request'

const api = {
	// 查询作业过程列表
	getlist(query) {
		return request({
			url: '/api/external/workprocess/getlist',
			method: 'get',
			params: query,
		})
	},

	// 新增作业过程
	insert(data) {
		return request({
			url: '/api/external/workprocess/insert',
			method: 'post',
			data: data,
		})
	},
	// 修改作业过程
	update(data) {
		return request({
			url: '/api/external/workprocess/update',
			method: 'put',
			data: data,
		})
	},
	// 删除作业过程
	deleteProcess(id) {
		return request({
			url: '/api/external/workprocess/deletebyid/' + id,
			method: 'delete',
		})
	},

	// 新增子作业过程
	insertChildprocess(data) {
		return request({
			url: '/api/external/workprocess/insertchildprocess',
			method: 'post',
			data: data,
		})
	},
	// 修改子作业过程
	updateChildprocess(data) {
		return request({
			url: '/api/external/workprocess/updatechildprocess',
			method: 'put',
			data: data,
		})
	},

	// 删除子作业过程
	deleteSubProcess(id) {
		return request({
			url: '/api/internal/operationprocess/deletesubprocess/' + id,
			method: 'delete',
		})
	},

	// 查询子过程
	listSubProcess(query) {
		return request({
			url: '/api/internal/operationprocess/listsubprocess',
			method: 'get',
			params: query,
		})
	},

	// 查询子过程
	getDictList(query) {
		return request({
			url: '/api/internal/public/getDictList',
			method: 'get',
			params: query,
		})
	},
}
export default api
