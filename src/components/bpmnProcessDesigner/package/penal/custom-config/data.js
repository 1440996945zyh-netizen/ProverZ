// 导入自定义配置组件（保持 ES6 模块化语法）
import UserTaskCustomConfig from './components/UserTaskCustomConfig.vue'
import BoundaryEventTimer from './components/BoundaryEventTimer.vue'

// 导出组件映射配置（移除 TS 类型，修正拼写错误：componet → component）
export const CustomConfigMap = {
  UserTask: {
    name: '用户任务',
    component: UserTaskCustomConfig // 修正拼写错误
  },
  BoundaryEventTimerEventDefinition: {
    name: '定时边界事件(非中断)',
    component: BoundaryEventTimer // 修正拼写错误
  }
}