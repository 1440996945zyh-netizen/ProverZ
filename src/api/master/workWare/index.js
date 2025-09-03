import request from '@/utils/auth/request'

const api = {
	// 根据查询工属具类型
	listWorkWareType(query) {
		return request({
			url: '/api/v1/internal/workwareType/listworkwaretype',
			method: 'get',
			params: query,
		})
	},

	// 根据id查询工属具类型
	selectbWorkWareTypeByid(id) {
		return request({
			url: '/api/v1/internal/workwareType/selectbworkwaretypebyid?id=' + id,
			method: 'get',
		})
	},

	// 新增工属具类型
	insertbWorkWareType(data) {
		return request({
			url: '/api/v1/internal/workwareType/insertbworkwaretype',
			method: 'post',
			data: data,
		})
	},

	// 修改工属具类型
	upDatebWorkWareType(data) {
		return request({
			url: '/api/v1/internal/workwareType/updatebworkwaretype',
			method: 'put',
			data: data,
		})
	},

	// 删除工属具类型
	deleteWorkWareType(id) {
		return request({
			url: '/api/v1/internal/workwareType/deleteworkwaretype/' + id,
			method: 'delete',
		})
	},
}
export default api
