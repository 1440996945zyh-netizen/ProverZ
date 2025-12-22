<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-18 16:05:58
 * @LastEditors: zhangsd
 * @Description: 任务配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\task\ElementTask.vue
-->

<template>
  <div class="panel-tab__content">
    <el-form size="small" label-width="90px">
      <!--由于「异步延续」暂时用不到，所以这里 display 为 none -->
      <el-form-item label="异步延续" style="display: none">
        <el-checkbox
          v-model="taskConfigForm.asyncBefore"
          label="异步前"
          @change="changeTaskAsync"
        />
        <el-checkbox
          v-model="taskConfigForm.asyncAfter"
          label="异步后"
          @change="changeTaskAsync"
        />
        <el-checkbox
          v-model="taskConfigForm.exclusive"
          :disabled="!taskConfigForm.asyncAfter && !taskConfigForm.asyncBefore"
          label="排除"
          @change="changeTaskAsync"
        />
      </el-form-item>
      <component :is="witchTaskComponent" v-bind="$props" />
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { installedComponent } from './data.js'
defineOptions({ name: 'ElementTaskConfig' })

const props = defineProps({
  /**
   * 任务元素 ID
   */
  id: {
    type: String,
    default: ''
  },
  /**
   * 任务元素类型
   */
  type: {
    type: String,
    default: ''
  }
})

// 异步配置表单
const taskConfigForm = ref({
  asyncAfter: false,
  asyncBefore: false,
  exclusive: false
})

const witchTaskComponent = ref()
const bpmnElement = ref()

/**
 * @description 获取 BPMN 实例对象
 * @returns {Object} BPMN 实例
 */
const bpmnInstances = () => window?.bpmnInstances

/**
 * @description 修改任务异步配置
 */
const changeTaskAsync = () => {
  if (!taskConfigForm.value.asyncBefore && !taskConfigForm.value.asyncAfter) {
    taskConfigForm.value.exclusive = false
  }
  
  bpmnInstances().modeling.updateProperties(bpmnInstances().bpmnElement, {
    ...taskConfigForm.value
  })
}

// 监听元素 ID 变化
watch(
  () => props.id,
  () => {
    bpmnElement.value = bpmnInstances().bpmnElement
    
    if (bpmnElement.value?.businessObject) {
      taskConfigForm.value.asyncBefore = bpmnElement.value.businessObject.asyncBefore || false
      taskConfigForm.value.asyncAfter = bpmnElement.value.businessObject.asyncAfter || false
      taskConfigForm.value.exclusive = bpmnElement.value.businessObject.exclusive || false
    }
  },
  { immediate: true }
)

// 监听组件类型变化
watch(
  () => props.type,
  () => {
    console.log('props.type =>', props.type);
    console.log('props.id =>', props.id);
    if (props.type && installedComponent[props.type]) {
      witchTaskComponent.value = installedComponent[props.type].component
    } else {
      witchTaskComponent.value = null
    }
  },
  { immediate: true }
)


</script>