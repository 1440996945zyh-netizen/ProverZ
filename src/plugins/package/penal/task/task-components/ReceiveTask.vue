<!--
 * @Author: zhangsd
 * @Date: 2025-09-19 09:17:50
 * @LastEditTime: 2025-12-09 16:01:28
 * @LastEditors: zhangsd
 * @Description: 接收任务组件
 * @FilePath: \view\src\plugins\package\penal\task\task-components\ReceiveTask.vue
-->

<template>
  <div style="margin-top: 16px">
    <ElFormItem label="消息实例">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap">
        <ElSelect v-model="bindMessageId" @change="updateTaskMessage">
          <ElOption
            v-for="id in Object.keys(messageMap)"
            :value="id"
            :label="messageMap[id]"
            :key="id"
          />
        </ElSelect>
        <ElButton
          size="mini"
          type="primary"
          icon="Plus"
          style="margin-left: 8px"
          @click="openMessageModel"
        />
      </div>
    </ElFormItem>
    <ElDialog
      v-model="messageModelVisible"
      :close-on-click-modal="false"
      title="创建新消息"
      width="400px"
      append-to-body
      destroy-on-close
    >
      <ElForm
        :model="newMessageForm"
        size="mini"
        label-width="90px"
        @submit.prevent
      >
        <ElFormItem label="消息ID">
          <ElInput v-model="newMessageForm.id" clearable />
        </ElFormItem>
        <ElFormItem label="消息名称">
          <ElInput v-model="newMessageForm.name" clearable />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton size="mini" type="primary" @click="createNewMessage">确 认</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { ElFormItem, ElSelect, ElOption, ElButton, ElDialog, ElForm, ElInput, ElMessage } from 'element-plus';

// 定义组件 props
const props = defineProps({
  id: String,
  type: String
});

// 响应式数据（与原逻辑完全一致）
const bindMessageId = ref("");
const newMessageForm = ref({});
const messageMap = ref({});
const messageModelVisible = ref(false);
let bpmnElement = null;
let bpmnMessageRefsMap = Object.create(null);
let bpmnRootElements = [];

// 初始化方法
const init = () => {
  bpmnMessageRefsMap = Object.create(null);
  bpmnRootElements = window.bpmnInstances.modeler.getDefinitions().rootElements;
  
  bpmnRootElements
    .filter(el => el.$type === "bpmn:Message")
    .forEach(m => {
      bpmnMessageRefsMap[m.id] = m;
      messageMap.value[m.id] = m.name;
    });
  
  messageMap.value["-1"] = "无"; // 添加空选项
};

// 组件创建时执行初始化
init();

// 监听id变化（与原逻辑一致）
watch(
  () => props.id,
  () => {
    nextTick(() => getBindMessage());
  },
  { immediate: true }
);

// 获取绑定的消息
const getBindMessage = () => {
  bpmnElement = window.bpmnInstances.bpmnElement;
  bindMessageId.value = bpmnElement.businessObject?.messageRef?.id || "-1";
};

// 打开消息模型弹窗
const openMessageModel = () => {
  messageModelVisible.value = true;
  newMessageForm.value = {};
};

// 创建新消息
const createNewMessage = () => {
  if (messageMap.value[newMessageForm.value.id]) {
    ElMessage.error("该消息已存在，请修改id后重新保存");
    return;
  }
  
  const newMessage = window.bpmnInstances.moddle.create("bpmn:Message", newMessageForm.value);
  bpmnRootElements.push(newMessage);
  messageMap.value[newMessageForm.value.id] = newMessageForm.value.name;
  bpmnMessageRefsMap[newMessageForm.value.id] = newMessage;
  messageModelVisible.value = false;
};

// 更新任务消息关联
const updateTaskMessage = (messageId) => {
  if (messageId === "-1") {
    window.bpmnInstances.modeling.updateProperties(bpmnElement, {
      messageRef: null
    });
  } else {
    window.bpmnInstances.modeling.updateProperties(bpmnElement, {
      messageRef: bpmnMessageRefsMap[messageId]
    });
  }
};

// 组件卸载前清理变量
onBeforeUnmount(() => {
  bpmnElement = null;
});
</script>

<style>
/* 如需添加自定义样式，可在此处编写 */
</style>