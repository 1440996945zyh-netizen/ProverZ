<template>
  <div class="panel-tab__content">
    <div class="element-property input-property">
      <div class="element-property__label">元素文档：</div>
      <div class="element-property__value">
        <el-input
          type="textarea"
          v-model="documentation"
          size="mini"
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
import { ref, watch, nextTick } from 'vue';
import { ElInput } from 'element-plus';
import 'element-plus/theme-chalk/el-input.css';

// 定义组件属性
const props = defineProps({
  id: String
});

// 响应式变量
const documentation = ref('');
let bpmnElement = null;

// 监听id变化，同步文档内容
watch(
  () => props.id,
  (id) => {
    if (id && id.length) {
      nextTick(() => {
        const element = window.bpmnInstances?.elementRegistry?.get(id);
        if (element) {
          const docs = element.businessObject?.documentation;
          documentation.value = docs && docs.length ? docs[0].text : '';
          bpmnElement = element;
        } else {
          documentation.value = '';
        }
      });
    } else {
      documentation.value = '';
    }
  },
  { immediate: true }
);

// 更新文档内容到BPMN元素
const updateDocumentation = () => {
  if (!props.id) return;
  
  // 确保获取到正确的BPMN元素
  if (!bpmnElement || bpmnElement.id !== props.id) {
    bpmnElement = window.bpmnInstances?.elementRegistry?.get(props.id);
  }
  
  if (bpmnElement) {
    const documentationObj = window.bpmnInstances.bpmnFactory.create("bpmn:Documentation", { 
      text: documentation.value 
    });
    window.bpmnInstances.modeling.updateProperties(bpmnElement, {
      documentation: [documentationObj]
    });
  }
};

// 组件销毁时清理引用
const onBeforeUnmount = () => {
  bpmnElement = null;
};

// 注册生命周期钩子
onBeforeUnmount(onBeforeUnmount);
</script>
