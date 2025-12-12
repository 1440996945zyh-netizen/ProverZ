<!--
 * @Author: zhangsd
 * @Date: 2025-09-19 09:17:50
 * @LastEditTime: 2025-12-09 15:43:23
 * @LastEditors: zhangsd
 * @Description: 服务任务组件
 * @FilePath: \view\src\plugins\package\penal\task\task-components\ServiceTask.vue
-->
<template>
  <div class="panel-tab__content">
    <el-form size="small" label-width="90px" @submit.prevent>
      <el-form-item label="服务类型">
        <el-select v-model="serviceType" size="small">
          <el-option 
            v-for="i in Object.keys(typeObject)" 
            :key="i" 
            :label="typeObject[i]" 
            :value="i" 
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="serviceType === 'class'" label="Java类">
        <el-input v-model="serviceValue" clearable @change="updateInfo('class')" size="small" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'expression'" label="表达式">
        <el-input v-model="serviceValue" clearable @change="updateInfo('expression')" size="small" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'delegateExpression'" label="代理表达式">
        <el-input v-model="serviceValue" clearable @change="updateInfo('delegateExpression')" size="small" />
      </el-form-item>
      <el-form-item v-if="serviceType === 'expression'" label="结果变量">
        <el-input v-model="resultVariable" clearable @change="updateInfo('resultVariable')" size="small" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount, inject } from 'vue';

// 定义组件属性
const props = defineProps({
  id: String,
  type: String
});

// 注入属性
const prefix = inject('prefix');
const width = inject('width');

// 响应式数据
const typeObject = {
  class: "Java 类",
  expression: "表达式",
  delegateExpression: "代理表达式"
};
const serviceType = ref("");
const serviceValue = ref("");
const resultVariable = ref("");
let bpmnElement = null;

// 监听id变化
watch(
  () => props.id,
  (val) => {
    nextTick(() => resetBaseInfo());
  },
  { immediate: true }
);

// 重置基础信息
const resetBaseInfo = () => {
  bpmnElement = window?.bpmnInstances?.bpmnElement;
  let val = "";
  if ((val = bpmnElement.businessObject.class)) {
    serviceType.value = "class";
  } else if ((val = bpmnElement.businessObject.expression)) {
    serviceType.value = "expression";
    if (bpmnElement.businessObject.hasOwnProperty('resultVariable')) {
      resultVariable.value = bpmnElement.businessObject.resultVariable;
    }
  } else if ((val = bpmnElement.businessObject.delegateExpression)) {
    serviceType.value = "delegateExpression";
  }
  serviceValue.value = val;
};

// 更新信息
const updateInfo = (key) => {
  const attrObj = Object.create(null);
  attrObj.class = undefined;
  attrObj.expression = undefined;
  attrObj.delegateExpression = undefined;
  attrObj.resultVariable = undefined;
  
  if (key === "class") {
    attrObj.class = serviceValue.value;
  } else if (key === "expression") {
    attrObj.expression = serviceValue.value;
    if (resultVariable.value !== "") {
      attrObj.resultVariable = resultVariable.value;
    }
  } else if (key === "delegateExpression") {
    attrObj.delegateExpression = serviceValue.value;
  }
  
  window.bpmnInstances.modeling.updateProperties(bpmnElement, attrObj);
};

// 组件卸载前清理
onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>

<style scoped>
/* 如果需要样式，可以在这里添加 */
</style>