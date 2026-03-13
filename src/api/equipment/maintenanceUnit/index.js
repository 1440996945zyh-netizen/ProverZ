import request from '@/utils/auth/request'

const api = {
	getList(params) {
		return request({
			url: '/api/internal/EMEquipRepairContract/getList',
			method: 'get',
			params: params,
		})
	},

	getById(id) {
		return request({
			url: '/api/internal/EMEquipRepairContract/getById?id=' + id,
			method: 'get',
		})
	},

	add(data) {
		return request({
			url: '/api/internal/EMEquipRepairContract/add',
			method: 'post',
			data: data,
		})
	},

	update(data) {
		return request({
			url: '/api/internal/EMEquipRepairContract/update',
			method: 'put',
			data: data,
		})
	},

	delete(id) {
		return request({
			url: '/api/internal/EMEquipRepairContract/delete',
			method: 'delete',
			params: { id },
		})
	},
	/**
	 * 根据部门级别查询部门列表
	 * @param {Number} deptLevel 部门级别
	 * @returns {Promise}
	 */
	getDeptListByLevel(deptLevel) {
		return request({
			url: '/api/internal/sysDept/getListByLevel',
			method: 'get',
			params: { deptLevel },
		})
	},
	getOutTypeNum(params) {
		return request({
			url: '/api/internal/EMEquipRepairContract/getOutTypeNum',
			method: 'get',
			params: params,
		})
	},
}
export default api
