import request from '@/utils/auth/request'

const api = {
	// 分页查询预算管理列表
	getList(params) {
		return request({
			url: '/api/internal/ECostBudgetManagement/getList',
			method: 'get',
			params,
		})
	},

	// 根据ID查询详情
	getById(id) {
		return request({
			url: '/api/internal/ECostBudgetManagement/getById?id=' + id,
			method: 'get',
		})
	},

	// 查询维修单位下拉
	queryRepairUnitName(params) {
		return request({
			url: '/api/internal/EMEquipRepairContract/queryUnitName',
			method: 'get',
			params,
		})
	},
	/**
	 * 根据部门级别查询部门列表
	 * @param {Number} deptLevel 部门级别
	 * @returns {Promise}
	 */
	getDeptListByLevel(params) {
		return request({
			url: '/api/internal/sysDept/getList',
			method: 'get',
			params: params,
		})
	},

	getWarningUser(params) {
		return request({
			url: '/api/internal/ECostBudgetManagement/getWarningUser',
			method: 'get',
			params,
		})
	},

	add(data) {
		return request({
			url: '/api/internal/ECostBudgetManagement/add',
			method: 'post',
			data,
		})
	},

	// 修改预算管理
	update(data) {
		return request({
			url: '/api/internal/ECostBudgetManagement/update',
			method: 'put',
			data,
		})
	},

	// 删除预算管理
	delete(id) {
		return request({
			url: '/api/internal/ECostBudgetManagement/delete',
			method: 'delete',
			params: { id },
		})
	},
}

export default api
