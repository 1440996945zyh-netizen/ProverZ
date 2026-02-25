<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2026-02-06 16:47:39
 * @LastEditors: zhangsd
 * @Description: 流程条件
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\flow-condition\FlowCondition.vue
-->
<template>
  <div class="panel-tab__content">
    <el-form :model="flowConditionForm" label-width="90px" >
      <el-form-item label="流转类型">
        <el-select v-model="flowConditionForm.type" @change="updateFlowType">
          <el-option label="普通流转路径" value="normal" />
          <el-option label="默认流转路径" value="default" />
          <el-option label="条件流转路径" value="condition" />
        </el-select>
      </el-form-item>
      <el-form-item label="条件格式" v-if="flowConditionForm.type === 'condition'" key="condition">
        <el-select v-model="flowConditionForm.conditionType">
          <el-option label="表达式" value="expression" />
          <el-option label="脚本" value="script" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="表达式"
        v-if="flowConditionForm.conditionType && flowConditionForm.conditionType === 'expression'"
        key="express"
      >
        <el-input
          v-model="flowConditionForm.body"
          style="width: 100%"
          clearable
          @change="updateFlowCondition"
        />
      </el-form-item>
      <template
        v-if="flowConditionForm.conditionType && flowConditionForm.conditionType === 'script'"
      >
        <el-form-item label="脚本语言" key="language">
          <el-input v-model="flowConditionForm.language" clearable @change="updateFlowCondition" />
        </el-form-item>
        <el-form-item label="脚本类型" key="scriptType">
          <el-select v-model="flowConditionForm.scriptType">
            <el-option label="内联脚本" value="inlineScript" />
            <el-option label="外部脚本" value="externalScript" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="脚本"
          v-if="flowConditionForm.scriptType === 'inlineScript'"
          key="body"
        >
          <el-input
            v-model="flowConditionForm.body"
            type="textarea"
            clearable
            @change="updateFlowCondition"
          />
        </el-form-item>
        <el-form-item
          label="资源地址"
          v-if="flowConditionForm.scriptType === 'externalScript'"
          key="resource"
        >
          <el-input v-model="flowConditionForm.resource" clearable @change="updateFlowCondition" />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, toRaw, onBeforeUnmount,  defineOptions } from 'vue'

// 组件名称定义
defineOptions({ name: 'FlowCondition' })

// 定义Props（移除TS类型验证，改为纯JS写法）
const props = defineProps({
  businessObject: Object,
  type: String
})

// 响应式变量定义（移除TS类型注解）
const flowConditionForm = ref({})
const bpmnElement = ref(null)
const bpmnElementSource = ref(null)
const bpmnElementSourceRef = ref(null)
const flowConditionRef = ref(null)

// 获取bpmn实例（移除TS类型断言）
const bpmnInstances = () => window?.bpmnInstances

/** 重置流转条件配置 */
const resetFlowCondition = () => {
  bpmnElement.value = bpmnInstances().bpmnElement
  bpmnElementSource.value = bpmnElement.value.source
  bpmnElementSourceRef.value = bpmnElement.value.businessObject.sourceRef
  
  // 初始化默认type为default
  flowConditionForm.value = { type: 'default' }
  
  if (
    bpmnElementSourceRef.value &&
    bpmnElementSourceRef.value.default &&
    bpmnElementSourceRef.value.default.id === bpmnElement.value.id
  ) {
    flowConditionForm.value = { type: 'default' }
  } else if (!bpmnElement.value.businessObject.conditionExpression) {
    // 普通流转路径
    flowConditionForm.value = { type: 'normal' }
  } else {
    // 带条件流转路径
    const conditionExpression = bpmnElement.value.businessObject.conditionExpression
    flowConditionForm.value = { ...conditionExpression, type: 'condition' }
    
    // resource 可直接标识 是否是外部资源脚本
    if (flowConditionForm.value.resource) {
      flowConditionForm.value['conditionType'] = 'script'
      flowConditionForm.value['scriptType'] = 'externalScript'
      return
    }
    
    if (conditionExpression.language) {
      flowConditionForm.value['conditionType'] = 'script'
      flowConditionForm.value['scriptType'] = 'inlineScript'
      return
    }
    
    flowConditionForm.value['conditionType'] = 'expression'
  }
}

/** 更新流转类型 */
const updateFlowType = (flowType) => {
  // 条件流转路径
  if (flowType === 'condition') {
    flowConditionRef.value = bpmnInstances().moddle.create('bpmn:FormalExpression')
    bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
      conditionExpression: flowConditionRef.value
    })
    return
  }
  
  // 默认流转路径
  if (flowType === 'default') {
    bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
      conditionExpression: null
    })
    bpmnInstances().modeling.updateProperties(toRaw(bpmnElementSource.value), {
      default: toRaw(bpmnElement.value)
    })
    return
  }
  
  // 普通流转路径：如果来源节点的默认路径是当前连线时，清除父元素的默认路径配置
  if (
    bpmnElementSourceRef.value.default &&
    bpmnElementSourceRef.value.default.id === bpmnElement.value.id
  ) {
    bpmnInstances().modeling.updateProperties(toRaw(bpmnElementSource.value), {
      default: null
    })
  }
  
  bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
    conditionExpression: null
  })
}

/** 更新流转条件 */
const updateFlowCondition = () => {
  const { conditionType, scriptType, body, resource, language } = flowConditionForm.value
  let condition
  
  if (conditionType === 'expression') {
    condition = bpmnInstances().moddle.create('bpmn:FormalExpression', { body })
  } else {
    if (scriptType === 'inlineScript') {
      condition = bpmnInstances().moddle.create('bpmn:FormalExpression', { body, language })
      flowConditionForm.value['resource'] = ''
    } else {
      flowConditionForm.value['body'] = ''
      condition = bpmnInstances().moddle.create('bpmn:FormalExpression', {
        resource,
        language
      })
    }
  }
  
  bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
    conditionExpression: condition
  })
}

// 组件卸载前清理变量
onBeforeUnmount(() => {
  bpmnElement.value = null
  bpmnElementSource.value = null
  bpmnElementSourceRef.value = null
})

// 监听业务对象变化重置配置
watch(
  () => props.businessObject,
  (val) => {
    console.log(val, 'val')
    nextTick(() => {
      resetFlowCondition()
    })
  },
  {
    immediate: true
  }
)
</script>