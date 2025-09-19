<template>
  <div style="margin-top: 16px">
    <el-form-item label="消息实例">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap">
        <el-select v-model="bindMessageId" @change="updateTaskMessage">
          <el-option 
            v-for="id in Object.keys(messageMap)" 
            :value="id" 
            :label="messageMap[id]" 
            :key="id" 
          />
        </el-select>
        <el-button 
          size="mini" 
          type="primary" 
          icon="Plus" 
          style="margin-left: 8px" 
          @click="openMessageModel" 
        />
      </div>
    </el-form-item>
    <el-dialog 
      v-model="messageModelVisible" 
      :close-on-click-modal="false" 
      title="创建新消息" 
      width="400px" 
      append-to-body 
      destroy-on-close
    >
      <el-form 
        :model="newMessageForm" 
        size="mini" 
        label-width="90px" 
        @submit.prevent
      >
        <el-form-item label="消息ID">
          <el-input v-model="newMessageForm.id" clearable />
        </el-form-item>
        <el-form-item label="消息名称">
          <el-input v-model="newMessageForm.name" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="mini" type="primary" @click="createNewMessage">确 认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, watch, nextTick, onBeforeUnmount,  } from 'vue';

export default defineComponent({
  name: "ReceiveTask",
  props: {
    id: String,
    type: String
  },
  setup(props) {
    // 响应式数据
    const bindMessageId = ref("");
    const newMessageForm = ref({});
    const messageMap = ref({});
    const messageModelVisible = ref(false);
    let bpmnElement = null;
    let bpmnMessageRefsMap = Object.create(null);
    let bpmnRootElements = [];

    // 初始化
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

    // 组件创建时初始化
    init();

    // 监听id变化
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

    // 打开消息模型
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

    // 更新任务消息
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

    // 组件卸载前清理
    onBeforeUnmount(() => {
      bpmnElement = null;
    });

    return {
      bindMessageId,
      newMessageForm,
      messageMap,
      messageModelVisible,
      getBindMessage,
      openMessageModel,
      createNewMessage,
      updateTaskMessage
    };
  }
});
</script>