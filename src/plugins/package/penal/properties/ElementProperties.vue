<template>
	<div class="panel-tab__content">
		<el-table :data="elementPropertyList" size="mini" max-height="240" border fit>
			<el-table-column label="序号" width="60px" type="index" />
			<el-table-column label="属性名" prop="name" min-width="100px" show-overflow-tooltip />
			<el-table-column label="属性值" prop="value" min-width="100px" show-overflow-tooltip />
			<el-table-column label="操作" width="90px">
				<template #default="{ row, $index }">
					<el-button size="mini" type="text" @click="openAttributesForm(row, $index)">编辑</el-button>
					<el-divider direction="vertical" />
					<el-button size="mini" type="text" style="color: #ff4d4f" @click="removeAttributes(row, $index)">移除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="element-drawer__button">
			<el-button size="mini" type="primary" icon="CirclePlus" @click="openAttributesForm(null, -1)">添加属性</el-button>
		</div>

		<Dialog
			v-model:visible="propertyFormModelVisible"
			title="属性配置"
			width="600px"
			
		>
			<el-form
				:model="propertyForm"
				label-width="80px"
				size="mini"
				ref="attributeFormRef"
				@submit.prevent
			>
				<el-form-item label="属性名：" prop="name">
					<el-input v-model="propertyForm.name" clearable />
				</el-form-item>
				<el-form-item label="属性值：" prop="value">
					<el-input v-model="propertyForm.value" clearable />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button size="mini" @click="propertyFormModelVisible = false">取 消</el-button>
				<el-button size="mini" type="primary" @click="saveAttribute">确 定</el-button>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, watch, inject, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import Dialog from "@/components/Dialog/index"
// Props
const props = defineProps({
	id: String,
	type: String,
})

// 注入依赖
const prefix = inject('prefix')
const width = inject('width')

// 响应式状态
const elementPropertyList = ref([])
const propertyForm = ref({})
const editingPropertyIndex = ref(-1)
const propertyFormModelVisible = ref(false)

// BPMN 相关引用（非响应式）
let bpmnElement = null
let otherExtensionList = []
let bpmnElementPropertyList = []

// 引用表单
const attributeFormRef = ref(null)

// 重置属性列表
const resetAttributesList = () => {
	bpmnElement = window.bpmnInstances.bpmnElement
	if (!bpmnElement) return

	otherExtensionList = []
	const businessObject = bpmnElement.businessObject
	const extensions = businessObject?.extensionElements?.values || []
	
	// 分离出我们关心的属性扩展
	const properties = extensions.filter(ex => ex.$type === `${prefix}:Properties`)
	otherExtensionList = extensions.filter(ex => ex.$type !== `${prefix}:Properties`)
	
	// 展平所有 Property 对象
	bpmnElementPropertyList = properties.reduce((pre, current) => pre.concat(current.values || []), [])
	elementPropertyList.value = JSON.parse(JSON.stringify(bpmnElementPropertyList))
}

// 打开属性编辑窗
const openAttributesForm = (attr, index) => {
	editingPropertyIndex.value = index
	propertyForm.value = index === -1 ? {} : JSON.parse(JSON.stringify(attr))
	propertyFormModelVisible.value = true

	nextTick(() => {
		if (attributeFormRef.value) {
			attributeFormRef.value.clearValidate()
		}
	})
}

// 删除属性
const removeAttributes = (attr, index) => {
	ElMessageBox.confirm(
		'确认移除该属性吗？',
		'提示',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(() => {
		elementPropertyList.value.splice(index, 1)
		bpmnElementPropertyList.splice(index, 1)

		// 重建 Properties 扩展对象
		if (bpmnElementPropertyList.length > 0) {
			const propertiesObject = window.bpmnInstances.moddle.create(`${prefix}:Properties`, {
				values: [...bpmnElementPropertyList]
			})

			updateElementExtensions(propertiesObject)
		} else {
			// 如果没有属性了，清除 extensionElements
			const extensions = window.bpmnInstances.moddle.create("bpmn:ExtensionElements", {
				values: otherExtensionList
			})
			window.bpmnInstances.modeling.updateProperties(bpmnElement, {
				extensionElements: extensions
			})
		}

		resetAttributesList()
	}).catch(() => {
		// 取消操作
	})
}

// 保存属性
const saveAttribute = async () => {
	const { name, value } = propertyForm.value

	// 验证是否填写了属性名（可选增强）
	if (!name?.trim()) {
		ElMessageBox.alert('属性名不能为空', '提示', { type: 'warning' })
		return
	}

	if (editingPropertyIndex.value !== -1) {
		// 更新已有属性
		window.bpmnInstances.modeling.updateModdleProperties(
			bpmnElement,
			bpmnElementPropertyList[editingPropertyIndex.value],
			{ name, value }
		)
	} else {
		// 新增属性
		const newPropertyObject = window.bpmnInstances.moddle.create(`${prefix}:Property`, { name, value })
		const propertiesObject = window.bpmnInstances.moddle.create(`${prefix}:Properties`, {
			values: [...bpmnElementPropertyList, newPropertyObject]
		})
		updateElementExtensions(propertiesObject)
	}

	propertyFormModelVisible.value = false
	resetAttributesList()
}

// 更新元素扩展属性（通用方法）
const updateElementExtensions = (properties) => {
	const extensions = window.bpmnInstances.moddle.create("bpmn:ExtensionElements", {
		values: [...otherExtensionList, properties]
	})
	window.bpmnInstances.modeling.updateProperties(bpmnElement, {
		extensionElements: extensions
	})
}

// 监听 id 变化，重置属性列表
watch(
	() => props.id,
	(val) => {
		if (val && val.length) {
			resetAttributesList()
		}
	},
	{ immediate: true }
)
</script>

<style scoped>
.element-drawer__button {
	text-align: right;
	margin-top: 16px;
}
</style>