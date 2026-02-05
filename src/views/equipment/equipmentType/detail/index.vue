<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="设备类型名称" prop="typeName">
				<el-input v-model="formData.typeName" placeholder="请输入设备类型名称" maxlength="200" />
			</el-form-item>


			<el-form-item label="父级分类" v-if="formData.categoryLevel > 1">
				<el-input v-model="parentName" disabled placeholder="父级分类" />
			</el-form-item>

			<el-form-item label="排序" prop="sortOrder">
				<el-input-number v-model="formData.sortOrder" :min="0" :max="9999" placeholder="排序" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="equipmentTypeDetail">
import { ref, reactive, watch, computed, getCurrentInstance, toRefs } from 'vue'
import api from '@/api/equipment/equipmentType/index'

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
		typeName: '',
		parentId: null,
		categoryLevel: 1,
		sortOrder: 0,
	},
})
const { formData } = toRefs(data)

// 获取级别名称
const getLevelName = level => {
	const levelMap = {
		1: '设备大类',
		2: '设备中类',
		3: '设备小类',
	}
	return levelMap[level] || ''
}

const rules = reactive({
	typeName: proxy.getRules({ required: true }),
	categoryLevel: proxy.getRules({ required: true }),
	sortOrder: proxy.getRules({ required: true }),
})

// 父级名称
const parentName = computed(() => {
	if (props.parentData) {
		if (props.parentData.typeName) {
			return props.parentData.typeName
		}
		if (props.parentData.id) {
			// 如果有父级ID但没有名称，可以异步获取
			return '父级分类'
		}
	}
	return formData.value.categoryLevel === 1 ? '顶级分类' : '请选择父级'
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
	formData.value.typeName = ''
	formData.value.parentId = null
	formData.value.categoryLevel = 1
	formData.value.sortOrder = 0
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

