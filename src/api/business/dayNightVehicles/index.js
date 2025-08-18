import request from '@/utils/request'

const api = {
	// 根据查询机械类型
  getList(query) {
		return request({
			url: '/api/tosdata/workinform/v1/getNewList',
			method: 'get',
			params: query,
		})
	},

	// 根据id查询机械类型
  getDetailById(id) {
		return request({
			url: '/api/v1/internal/tWeightPlan/getDetail?id=' + id,
			method: 'get',
		})
	},

	// 新增机械类型
  insert(data) {
		return request({
			url: '/api/v1/internal/tWeightPlan/add',
			method: 'post',
			data: data,
		})
	},

	// 保存派车
  insertCar(data) {
		return request({
			url: '/api/tosdata/workinformtransportJSG/v1/saveList',
			method: 'post',
			data: data,
		})
	},

	// 逻辑删除排车计划
  delete(taskNo) {
		return request({
			url: `/api/tosdata/workinformtransportJSG/v1/delete/${taskNo}`,
			method: 'delete',
		})
	},
  updateStatus(data) {
    return request({
      url: '/api/tosdata/workinformtransportJSG/v1/updateStatus',
      method: 'post',
      data: data
    })
  },
  // 查询过磅数据
  getCarList(query) {
    return request({
      url: '/api/tosdata/workinformtransportJSG/v1/getCarsBySubPlanNO',
      method: 'get',
      params: query,
    })
  },

}
export default api
