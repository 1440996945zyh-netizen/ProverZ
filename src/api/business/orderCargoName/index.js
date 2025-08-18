import request from '@/utils/request'

const api = {

  // 查询票据
  getOrderCargoName(params) {
    return request({
      url: `/api/v1/internal/tBusTrust/getOrderCargoName`,
      method: 'get',
      params: params,
    })
  },

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 	//新增作业指令
// 	addTrustOrder(params) {
// 		return request({
// 			url: '/api/v1/internal/tBusTrust/add',
// 			method: 'post',
// 			data: params,
// 		})
// 	},
// 	//修改作业指令
// 	update(params) {
// 		return request({
// 			url: '/api/v1/internal/tBusTrust/update',
// 			method: 'put',
// 			data: params,
// 		})
// 	},
//   //修改作业指令
//   reject(params) {
//     return request({
//       url: '/api/v1/internal/tBusTrust/reject',
//       method: 'put',
//       data: params,
//     })
//   },
// 	//已发布修改作业指令
// 	updateAfterRelease(params) {
// 		return request({
// 			url: '/api/v1/internal/tBusTrust/updateAfterRelease',
// 			method: 'put',
// 			data: params,
// 		})
// 	},
// 	//获取数据列表
// 	getList(params) {
// 		return request({
// 			url: '/api/v1/internal/tBusTrust/getList',
// 			method: 'get',
// 			params: params,
// 		})
// 	},
// 	//发布
// 	release(params) {
// 		return request({
// 			url: `/api/v1/internal/tBusTrust/release/${params}`,
// 			method: 'post',
// 		})
// 	},
// 	//撤销发布
// 	cancelRelease(id,type) {
// 		return request({
// 			url: `/api/v1/internal/tBusTrust/cancelRelease?trustId=${id}&type=${type}`,
// 			method: 'put',
// 		})
// 	},
// 	//删除
// 	delete(params) {
// 		return request({
// 			url: `/api/v1/internal/tBusTrust/delete/${params}`,
// 			method: 'delete',
// 		})
// 	},
// 	//获取单挑详情
// 	getDetail(params) {
// 		return request({
// 			url: `/api/v1/internal/tBusTrust/getDetail?id=${params}`,
// 			method: 'get',
// 		})
// 	},
// 	//根据货主 货物编码 贸别 查合同列表
// 	getListContract(params) {
// 		return request({
// 			url: `/api/v1/internal/tBusTrust/listContract?cargoOwnerId=${params.cargoOwnerId}&cargoCode=${params.cargoCode}&tradeType=${params.tradeType}`,
// 			method: 'get',
// 		})
// 	},
//   getPreferentialRate(params) {
// 		return request({
// 			url: `/api/v1/internal/tBusTrust/getPreferentialRate`,
// 			method: 'get',
//       params: params,
// 		})
// 	},
// 	// 查询通知单类型
// 	getListTrustType(params) {
// 		return request({
// 			url: `/api/v1/internal/tBusTrust/listTrustType`,
// 			method: 'get',
// 			params: params,
// 		})
// 	},
// 	// 查询作业过程
// 	getWorkProcess() {
// 		return request({
// 			url: `/api/internal/public/getLocalSelect?type=MAIN_WORK_PROCESS`,
// 			method: 'get',
// 		})
// 	},
// 	// 修改垛位
// 	updateMass(data) {
// 		return request({
// 			url: `/api/v1/internal/tBusTrustLocation/update`,
// 			method: 'put',
// 			data: data,
// 		})
// 	},
// 	getShipvoyageItemFile(id) {
// 		return request({
// 			url: '/api/v1/internal/tBusTrust/listShipvoyageItemFile?id=' + id,
// 			method: 'get',
// 		})
// 	},
// 	//获取数据列表
// 	getStorageYardList(params) {
// 		return request({
// 			url: '/api/v1/internal/tBusTrust/getStorageYardList',
// 			method: 'get',
// 			params: params,
// 		})
// 	},
//   //库场计划查询详情
//   getDetailMass(params) {
//     return request({
//       url: '/api/v1/internal/tBusTrustLocation/getDetail',
//       method: 'get',
//       params: params,
//     })
//   },
//   //库场计划查询详情
//   getMassIdsWithTrustId(params) {
//     return request({
//       url: '/api/v1/internal/tBusTrustLocation/getMassIdsWithTrustId',
//       method: 'get',
//       params: params,
//     })
//   },
//   cancelAudit(id){
//     return request({
//       url: '/api/v1/internal/tBusTrust/cancelAudit?id='+id,
//       method: 'get',
//     })
//   },
//   // 获取当前时间班次
//   getCurrentShift(params) {
//     return request({
//       url: '/api/internal/public/getDateAndShift',
//       method: 'get',
//       params,
//     })
//   },
//   exportFeeEvent(trustId){
//     return request({
//       url: '/api/v1/internal/tBusTrust/exportFeeEvent?trustId='+trustId,
//       method: 'get',
//       responseType: 'blob'
//     })
//   },
//   isStopStatus(data) {
//     return request({
//       url: '/api/v1/internal/tBusTrust/isStopStatus',
//       method: 'put',
//       data: data
//     })
//   },
//   getTrustCargoById(id){
//     return request({
//       url: '/api/v1/internal/tBusTrust/getTrustCargoById?id='+id,
//       method: 'get',
//     })
//   },
//   // 根据查询机械类型
//   addDispatchRelease(data) {
//     return request({
//       url: '/api/v1/internal/tBusDispatchRelease/addCargoList',
//       method: 'post',
//       data: data,
//     })
//   },
//   deleteDispatchRelease(data) {
//     return request({
//       url: '/api/v1/internal/tBusDispatchRelease/deleteDispatchRelease',
//       method: 'post',
//       data: data,
//     })
//   },
}
export default api
