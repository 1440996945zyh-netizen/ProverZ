<!--
 * @Author: zhangsd
 * @Date: 2025-09-19 09:17:50
 * @LastEditTime: 2025-12-09 15:59:23
 * @LastEditors: zhangsd
 * @Description: 脚本任务组件
 * @FilePath: \view\src\plugins\package\penal\task\task-components\ScriptTask.vue
-->

<template>
  <div style="margin-top: 16px">
    <ElFormItem label="脚本格式">
      <ElInput
        v-model="scriptTaskForm.scriptFormat"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </ElFormItem>
    <ElFormItem label="脚本类型">
      <ElSelect v-model="scriptTaskForm.scriptType">
        <ElOption label="内联脚本" value="inline" />
        <ElOption label="外部资源" value="external" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="脚本" v-show="scriptTaskForm.scriptType === 'inline'">
      <ElInput
        v-model="scriptTaskForm.script"
        type="textarea"
        resize="vertical"
        :autosize="{ minRows: 2, maxRows: 4 }"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </ElFormItem>
    <ElFormItem label="资源地址" v-show="scriptTaskForm.scriptType === 'external'">
      <ElInput
        v-model="scriptTaskForm.resource"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </ElFormItem>
    <ElFormItem label="结果变量">
      <ElInput
        v-model="scriptTaskForm.resultVariable"
        clearable
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </ElFormItem>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';

// 定义 props
const props = defineProps({
  id: String,
  type: String
});

// 响应式数据
const defaultTaskForm = {
  scriptFormat: "",
  script: "",
  resource: "",
  resultVariable: "",
  scriptType: "inline"
};
const scriptTaskForm = ref({ ...defaultTaskForm });
let bpmnElement = null;

// 监听id变化
watch(
  () => props.id,
  () => {
    bpmnElement = window.bpmnInstances.bpmnElement;
    nextTick(() => resetTaskForm());
  },
  { immediate: true }
);

// 重置表单
const resetTaskForm = () => {
  for (let key in defaultTaskForm) {
    scriptTaskForm.value[key] = bpmnElement?.businessObject[key] || defaultTaskForm[key];
  }
  scriptTaskForm.value.scriptType = scriptTaskForm.value.script ? "inline" : "external";
};

// 更新元素任务
const updateElementTask = () => {
  let taskAttr = Object.create(null);
  taskAttr.scriptFormat = scriptTaskForm.value.scriptFormat || null;
  taskAttr.resultVariable = scriptTaskForm.value.resultVariable || null;
  
  if (scriptTaskForm.value.scriptType === "inline") {
    taskAttr.script = scriptTaskForm.value.script || null;
    taskAttr.resource = null;
  } else {
    taskAttr.resource = scriptTaskForm.value.resource || null;
    taskAttr.script = null;
  }
  
  window.bpmnInstances.modeling.updateProperties(bpmnElement, taskAttr);
};

// 组件卸载前清理
onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>

<style>
/* 如需添加样式可在此处编写 */
</style>