<template>
  <div class="panel-tab__content">
    <component :is="customConfigComponent" v-bind="$props" />
  </div>
</template>

<script lang="js" setup>
import { ref, watch } from 'vue'
import { CustomConfigMap } from './data'

// 定义组件名称
defineOptions({ name: 'ElementCustomConfig' })

// 定义 Props
const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  businessObject: {
    type: Object,
    default: () => ({})
  }
})

//
const bpmnInstances = () => window?.bpmnInstances

// 响应式变量
const customConfigComponent = ref(null)


watch(
  () => props.businessObject,
  () => {
    if (props.type && props.businessObject) {
      let val = props.type
      if (props.businessObject.eventDefinitions) {
        val += props.businessObject.eventDefinitions[0]?.$type.split(':')[1] || ''
      }

      customConfigComponent.value = CustomConfigMap[val]?.component
      console.log('customConfigComponent.value =>', customConfigComponent.value);
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped></style>