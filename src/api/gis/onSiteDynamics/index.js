import request from '@/utils/request'

let contextPath = '/api/external/onSiteDynamics'

/**
 * 港区元素：船舶
 *
 * @returns {*}
 */
const listShip = () => {
  return request({
    url: contextPath + '/listShip',
    method: 'GET'
  })
}
/**
 * 港区元素：榄桩
 *
 * @returns {*}
 */
const listPile = () => {
  return request({
    url: contextPath + '/listPile',
    method: 'GET'
  })
}

/**
 * 港区元素：垛位
 *
 * @returns {*}
 */
const listStack = () => {
  return request({
    url: contextPath + '/listStack',
    method: 'GET'
  })
}

/**
 * 港区元素：垛位-流机队
 *
 * @returns {*}
 */
const listStackForMac = () => {
  return request({
    url: contextPath + '/listStackForMac',
    method: 'GET'
  })
}

/**
 * 港区元素：垛位明细
 *
 * @returns {*}
 */
const getStack = (id) => {
  return request({
    url: contextPath + `/getStack?id=${id}`,
    method: 'GET',
  })
}

/**
 * 港区元素：车辆
 *
 * @returns {*}
 */
const listCar = () => {
  return request({
    url: contextPath + '/listCar',
    method: 'GET',
    loading: false
  })
}

/**
 * 车辆历史
 *
 * @returns {*}
 */
const listCarHistory = (macId, beginTime, endTime) => {
  return request({
    url: contextPath + `/listCarHistory?macId=${macId}&beginTime=${beginTime}&endTime=${endTime}`,
    method: 'GET'
  })
}

const listStorehouseOption = () => {
  return request({
    url: '/api/internal/public/getLocalSelect?type=STORAGE_YARD_LEVEL&level=1&parent=-1',
    method: 'GET'
  })
}
const queryPortVehicleNum = () => {
  return request({
    url: '/api/v1/external/tMacTerminal/queryPortVehicleNum',
    method: 'GET'
  })
}
const listRegionOption = storehouseId => {
  return request({
    url: `/api/internal/public/getLocalSelect?type=STORAGE_YARD_LEVEL&level=2&parent=${storehouseId}`,
    method: 'GET'
  })
}
const listStackOption = regionId => {
  return request({
    url: `/api/internal/public/getLocalSelect?type=STORAGE_YARD_LEVEL&level=3&parent=${regionId}`,
    method: 'GET'
  })
}

const insertStorageStackPosition = data => {
  return request({
    url: contextPath + `/insertStorageStackPosition`,
    method: 'POST',
    data,
  })
}

const deleteStorageStackPosition = stackId => {
  return request({
    url: contextPath + `/deleteStorageStackPosition?stackId=${stackId}`,
    method: 'DELETE',
  })
}

/**
 *
 * @returns 查询跑垛历史
 */
const getRunPileHistoryList = (stackId) => {
  return request({
    url: '/api/v1/external/tRunPileHistory/getList?stackId=' + stackId,
    method: 'GET'
  })
}

/**
 * 查询港存进出明细
 * @param query
 * @returns {*}
 */
const getInoutDetail = (query) => {
  return request({
    url: '/api/external/onSiteDynamics/getInoutDetail',
    method: 'get',
    params: query,
  })
}

export default {
  listShip,
  listPile,
  listStack,
  listStackForMac,
  getStack,
  listCar,
  listCarHistory,
  listStorehouseOption,
  listRegionOption,
  listStackOption,
  insertStorageStackPosition,
  deleteStorageStackPosition,
  getRunPileHistoryList,
  getInoutDetail,
  queryPortVehicleNum,
}
