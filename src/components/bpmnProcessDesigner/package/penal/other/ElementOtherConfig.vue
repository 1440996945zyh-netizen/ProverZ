<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-16 16:10:28
 * @LastEditors: zhangsd
 * @Description: 元素其他配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\other\ElementOtherConfig.vue
-->

<template>
  <div class="panel-tab__content">
    <div class="element-property input-property">
      <div class="element-property__label">元素文档：</div>
      <div class="element-property__value">
        <el-input
          v-model="documentation"
          type="textarea"
          resize="vertical"
          :autosize="{ minRows: 2, maxRows: 4 }"
          @input="updateDocumentation"
          @blur="updateDocumentation"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { toRaw } from 'vue'

defineOptions({ name: 'ElementOtherConfig' })

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
})

const documentation = ref('')
const bpmnElement = ref()

const bpmnInstances = () => window?.bpmnInstances

const updateDocumentation = () => {
  // 确保当前元素与目标元素一致
  if (!bpmnElement.value || bpmnElement.value.id !== props.id) {
    bpmnElement.value = bpmnInstances().elementRegistry.get(props.id)
  }
  
  const documentations = bpmnInstances().bpmnFactory.create('bpmn:Documentation', {
    text: documentation.value
  })
  
  bpmnInstances().modeling.updateProperties(toRaw(bpmnElement.value), {
    documentation: [documentations]
  })
}
// 组件销毁时清理引用
onBeforeUnmount(() => {
  bpmnElement.value = null
})

watch(
  () => props.id,
  (id) => {
    if (id && id.length) {
      nextTick(() => {
        const documentations = bpmnInstances().bpmnElement?.businessObject?.documentation
        documentation.value = documentations && documentations.length ? documentations[0].text : ''
      })
    } else {
      documentation.value = ''
    }
  },
  { immediate: true }
)
</script>