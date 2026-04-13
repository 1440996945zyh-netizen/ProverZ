import request from '@/utils/auth/request'

/**
 * 获取首页数据
 * @returns {Promise}
 */
export function getHomeMap() {
	return request({
		url: '/api/internal/home/getHomeMap',
		method: 'get',
		loading: false,
	})
}

/**
 * 获取工单趋势数据
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {Promise}
 */
export function getMaintInfo(startTime, endTime) {
	return request({
		url: '/api/internal/home/getMaintInfo',
		method: 'get',
		params: {
			startTime,
			endTime,
		},
		loading: false,
	})
}

/**
 * 获取物资预警数据
 * @returns {Promise}
 */
export function getWarningRecord() {
	return request({
		url: '/api/internal/home/getWarningRecord',
		method: 'get',
		loading: false,
	})
}

export const getTaskTodoPage = async params => {
	return request({
		url: '/bpm/task/todoPage',
		method: 'get',
		params,
		loading: false,
	})
}

export const getMessageList = async params => {
	return request({
		url: '/system/notification/list',
		method: 'get',
		params,
		loading: false,
	})
}
