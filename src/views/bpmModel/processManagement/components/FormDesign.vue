<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 14:18:02
 * @LastEditTime: 2025-12-18 11:41:17
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
				<el-option v-for="form in formList" :key="form.id" :label="form.name" :value="form.id" />
			</el-select>
		</el-form-item>

		<el-form-item
			v-if="modelData.formType === BpmModelFormType.CUSTOM"
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
import * as FormApi from '@/api/system/bpm/form'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'
import { BpmModelFormType, DICT_TYPE } from '@/utils/bpm/constantEnumeration'

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