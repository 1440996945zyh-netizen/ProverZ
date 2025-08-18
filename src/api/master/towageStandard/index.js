import request from '@/utils/request'
import get from '../../../../docs/.vitepress/cache/deps/element-plus'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/external/tugFee/listTugFee',
			method: 'get',
			params: query,
		})
	},

	// 新增拖轮费用数据
	insert(data) {
		return request({
			url: '/api/external/tugFee/insertTugFee',
			method: 'post',
			data: data,
		})
	},

	// //修改拖轮数据
	update(data) {
		return request({
			url: '/api/external/tugFee/updateTugFee',
			method: 'put',
			data: data,
		})
	},

	// //通过ID删除拖轮数据
	delete(id) {
		return request({
			url: '/api/external/tugFee/deleteTugFee?id=' + id,
			method: 'delete',
		})
	},
}
export default api
