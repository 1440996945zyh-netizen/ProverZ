<template>
	<div class="panel-tab__content">
		<el-form size="mini" label-width="90px" @submit.prevent>
			<el-form-item label="ID">
				<el-input v-model="formData.id" :disabled="idEditDisabled" clearable @change="updateBaseInfo('id')" />
			</el-form-item>
			<el-form-item label="名称">
				<el-input v-model="formData.name" clearable @change="updateBaseInfo('name')" />
			</el-form-item>
			<!-- 流程的基础属性 -->
			<template v-if="formData.$type === 'bpmn:Process'">
				<el-form-item label="流程分类">
					<el-select
						v-model="formData.processCategory"
						clearable
						@change="updateBaseInfo('processCategory')"
						placeholder="请选择"
					>
						<el-option v-for="item in categorys" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
				<el-form-item label="版本标签">
					<el-input v-model="formData.versionTag" clearable @change="updateBaseInfo('versionTag')" />
				</el-form-item>
				<el-form-item label="可执行">
					<el-switch v-model="formData.isExecutable"  active-text="是" inactive-text="否" />
				</el-form-item>
			</template>
			<el-form-item v-if="formData.$type === 'bpmn:SubProcess'" label="状态">
				<el-switch v-model="formData.isExpanded" active-label="展开" inactive-label="折叠" @change="updateBaseInfo('isExpanded')" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { commonParse } from '../parseElement'

// 1. 优先定义 Props（避免引用顺序问题）
const props = defineProps({
	businessObject: Object,
	categorys: {
		type: Array,
		default: () => [],
	},
	type: String,
	idEditDisabled: {
		type: Boolean,
		default: true,
	},
})
// 2. 核心修复：用 ref 存储「视图专用数据」，不直接代理 BPMN 原始对象
const formData = ref({
	id: '',
	name: '',
	$type: '',
	processCategory: '',
	versionTag: '',
	isExecutable: false,
	isExpanded: false,
})

// 3. 存储 BPMN 原始对象（非响应式，避免代理干扰）
let bpmnRawElement = null // 原始 BPMN 元素（无代理）
let bpmnRawBusinessObject = null // 原始 businessObject（无代理）

/**
 * 重置视图数据：从 BPMN 原始对象提取需要的属性，不复制整个对象
 */
const resetBaseInfo = () => {
	// 校验 BPMN 实例和原始对象是否存在
	if (!window?.bpmnInstances?.bpmnElement || !props.businessObject) return

	// 保存原始对象引用（不做响应式处理）
	bpmnRawElement = window.bpmnInstances.bpmnElement
	bpmnRawBusinessObject = props.businessObject

	// 提取 BPMN 解析的流程分类（避免代理干扰）
	const parsedData = commonParse(bpmnRawElement)

	// 仅同步需要编辑的属性到视图数据（核心：不复制只读属性如 labels）
	formData.value = {
		id: bpmnRawBusinessObject.id || '',
		name: bpmnRawBusinessObject.name || '',
		$type: bpmnRawBusinessObject.$type || '',
		// 流程专属属性
		processCategory: parsedData.processCategory || '',
		versionTag: bpmnRawBusinessObject.versionTag || '',
		isExecutable: !!bpmnRawBusinessObject.isExecutable,
		// 子流程专属属性（从 di 中提取，避免直接代理 di 对象）
		isExpanded: bpmnRawBusinessObject.di?.isExpanded ?? false,
	}
}

/**
 * 更新属性：直接操作 BPMN 原始对象，不通过响应式代理
 */
const updateBaseInfo = key => {
	if (!bpmnRawElement || !bpmnRawBusinessObject) return

	const value = formData.value[key]

	// 处理特殊属性
	switch (key) {
		// ID 需同步更新 di 的 ID
		case 'id':
			window.bpmnInstances.modeling.updateProperties(bpmnRawElement, {
				id: value,
				di: { ...bpmnRawBusinessObject.di, id: `${value}_di` }, // 浅拷贝 di，避免代理
			})
			break

		// 子流程展开/折叠：使用 BPMN 内置方法
		case 'isExpanded':
			window.bpmnInstances.modeling.toggleCollapse(bpmnRawElement)
			break

		// 流程分类：兼容老系统的 flowable 前缀属性
		case 'processCategory':
			window.bpmnInstances.modeling.updateProperties(bpmnRawElement, {
				'flowable:processCategory': value,
			})
			break

		// 普通属性：直接更新
		default:
			window.bpmnInstances.modeling.updateProperties(bpmnRawElement, {
				[key]: value,
			})
	}
}

/**
 * 监听 businessObject 变化（BPMN 元素切换时重置视图）
 */
watch(
	() => props.businessObject,
	newBusinessObj => {
		if (newBusinessObj) {
			// 延迟重置，确保 BPMN 原始对象已更新
			nextTick(() => resetBaseInfo())
		}
	},
	{ immediate: true } // 初始加载时执行一次
)

/**
 * 组件卸载：彻底清理原始对象引用，避免残留代理影响
 */
onUnmounted(() => {
	bpmnRawElement = null
	bpmnRawBusinessObject = null
	// 清空视图数据（非必需，但可避免内存残留）
	formData.value = { ...formData.value }
})
</script>