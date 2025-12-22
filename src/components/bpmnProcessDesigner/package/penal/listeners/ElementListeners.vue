<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-19 09:09:41
 * @LastEditors: zhangsd
 * @Description: 元素监听器 -- 执行监听器
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\listeners\ElementListeners.vue
-->

<template>
	<div class="panel-tab__content">
		<el-table :data="elementListenersList" border>
			<el-table-column label="序号" width="80px" type="index" />
			<el-table-column label="事件类型" min-width="100px" prop="event" />
			<el-table-column
				label="监听器类型"
				min-width="100px"
				show-overflow-tooltip
				:formatter="row => listenerTypeObject[row.listenerType]"
			/>
			<el-table-column label="操作" width="110px">
				<template #default="scope">
					<el-button  link @click="openListenerForm(scope.row, scope.$index)">编辑</el-button>
					<el-divider direction="vertical" />
					<el-button  link style="color: #ff4d4f" @click="removeListener(scope.$index)">移除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="element-drawer__button">
			<el-button type="primary" icon="Plus"  @click="openListenerForm(null)">添加监听器</el-button>
			<el-button type="success" icon="select"  @click="openProcessListenerDialog">选择监听器</el-button>
		</div>

		<!-- 监听器 编辑/创建 部分 -->
		<Drawer v-model="listenerFormModelVisible" title="执行监听器" :size="600">
			<div class="drawer-content">
				<el-form :model="listenerForm" label-width="96px" ref="listenerFormRef">
					<el-form-item label="事件类型" prop="event" :rules="{ required: true, trigger: ['blur', 'change'] ,message: '请选择事件类型'}">
						<el-select v-model="listenerForm.event">
							<el-option label="start" value="start" />
							<el-option label="end" value="end" />
						</el-select>
					</el-form-item>
					<el-form-item label="监听器类型" prop="listenerType" :rules="{ required: true, trigger: ['blur', 'change'] ,message: '请选择监听器类型'}">
						<el-select v-model="listenerForm.listenerType">
							<el-option v-for="i in Object.keys(listenerTypeObject)" :key="i" :label="listenerTypeObject[i]" :value="i" />
						</el-select>
					</el-form-item>
					<el-form-item
						v-if="listenerForm.listenerType === 'classListener'"
						label="Java类"
						prop="class"
						key="listener-class"
						:rules="{ required: true, trigger: ['blur', 'change'] ,message: '请填写Java类'}">
						<el-input v-model="listenerForm.class" clearable />
					</el-form-item>
					<el-form-item
						v-if="listenerForm.listenerType === 'expressionListener'"
						label="表达式"
						prop="expression"
						key="listener-expression"
						:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写表达式' }"
					>
						<el-input v-model="listenerForm.expression" clearable />
					</el-form-item>
					<el-form-item
						v-if="listenerForm.listenerType === 'delegateExpressionListener'"
						label="代理表达式"
						prop="delegateExpression"
						key="listener-delegate"
						:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写代理表达式' }"
					>
						<el-input v-model="listenerForm.delegateExpression" clearable />
					</el-form-item>
					<template v-if="listenerForm.listenerType === 'scriptListener'">
						<el-form-item
							label="脚本格式"
							prop="scriptFormat"
							key="listener-script-format"
							:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本格式' }"
						>
							<el-input v-model="listenerForm.scriptFormat" clearable />
						</el-form-item>
						<el-form-item
							label="脚本类型"
							prop="scriptType"
							key="listener-script-type"
							:rules="{ required: true, trigger: ['blur', 'change'], message: '请选择脚本类型' }"
						>
							<el-select v-model="listenerForm.scriptType">
								<el-option label="内联脚本" value="inlineScript" />
								<el-option label="外部脚本" value="externalScript" />
							</el-select>
						</el-form-item>
						<el-form-item
							v-if="listenerForm.scriptType === 'inlineScript'"
							label="脚本内容"
							prop="value"
							key="listener-script"
							:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本内容' }"
						>
							<el-input v-model="listenerForm.value" clearable />
						</el-form-item>
						<el-form-item
							v-if="listenerForm.scriptType === 'externalScript'"
							label="资源地址"
							prop="resource"
							key="listener-resource"
							:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写资源地址' }"
						>
							<el-input v-model="listenerForm.resource" clearable />
						</el-form-item>
					</template>
				</el-form>
			</div>

			<el-divider />
			<div class="fields-section">
				<div class="listener-filed__title">
					<div style="width: 80%">
						<span>
							<el-icon><Memo /></el-icon>
							注入字段：
						</span>
					</div>
					<el-button type="primary" @click="openListenerFieldForm(null)" icon="Plus" title="添加字段" style="width: 100px">
						添加字段
					</el-button>
				</div>
				<el-table :data="fieldsListOfListener" max-height="240" fit border style="flex: none">
					<el-table-column label="序号" width="50px" type="index" />
					<el-table-column label="字段名称" min-width="100px" prop="name" />
					<el-table-column
						label="字段类型"
						min-width="80px"
						show-overflow-tooltip
						:formatter="row => fieldTypeObject[row.fieldType]"
					/>
					<el-table-column
						label="字段值/表达式"
						min-width="100px"
						show-overflow-tooltip
						:formatter="row => row.string || row.expression"
					/>
					<el-table-column label="操作" width="130px">
						<template #default="scope">
							<el-button link @click="openListenerFieldForm(scope.row, scope.$index)">编辑</el-button>
							<el-divider direction="vertical" />
							<el-button link style="color: #ff4d4f" @click="removeListenerField(scope.$index)">移除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>

			<template #footer>
				<el-button @click="listenerFormModelVisible = false">取 消</el-button>
				<el-button type="primary" @click="saveListenerConfig">保 存</el-button>
			</template>
		</Drawer>

		<!-- 注入西段 编辑/创建 部分 -->
		<Dialog title="字段配置" v-model:visible="listenerFieldFormModelVisible" width="400px">
			<el-form :model="listenerFieldForm" label-width="96px" ref="listenerFieldFormRef" style="height: 136px">
				<el-form-item label="字段名称：" prop="name" :rules="{ required: true, trigger: ['blur', 'change'] ,message:'请填写字段名称'}">
					<el-input v-model="listenerFieldForm.name" clearable />
				</el-form-item>
				<el-form-item label="字段类型：" prop="fieldType" :rules="{ required: true, trigger: ['blur', 'change'],message:'请选择字段类型' }">
					<el-select v-model="listenerFieldForm.fieldType">
						<el-option v-for="i in Object.keys(fieldTypeObject)" :key="i" :label="fieldTypeObject[i]" :value="i" />
					</el-select>
				</el-form-item>
				<el-form-item
					v-if="listenerFieldForm.fieldType === 'string'"
					label="字段值："
					prop="string"
					key="field-string"
					:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写字段值' }"
				>
					<el-input v-model="listenerFieldForm.string" clearable />
				</el-form-item>
				<el-form-item
					v-if="listenerFieldForm.fieldType === 'expression'"
					label="表达式："
					prop="expression"
					key="field-expression"
					:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写表达式' }"
				>
					<el-input v-model="listenerFieldForm.expression" clearable />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="listenerFieldFormModelVisible = false">取 消</el-button>
				<el-button type="primary" @click="saveListenerFiled">确 定</el-button>
			</template>
		</Dialog>
	</div>

	<!-- 选择弹窗 -->
	<ProcessListenerDialog ref="processListenerDialogRef" @select="selectProcessListener" />
