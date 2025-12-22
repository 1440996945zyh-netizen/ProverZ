<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-16 16:20:59
 * @LastEditors: zhangsd
 * @Description: 服务任务配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\task\task-components\ServiceTask.vue
-->
<template>
  <div>
    <el-form-item label="执行类型" key="executeType">
      <el-select v-model="serviceTaskForm.executeType" @change="handleExecuteTypeChange">
        <el-option label="Java类" value="class" />
        <el-option label="表达式" value="expression" />
        <el-option label="代理表达式" value="delegateExpression" />
        <el-option label="HTTP 调用" value="http" />
      </el-select>
    </el-form-item>
    <el-form-item
      v-if="serviceTaskForm.executeType === 'class'"
      label="Java类"
      prop="class"
      key="execute-class"
    >
      <el-input v-model="serviceTaskForm.class" clearable @change="updateElementTask" />
    </el-form-item>
    <el-form-item
      v-if="serviceTaskForm.executeType === 'expression'"
      label="表达式"
      prop="expression"
      key="execute-expression"
    >
      <el-input v-model="serviceTaskForm.expression" clearable @change="updateElementTask" />
    </el-form-item>
    <el-form-item
      v-if="serviceTaskForm.executeType === 'delegateExpression'"
      label="代理表达式"
      prop="delegateExpression"
      key="execute-delegate"
    >
      <el-input
        v-model="serviceTaskForm.delegateExpression"
        clearable
        @change="updateElementTask"
      />
    </el-form-item>
    <template v-if="serviceTaskForm.executeType === 'http'">
      <el-form-item label="请求方法" key="http-method">
        <el-radio-group v-model="httpTaskForm.requestMethod">
          <el-radio-button label="GET" />
          <el-radio-button label="POST" />
          <el-radio-button label="PUT" />
          <el-radio-button label="DELETE" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="请求地址" key="http-url" prop="requestUrl">
        <el-input v-model="httpTaskForm.requestUrl" clearable />
      </el-form-item>
      <el-form-item label="请求头" key="http-headers">
        <div style="display: flex; gap: 8px; align-items: flex-start; width: 100%">
          <el-input
            v-model="httpTaskForm.requestHeaders"
            type="textarea"
            resize="vertical"
            :autosize="{ minRows: 4, maxRows: 8 }"
            readonly
            placeholder="点击右侧编辑按钮添加请求头"
            style="flex: 1; min-width: 0"
          />
          <el-button
            type="primary"
            :icon="Edit"
            @click="showHeaderEditor = true"
            style="flex-shrink: 0"
          >
            编辑
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="禁止重定向" key="http-disallow-redirects">
        <el-switch v-model="httpTaskForm.disallowRedirects" />
      </el-form-item>
      <el-form-item label="忽略异常" key="http-ignore-exception">
        <el-switch v-model="httpTaskForm.ignoreException" />
      </el-form-item>
      <el-form-item label="保存返回变量" key="http-save-response">
        <el-switch v-model="httpTaskForm.saveResponseParameters" />
      </el-form-item>
      <el-form-item label="是否瞬间变量" key="http-save-transient">
        <el-switch v-model="httpTaskForm.saveResponseParametersTransient" />
      </el-form-item>
      <el-form-item label="返回变量前缀" key="http-result-variable-prefix">
        <el-input v-model="httpTaskForm.resultVariablePrefix" />
      </el-form-item>
      <el-form-item label="格式化返回为JSON" key="http-save-json">
        <el-switch v-model="httpTaskForm.saveResponseVariableAsJson" />
      </el-form-item>
    </template>

    <!-- 请求头编辑器 -->
    <HttpHeaderEditor
      v-model="showHeaderEditor"
      :headers="httpTaskForm.requestHeaders"
      @save="handleHeadersSave"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, inject, onBeforeUnmount } from 'vue'
import { Edit } from '@element-plus/icons-vue'

// 假设这些是从其他模块导入的
import { updateElementExtensions } from '@/components/bpmnProcessDesigner/package/utils'
import HttpHeaderEditor from './HttpHeaderEditor.vue'

defineOptions({ name: 'ServiceTask' })

const props = defineProps({
  id: String,
  type: String
})

const prefix = inject('prefix', 'flowable') || 'flowable'
const flowableTypeKey = `${prefix}:type`
const flowableFieldType = `${prefix}:Field`

