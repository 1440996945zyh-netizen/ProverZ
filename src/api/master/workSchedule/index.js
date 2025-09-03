import request from '@/utils/auth/request'

const api = {
	// 查询工班设置
	getlist() {
		return request({
			url: '/api/external/workschedule/getlist',
			method: 'get',
		})
	},

	// 保存工班设置
	save(data) {
		return request({
			url: '/api/external/workschedule/save',
			method: 'post',
			data: data,
		})
	},
}

export default api
