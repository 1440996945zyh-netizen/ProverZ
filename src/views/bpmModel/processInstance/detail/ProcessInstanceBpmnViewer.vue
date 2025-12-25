<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:18:48
 * @LastEditTime: 2025-12-22 17:22:21
 * @LastEditors: zhangsd
 * @Description: 流程实例BPMN视图
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\ProcessInstanceBpmnViewer.vue
-->
<template>
  <el-card v-loading="loading" class="box-card">
    <MyProcessViewer key="designer" :xml="view.bpmnXml" :view="view" class="process-viewer" />
  </el-card>
</template>

<script lang="js" setup>
import { ref, watch } from 'vue'
import { MyProcessViewer } from '@/components/bpmnProcessDesigner/package'

defineOptions({ name: 'BpmProcessInstanceBpmnViewer' })

// 定义组件props，移除TS的propTypes，使用JS原生写法
const props = defineProps({
  loading: {
    type: Boolean,
    default: false // 是否加载中
  },
  bpmnXml: {
    type: String // BPMN XML
  },
  modelView: {
    type: Object // 流程模型视图
  }
})

// BPMN 流程图数据，无需TS类型标注
const view = ref({
  bpmnXml: ''
})

/** 只有 loading 完成时，才去加载流程列表 */
watch(
  () => props.modelView,
  async (newModelView) => {
    // 加载最新流程模型视图
    if (newModelView) {
      view.value = newModelView
    }
  }
)

/** 监听 bpmnXml 变化，更新视图 */
watch(
  () => props.bpmnXml,
  (value) => {
    view.value.bpmnXml = value
  }
)
</script>

<style lang="css" scoped>
/* 移除SCSS，改为标准CSS，无简写样式需要替换，保持原样式逻辑 */
.box-card {
  height: 100%;
  width: 100%;
  margin-bottom: 0;
}

.box-card :deep(.el-card__body) {
  height: 100%;
  padding: 0;
}

.box-card :deep(.process-viewer) {
  height: 100% !important;
  min-height: 100%;
  width: 100%;
  overflow: auto;
}
</style>