// HTTP 字段常量
const HTTP_FIELD_NAMES = [
  'requestMethod',
  'requestUrl',
  'requestHeaders',
  'disallowRedirects',
  'ignoreException',
  'saveResponseParameters',
  'resultVariablePrefix',
  'saveResponseParametersTransient',
  'saveResponseVariableAsJson'
]

const HTTP_BOOLEAN_FIELDS = new Set([
  'disallowRedirects',
  'ignoreException',
  'saveResponseParameters',
  'saveResponseParametersTransient',
  'saveResponseVariableAsJson'
])

const DEFAULT_TASK_FORM = {
  executeType: '',
  class: '',
  expression: '',
  delegateExpression: ''
}

const DEFAULT_HTTP_FORM = {
  requestMethod: 'GET',
  requestUrl: '',
  requestHeaders: 'Content-Type: application/json',
  resultVariablePrefix: '',
  disallowRedirects: false,
  ignoreException: false,
  saveResponseParameters: false,
  saveResponseParametersTransient: false,
  saveResponseVariableAsJson: false
}

// 响应式数据
const serviceTaskForm = ref({ ...DEFAULT_TASK_FORM })
const httpTaskForm = ref({ ...DEFAULT_HTTP_FORM })
const bpmnElement = ref()
const httpInitializing = ref(false)
const showHeaderEditor = ref(false)

/**
 * @description 获取 BPMN 实例对象
 * @returns {Object} BPMN 实例
 */
const bpmnInstances = () => window?.bpmnInstances

/**
 * @description 判断字符串是否包含表达式
 * @param {string} value 待检查的字符串
 * @returns {boolean} 是否包含表达式
 */
const isExpression = (value) => {
  if (!value) return false
  // 检测 ${...} 或 #{...} 格式的表达式
  return /\${[^}]+}/.test(value) || /#{[^}]+}/.test(value)
}

/**
 * @description 收集 HTTP 扩展信息
 * @returns {Object} HTTP 字段信息
 */
const collectHttpExtensionInfo = () => {
  const businessObject = bpmnElement.value?.businessObject
  const extensionElements = businessObject?.extensionElements
  const httpFields = new Map()
  const httpFieldTypes = new Map()
  const otherExtensions = []

  extensionElements?.values?.forEach((item) => {
    if (item?.$type === flowableFieldType && HTTP_FIELD_NAMES.includes(item.name)) {
      const value = item.string ?? item.stringValue ?? item.expression ?? ''
      const fieldType = item.expression ? 'expression' : 'string'
      httpFields.set(item.name, value)
      httpFieldTypes.set(item.name, fieldType)
    } else {
      otherExtensions.push(item)
    }
  })

  return { httpFields, httpFieldTypes, otherExtensions }
}

/**
 * @description 重置 HTTP 默认值
 */
const resetHttpDefaults = () => {
  httpInitializing.value = true
  httpTaskForm.value = { ...DEFAULT_HTTP_FORM }
  nextTick(() => {
    httpInitializing.value = false
  })
}

/**
 * @description 重置 HTTP 表单
 */
const resetHttpForm = () => {
  httpInitializing.value = true
  const { httpFields } = collectHttpExtensionInfo()
  const nextForm = { ...DEFAULT_HTTP_FORM }

  HTTP_FIELD_NAMES.forEach((name) => {
    const stored = httpFields.get(name)
    if (stored !== undefined) {
      nextForm[name] = HTTP_BOOLEAN_FIELDS.has(name) ? stored === 'true' : stored
    }
  })

  httpTaskForm.value = nextForm
  nextTick(() => {
    httpInitializing.value = false
    updateHttpExtensions(true)
  })
}

/**
 * @description 重置服务任务表单
 */
const resetServiceTaskForm = () => {
  const businessObject = bpmnElement.value?.businessObject
  const nextForm = { ...DEFAULT_TASK_FORM }

  if (businessObject) {
    if (businessObject.class) {
      nextForm.class = businessObject.class
      nextForm.executeType = 'class'
    }
    if (businessObject.expression) {
      nextForm.expression = businessObject.expression
      nextForm.executeType = 'expression'
    }
    if (businessObject.delegateExpression) {
      nextForm.delegateExpression = businessObject.delegateExpression
      nextForm.executeType = 'delegateExpression'
    }
    if (businessObject.$attrs?.[flowableTypeKey] === 'http') {
      nextForm.executeType = 'http'
    } else {
      // 兜底：如缺少 flowable:type=http，但扩展里已有 HTTP 的字段，也认为是 HTTP
      const { httpFields } = collectHttpExtensionInfo()
      if (httpFields.size > 0) {
        nextForm.executeType = 'http'
      }
    }
  }

  serviceTaskForm.value = nextForm

  if (nextForm.executeType === 'http') {
    resetHttpForm()
  } else {
    resetHttpDefaults()
  }
}

