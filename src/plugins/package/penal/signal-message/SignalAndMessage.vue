<template>
  <div class="panel-tab__content">
    <div class="panel-tab__content--title">
      <span><el-icon  style="margin-right: 8px; color: #555555"><Menu /></el-icon>消息列表</span>
      <el-button size="mini" type="primary" icon="CirclePlus" @click="openModel('message')">创建新消息</el-button>
    </div>
    <el-table :data="messageList" size="mini" border>
      <el-table-column type="index" label="序号" width="60px" />
      <el-table-column label="消息ID" prop="id" max-width="300px" show-overflow-tooltip />
      <el-table-column label="消息名称" prop="name" max-width="300px" show-overflow-tooltip />
    </el-table>
    <div class="panel-tab__content--title" style="padding-top: 8px; margin-top: 8px; border-top: 1px solid #eeeeee">
      <span><el-icon  style="margin-right: 8px; color: #555555"><Menu /></el-icon>信号列表</span>

      <el-button size="mini" type="primary" icon="CirclePlus" @click="openModel('signal')">创建新信号</el-button>
    </div>
    <el-table :data="signalList" size="mini" border>
      <el-table-column type="index" label="序号" width="60px" />
      <el-table-column label="信号ID" prop="id" max-width="300px" show-overflow-tooltip />
      <el-table-column label="信号名称" prop="name" max-width="300px" show-overflow-tooltip />
    </el-table>

    <Dialog
      v-model:visible="modelVisible" 
      :title="modelConfig.title" 
      width="400px" 
    >
      <el-form :model="modelObjectForm" size="mini" label-width="90px" @submit.prevent>
        <el-form-item :label="modelConfig.idLabel">
          <el-input v-model="modelObjectForm.id" clearable />
        </el-form-item>
        <el-form-item :label="modelConfig.nameLabel">
          <el-input v-model="modelObjectForm.name" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="mini" @click="modelVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="addNewObject">保 存</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus';
import 'element-plus/theme-chalk/el-table.css';
import 'element-plus/theme-chalk/el-table-column.css';
import 'element-plus/theme-chalk/el-button.css';
import 'element-plus/theme-chalk/el-dialog.css';
import 'element-plus/theme-chalk/el-form.css';
import 'element-plus/theme-chalk/el-form-item.css';
import 'element-plus/theme-chalk/el-input.css';
import { Menu } from '@element-plus/icons-vue'
import Dialog from "@/components/Dialog/index"

// 响应式变量
const signalList = ref([]);
const messageList = ref([]);
const modelVisible = ref(false);
const modelType = ref("");
const modelObjectForm = reactive({});
let rootElements = null;
let messageIdMap = {};
let signalIdMap = {};

// 计算属性 - 根据模型类型返回配置
const modelConfig = computed(() => {
  if (modelType.value === "message") {
    return { title: "创建消息", idLabel: "消息ID", nameLabel: "消息名称" };
  } else {
    return { title: "创建信号", idLabel: "信号ID", nameLabel: "信号名称" };
  }
});

// 初始化数据列表
const initDataList = () => {
  rootElements = window.bpmnInstances.modeler.getDefinitions().rootElements;
  messageIdMap = {};
  signalIdMap = {};
  messageList.value = [];
  signalList.value = [];
  
  rootElements.forEach(el => {
    if (el.$type === "bpmn:Message") {
      messageIdMap[el.id] = true;
      messageList.value.push({ ...el });
    }
    if (el.$type === "bpmn:Signal") {
      signalIdMap[el.id] = true;
      signalList.value.push({ ...el });
    }
  });
};

// 打开创建模型的弹窗
const openModel = (type) => {
  modelType.value = type;
  // 清空表单
  modelObjectForm.id = '';
  modelObjectForm.name = '';
  modelVisible.value = true;
};

// 添加新的消息或信号
const addNewObject = () => {
  if (modelType.value === "message") {
    if (messageIdMap[modelObjectForm.id]) {
      return ElMessage.error("该消息已存在，请修改id后重新保存");
    }
    const messageRef = window.bpmnInstances.moddle.create("bpmn:Message", modelObjectForm);
    rootElements.push(messageRef);
  } else {
    if (signalIdMap[modelObjectForm.id]) {
      return ElMessage.error("该信号已存在，请修改id后重新保存");
    }
    const signalRef = window.bpmnInstances.moddle.create("bpmn:Signal", modelObjectForm);
    rootElements.push(signalRef);
  }
  modelVisible.value = false;
  initDataList();
};

// 组件挂载时初始化数据
onMounted(() => {
  initDataList();
});
</script>
    