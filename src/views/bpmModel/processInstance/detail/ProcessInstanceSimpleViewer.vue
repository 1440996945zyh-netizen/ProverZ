<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:19:36
 * @LastEditTime: 2025-12-23 09:43:32
 * @LastEditors: zhangsd
 * @Description: 流程实例简单查看器
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\ProcessInstanceSimpleViewer.vue
-->
<template>
  <div v-loading="loading" class="process-viewer-container">
    <!-- <SimpleProcessViewer
      :flow-node="simpleModel"
      :tasks="tasks"
      :process-instance="processInstance"
    /> -->
  </div>
</template>

<script lang="js" setup>
import { ref, watch } from 'vue'
import { TaskStatusEnum } from '@/api/system/bpm/task'
import { NodeType } from '@/components/bpmnProcessDesigner/package/penal/consts'
// import { SimpleProcessViewer } from '@/components/SimpleProcessDesignerV2/src/'

defineOptions({ name: 'BpmProcessInstanceSimpleViewer' })

// 定义组件Props，替换TS的propTypes为JS原生配置
const props = defineProps({
  loading: {
    type: Boolean,
    default: false // 是否加载中
  },
  modelView: {
    type: Object // 模型视图数据
  },
  simpleJson: {
    type: String // Simple 模型结构数据 (json 格式)
  }
})

// 响应式变量定义，移除TS类型注解
const simpleModel = ref({})
// 用户任务
const tasks = ref([])
// 流程实例
const processInstance = ref(null)

/** 监控模型视图 包括任务列表、进行中的活动节点编号等 */
watch(
  () => props.modelView,
  async (newModelView) => {
    if (newModelView) {
      tasks.value = newModelView.tasks
      processInstance.value = newModelView.processInstance
      // 已经拒绝的活动节点编号集合，只包括 UserTask
      const rejectedTaskActivityIds = newModelView.rejectedTaskActivityIds
      // 进行中的活动节点编号集合， 只包括 UserTask
      const unfinishedTaskActivityIds = newModelView.unfinishedTaskActivityIds
      // 已经完成的活动节点编号集合， 包括 UserTask、Gateway 等
      const finishedActivityIds = newModelView.finishedTaskActivityIds
      // 已经完成的连线节点编号集合，只包括 SequenceFlow
      const finishedSequenceFlowActivityIds = newModelView.finishedSequenceFlowActivityIds
      setSimpleModelNodeTaskStatus(
        newModelView.simpleModel,
        newModelView.processInstance?.status,
        rejectedTaskActivityIds,
        unfinishedTaskActivityIds,
        finishedActivityIds,
        finishedSequenceFlowActivityIds
      )
      simpleModel.value = newModelView.simpleModel ? newModelView.simpleModel : {}
    }
  }
)

/** 监控模型结构数据 */
watch(
  () => props.simpleJson,
  async (value) => {
    if (value) {
      simpleModel.value = JSON.parse(value)
    }
  }
)

/** 设置简单模型节点的任务状态 */
const setSimpleModelNodeTaskStatus = (
  simpleModel,
  processStatus,
  rejectedTaskActivityIds,
  unfinishedTaskActivityIds,
  finishedActivityIds,
  finishedSequenceFlowActivityIds
) => {
  if (!simpleModel) {
    return
  }
  // 结束节点
  if (simpleModel.type === NodeType.END_EVENT_NODE) {
    if (finishedActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = processStatus
    } else {
      simpleModel.activityStatus = TaskStatusEnum.NOT_START
    }
    return
  }
  // 审批节点
  if (
    simpleModel.type === NodeType.START_USER_NODE ||
    simpleModel.type === NodeType.USER_TASK_NODE ||
    simpleModel.type === NodeType.TRANSACTOR_NODE ||
    simpleModel.type === NodeType.CHILD_PROCESS_NODE
  ) {
    simpleModel.activityStatus = TaskStatusEnum.NOT_START
    if (rejectedTaskActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = TaskStatusEnum.REJECT
    } else if (unfinishedTaskActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = TaskStatusEnum.RUNNING
    } else if (finishedActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = TaskStatusEnum.APPROVE
    }
    // TODO 是不是还缺一个 cancel 的状态
  }
  // 抄送节点
  if (simpleModel.type === NodeType.COPY_TASK_NODE) {
    // 抄送节点,只有通过和未执行状态
    if (finishedActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = TaskStatusEnum.APPROVE
    } else {
      simpleModel.activityStatus = TaskStatusEnum.NOT_START
    }
  }
  // 延迟器节点
  if (simpleModel.type === NodeType.DELAY_TIMER_NODE) {
    // 延迟器节点,只有通过和未执行状态
    if (finishedActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = TaskStatusEnum.APPROVE
    } else {
      simpleModel.activityStatus = TaskStatusEnum.NOT_START
    }
  }
  // 触发器节点
  if (simpleModel.type === NodeType.TRIGGER_NODE) {
    // 触发器节点,只有通过和未执行状态
    if (finishedActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = TaskStatusEnum.APPROVE
    } else {
      simpleModel.activityStatus = TaskStatusEnum.NOT_START
    }
  }

  // 条件节点对应 SequenceFlow
  if (simpleModel.type === NodeType.CONDITION_NODE) {
    // 条件节点,只有通过和未执行状态
    if (finishedSequenceFlowActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = TaskStatusEnum.APPROVE
    } else {
      simpleModel.activityStatus = TaskStatusEnum.NOT_START
    }
  }
  // 网关节点
  if (
    simpleModel.type === NodeType.CONDITION_BRANCH_NODE ||
    simpleModel.type === NodeType.PARALLEL_BRANCH_NODE ||
    simpleModel.type === NodeType.INCLUSIVE_BRANCH_NODE ||
    simpleModel.type === NodeType.ROUTER_BRANCH_NODE
  ) {
    // 网关节点。只有通过和未执行状态
    if (finishedActivityIds.includes(simpleModel.id)) {
      simpleModel.activityStatus = TaskStatusEnum.APPROVE
    } else {
      simpleModel.activityStatus = TaskStatusEnum.NOT_START
    }
    simpleModel.conditionNodes?.forEach((node) => {
      setSimpleModelNodeTaskStatus(
        node,
        processStatus,
        rejectedTaskActivityIds,
        unfinishedTaskActivityIds,
        finishedActivityIds,
        finishedSequenceFlowActivityIds
      )
    })
  }

  setSimpleModelNodeTaskStatus(
    simpleModel.childNode,
    processStatus,
    rejectedTaskActivityIds,
    unfinishedTaskActivityIds,
    finishedActivityIds,
    finishedSequenceFlowActivityIds
  )
}
</script>

<style lang="css" scoped>
/* 移除SCSS，改为标准CSS，无简写样式需要替换，保持样式为空 */
</style>