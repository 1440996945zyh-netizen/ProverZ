<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-16 15:48:26
 * @LastEditors: zhangsd
 * @Description: 元素基础信息
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\base\ElementBaseInfo.vue
-->


<template>
  <div class="panel-tab__content">
    <el-form label-width="90px" :model="needProps" :rules="rules">
      <div v-if="needProps.type == 'bpmn:Process'">
        <!-- 如果是 Process 信息的时候，使用自定义表单 -->
        <el-form-item label="流程标识" prop="id">
          <el-input
            v-model="needProps.id"
            placeholder="请输入流标标识"
            :disabled="needProps.id !== undefined && needProps.id.length > 0"
            @change="handleKeyUpdate"
          />
        </el-form-item>
        <el-form-item label="流程名称" prop="name">
          <el-input
            v-model="needProps.name"
            placeholder="请输入流程名称"
            clearable
            @change="handleNameUpdate"
          />
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item label="ID">
          <el-input v-model="elementBaseInfo.id" clearable @change="updateBaseInfo('id')" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="elementBaseInfo.name" clearable @change="updateBaseInfo('name')" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount, toRaw } from 'vue'

// 组件名称定义
defineOptions({ name: 'ElementBaseInfo' })

// 定义Props（移除TS类型验证，改为纯JS写法）
const props = defineProps({
  businessObject: {
    type: Object,
    default: () => ({})
  },
  model: {
    type: Object,
    default: () => ({})
  }
})

// 响应式变量定义（移除TS类型注解）
const needProps = ref({})
const bpmnElement = ref(null)
const elementBaseInfo = ref({})

// 流程模型的校验规则（reactive 保持不变）
const rules = reactive({
  id: [{ required: true, message: '流程标识不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '流程名称不能为空', trigger: 'blur' }]
})

// 获取bpmn实例（移除TS类型断言）
const bpmnInstances = () => window?.bpmnInstances

/** 重置基础信息 */
const resetBaseInfo = () => {
  console.log(window, 'window')
  console.log(bpmnElement.value, 'bpmnElement')

  bpmnElement.value = bpmnInstances()?.bpmnElement
  elementBaseInfo.value = bpmnElement.value.businessObject
  needProps.value['type'] = bpmnElement.value.businessObject.$type
}

/** 处理流程标识更新 */
const handleKeyUpdate = (value) => {
  // 校验 value 的值，只有 XML NCName 通过的情况下，才进行赋值。否则，会导致流程图报错，无法绘制的问题
  if (!value) {
    return
  }
  if (!value.match(/[a-zA-Z_][\-_.0-9a-zA-Z$]*/)) {
    console.log('key 不满足 XML NCName 规则，所以不进行赋值')
    return
  }
  console.log('key 满足 XML NCName 规则，所以进行赋值')

  // 在 BPMN 的 XML 中，流程标识 key，其实对应的是 id 节点
  elementBaseInfo.value['id'] = value

  setTimeout(() => {
    updateBaseInfo('id')
  }, 100)
}

/** 处理流程名称更新 */
const handleNameUpdate = (value) => {
  console.log(elementBaseInfo, 'elementBaseInfo')
  if (!value) {
    return
  }
  elementBaseInfo.value['name'] = value

  setTimeout(() => {
    updateBaseInfo('name')
  }, 100)
}

/** 更新基础信息到BPMN模型 */
const updateBaseInfo = (key) => {
  console.log(key, 'key')
  // 触发 elementBaseInfo 对应的字段
  const attrObj = Object.create(null)
  attrObj[key] = elementBaseInfo.value[key]
  
  needProps.value = { ...elementBaseInfo.value, ...needProps.value }

  if (key === 'id') {
    console.log(window, 'window')
    console.log(bpmnElement.value, 'bpmnElement')
    console.log(toRaw(bpmnElement.value), 'bpmnElement')
    bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
      id: elementBaseInfo.value[key],
      di: { id: `${elementBaseInfo.value[key]}_di` }
    })
  } else {
    console.log(attrObj, 'attrObj')
    bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), attrObj)
  }
}

// 监听businessObject变化重置基础信息
watch(
  () => props.businessObject,
  (val) => {
    if (val) {
      resetBaseInfo()
    }
  }
)

// 监听model.key变化更新key和name
watch(
  () => props.model?.key,
  (val) => {
    // 针对上传的 bpmn 流程图时，保证 key 和 name 的更新
    if (val) {
      handleKeyUpdate(props.model.key)
      handleNameUpdate(props.model.name)
    }
  },
  {
    immediate: true
  }
)

// 组件卸载时清空引用
onBeforeUnmount(() => {
  bpmnElement.value = null
})
</script>