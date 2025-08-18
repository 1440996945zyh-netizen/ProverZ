import request from '@/utils/request'

const api = {
	/**
	 * 获取作业计划主列表
	 * @param {*} params {workDate，classCode}
	 */
	getWorkTicketList(params) {
		return request({
			url: '/api/external/workTicket/getWorkTicketList',
			method: 'get',
			params,
		})
	},

  /**
   * 获取作业计划主列表
   * @param {*} params {workDate，classCode}
   */
  getMonthWorkTicketList(params) {
    return request({
      url: '/api/external/workTicket/getMonthWorkTicketList',
      method: 'get',
      params,
    })
  },

	listMass(id) {
		return request({
			url: '/api/internal/public/listMass?regionId=' + id,
			method: 'get',
		})
	},

	/**
	 * 获取指令票货id
	 * @param {String} workPlanId
	 */
	listTrustCargo(workPlanId) {
		return request({
			url: `/api/external/workTicket/listTrustCargo?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	/**
	 * 根据票货id查目标票货
	 * @param {String} cargoInfoId
	 */
	listTargetCargo(cargoInfoId) {
		return request({
			url: `/api/external/workTicket/listTargetCargo?cargoInfoId=${cargoInfoId}`,
			method: 'get',
		})
	},
	/**
	 * 根据计划id查起始终点位置
	 * @param {String} workPlanId
	 */
	listWorkPlanLocation(workPlanId) {
		return request({
			url: `/api/external/workTicket/listWorkPlanLocation?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	/**
	 * 获取操作工班
	 */
	listPieceWorkTeam() {
		return request({
			url: '/api/external/workTicket/listPieceWorkTeam',
			method: 'get',
		})
	},
	//获取当前时间
	getNowDate(params) {
		return request({
			url: '/api/internal/public/getDateAndShift',
			method: 'get',
			params,
		})
	},
	/**
	 * 获取装卸队
	 * @param {String} workPlanId
	 */
	listLabor(workPlanId) {
		return request({
			url: `/api/external/workTicket/listLabor?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	// 新增签票
	insertWorkTicket(data) {
		return request({
			url: '/api/external/workTicket/insertWorkTicket',
			method: 'post',
			data,
		})
	},
	// 修改签票
	updateWorkTicket(data) {
		return request({
			url: '/api/external/workTicket/updateWorkTicket',
			method: 'put',
			data,
		})
	},
	// 查询作业票
	getWorkTicket(workPlanId) {
		return request({
			url: `/api/external/workTicket/getWorkTicket?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	// 根据指令票货查票货详情
	getTicketInfo(data) {
		return request({
			url: `/api/external/workTicket/getTicketInfo?workPlanId=${data.workPlanId}&&type=${data.type}`,
			method: 'get',
		})
	},
	// 删除作业票
	getDeleteTicket(workPlanId) {
		return request({
			url: `/api/external/workTicket/deleteWorkTicket?workPlanId=${workPlanId}`,
			method: 'delete',
		})
	},
	// 审核作业票
	getAuditTicket(data) {
		return request({
			url: `/api/external/workTicket/reviewWorkTicket`,
			method: 'put',
			data,
		})
	},
	// 集疏港审核作业票
	getAuditTicketJsg(data) {
		return request({
			url: `/api/external/workTicket/reviewWorkTicketJsg`,
			method: 'put',
			data,
		})
	},
	// 核销作业票
	getCancelTicket(data) {
		return request({
			url: `/api/external/workTicket/cancelReviewWorkTicket`,
			method: 'put',
			data,
		})
	},
	// 获取分组下拉框
	getGroupSelect(processCode) {
		return request({
			url: `/api/external/group/listGroupNo?processCode=${processCode}`,
			method: 'get',
		})
	},
	// 获取分组数据
	getGroupData(params) {
		return request({
			url: '/api/external/group/insertGroup',
			method: 'get',
			params,
		})
	},
	// 获取操作工班
	getDepts(data) {
		return request({
			url: '/api/external/workTicket/getDepts?type=' + data.type,
			method: 'get',
		})
	},

	// 下拉框
	getDeptsTally() {
		return request({
			url: '/api/external/workTicket/getDeptsTally',
			method: 'get',
		})
	},
	getProcessType(params) {
		return request({
			url: '/api/external/workTicket/getProcessIsTally',
			method: 'get',
			params,
		})
	},
  // 获取当前时间班次
  getCurrentShift(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },

  // 黑名单导出
  exportExcel(query) {
    return request({
      url: '/api/external/workTicket/exportExcel',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
}
export default api
