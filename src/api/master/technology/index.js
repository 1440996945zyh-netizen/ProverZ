import request from '@/utils/auth/request'

const api = {
	// 查询作业工艺查询
	listTechnology(query) {
		return request({
			url: '/api/internal/operationtechnique/listtechnique',
			method: 'get',
			params: query,
		})
	},

	// 新增作业工艺
	addTechnique(data) {
		return request({
			url: '/api/internal/operationtechnique/addtechnique',
			method: 'post',
			data: data,
		})
	},

	// 通过id查询作业工艺
	selectTechniQueById(id) {
		return request({
			url: '/api/internal/operationtechnique/selecttechniquebyid?id=' + id,
			method: 'get',
		})
	},
	// 通过作业工艺id查询配置表
	selectAllSubTechnique(id) {
		return request({
			url: '/api/internal/operationtechnique/selectallsubtechnique?id=' + id,
			method: 'get',
		})
	},

	// 通过id查询作业工艺配置
	selectSubTechniQueById(id) {
		return request({
			url: '/api/internal/operationtechnique/selectsubtechniquebyid?id=' + id,
			method: 'get',
		})
	},

	// 修改作业工艺
	updateTechnique(data) {
		return request({
			url: '/api/internal/operationtechnique/updatetechnique',
			method: 'put',
			data: data,
		})
	},

	// 删除作业过程
	deleteTechniqueById(id) {
		return request({
			url: '/api/internal/operationtechnique/deletetechniquebyid/' + id,
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

	// 根据查询工属具类型
	getWorkWareType(query) {
		return request({
			url: '/api/internal/public/getworkwaretype',
			method: 'get',
			params: {
				...query,
			},
		})
	},

	// 根据id查询工属具类型
	getWorkWareModel(typeCode) {
		return request({
			url: '/api/internal/public/getworkwaremodel?typeCode=' + typeCode,
			method: 'get',
		})
	},

	// 根据查询机械类型
	getMacTypeList(query) {
		return request({
			url: '/api/internal/public/getmactypelist',
			method: 'get',
			params: {
				...query,
			},
		})
	},

	// 根据code查询机械类型
	getMacModelList(macTypeCode) {
		return request({
			url: '/api/internal/public/getmacmodellist?macTypeCode=' + macTypeCode,
			method: 'get',
		})
	},

	// 根据查询工人岗位
	getWorkerPostList(query) {
		return request({
			url: '/api/internal/public/getDictList?types=WORKER_POST',
			method: 'get',
		})
	},
}
export default api
