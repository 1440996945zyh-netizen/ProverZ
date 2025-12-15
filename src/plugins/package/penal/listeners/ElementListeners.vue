<!--
 * @Author: zhangsd
 * @Date: 2025-09-19 09:17:50
 * @LastEditTime: 2025-12-12 17:32:52
 * @LastEditors: zhangsd
 * @Description: 元素监听器 -- 执行监听器
 * @FilePath: \view\src\plugins\package\penal\listeners\ElementListeners.vue
-->

<template>
	<div class="panel-tab__content">
		<el-table :data="elementListenersList" size="mini" border class="listener-table">
			<el-table-column label="序号" width="60px" type="index" />
			<el-table-column label="事件类型" min-width="100px" prop="event" />
			<el-table-column label="监听器类型" min-width="100px" show-overflow-tooltip>
				<template #default="{ row }">
					{{ listenerTypeObject[row.listenerType] }}
				</template>
			</el-table-column>
			<el-table-column label="操作" width="90px">
				<template #default="{ row, $index }">
					<el-button size="mini" type="text" @click="openListenerForm(row, $index)">编辑</el-button>
					<el-divider orientation="vertical" />
					<el-button size="mini" type="text" class="delete-btn" @click="removeListener(row, $index)">移除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<div class="element-drawer__button">
			<el-button size="mini" type="primary" :icon="CirclePlus" @click="openListenerForm(null)">添加监听器</el-button>
		</div>

		<!-- 监听器 编辑/创建 部分 -->
		<Drawer v-model="listenerFormModelVisible" title="执行监听器" :size="`${width}px`" >
			<div class="drawer-content">
				<el-form size="mini" :model="listenerForm" label-width="96px" ref="listenerFormRef" @submit.prevent class="listener-form">
					<el-form-item label="事件类型" prop="event" :rules="{ required: true, trigger: ['blur', 'change'] }">
						<el-select v-model="listenerForm.event" class="form-select">
							<el-option label="start" value="start" />
							<el-option label="end" value="end" />
						</el-select>
					</el-form-item>

					<el-form-item label="监听器类型" prop="listenerType" :rules="{ required: true, trigger: ['blur', 'change'] }">
						<el-select v-model="listenerForm.listenerType" class="form-select">
							<el-option v-for="(label, key) in listenerTypeObject" :key="key" :label="label" :value="key" />
						</el-select>
					</el-form-item>

					<el-form-item
						v-if="listenerForm.listenerType === 'classListener'"
						label="Java类"
						prop="class"
						key="listener-class"
						:rules="{ required: true, trigger: ['blur', 'change'] }"
						class="dynamic-form-item"
					>
						<el-input v-model="listenerForm.class" clearable class="form-input" />
					</el-form-item>

					<el-form-item
						v-if="listenerForm.listenerType === 'expressionListener'"
						label="表达式"
						prop="expression"
						key="listener-expression"
						:rules="{ required: true, trigger: ['blur', 'change'] }"
						class="dynamic-form-item"
					>
						<el-input v-model="listenerForm.expression" clearable class="form-input" />
					</el-form-item>

					<el-form-item
						v-if="listenerForm.listenerType === 'delegateExpressionListener'"
						label="代理表达式"
						prop="delegateExpression"
						key="listener-delegate"
						:rules="{ required: true, trigger: ['blur', 'change'] }"
						class="dynamic-form-item"
					>
						<el-input v-model="listenerForm.delegateExpression" clearable class="form-input" />
					</el-form-item>

					<template v-if="listenerForm.listenerType === 'scriptListener'">
						<el-form-item
							label="脚本格式"
							prop="scriptFormat"
							key="listener-script-format"
							:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本格式' }"
							class="dynamic-form-item"
						>
							<el-input v-model="listenerForm.scriptFormat" clearable class="form-input" />
						</el-form-item>

						<el-form-item
							label="脚本类型"
							prop="scriptType"
							key="listener-script-type"
							:rules="{ required: true, trigger: ['blur', 'change'], message: '请选择脚本类型' }"
							class="dynamic-form-item"
						>
							<el-select v-model="listenerForm.scriptType" class="form-select">
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
							class="dynamic-form-item"
						>
							<el-input v-model="listenerForm.value" clearable class="form-input" />
						</el-form-item>

						<el-form-item
							v-if="listenerForm.scriptType === 'externalScript'"
							label="资源地址"
							prop="resource"
							key="listener-resource"
							:rules="{ required: true, trigger: ['blur', 'change'], message: '请填写资源地址' }"
							class="dynamic-form-item"
						>
							<el-input v-model="listenerForm.resource" clearable class="form-input" />
						</el-form-item>
					</template>
				</el-form>
			</div>

			<el-divider class="form-divider" />

			<div class="fields-section">
				<div class="listener-filed__title">
					<div style="width: 80%">
						<span>
							<el-icon><Menu /></el-icon>
							注入字段：
						</span>
					</div>
					<el-button type="primary" size="mini" @click="openListenerFieldForm(null)" :icon="CirclePlus" style="width: 100px">
						添加字段
					</el-button>
				</div>

				<el-table :data="fieldsListOfListener" size="mini" max-height="240" border fit class="fields-table">
					<el-table-column label="序号" width="50px" type="index" />
					<el-table-column label="字段名称" min-width="100px" prop="name" />
					<el-table-column label="字段类型" min-width="80px" show-overflow-tooltip>
						<template #default="{ row }">
							{{ fieldTypeObject[row.fieldType] }}
						</template>
					</el-table-column>
					<el-table-column label="字段值/表达式" min-width="100px" show-overflow-tooltip>
						<template #default="{ row }">
							{{ row.string || row.expression }}
						</template>
					</el-table-column>
					<el-table-column label="操作" width="100px">
						<template #default="{ row, $index }">
							<el-button size="mini" type="text" class="edit-btn" @click="openListenerFieldForm(row, $index)">编辑</el-button>
							<el-divider orientation="vertical" />
							<el-button size="mini" type="text" class="delete-btn" @click="removeListenerField(row, $index)">移除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>

			<template #footer>
				<el-button size="mini" @click="listenerFormModelVisible = false">取 消</el-button>
				<el-button size="mini" type="primary" @click="saveListenerConfig">保 存</el-button>
			</template>
		</Drawer>

		<!-- 注入字段 编辑/创建 部分 -->
		<Dialog v-model:visible="listenerFieldFormModelVisible" title="字段配置" width="600px">
			<el-form
				:model="listenerFieldForm"
				size="mini"
				label-width="96px"
				ref="listenerFieldFormRef"
				@submit.prevent
				class="field-form"
			>
				<el-form-item label="字段名称：" prop="name" :rules="{ required: true, trigger: ['blur', 'change'] }">
					<el-input v-model="listenerFieldForm.name" clearable class="form-input" />
				</el-form-item>

				<el-form-item label="字段类型：" prop="fieldType" :rules="{ required: true, trigger: ['blur', 'change'] }">
					<el-select v-model="listenerFieldForm.fieldType" class="form-select">
						<el-option v-for="(label, key) in fieldTypeObject" :key="key" :label="label" :value="key" />
					</el-select>
				</el-form-item>

				<el-form-item
					v-if="listenerFieldForm.fieldType === 'string'"
					label="字段值："
					prop="string"
					key="field-string"
					:rules="{ required: true, trigger: ['blur', 'change'] }"
					class="dynamic-form-item"
				>
					<el-input v-model="listenerFieldForm.string" clearable class="form-input" />
				</el-form-item>

				<el-form-item
					v-if="listenerFieldForm.fieldType === 'expression'"
					label="表达式："
					prop="expression"
					key="field-expression"
					:rules="{ required: true, trigger: ['blur', 'change'] }"
					class="dynamic-form-item"
				>
					<el-input v-model="listenerFieldForm.expression" clearable class="form-input" />
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button size="mini" @click="listenerFieldFormModelVisible = false">取 消</el-button>
				<el-button size="mini" type="primary" @click="saveListenerFiled">确 定</el-button>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject, nextTick } from 'vue'