</template>

<script lang="js" setup>
import { ref, watch, nextTick, inject } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Memo } from '@element-plus/icons-vue'
import { createListenerObject, updateElementExtensions } from '../../utils'
import {
  initListenerType,
  initListenerForm,
  listenerType,
  fieldType,
  initListenerForm2
} from './utilSelf'
import ProcessListenerDialog from './ProcessListenerDialog.vue'
import Dialog from "@/components/Dialog"
import Drawer from "@/components/Drawer"

defineOptions({ name: 'ElementListeners' })

// 定义组件属性
const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: ''
  }
})

// 注入配置
const prefix = inject('prefix', '')
const width = inject('width', 800)

// 响应式变量定义
const elementListenersList = ref([]) // 监听器列表
const listenerForm = ref({}) // 监听器详情表单
const listenerFormModelVisible = ref(false) // 监听器 编辑 侧边栏显示状态
const fieldsListOfListener = ref([])
const listenerFieldForm = ref({}) // 监听器 注入字段 详情表单
const listenerFieldFormModelVisible = ref(false) // 监听器 注入字段表单弹窗 显示状态
const editingListenerIndex = ref(-1) // 监听器所在下标，-1 为新增
const editingListenerFieldIndex = ref(-1) // 字段所在下标，-1 为新增
const listenerTypeObject = ref(listenerType)
const fieldTypeObject = ref(fieldType)
const otherExtensionList = ref([])
const bpmnElementListeners = ref([])
const listenerFormRef = ref()
const listenerFieldFormRef = ref()
const processListenerDialogRef = ref()

