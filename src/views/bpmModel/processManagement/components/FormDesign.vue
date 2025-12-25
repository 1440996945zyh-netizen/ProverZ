<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 14:18:02
 * @LastEditTime: 2025-12-25 15:28:46
 * @LastEditors: zhangsd
 * @Description: 表单设计
 * @FilePath: \view\src\views\bpmModel\processManagement\components\FormDesign.vue
-->
<template>
	<el-form ref="formRef" :model="modelData" :rules="rules" label-width="120px" class="mt-20px">
		<el-form-item label="表单类型" prop="formType" class="form-item-gap">
			<el-radio-group v-model="modelData.formType">
				<el-radio v-for="dict in formTypeList" :key="dict.value" :value="dict.value">
					{{ dict.label }}
				</el-radio>
			</el-radio-group>
		</el-form-item>

		<el-form-item v-if="modelData.formType == BpmModelFormType.NORMAL" label="流程表单" prop="formId" class="form-item-gap">
			<el-select v-model="modelData.formId" clearable style="width: 100%">
				<el-option v-for="form in formList" :key="form.value" :label="form.label" :value="form.value" />
			</el-select>
		</el-form-item>

		<el-form-item
			v-if="modelData.formType == BpmModelFormType.CUSTOM"
			label="表单提交路由"
			prop="formCustomCreatePath"
			class="form-item-gap"
		>
			<el-input v-model="modelData.formCustomCreatePath" placeholder="请输入表单提交路由" style="width: 330px" />
			<el-tooltip
				class="item"
				content="自定义表单的提交路径，使用 Vue 的路由地址，例如说：bpm/oa/leave/create.vue"
				effect="light"
				placement="top"
			>
				<Icon icon="ep:question" class="ml-5px" />
			</el-tooltip>
		</el-form-item>

		<el-form-item
			v-if="modelData.formType === BpmModelFormType.CUSTOM"
			label="表单查看地址"
			prop="formCustomViewPath"
			class="form-item-gap"
		>
			<el-input v-model="modelData.formCustomViewPath" placeholder="请输入表单查看的组件地址" style="width: 330px" />
			<el-tooltip
				class="item"
				content="自定义表单的查看组件地址，使用 Vue 的组件地址，例如说：bpm/oa/leave/detail.vue"
				effect="light"
				placement="top"
			>
				<Icon icon="ep:question" class="ml-5px" />
			</el-tooltip>
		</el-form-item>

		<!-- 表单预览 -->
		<div
			v-if="modelData.formType === BpmModelFormType.NORMAL && modelData.formId && formPreview.rule.length > 0"
			class="form-preview-wrap"
		>
			<div class="form-preview-title">
				<div class="title-line mr-10px"></div>
				<span class="title-text">表单预览</span>
			</div>
			<form-create v-model="formPreview.formData" :rule="formPreview.rule" :option="formPreview.option" />
		</div>
	</el-form>
</template>

<script setup>
defineOptions({
	name: 'FormDesign',
})
import { ref, watch } from 'vue'
// import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'
import { BpmModelFormType } from '@/utils/bpm/constantEnumeration'
import { getFormPage, getDetail, deleteForm } from '@/api/system/bpm/form'
// 定义组件属性
const props = defineProps({
	formList: {
		type: Array,
		required: true,
	},
})
const formTypeList = ref([
	{
		label: '流程表单',
		value: 10,
	},
])

// 表单引用
const formRef = ref()

// 双向绑定数据
const modelData = defineModel({})

// 表单预览数据
const formPreview = ref({
	formData: {},
	rule: [],
	option: {
		submitBtn: false,
		resetBtn: false,
		formData: {},
	},
})

// 监听表单ID变化，加载表单数据
watch(
	() => modelData.value.formId,
	async newFormId => {
		console.log('newFormId =>', newFormId)
		if (newFormId && modelData.value.formType == BpmModelFormType.NORMAL) {
			const {data} = await getDetail(newFormId)
		
			setConfAndFields2(formPreview.value, data.conf, data.fields)
			// 设置只读
			formPreview.value.rule.forEach(item => {
				item.props = { ...item.props, disabled: true }
			})
			console.log('formPreview.value =>', formPreview.value)
		} else {
			formPreview.value.rule = []
		}
	},
	{ immediate: true }
)

// 表单验证规则
const rules = {
	formType: [{ required: true, message: '表单类型不能为空', trigger: 'blur' }],
	formId: [{ required: true, message: '流程表单不能为空', trigger: 'blur' }],
	formCustomCreatePath: [{ required: true, message: '表单提交路由不能为空', trigger: 'blur' }],
	formCustomViewPath: [{ required: true, message: '表单查看地址不能为空', trigger: 'blur' }],
}

/** 表单校验 */
const validate = async () => {
	await formRef.value?.validate()
}

// 暴露组件方法
defineExpose({
	validate,
})
</script>

<style lang="scss" scoped>
// 表单项间距样式（适配Element Plus）
.form-item-gap {
	margin-bottom: 20px;
}

// 表单预览容器
.form-preview-wrap {
	margin-top: 20px;
}

// 表单预览标题栏
.form-preview-title {
	display: flex;
	align-items: center;
	margin-bottom: 15px;

	.title-line {
		width: 4px;
		height: 15px;
		background-color: var(--el-color-primary);
	}

	.title-text {
		font-size: 15px;
		font-weight: bold;
		color: var(--el-text-color-primary);
	}
}
</style>