import { createListenerObject, updateElementExtensions } from '../../utils'
import { initListenerType, initListenerForm, listenerType, fieldType } from './utilSelf'
import { Menu } from '@element-plus/icons-vue'
import Dialog from '@/components/Dialog/index'
import Drawer from '@/components/Drawer/index.vue'
import { CirclePlus } from '@element-plus/icons-vue'
// 先定义Props，解决引用顺序问题
const props = defineProps({
	id: String,
	type: String,
})

// 注入全局变量
const prefix = inject('prefix')
const width = inject('width')

// 响应式数据
const elementListenersList = ref([])
const listenerForm = reactive({})
const listenerFormModelVisible = ref(false)
const fieldsListOfListener = ref([])
const listenerFieldForm = reactive({})
const listenerFieldFormModelVisible = ref(false)
const editingListenerIndex = ref(-1)
const editingListenerFieldIndex = ref(-1)

// 只读对象映射（用于模板）
const listenerTypeObject = computed(() => listenerType)
const fieldTypeObject = computed(() => fieldType)

// 引用
const listenerFormRef = ref(null)
const listenerFieldFormRef = ref(null)

// BPMN 元素引用
let bpmnElement = null
let otherExtensionList = []
let bpmnElementListeners = [] // 声明缺失的变量

// 重置监听器列表
const resetListenersList = () => {
	if (!bpmnElement) return

	otherExtensionList = []
	bpmnElementListeners =
		bpmnElement.businessObject?.extensionElements?.values?.filter(ex => ex.$type === `${prefix.value}:ExecutionListener`) ?? []

	elementListenersList.value = bpmnElementListeners.map(listener => initListenerType(listener))
}

