<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 14:38:40
 * @LastEditTime: 2025-12-22 10:17:22
 * @LastEditors: zhangsd
 * @Description: 流程设计器
 * @FilePath: \view\src\views\bpmModel\processManagement\editor\index.vue
-->
<template>
  <div class="app-container" style="height:calc(100vh - 191px)">
     <!-- 流程设计器，负责绘制流程等 -->
    <MyProcessDesigner
      key="designer"
      v-model="xmlString"
      :value="xmlString"
      v-bind="controlForm"
      keyboard
      ref="processDesigner"
      @init-finished="initModeler"
      :additionalModel="controlForm.additionalModel"
      :model="model"
      @save="save"
      :process-id="modelKey"
      :process-name="modelName"
    />
    <!-- 流程属性器，负责编辑每个流程节点的属性 -->
    <MyProcessPenal
      v-if="modeler"
      key="penal"
      :bpmnModeler="modeler"
      :prefix="controlForm.prefix"
      class="process-panel"
      :model="model"
    />  
  </div>
</template>

<script setup>
import { ref, inject, shallowRef, watch, onBeforeUnmount } from 'vue'
import { useMessage } from '@/plugins/useMessage' // 补充引入useMessage
import { MyProcessDesigner, MyProcessPenal } from '@/components/bpmnProcessDesigner/package'
// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/content-pad'
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/palette'
import * as ModelApi from '@/api/system/bpm/model'
import { BpmModelFormType } from '@/utils/bpm/constantEnumeration'
import * as FormApi from '@/api/system/bpm/form'

// 定义组件名称
defineOptions({ name: 'BpmModelEditor' })

// 定义组件属性 
const props = defineProps({
  /**
   * 流程模型ID
   */
  modelId: {
    type: String,
    required: false
  },
  /**
   * 流程模型Key
   */
  modelKey: {
    type: String,
    required: true
  },
  /**
   * 流程模型名称
   */
  modelName: {
    type: String,
    required: true
  },
  /**
   * 流程模型XML字符串
   */
  value: {
    type: String,
    required: false
  }
})

// 定义组件事件
const emit = defineEmits(['success', 'init-finished'])

// 引入消息提示
const message = useMessage()

// 表单信息
const formFields = ref([])
// 表单类型，暂仅限流程表单
const formType = ref(BpmModelFormType.NORMAL)
provide('formFields', formFields)
provide('formType', formType)

// 注入流程数据（移除TS类型断言）
const xmlString = inject('processData')
// 注入模型数据（移除TS类型断言）
const modelData = inject('modelData')

// BPMN Modeler 实例
const modeler = shallowRef()
const processDesigner = ref()

// 流程设计器配置
const controlForm = ref({
  simulation: true,
  labelEditing: false,
  labelVisible: false,
  prefix: 'flowable',
  headerButtonSize: 'mini',
  additionalModel: [CustomContentPadProvider, CustomPaletteProvider]
})

// 流程模型的信息
const model = ref()

/** 初始化 modeler */
const initModeler = async (item) => {
  // 先初始化模型数据
  model.value = modelData.value
  modeler.value = item
}

/** 添加/修改模型 */
const save = async (bpmnXml) => {
  try {
    xmlString.value = bpmnXml
    emit('success', bpmnXml)
  } catch (error) {
    console.error('保存失败:', error)
    message.error('保存失败')
  }
}

/** 监听表单 ID 变化，加载表单数据 */
watch(
  () => modelData.value.formId,
  async (newFormId) => {
    if (newFormId && modelData.value.formType === BpmModelFormType.NORMAL) {
      // const data = await FormApi.getForm(newFormId)
      const data = {
				id: 39,
				name: 'test',
				conf: '{"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"right","size":"default","labelWidth":"100px"},"resetBtn":{"show":false,"innerText":"重置"},"submitBtn":{"show":true,"innerText":"提交"}}',
				fields: [
					'{"type":"input","field":"Fgyomj6yl6fnabc","title":"输入框","info":"","$required":false,"_fc_id":"id_F403mj6yl6fnacc","name":"ref_Ff23mj6yl6fnadc","display":true,"hidden":false,"_fc_drag_tag":"input"}',
					'{"type":"input","field":"Fpvwmj6yl7giaec","title":"多行输入框","info":"","$required":false,"props":{"type":"textarea"},"_fc_id":"id_Fovymj6yl7giafc","name":"ref_Fw2smj6yl7giagc","display":true,"hidden":false,"_fc_drag_tag":"textarea"}',
					'{"type":"checkbox","field":"Ft94mj6yl8amahc","title":"多选框","info":"","effect":{"fetch":""},"$required":false,"options":[{"label":"选项01","value":"1"},{"label":"选项02","value":"2"},{"label":"选项03","value":"3"}],"_fc_id":"id_Fuapmj6yl8amaic","name":"ref_F0iamj6yl8amajc","display":true,"hidden":false,"_fc_drag_tag":"checkbox"}',
				],
				status: 0,
				remark: '',
				createTime: 1765791379000,
			}
      formFields.value = data.fields
    } else {
      formFields.value = []
    }
  },
  { immediate: true }
)

// 组件卸载时清理资源
onBeforeUnmount(() => {
  modeler.value = null
  // 清理全局BPMN实例
  const w = window
  if (w.bpmnInstances) {
    w.bpmnInstances = null
  }
})
</script>

<style lang="scss" scoped>
// 流程属性面板样式（
.process-panel {
  &__container {
    position: absolute;
    top: 172px;
    right: 70px;
    background-color: var(--el-bg-color);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
    padding: var(--el-padding-md);
  }
}
</style>