import request from '@/utils/request'

const api = {
	// 获取列表
	getList(query) {
		return request({
			url: '/api/v1/internal/tBusCustomer/getList',
			method: 'get',
			params: query,
		})
	},

	// 根据Id查询单条
	getDataById(id) {
		return request({
			url: `/api/v1/internal/tBusCustomer/getDetail/${id}`,
			method: 'get',
		})
	},

	// 新建
	insert(data) {
		return request({
			url: '/api/v1/internal/tBusCustomer/add',
			method: 'post',
			data: data,
		})
	},
	// 驳回
	reject(data) {
		return request({
			url: '/api/v1/internal/tBusCustomer/reject',
			method: 'put',
			data: data,
		})
	},
  doCredit(data) {
    return request({
      url: '/api/v1/internal/tBusCustomer/doCredit',
      method: 'post',
      data: data,
    })
  },

  doAccountType(data) {
    return request({
      url: '/api/v1/internal/tBusCustomer/doAccountType',
      method: 'post',
      data: data,
    })
  },

	// 修改
	update(data) {
		return request({
			url: '/api/v1/internal/tBusCustomer/update',
			method: 'put',
			data: data,
		})
	},

	//删除
	delete(id) {
		return request({
			url: `/api/v1/internal/tBusCustomer/delete/${id}`,
			method: 'delete',
		})
	},

  publishMisc(id){
    return request({
      url: `/api/v1/internal/tBusCustomer/publishmisc/${id}`,
      method: 'get',
    })
  },

  revokeMisc(id){
    return request({
      url: `/api/v1/internal/tBusCustomer/revokeMisc/${id}`,
      method: 'get',
    })
  },
  getData(query){
    return request({
      url: `/api/v1/internal/tBusCustomer/getData`,
      method: 'get',
      params:query
    })
  },
  syncData(query){
    return request({
      url: `/api/v1/internal/tBusCustomer/sync`,
      method: 'post',
      data:query
    })
  },

}
export default api
