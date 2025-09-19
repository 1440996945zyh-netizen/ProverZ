<template>
  <div class="panel-tab__content">
    <el-form :model="flowConditionForm" label-width="90px" size="mini" @submit.prevent>
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

      <el-form-item label="表达式" v-if="flowConditionForm.conditionType === 'expression'" key="express">
        <el-input v-model="flowConditionForm.body" clearable @change="updateFlowCondition" />
      </el-form-item>

      <template v-if="flowConditionForm.conditionType === 'script'">
        <el-form-item label="脚本语言" key="language">
          <el-input v-model="flowConditionForm.language" clearable @change="updateFlowCondition" />
        </el-form-item>

        <el-form-item label="脚本类型" key="scriptType">
          <el-select v-model="flowConditionForm.scriptType">
            <el-option label="内联脚本" value="inlineScript" />
            <el-option label="外部脚本" value="externalScript" />
          </el-select>
        </el-form-item>

        <el-form-item label="脚本" v-if="flowConditionForm.scriptType === 'inlineScript'" key="body">
          <el-input v-model="flowConditionForm.body" type="textarea" clearable @change="updateFlowCondition" />
        </el-form-item>

        <el-form-item label="资源地址" v-if="flowConditionForm.scriptType === 'externalScript'" key="resource">
          <el-input v-model="flowConditionForm.resource" clearable @change="updateFlowCondition" />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount, nextTick } from 'vue';

// 1. 首先定义Props，确保在使用前完成初始化
const props = defineProps({
  businessObject: Object,
  type: String
});

// 假设 window.bpmnInstances 是全局注入的，保持原样
const bpmnInstances = window.bpmnInstances;

// 响应式表单数据
const flowConditionForm = reactive({
  type: 'normal',
  conditionType: '',
  scriptType: '',
  body: '',
  resource: '',
  language: ''
});

// 用于缓存 BPMN 元素引用（避免重复查找）
let bpmnElement = null;
let bpmnElementSource = null;
let bpmnElementSourceRef = null;

// 初始化或重置表单数据
const resetFlowCondition = () => {
  if (!bpmnInstances || !bpmnInstances.bpmnElement) return;

  bpmnElement = bpmnInstances.bpmnElement;
  bpmnElementSource = bpmnElement.source;
  bpmnElementSourceRef = bpmnElement.businessObject.sourceRef;

  // 默认路径判断
  if (bpmnElementSourceRef && bpmnElementSourceRef.default?.id === bpmnElement.id) {
    flowConditionForm.type = 'default';
    flowConditionForm.conditionType = '';
    flowConditionForm.scriptType = '';
    flowConditionForm.body = '';
    flowConditionForm.resource = '';
    flowConditionForm.language = '';
    return;
  }

  // 普通路径：无 conditionExpression
  if (!bpmnElement.businessObject.conditionExpression) {
    flowConditionForm.type = 'normal';
    flowConditionForm.conditionType = '';
    flowConditionForm.scriptType = '';
    flowConditionForm.body = '';
    flowConditionForm.resource = '';
    flowConditionForm.language = '';
    return;
  }

  // 条件路径：从 conditionExpression 复制数据
  const conditionExpression = bpmnElement.businessObject.conditionExpression;
  Object.assign(flowConditionForm, {
    ...conditionExpression,
    type: 'condition'
  });

  // 判断是 script 还是 expression
  if (conditionExpression.resource) {
    flowConditionForm.conditionType = 'script';
    flowConditionForm.scriptType = 'externalScript';
    flowConditionForm.body = ''; // 清空 body，因为是外部资源
  } else if (conditionExpression.language) {
    flowConditionForm.conditionType = 'script';
    flowConditionForm.scriptType = 'inlineScript';
  } else {
    flowConditionForm.conditionType = 'expression';
    flowConditionForm.language = '';
    flowConditionForm.resource = '';
  }
};

// 更新流转类型
const updateFlowType = (flowType) => {
  if (!bpmnElement) return; // 防御性检查

  if (flowType === 'condition') {
    const conditionRef = bpmnInstances.moddle.create('bpmn:FormalExpression');
    bpmnInstances.modeling.updateProperties(bpmnElement, {
      conditionExpression: conditionRef
    });
    return;
  }

  if (flowType === 'default') {
    bpmnInstances.modeling.updateProperties(bpmnElement, {
      conditionExpression: null
    });
    bpmnInstances.modeling.updateProperties(bpmnElementSource, {
      default: bpmnElement
    });
    return;
  }

  // 普通路径：清除父元素的默认路径（如果当前连线是默认路径）
  if (bpmnElementSourceRef?.default?.id === bpmnElement.id) {
    bpmnInstances.modeling.updateProperties(bpmnElementSource, {
      default: null
    });
  }

  bpmnInstances.modeling.updateProperties(bpmnElement, {
    conditionExpression: null
  });
};

// 更新条件内容（表达式/脚本）
const updateFlowCondition = () => {
  if (!bpmnElement) return; // 防御性检查

  const { conditionType, scriptType, body, resource, language } = flowConditionForm;
  let condition;

  if (conditionType === 'expression') {
    condition = bpmnInstances.moddle.create('bpmn:FormalExpression', { body });
  } else {
    if (scriptType === 'inlineScript') {
      condition = bpmnInstances.moddle.create('bpmn:FormalExpression', { body, language });
      flowConditionForm.resource = ''; // 清除资源字段
    } else {
      flowConditionForm.body = ''; // 清除 body 字段
      condition = bpmnInstances.moddle.create('bpmn:FormalExpression', { resource, language });
    }
  }

  bpmnInstances.modeling.updateProperties(bpmnElement, { conditionExpression: condition });
};

// 监听 businessObject 变化，自动重置表单
watch(
  () => props.businessObject,
  () => {
    nextTick(() => resetFlowCondition());
  },
  { immediate: true }
);

// 组件销毁前清理引用
onBeforeUnmount(() => {
  bpmnElement = null;
  bpmnElementSource = null;
  bpmnElementSourceRef = null;
});
</script>

<style scoped>
/* 保持原有样式，无需修改 */
</style>
