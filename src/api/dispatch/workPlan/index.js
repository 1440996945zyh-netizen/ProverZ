import request from '@/utils/request'
const api = {
	/**
	 * 获取当前班次时间
	 * @param {Object} params 检索条件的obj
	 */
	getNowDate(params) {
		return request({
			url: '/api/internal/public/getDateAndShift',
			method: 'get',
			params,
		})
	},
  //获取下方已派列表
  getDispatchAllList(params) {
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getDispatchAllList',
      method: 'get',
      params
    })
  },
	/**
	 * 列表查询
	 * @param {Object} params 检索条件的obj
	 */
	reqGetWorkPlanList(params) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/getWorkPlanList',
			method: 'get',
			params,
		})
	},
  reqGetJSGDayNightPlanList(params) {
    return request({
      url: '/api/v1/internal/tPrdWorkPlan/getJSGDayNightWorkPlanList',
      method: 'get',
      params,
    })
  },
  /**
   * 导入上班次列表查询
   * @param {Object} params 检索条件的obj
   */
  getLastWorkPlanList(params) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/getLastWorkPlanList',
			method: 'get',
			params,
		})
	},
	/**
	 * 集疏港导入上班次列表查询
	 * @param {Object} params 检索条件的obj
	 */
	reqGetWorkPlanListData(params) {
		return request({
			url: 'api/v1/internal/openPortApply/getList',
			method: 'get',
			params,
		})
	},
	/**
	 * 船舶计划，零工计划，集疏港计划，转运计划保存
	 * @param {Object} params 检索条件的obj
	 */
	updatePlan(data) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/updateWorkPlan',
			method: 'put',
			data: data,
		})
	},
  insertLgWorkPlan(data) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/insertLgWorkPlan',
			method: 'post',
			data: data,
		})
	},
	/**
	 * 船舶计划导入作业指令
	 * @param {Object} params 检索条件的obj
	 */
	insertWorkPlan(data, workDate, classCode, className,planType) {
		return request({
			url:
				'/api/v1/internal/tPrdWorkPlan/insertWorkPlan?workDate=' + workDate + '&classCode=' + classCode + '&className=' + className+'&planType='+planType,
			method: 'post',
			data: data,
		})
	},
	/**
	 * 集疏港导入作业指令
	 * @param {Object} params 检索条件的obj
	 */
	insertWorkPlanData(data, workDate, classCode, className) {
		return request({
			url:
				'/api/v1/internal/openPortApply/importTrust?workDate=' + workDate + '&classCode=' + classCode + '&className=' + className,
			method: 'post',
			data: data,
		})
	},
	/**
	 * 零工计划，集疏港计划，转运计划审核
	 * @param {Object} params 检索条件的obj
	 */
	reqApprove(data) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/approve',
			method: 'post',
			data: data,
		})
	},
	/**
	 * 零工计划，集疏港计划，转运计划 撤销审核
	 * @param {Object} params 检索条件的obj
	 */
	reqCancle(data) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/cancle',
			method: 'post',
			data: data,
		})
	},
	/**
	 * 复制
	 * @param {Object} params 检索条件的obj
	 */
	reqCopyWorkPlan(data) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/copyWorkPlan?id=' + data,
			method: 'post',
		})
	},
  reqCopyJSGWorkPlan(data) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/copyJSGWorkPlan?id=' + data,
			method: 'post',
		})
	},
  reqCopyZYWorkPlan(data) {
    return request({
      url: '/api/v1/internal/tPrdWorkPlan/copyZYWorkPlan?id=' + data,
      method: 'post',
    })
  },
	/**
	 * 删除
	 * @param {Object} params 检索条件的obj
	 */
	reqDelete(data) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/delete',
			method: 'delete',
			data: data,
		})
	},
	// 派工修改
	getDetail(id) {
		return request({
			url: `/api/v1/internal/openPortApply/getDetail?id=${id}`,
			method: 'get',
		})
	},
  getNormalProcess() {
		return request({
			url: `/api/v1/internal/tPrdWorkPlan/normalWorkProcess`,
			method: 'get',
		})
	},
  //作业计划指派场地查询详情
  getMassIdsWithPlanId(planId,tmpParam) {
    return request({
      url: '/api/v1/internal/tPrdWorkPlan/getMassIdsWithPlanId?planId='+planId+'&tmpParam='+tmpParam,
      method: 'get',
    })
  },
  //根据作业计划类型选择作业过程
  getNormalProcessByType(type) {
		return request({
			url: `/api/v1/internal/tPrdWorkPlan/workProcessType/${type}`,
			method: 'get',
		})
	},
  getNormalProcessByType2(query) {
		return request({
			url: `/api/v1/internal/tPrdWorkPlan/workProcessType2`,
			method: 'get',
      params:query
		})
	},

  getCustomer() {
		return request({
			url: `/api/v1/internal/tPrdWorkPlan/getCustomer`,
			method: 'get',
		})
	},


	/**
	 * 派工保存
	 * @param {Object} params 检索条件的obj
	 */
	reqUpdateDispatch(data) {
		return request({
			url: '/api/v1/internal/tPrdWorkPlan/updateDispatch',
			method: 'put',
			data: data,
		})
	},
	/**
	 * 导入上一班次
	 * @param {Object} params 检索条件的obj
	 */
	reqImportWorkPlan(data, workDate, classCode, className) {
		return request({
			url:
				'/api/v1/internal/tPrdWorkPlan/importWorkPlan?workDate=' + workDate + '&classCode=' + classCode + '&className=' + className,
			method: 'post',
			data: data,
		})
	},
/**
   * 集疏港导入上一班次
   * @param {Object} params 检索条件的obj
   */
insertBatch(data, workDate, classCode, className) {
	return request({
		url: '/api/v1/internal/openPortApply/addBatch?workDate=' + workDate + '&classCode=' + classCode + '&className=' + className,
		method: 'post',
		data: data,
	})
},
  insertJSGBatch(data, workDate, classCode, className) {
	return request({
		url: '/api/v1/internal/openPortApply/addJSGBatch?workDate=' + workDate + '&classCode=' + classCode + '&className=' + className,
		method: 'post',
		data: data,
	})
},
  //更新理货员派工
  tallYUpdateSave(data) {
    return request({
      url: `/api/v1/internal/tPrdWorkPlan/updateTally`,
      method: 'put',
      data: data,
    })
  },
  // 修改垛位
  massUpdateSave(data) {
    return request({
      url: `/api/v1/internal/tPrdWorkPlan/updateMass`,
      method: 'put',
      data: data,
    })
  },
}
export default api
