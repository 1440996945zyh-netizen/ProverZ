import request from '@/utils/request'

const api = {
  //获取数据列表/api/v1/internal/tBusTrust/getList
  getList(params) {
    return request({
      url: '/api/external/trustWriteOff/getWriteOffList',
      method: 'get',
      params: params,
    })
  },
  getWriteOffById(params) {
    return request({
      url: '/api/external/trustWriteOff/getWriteOffById',
      method: 'get',
      params: params,
    })
  },
  writeOff(params) {
    return request({
      url: `/api/external/trustWriteOff/writeOff`,
      method: 'post',
	  params
    })
  },

  cancelWriteOff(params) {
    return request({
      url: `/api/external/trustWriteOff/cancelWriteOff`,
      method: 'post',
      params
    })
  },





	//新增作业指令
	addTrustOrder(params) {
		return request({
			url: '/api/v1/internal/tBusTrust/add',
			method: 'post',
			data: params,
		})
	},
	//修改作业指令
	update(params) {
		return request({
			url: '/api/v1/internal/tBusTrust/update',
			method: 'put',
			data: params,
		})
	},


	//发布
	release(params) {
		return request({
			url: `/api/v1/internal/tBusTrust/release/${params}`,
			method: 'post',
		})
	},
	//删除
	delete(params) {
		return request({
			url: `/api/v1/internal/tBusTrust/delete/${params}`,
			method: 'delete',
		})
	},
	//获取单挑详情
	getDetail(params) {
		return request({
			url: `/api/v1/internal/tBusTrust/getDetail?id=${params}`,
			method: 'get',
		})
	},
	// 查询票据
	getTicketInfo(params) {
		return request({
			url: `/api/v1/internal/tBusTrust/getticketinfo`,
			method: 'get',
			params: params,
		})
	},
	// 查询作业过程
	getWorkProcess() {
		return request({
			url: `/api/internal/public/getLocalSelect?type=MAIN_WORK_PROCESS`,
			method: 'get',
		})
	},
}
export default api
