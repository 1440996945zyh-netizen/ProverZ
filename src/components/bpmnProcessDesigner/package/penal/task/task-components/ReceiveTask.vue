<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-16 16:19:56
 * @LastEditors: zhangsd
 * @Description: 接收任务配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\task\task-components\ReceiveTask.vue
-->

<template>
  <div style="margin-top: 16px">
    <el-form-item label="消息实例">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
        "
      >
        <el-select v-model="bindMessageId" @change="updateTaskMessage">
          <el-option
            v-for="key in Object.keys(messageMap)"
            :value="key"
            :label="messageMap[key]"
            :key="key"
          />
        </el-select>
        <el-button
          type="primary"
          style="margin-left: 8px"
          @click="openMessageModel"
        >
          <el-icon><Plus /></el-icon>
          添加消息
        </el-button>
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
      <el-form :model="newMessageForm" size="small" label-width="90px">
        <el-form-item label="消息ID">
          <el-input v-model="newMessageForm.id" clearable />
        </el-form-item>
        <el-form-item label="消息名称">
          <el-input v-model="newMessageForm.name" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" type="primary" @click="createNewMessage">确 认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

defineOptions({ name: 'ReceiveTask' })

const props = defineProps({
  id: String,
  type: String
})

// 消息工具
const useMessage = () => ({
  error: (msg) => ElMessage.error(msg)
})

const message = useMessage()

// 响应式数据
const bindMessageId = ref('')
const newMessageForm = ref({})
const messageMap = ref({})
const messageModelVisible = ref(false)
const bpmnElement = ref()
const bpmnMessageRefsMap = ref()
const bpmnRootElements = ref()

/**
 * @description 获取 BPMN 实例对象
 * @returns {Object} BPMN 实例
 */
const bpmnInstances = () => window?.bpmnInstances

/**
 * @description 获取绑定的消息
 */
const getBindMessage = () => {
  bpmnElement.value = bpmnInstances().bpmnElement
  bindMessageId.value = bpmnElement.value.businessObject?.messageRef?.id || '-1'
}

/**
 * @description 打开消息模型对话框
 */
const openMessageModel = () => {
  messageModelVisible.value = true
  newMessageForm.value = {}
}

/**
 * @description 创建新消息
 */
const createNewMessage = () => {
  if (messageMap.value[newMessageForm.value.id]) {
    message.error('该消息已存在，请修改id后重新保存')
    return
  }
  
  const newMessage = bpmnInstances().moddle.create('bpmn:Message', newMessageForm.value)
  bpmnRootElements.value.push(newMessage)
  messageMap.value[newMessageForm.value.id] = newMessageForm.value.name
  bpmnMessageRefsMap.value[newMessageForm.value.id] = newMessage
  messageModelVisible.value = false
}

/**
 * @description 更新任务消息
 * @param {string} messageId 消息ID
 */
const updateTaskMessage = (messageId) => {
  if (messageId === '-1') {
    bpmnInstances().modeling.updateProperties(bpmnElement.value, {
      messageRef: null
    })
  } else {
    bpmnInstances().modeling.updateProperties(bpmnElement.value, {
      messageRef: bpmnMessageRefsMap.value[messageId]
    })
  }
}

// 组件挂载时初始化
onMounted(() => {
  bpmnMessageRefsMap.value = Object.create(null)
  bpmnRootElements.value = bpmnInstances().modeler.getDefinitions().rootElements
  bpmnRootElements.value
    .filter((el) => el.$type === 'bpmn:Message')
    .forEach((m) => {
      bpmnMessageRefsMap.value[m.id] = m
      messageMap.value[m.id] = m.name
    })
  messageMap.value['-1'] = '无'
})

// 组件卸载前清理
onBeforeUnmount(() => {
  bpmnElement.value = null
})

// 监听元素 ID 变化
watch(
  () => props.id,
  () => {
    nextTick(() => {
      getBindMessage()
    })
  },
  { immediate: true }
)
</script>