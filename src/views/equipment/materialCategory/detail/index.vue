<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="类别编码" prop="categoryCode" v-if="formData.categoryLevel === 1">
				<el-input v-model="formData.categoryCode" placeholder="请输入类别编码" maxlength="50" />
			</el-form-item>

			<el-form-item label="类别名称" prop="categoryName">
				<el-input v-model="formData.categoryName" placeholder="请输入类别名称" maxlength="200" />
			</el-form-item>

			<el-form-item label="父级类别" v-if="formData.categoryLevel > 1">
				<el-input v-model="parentName" disabled placeholder="父级类别" />
			</el-form-item>

			<el-form-item label="是否纳入劳保" prop="isLaborProtection">
				<el-radio-group v-model="formData.isLaborProtection">
					<el-radio :label="0">否</el-radio>
					<el-radio :label="1">是</el-radio>
				</el-radio-group>
			</el-form-item>

			<el-form-item label="排序" prop="sortOrder">
				<el-input-number v-model="formData.sortOrder" :min="0" :max="9999" placeholder="排序" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="materialCategoryDetail">
import { ref, reactive, watch, computed, getCurrentInstance, toRefs } from 'vue'
import api from '@/api/equipment/materialCategory/index'

const props = defineProps({
	parentData: {
		type: Object,
		default: null,
	},
})

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const data = reactive({
	formData: {
		id: null,
		categoryCode: '',
		categoryName: '',
		parentId: null,
		categoryLevel: 1,
		sortOrder: 0,
		isLaborProtection: 0,
		codeCount: null,
	},
})
const { formData } = toRefs(data)

const rules = reactive({
	categoryCode: [
		{
			validator: (rule, value, callback) => {
				// 只有一级类别时才验证必填
				if (formData.value.categoryLevel === 1) {
					if (!value || value.trim() === '') {
						callback(new Error('类别编码不能为空'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
	categoryName: proxy.getRules({ required: true }),
	categoryLevel: proxy.getRules({ required: true }),
	sortOrder: proxy.getRules({ required: true }),
})

// 父级名称
const parentName = computed(() => {
	if (props.parentData) {
		if (props.parentData.categoryName) {
			return props.parentData.categoryName
		}
		if (props.parentData.id) {
			// 如果有父级ID但没有名称，可以异步获取
			return '父级类别'
		}
	}
	return formData.value.categoryLevel === 1 ? '顶级类别' : '请选择父级'
})

// 监听父级数据变化
watch(
	() => props.parentData,
	newVal => {
		if (newVal && newVal.id) {
			formData.value.parentId = newVal.id
		} else {
			formData.value.parentId = null
		}
	},
	{ immediate: true }
)

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		}
	})
	return flag
}

const resetForm = () => {
	// 逐个属性重置，保持响应式
	formData.value.id = null
	formData.value.categoryCode = ''
	formData.value.categoryName = ''
	formData.value.parentId = null
	formData.value.categoryLevel = 1
	formData.value.sortOrder = 0
	formData.value.isLaborProtection = 0
	formData.value.codeCount = null
	ruleForm.value?.clearValidate()
}

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>

