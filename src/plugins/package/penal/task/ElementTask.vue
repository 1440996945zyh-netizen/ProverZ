<!--
 * @Author: zhangsd
 * @Date: 2025-09-19 09:17:50
 * @LastEditTime: 2025-12-09 15:43:42
 * @LastEditors: zhangsd
 * @Description: 元素任务组件
 * @FilePath: \view\src\plugins\package\penal\task\task-components\ElementTask.vue
-->

<template>
  <div class="panel-tab__content">
    <el-form size="small" label-width="90px" @submit.prevent>
      <component 
        :is="witchTaskComponent" 
        v-bind="$props" 
        :users="users" 
        :groups="groups" 
      />
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import UserTask from "./task-components/UserTask";
import ScriptTask from "./task-components/ScriptTask";
import ReceiveTask from "./task-components/ReceiveTask";
import ServiceTask from "./task-components/ServiceTask";

// 定义组件属性
const props = defineProps({
  users: {
    type: Array,
    required: true
  },
  groups: {
    type: Array,
    required: true
  },
  id: String,
  type: String
});

// 响应式数据
const taskConfigForm = ref({
  asyncAfter: false,
  asyncBefore: false,
  exclusive: false
});
const witchTaskComponent = ref("");
const installedComponent = {
  UserTask: "UserTask",
  ScriptTask: "ScriptTask",
  ReceiveTask: "ReceiveTask",
  ServiceTask: "ServiceTask"
};
let bpmnElement = null;

// 监听id变化
watch(
  () => props.id,
  () => {
    bpmnElement = window.bpmnInstances.bpmnElement;
    taskConfigForm.value.asyncBefore = bpmnElement?.businessObject?.asyncBefore;
    taskConfigForm.value.asyncAfter = bpmnElement?.businessObject?.asyncAfter;
    taskConfigForm.value.exclusive = bpmnElement?.businessObject?.exclusive;
  },
  { immediate: true }
);

// 监听type变化
watch(
  () => props.type,
  () => {
    witchTaskComponent.value = installedComponent[props.type];
  },
  { immediate: true }
);

// 更改任务异步配置
const changeTaskAsync = () => {
  if (!taskConfigForm.value.asyncBefore && !taskConfigForm.value.asyncAfter) {
    taskConfigForm.value.exclusive = false;
  }
  window.bpmnInstances.modeling.updateProperties(
    window.bpmnInstances.bpmnElement,
    { ...taskConfigForm.value }
  );
};

// 注册组件
defineOptions({
  components: { UserTask, ScriptTask, ReceiveTask, ServiceTask },
  name: "ElementTaskConfig"
});
</script>

<style scoped>
/* 如果需要样式，可以在这里添加 */
</style>