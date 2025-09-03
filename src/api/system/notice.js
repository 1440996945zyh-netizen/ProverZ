import request from '@/utils/auth/request'

const api = {
	/**
	 * 我是函数名
	 * @param {Object} query {参数结构}
	 * @returns 返回数据结构稍微一写
	 */
	listNotice(query) {
		return request({
			url: '/system/notice/list',
			method: 'get',
			params: query,
		})
	},

	// 查询公告详细
	getNotice(noticeId) {
		return request({
			url: '/system/notice/' + noticeId,
			method: 'get',
		})
	},

	// 新增公告
	addNotice(data) {
		return request({
			url: '/system/notice',
			method: 'post',
			data: data,
		})
	},

	// 修改公告
	updateNotice(data) {
		return request({
			url: '/system/notice',
			method: 'put',
			data: data,
		})
	},

	// 删除公告
	delNotice(noticeId) {
		return request({
			url: '/system/notice/' + noticeId,
			method: 'delete',
		})
	},
}
export default api
