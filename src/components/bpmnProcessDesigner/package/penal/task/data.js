import UserTask from './task-components/UserTask.vue'
import ServiceTask from './task-components/ServiceTask.vue'
import ScriptTask from './task-components/ScriptTask.vue'
import ReceiveTask from './task-components/ReceiveTask.vue'
import CallActivity from './task-components/CallActivity.vue'

/**
 * @description 已安装的任务组件配置
 */
export const installedComponent = Object.freeze({
  UserTask: {
    name: '用户任务',
    component: UserTask
  },
  ServiceTask: {
    name: '服务任务',
    component: ServiceTask
  },
  ScriptTask: {
    name: '脚本任务',
    component: ScriptTask
  },
  ReceiveTask: {
    name: '接收任务',
    component: ReceiveTask
  },
  CallActivity: {
    name: '调用活动',
    component: CallActivity
  }
})

/**
 * @description 获取任务折叠项名称
 * @param {string} elementType 元素类型
 * @returns {string} 任务名称
 */
export const getTaskCollapseItemName = (elementType) => {
  return installedComponent[elementType]?.name || ''
}

/**
 * @description 判断任务折叠项是否显示
 * @param {string} elementType 元素类型
 * @returns {boolean} 是否显示
 */
export const isTaskCollapseItemShow = (elementType) => {
  return !!installedComponent[elementType]
}