// 获取bpmn实例
const bpmnInstances = () => window.bpmnInstances ?? {}

/**
 * 重置监听器列表
 */
const resetListenersList = () => {
  const instances = bpmnInstances()
  if (!instances || !instances.bpmnElement) return

  // 直接使用原始BPMN元素，避免Vue响应式代理问题
  const bpmnElement = instances.bpmnElement
  const businessObject = bpmnElement.businessObject

  otherExtensionList.value =
    businessObject?.extensionElements?.values?.filter(
      (ex) => ex.$type !== `${prefix}:ExecutionListener`
    ) ?? [] // 保留非监听器类型的扩展属性，避免移除监听器时清空其他配置
  bpmnElementListeners.value =
    businessObject?.extensionElements?.values?.filter(
      (ex) => ex.$type === `${prefix}:ExecutionListener`
    ) ?? []
  elementListenersList.value = bpmnElementListeners.value.map((listener) =>
    initListenerType(listener)
  )
}

/**
 * 打开监听器详情侧边栏
 * @param {Object|null} listener - 监听器数据
 * @param {number} [index] - 索引
 */
const openListenerForm = (listener, index) => {
  if (listener) {
    listenerForm.value = initListenerForm(listener)
    editingListenerIndex.value = index
  } else {
    listenerForm.value = {}
    editingListenerIndex.value = -1 // 标记为新增
  }
  if (listener && listener.fields) {
    fieldsListOfListener.value = listener.fields.map((field) => ({
      ...field,
      fieldType: field.string ? 'string' : 'expression'
    }))
  } else {
    fieldsListOfListener.value = []
    listenerForm.value.fields = []
  }
  // 打开侧边栏并清除验证状态
  listenerFormModelVisible.value = true
  nextTick(() => {
    if (listenerFormRef.value) {
      listenerFormRef.value.clearValidate()
    }
  })
}

/**
 * 打开监听器字段编辑弹窗
 * @param {Object|null} field - 字段数据
 * @param {number} [index] - 索引
 */
const openListenerFieldForm = (field, index) => {
  listenerFieldForm.value = field ? JSON.parse(JSON.stringify(field)) : {}
  editingListenerFieldIndex.value = field ? index : -1
  listenerFieldFormModelVisible.value = true
  nextTick(() => {
    if (listenerFieldFormRef.value) {
      listenerFieldFormRef.value.clearValidate()
    }
  })
}

/**
 * 保存监听器注入字段
 */
const saveListenerFiled = async () => {
  let validateStatus = await listenerFieldFormRef.value.validate()
  if (!validateStatus) return // 验证不通过直接返回
  
  if (editingListenerFieldIndex.value === -1) {
    fieldsListOfListener.value.push(listenerFieldForm.value)
    listenerForm.value.fields.push(listenerFieldForm.value)
  } else {
    fieldsListOfListener.value.splice(editingListenerFieldIndex.value, 1, listenerFieldForm.value)
    listenerForm.value.fields.splice(editingListenerFieldIndex.value, 1, listenerFieldForm.value)
  }
  
  listenerFieldFormModelVisible.value = false
  nextTick(() => {
    listenerFieldForm.value = {}
  })
}

/**
 * 移除监听器字段
 * @param {number} index - 索引
 */
const removeListenerField = (index) => {
  ElMessageBox.confirm('确认移除该字段吗？', '提示', {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消'
  })
    .then(() => {
      fieldsListOfListener.value.splice(index, 1)
      listenerForm.value.fields.splice(index, 1)
    })
    .catch(() => console.info('操作取消'))
}

/**
 * 移除监听器
 * @param {number} index - 索引
 */
const removeListener = (index) => {
  ElMessageBox.confirm('确认移除该监听器吗？', '提示', {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消'
  })
    .then(() => {
      const instances = bpmnInstances()
      if (!instances || !instances.bpmnElement) return

      bpmnElementListeners.value.splice(index, 1)
      elementListenersList.value.splice(index, 1)
      updateElementExtensions(
        instances.bpmnElement,
        otherExtensionList.value.concat(bpmnElementListeners.value)
      )
    })
    .catch(() => console.info('操作取消'))
}

/**
 * 保存监听器配置
 */
