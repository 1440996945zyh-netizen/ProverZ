import request from '@/utils/request'

const api = {
	/**
	 * 获取作业计划主列表
	 * @param {*} params {workDate，classCode}
	 */
  listMechaneWorkPlan(params) {
		return request({
			url: '/api/external/ticketSecondAllot/listTicket',
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
	// 查看是否有权限
	getUserRole(flag) {
		return request({
			url: `/api/external/workTicketNew/getUserRole?flag=${flag}`,
			method: 'get',
		})
	},
	/**
	 * 获取指令票货id
	 * @param {String} workPlanId
	 */
	listTrustCargo(workPlanId) {
		return request({
			url: `/api/external/workTicketNew/listTrustCargo?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	/**
	 * 根据票货id查目标票货
	 * @param {String} cargoInfoId
	 */
	listTargetCargo(cargoInfoId) {
		return request({
			url: `/api/external/workTicketNew/listTargetCargo?cargoInfoId=${cargoInfoId}`,
			method: 'get',
		})
	},
	/**
	 * 根据计划id查起始终点位置
	 * @param {String} workPlanId
	 */
	listWorkPlanLocation(workPlanId) {
		return request({
			url: `/api/external/workTicketNew/listWorkPlanLocation?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	/**
	 * 获取操作工班
	 */
	listPieceWorkTeam() {
		return request({
			url: '/api/external/workTicketNew/listPieceWorkTeam',
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
			url: `/api/external/workTicketNew/listLabor?workPlanId=${workPlanId}`,
			method: 'get',
		})
	},
	// 新增签票
	insertWorkTicket(data) {
		return request({
			url: '/api/external/ticketSecondAllot/insertWorkTicket',
			method: 'post',
			data,
		})
	},
	// 修改签票
	updateWorkTicket(data) {
		return request({
			url: '/api/external/workTicketNew/updateWorkTicket',
			method: 'put',
			data,
		})
	},
	// 查询作业票
	getWorkTicket(data) {
		return request({
			url: `/api/external/workTicketNew/getWorkTicket?workPlanId=${data.workPlanId}&ticketType=${data.ticketType}`,
			method: 'get',
		})
	},
	// 根据指令票货查票货详情
	getTicketInfo(data) {
		return request({
			url: `/api/external/ticketSecondAllot/listDetailForAllot?workPlanId=${data.workPlanId}&allotType=${data.allotType}&cargoCode=${data.cargoCode}&processCode=${data.processCode}&id=${data.id}`,
			method: 'get',
		})
	},
  // 根据workPlanId查询所有票货
  getTicketInfoForAdd(data) {
		return request({
			url: `/api/external/workTicketNew/getTicketInfoForAdd?workPlanId=${data.workPlanId}`,
			method: 'get',
		})
	},
	// 签票撤销
	getDeleteTicket(data) {
		return request({
			url: `/api/external/ticketSecondAllot/deleteAllot?workPlanId=${data.workPlanId}&allotType=${data.allotType}&id=${data.id}`,
			method: 'delete',
		})
	},
	// 审核作业票
	getAuditTicket(workPlanId) {
		return request({
			url: `/api/external/workTicketNew/reviewWorkTicket?workPlanId=${workPlanId}`,
			method: 'put',
		})
	},
	// 核销作业票
	getCancelTicket(workPlanId) {
		return request({
			url: `/api/external/workTicketNew/cancelReviewWorkTicket?workPlanId=${workPlanId}`,
			method: 'put',
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
  getDepts(allotType) {
    return request({
      url: '/api/external/ticketSecondAllot/getDepts?allotType='+allotType,
      method: 'get',
    })
  },
	// 获取理货记录
	getTallyRecord(params) {
		return request({
			url: `/api/external/tally/getTallyRecord`,
			method: 'get',
			params,
		})
	},
	// 下拉框
	getDeptsTally() {
		return request({
			url: '/api/external/workTicketNew/getDeptsTally',
			method: 'get',
		})
	},
	getProcessType(params) {
		return request({
			url: '/api/external/workTicketNew/getProcessIsTally',
			method: 'get',
			params,
		})
	},
	getProcess(params) {
		return request({
			url: '/api/external/workTicketNew/getProcess',
			method: 'get',
			params,
		})
	},
	getSelectData(params) {
		return request({
			url: '/api/external/tally/getProcessInfoList',
			method: 'get',
			params,
		})
	},
	// 获取件数吨数
	getWorkMeasure(params) {
		return request({
			url: '/api/external/workTicketNew/getWorkMeasure',
			method: 'get',
			params,
		})
	},
}
export default api
