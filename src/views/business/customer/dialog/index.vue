<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" class="demo-ruleForm" :size="formSize" status-icon>
		<el-form-item prop="rejectIdea">
			<el-input v-model="formData.rejectIdea" placeholder="请输入驳回意见" show-word-limit type="textarea" />
		</el-form-item>
	</el-form>
</template>

<script setup name="customerDialog">
import { reactive } from 'vue'
const ruleForm = ref()
const { proxy } = getCurrentInstance()
const emit = defineEmits(['dialogShowEmit'])
const props = defineProps({
	rejectId: {
		type: String,
	},
})

const formData = reactive({
	rejectIdea: '',
})
const rules = reactive({
	rejectIdea: proxy.getRules({
		required: true,
	}),
})
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}

const resetForm = () => {
	proxy.resetObj(formData)
}
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="scss" scoped></style>
