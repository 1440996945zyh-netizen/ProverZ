<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-16 16:20:14
 * @LastEditors: zhangsd
 * @Description: 脚本任务配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\task\task-components\ScriptTask.vue
-->
<template>
  <div style="margin-top: 16px">
    <el-form-item label="脚本格式">
      <el-input
        v-model="scriptTaskForm.scriptFormat"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="脚本类型">
      <el-select v-model="scriptTaskForm.scriptType">
        <el-option label="内联脚本" value="inline" />
        <el-option label="外部资源" value="external" />
      </el-select>
    </el-form-item>
    <el-form-item label="脚本" v-show="scriptTaskForm.scriptType === 'inline'">
      <el-input
        v-model="scriptTaskForm.script"
        type="textarea"
        resize="vertical"
        :autosize="{ minRows: 2, maxRows: 4 }"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="资源地址" v-show="scriptTaskForm.scriptType === 'external'">
      <el-input
        v-model="scriptTaskForm.resource"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
    <el-form-item label="结果变量">
      <el-input
        v-model="scriptTaskForm.resultVariable"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

defineOptions({ name: 'ScriptTask' })

const props = defineProps({
  id: String,
  type: String
})

// 默认任务表单
const defaultTaskForm = ref({
  scriptFormat: '',
  script: '',
  resource: '',
  resultVariable: ''
})

const scriptTaskForm = ref({})
const bpmnElement = ref()

/**
 * @description 获取 BPMN 实例对象
 * @returns {Object} BPMN 实例
 */
const bpmnInstances = () => window?.bpmnInstances

/**
 * @description 重置任务表单
 */
const resetTaskForm = () => {
  for (const key in defaultTaskForm.value) {
    const value = bpmnElement.value?.businessObject[key] || defaultTaskForm.value[key]
    scriptTaskForm.value[key] = value
  }
  scriptTaskForm.value.scriptType = scriptTaskForm.value.script ? 'inline' : 'external'
}

/**
 * @description 更新元素任务
 */
const updateElementTask = () => {
  const taskAttr = Object.create(null)
  taskAttr.scriptFormat = scriptTaskForm.value.scriptFormat || null
  taskAttr.resultVariable = scriptTaskForm.value.resultVariable || null
  
  if (scriptTaskForm.value.scriptType === 'inline') {
    taskAttr.script = scriptTaskForm.value.script || null
    taskAttr.resource = null
  } else {
    taskAttr.resource = scriptTaskForm.value.resource || null
    taskAttr.script = null
  }
  
  bpmnInstances().modeling.updateProperties(bpmnElement.value, taskAttr)
}

// 组件卸载前清理
onBeforeUnmount(() => {
  bpmnElement.value = null
})

// 监听元素 ID 变化
watch(
  () => props.id,
  () => {
    bpmnElement.value = bpmnInstances().bpmnElement
    nextTick(() => {
      resetTaskForm()
    })
  },
  { immediate: true }
)
</script>