/**
 * @description 判断是否应该持久化字段
 * @param {string} name 字段名
 * @param {*} value 字段值
 * @returns {boolean} 是否应该持久化
 */
const shouldPersistField = (name, value) => {
  if (HTTP_BOOLEAN_FIELDS.has(name)) return true
  if (name === 'requestMethod') return true
  if (name === 'requestUrl') return !!value
  return value !== undefined && value !== ''
}

/**
 * @description 更新 HTTP 扩展
 * @param {boolean} force 是否强制更新
 */
const updateHttpExtensions = (force = false) => {
  if (!bpmnElement.value) return
  if (!force && (httpInitializing.value || serviceTaskForm.value.executeType !== 'http')) {
    return
  }

  const {
    httpFields: existingFields,
    httpFieldTypes: existingTypes,
    otherExtensions
  } = collectHttpExtensionInfo()

  const desiredEntries = []
  HTTP_FIELD_NAMES.forEach((name) => {
    const rawValue = httpTaskForm.value[name]
    if (!shouldPersistField(name, rawValue)) {
      return
    }

    const persisted = HTTP_BOOLEAN_FIELDS.has(name)
      ? String(!!rawValue)
      : rawValue === undefined
        ? ''
        : String(rawValue)

    desiredEntries.push([name, persisted])
  })

  // 检查是否有变化：不仅比较值，还要比较字段类型（string vs expression）
  if (!force && desiredEntries.length === existingFields.size) {
    let noChange = true
    for (const [name, value] of desiredEntries) {
      const existingValue = existingFields.get(name)
      const existingType = existingTypes.get(name)
      const currentType = isExpression(value) ? 'expression' : 'string'
      if (existingValue !== value || existingType !== currentType) {
        noChange = false
        break
      }
    }
    if (noChange) {
      return
    }
  }

  const moddle = bpmnInstances().moddle
  const httpFieldElements = desiredEntries.map(([name, value]) => {
    // 根据值是否包含表达式来决定使用 string 还是 expression 属性
    const isExpr = isExpression(value)
    return moddle.create(flowableFieldType, {
      name,
      ...(isExpr ? { expression: value } : { string: value })
    })
  })

  updateElementExtensions(bpmnElement.value, [...otherExtensions, ...httpFieldElements])
}

/**
 * @description 移除 HTTP 扩展
 */
const removeHttpExtensions = () => {
  if (!bpmnElement.value) return
  const { httpFields, otherExtensions } = collectHttpExtensionInfo()
  if (!httpFields.size) {
    return
  }

  if (!otherExtensions.length) {
    bpmnInstances().modeling.updateProperties(bpmnElement.value, {
      extensionElements: null
    })
    return
  }

  updateElementExtensions(bpmnElement.value, otherExtensions)
}

/**
 * @description 更新元素任务
 */
const updateElementTask = () => {
  if (!bpmnElement.value) return

  const taskAttr = {
    class: null,
    expression: null,
    delegateExpression: null,
    [flowableTypeKey]: null
  }

  const type = serviceTaskForm.value.executeType
  if (type === 'class' || type === 'expression' || type === 'delegateExpression') {
    taskAttr[type] = serviceTaskForm.value[type] || null
  } else if (type === 'http') {
    taskAttr[flowableTypeKey] = 'http'
  }

  bpmnInstances().modeling.updateProperties(bpmnElement.value, taskAttr)

  if (type === 'http') {
    updateHttpExtensions(true)
  } else {
    removeHttpExtensions()
  }
}

/**
 * @description 处理执行类型变化
 * @param {string} value 执行类型值
 */
const handleExecuteTypeChange = (value) => {
  serviceTaskForm.value.executeType = value
  if (value === 'http') {
    resetHttpForm()
  }
  updateElementTask()
}

/**
 * @description 处理头部保存
 * @param {string} headersStr 头部字符串
 */
const handleHeadersSave = (headersStr) => {
  httpTaskForm.value.requestHeaders = headersStr
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
      resetServiceTaskForm()
    })
  },
  { immediate: true }
)

// 监听 HTTP 表单变化
watch(
  () => httpTaskForm.value,
  () => {
    updateHttpExtensions()
  },
  { deep: true }
)
</script>