const saveListenerConfig = async () => {
  let validateStatus = await listenerFormRef.value.validate()
  if (!validateStatus) return // 验证不通过直接返回

  const instances = bpmnInstances()
  if (!instances || !instances.bpmnElement) return

  const bpmnElement = instances.bpmnElement
  const listenerObject = createListenerObject(listenerForm.value, false, prefix)

  if (editingListenerIndex.value === -1) {
    bpmnElementListeners.value.push(listenerObject)
    elementListenersList.value.push(listenerForm.value)
  } else {
    bpmnElementListeners.value.splice(editingListenerIndex.value, 1, listenerObject)
    elementListenersList.value.splice(editingListenerIndex.value, 1, listenerForm.value)
  }
  
  // 保存其他配置
  otherExtensionList.value =
    bpmnElement.businessObject?.extensionElements?.values?.filter(
      (ex) => ex.$type !== `${prefix}:ExecutionListener`
    ) ?? []
  updateElementExtensions(
    bpmnElement,
    otherExtensionList.value.concat(bpmnElementListeners.value)
  )
  
  // 隐藏侧边栏
  listenerFormModelVisible.value = false
  listenerForm.value = {}
}

/**
 * 打开监听器选择弹窗
 */
const openProcessListenerDialog = async () => {
	console.log('是否执行选择时间监听器的方法openProcessListenerDialog', listenerForm.value)
  processListenerDialogRef.value.open('execution')
}

/**
 * 选择流程监听器回调
 * @param {Object} listener - 选中的监听器
 */
const selectProcessListener = (listener) => {
  const instances = bpmnInstances()
  if (!instances || !instances.bpmnElement) return

  const bpmnElement = instances.bpmnElement
  const listenerForm = initListenerForm2(listener)
  const listenerObject = createListenerObject(listenerForm, false, prefix)
  
  bpmnElementListeners.value.push(listenerObject)
  elementListenersList.value.push(listenerForm)

  // 保存其他配置
  otherExtensionList.value =
    bpmnElement.businessObject?.extensionElements?.values?.filter(
      (ex) => ex.$type !== `${prefix}:ExecutionListener`
    ) ?? []
  updateElementExtensions(
    bpmnElement,
    otherExtensionList.value.concat(bpmnElementListeners.value)
  )
}

// 监听ID变化重置列表
watch(
  () => props.id,
  (val) => {
    if (val && val.length) {
      nextTick(() => {
        resetListenersList()
      })
    }
  },
  { immediate: true }
)
</script>
<style scoped lang="scss">
// 基础表格样式优化
.listener-table {
	margin-bottom: 16px;
	border-radius: 4px;
	::deep(.el-table__header) {
		background-color: #f5f7fa;
	}
	::deep(.el-table__body tr:hover) {
		background-color: #fafafa;
	}
}

// 按钮区域样式
.element-drawer__button {
	text-align: right;
	margin-top: 16px;
	margin-bottom: 20px;
}

// 抽屉整体样式
.listener-drawer {
	::deep(.el-drawer__body) {
		padding: 0;
	}
}

// 抽屉内容容器
.drawer-content {
	padding: 20px;
}

// 监听器表单样式
.listener-form {
	margin-bottom: 20px;
}

// 统一表单输入框/下拉框样式
.form-input,
.form-select {
	width: 100%;
	max-width: 500px;
}

// 动态表单项间距
.dynamic-form-item {
	margin-bottom: 16px;
}

// 分割线样式优化
.form-divider {
	margin: 16px 0;
}

// 注入字段区域样式
.fields-section {
	padding: 0 20px 20px;
}

// 字段标题样式增强
.listener-filed__title {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 0 0 12px;
	font-weight: 500;
	color: #1f2937;
	::deep(.el-icon) {
		margin-right: 6px;
	}
}

// 字段表格样式
.fields-table {
	border-radius: 4px;
	::deep(.el-table__header) {
		background-color: #f5f7fa;
	}
	::deep(.el-table__body tr:hover) {
		background-color: #fafafa;
	}
}

// 操作按钮样式优化
.edit-btn {
	color: #409eff !important;
	&:hover {
		color: #66b1ff !important;
	}
}

.delete-btn {
	color: #ff4d4f !important;
	&:hover {
		color: #ff7875 !important;
	}
}

// 抽屉底部按钮间距
.drawer-footer {
	::deep(.el-dialog__footer) {
		padding: 16px 20px;
		border-top: 1px solid #f0f0f0;
	}
}

// 字段弹窗样式
.field-dialog {
	::deep(.el-dialog__body) {
		padding: 20px;
	}
	::deep(.el-dialog__footer) {
		padding: 16px 20px;
		border-top: 1px solid #f0f0f0;
	}
}

// 字段表单样式
.field-form {
	margin: 10px;
}
</style>