<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="130px" :rules="rules">
			<el-form-item label="每页显示条数" prop="pageSize">
				<el-input v-model="formData.pageSize" placeholder="请输入货种名称" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="personalization">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'

const ruleForm = ref()
const formData = reactive({
	pageSize: '',
})
const rules = reactive({
	pageSize: proxy.getRules({ required: true }),
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
	console.log(ruleForm, 'ruleForm')
	ruleForm.value.resetFields()
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
