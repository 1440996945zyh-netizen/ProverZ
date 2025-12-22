<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-19 09:41:57
 * @LastEditors: zhangsd
 * @Description: 元素属性配置
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\properties\ElementProperties.vue
-->

<template>
	<div class="panel-tab__content">
		<el-table :data="elementPropertyList" max-height="240" fit border>
			<el-table-column label="序号" width="60px" type="index" />
			<el-table-column label="属性名" prop="name" min-width="100px" show-overflow-tooltip />
			<el-table-column label="属性值" prop="value" min-width="100px" show-overflow-tooltip />
			<el-table-column label="操作" width="110px">
				<template #default="scope">
					<el-button link @click="openAttributesForm(scope.row, scope.$index)" type="primary">编辑</el-button>
					<el-divider direction="vertical" />
					<el-button link type="danger" @click="removeAttributes(scope.row, scope.$index)">移除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="element-drawer__button">
			<el-button type="primary" @click="openAttributesForm(null, -1)">
				<el-icon><Plus /></el-icon>
				添加属性
			</el-button>
		</div>

		<Dialog v-model:visible="propertyFormModelVisible" title="属性配置" width="400px" >
			<el-form :model="propertyForm" label-width="80px" ref="attributeFormRef">
				<el-form-item label="属性名：" prop="name">
					<el-input v-model="propertyForm.name" clearable />
				</el-form-item>
				<el-form-item label="属性值：" prop="value">
					<el-input v-model="propertyForm.value" clearable />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="propertyFormModelVisible = false">取 消</el-button>
				<el-button type="primary" @click="saveAttribute">确 定</el-button>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, watch, nextTick, inject } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import Dialog from '@/components/Dialog'

defineOptions({ name: 'ElementProperties' })

const props = defineProps({
	id: {
    type: String,
    default: ''
  },
	type: {
    type: String,
    default: ''
  },
})

const prefix = inject('prefix')

// 响应式数据
const elementPropertyList = ref([])
const propertyForm = ref({})
const editingPropertyIndex = ref(-1)
const propertyFormModelVisible = ref(false)
const otherExtensionList = ref([])
const bpmnElementProperties = ref([])
const bpmnElementPropertyList = ref([])
const attributeFormRef = ref()

/**
 * @description 获取 BPMN 实例对象
 * @returns {Object} BPMN 实例
 */
const bpmnInstances = () => window?.bpmnInstances

/**
 * @description 重置属性列表
 */
const resetAttributesList = () => {
	const instances = bpmnInstances()
	if (!instances || !instances.bpmnElement) return

	const bpmnElement = instances.bpmnElement
	const businessObject = bpmnElement.businessObject

	// 清空其他扩展配置
	otherExtensionList.value = []

	// 分离 Properties 类型和其他扩展元素
	bpmnElementProperties.value =
		businessObject?.extensionElements?.values?.filter(ex => {
			if (ex.$type !== `${prefix}:Properties`) {
				otherExtensionList.value.push(ex)
				return false
			}
			return true
		}) ?? []

	// 提取所有属性字段
	bpmnElementPropertyList.value = bpmnElementProperties.value.reduce((pre, current) => pre.concat(current.values), [])

	// 深拷贝显示数据
	elementPropertyList.value = JSON.parse(JSON.stringify(bpmnElementPropertyList.value ?? []))
}

/**
 * @description 打开属性表单
 * @param {Object} attr 属性对象
 * @param {number} index 属性索引
 */
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

/**
 * @description 移除属性
 * @param {Object} attr 属性对象
 * @param {number} index 属性索引
 */
const removeAttributes = (attr, index) => {
	console.log(attr, 'attr')

	ElMessageBox.confirm('确认移除该属性吗？', '提示', {
		confirmButtonText: '确 认',
		cancelButtonText: '取 消',
	})
		.then(() => {
			elementPropertyList.value.splice(index, 1)
			bpmnElementPropertyList.value.splice(index, 1)

			// 创建新的属性对象
			const propertiesObject = bpmnInstances().moddle.create(`${prefix}:Properties`, {
				values: bpmnElementPropertyList.value,
			})

			updateElementExtensions(propertiesObject)
			resetAttributesList()

			ElMessage.success('属性已移除')
		})
		.catch(() => {
			console.info('操作取消')
		})
}

/**
 * @description 保存属性
 */
const saveAttribute = () => {
	console.log(propertyForm.value, 'propertyForm.value')

	const { name, value } = propertyForm.value
	const instances = bpmnInstances()
	if (!instances || !instances.bpmnElement) return

	const bpmnElement = instances.bpmnElement

	if (editingPropertyIndex.value !== -1) {
		// 更新现有属性
		instances.modeling.updateModdleProperties(bpmnElement, bpmnElementPropertyList.value[editingPropertyIndex.value], { name, value })
	} else {
		// 创建新属性
		const newPropertyObject = instances.moddle.create(`${prefix}:Property`, {
			name,
			value,
		})

		// 创建新的属性列表
		const propertiesObject = instances.moddle.create(`${prefix}:Properties`, {
			values: bpmnElementPropertyList.value.concat([newPropertyObject]),
		})

		updateElementExtensions(propertiesObject)
	}

	propertyFormModelVisible.value = false
	resetAttributesList()

	ElMessage.success(editingPropertyIndex.value !== -1 ? '属性已更新' : '属性已添加')
}

/**
 * @description 更新元素扩展属性
 * @param {Object} properties 属性对象
 */
const updateElementExtensions = properties => {
	const instances = bpmnInstances()
	if (!instances || !instances.bpmnElement) return

	const bpmnElement = instances.bpmnElement
	const extensions = instances.moddle.create('bpmn:ExtensionElements', {
		values: otherExtensionList.value.concat([properties]),
	})

	instances.modeling.updateProperties(bpmnElement, {
		extensionElements: extensions,
	})
}

// 监听元素 ID 变化
watch(
	() => props.id,
	val => {
		if (val) {
			resetAttributesList()
		}
	},
	{ immediate: true }
)
</script>