// 打开监听器编辑侧边栏
const openListenerForm = (listener, index) => {
	if (listener) {
		Object.assign(listenerForm, initListenerForm(listener))
		editingListenerIndex.value = index
	} else {
		Object.assign(listenerForm, {})
		editingListenerIndex.value = -1
	}

	if (listener && listener.fields) {
		fieldsListOfListener.value = listener.fields.map(field => ({
			...field,
			fieldType: field.string ? 'string' : 'expression',
		}))
	} else {
		fieldsListOfListener.value = []
		listenerForm.fields = [] // 确保字段数组存在
	}

	listenerFormModelVisible.value = true
	nextTick(() => {
		if (listenerFormRef.value) listenerFormRef.value.clearValidate()
	})
}

// 打开字段编辑弹窗
const openListenerFieldForm = (field, index) => {
	if (field) {
		Object.assign(listenerFieldForm, JSON.parse(JSON.stringify(field)))
		editingListenerFieldIndex.value = index
	} else {
		Object.assign(listenerFieldForm, {})
		editingListenerFieldIndex.value = -1
	}
	listenerFieldFormModelVisible.value = true
	nextTick(() => {
		if (listenerFieldFormRef.value) listenerFieldFormRef.value.clearValidate()
	})
}

// 保存字段
const saveListenerFiled = async () => {
	const validateStatus = await listenerFieldFormRef.value.validate().catch(() => false)
	if (!validateStatus) return

	if (editingListenerFieldIndex.value === -1) {
		fieldsListOfListener.value.push({ ...listenerFieldForm })
		listenerForm.fields.push({ ...listenerFieldForm })
	} else {
		fieldsListOfListener.value.splice(editingListenerFieldIndex.value, 1, { ...listenerFieldForm })
		listenerForm.fields.splice(editingListenerFieldIndex.value, 1, { ...listenerFieldForm })
	}

	listenerFieldFormModelVisible.value = false
	Object.assign(listenerFieldForm, {}) // 清空表单
}

// 删除字段
const removeListenerField = (field, index) => {
	ElMessageBox.confirm('确认移除该字段吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			fieldsListOfListener.value.splice(index, 1)
			listenerForm.fields.splice(index, 1)
		})
		.catch(() => {})
}

// 删除监听器
const removeListener = (listener, index) => {
	ElMessageBox.confirm('确认移除该监听器吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			bpmnElementListeners.splice(index, 1)
			elementListenersList.value.splice(index, 1)
			updateElementExtensions(bpmnElement, otherExtensionList.concat(bpmnElementListeners))
		})
		.catch(() => {})
}

// 保存监听器配置
const saveListenerConfig = async () => {
	const validateStatus = await listenerFormRef.value.validate().catch(() => false)
	if (!validateStatus) return

	const listenerObject = createListenerObject(listenerForm, false, prefix.value)

	if (editingListenerIndex.value === -1) {
		bpmnElementListeners.push(listenerObject)
		elementListenersList.value.push({ ...listenerForm })
	} else {
		bpmnElementListeners.splice(editingListenerIndex.value, 1, listenerObject)
		elementListenersList.value.splice(editingListenerIndex.value, 1, { ...listenerForm })
	}

	// 保留其他扩展元素
	otherExtensionList =
		bpmnElement.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${prefix.value}:ExecutionListener`) ?? []

	updateElementExtensions(bpmnElement, otherExtensionList.concat(bpmnElementListeners))

	listenerFormModelVisible.value = false
	Object.assign(listenerForm, {})
}

// 监听 id 变化以重置列表 - 现在props已经定义，可以正常使用了
watch(
	() => props.id,
	val => {
		if (val && val.length) {
			nextTick(() => resetListenersList())
		}
	},
	{ immediate: true }
)

// 组件挂载时初始化 BPMN 元素
onMounted(() => {
	bpmnElement = window.bpmnInstances?.bpmnElement
})
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