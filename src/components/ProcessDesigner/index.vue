<!--
 * @Author: zhangsd
 * @Date: 2025-09-17 10:35:09
 * @LastEditTime: 2025-09-18 16:32:21
 * @LastEditors: zhangsd
 * @Description: 流程设计模版
 * @FilePath: \view\src\components\ProcessDesigner\index.vue
--> 
<template>
  <div class="process-design" :style="`display: flex; height: ${height}`">
    <BpmnProcessDesigner
      v-model="xmlString"
      v-bind="controlForm"
      keyboard
      ref="processDesigner"
      :events="[
        'element.click',
        'connection.added',
        'connection.removed',
        'connection.changed'
      ]"

      @element-click="elementClick"
      @init-finished="initModeler"
      @event="handlerEvent"
      @save="onSaveProcess"
    />
    <BmpnProcessPenal
      :bpmn-modeler="modeler" 
      :prefix="controlForm.prefix" 
      :users="controlForm.users" 
      :groups="controlForm.groups" 
      :categorys="controlForm.categorys" 
      class="process-panel" 
    />
  </div>
</template>
 
<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import '@/plugins/package/theme/index.scss';
import { BpmnProcessDesigner, BmpnProcessPenal } from '@/plugins/package/index';
// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from '@/plugins/package/designer/plugins/content-pad';
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from '@/plugins/package/designer/plugins/palette';
// import { vuePlugin } from '@/plugins/package/highlight';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
// import hljs from '@/plugins/package/highlight/index.js';
// // 注册highlight插件
// vuePlugin.install();

// 定义组件属性
const props = defineProps({
  bpmnXml: {
    type: String,
    required: true
  },
  designerForm: {
    type: Object,
    required: true
  },
});

// 定义事件
const emit = defineEmits(['save']);

// 响应式变量
const processDesigner = ref(null);
const xmlString = ref(props.bpmnXml);
const modeler = ref(null);
const element = ref(null);
const height = ref(`${document.documentElement.clientHeight - 124.5}px`);

// 控制表单数据
const controlForm = reactive({
  users: props.designerForm.users,
  groups: props.designerForm.groups,
  categorys: props.designerForm.categorys,
  processId: props.designerForm.processKey || '',
  processName: props.designerForm.processName || '',
  simulation: false,
  labelEditing: false,
  labelVisible: false,
  prefix: 'flowable',
  headerButtonSize: 'default',
  additionalModel: [CustomContentPadProvider, CustomPaletteProvider]
});

// 监听窗口大小变化，调整高度
function handleResize() {
  height.value = `${document.documentElement.clientHeight - 94.5}px`;
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('resize', handleResize);
  
  // 监听designerForm变化，更新controlForm
  watch(() => props.designerForm, (newVal) => {
    controlForm.users = newVal.users;
    controlForm.groups = newVal.groups;
    controlForm.categorys = newVal.categorys;
    controlForm.processId = newVal.processKey || '';
    controlForm.processName = newVal.processName || '';
  }, { deep: true });
  
  // 监听bpmnXml变化，更新xmlString
  watch(() => props.bpmnXml, (newVal) => {
    xmlString.value = newVal;
  });
});

// 元素点击事件
function elementClick(el) {
  element.value = el;
}

// 初始化模型器
function initModeler(bpmnModeler) {
  setTimeout(() => {
    modeler.value = bpmnModeler;
    console.log("initModeler modeler", modeler.value);
  }, 10);
}

// 事件处理器
function handlerEvent(eventName, el) {
  // 可以在这里添加事件处理逻辑
  // console.log('event:', eventName, el);
}

// 保存流程
function onSaveProcess(saveData) {
  emit('save', saveData);
}
</script>

<style lang="scss">
body {
  overflow: auto;
  margin: 0;
  box-sizing: border-box;
}
body,
body * {
  /* 滚动条 */
  &::-webkit-scrollbar-track-piece {
    background-color: #fff; /*滚动条的背景颜色*/
    -webkit-border-radius: 0; /*滚动条的圆角宽度*/
  }

  &::-webkit-scrollbar {
    width: 10px; /*滚动条的宽度*/
    height: 8px; /*滚动条的高度*/
  }

  &::-webkit-scrollbar-thumb:vertical {
    /*垂直滚动条的样式*/
    height: 50px;
    background-color: rgba(153, 153, 153, 0.5);
    -webkit-border-radius: 4px;
    outline: 2px solid #fff;
    outline-offset: -2px;
    border: 2px solid #fff;
  }

  &::-webkit-scrollbar-thumb {
    /*滚动条的hover样式*/
    background-color: rgba(159, 159, 159, 0.3);
    -webkit-border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    /*滚动条的hover样式*/
    background-color: rgba(159, 159, 159, 0.5);
    -webkit-border-radius: 4px;
  }
}

.process-panel {
  min-width: 300px;
  border-left: 1px solid #e5e7eb;
}
</style>
