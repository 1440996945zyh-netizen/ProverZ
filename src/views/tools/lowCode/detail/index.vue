<template>
	<div class="formData">
		<el-form label-position="left" :model="formData" label-width="80" :rules="rules" ref="ruleForm">
			<el-form-item label="date" prop="date">
				<el-input v-model="formData.date" />
			</el-form-item>
			<el-form-item label="Name" prop="name">
				<el-input v-model="formData.name" />
			</el-form-item>
			<el-form-item label="age" prop="age">
				<el-input v-model="formData.age" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="LowCode">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const collapseActiveNames = ref(['1', '2'])
const formData = reactive({
	name: '',
	date: '',
	age: '',
})
const rules = reactive({
	date: proxy.getRules({ required: true }),
	name: proxy.getRules({ required: true }),
	age: proxy.getRules({ required: true }),
})

const validate = async () => {
	let flag = false
	console.log(ruleForm, 'ruleForm')
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			console.log('succ')
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
			console.log('err')
		}
	})
	return flag
}
const resetForm = () => {
	console.log(ruleForm, 'ruleForm')
	ruleForm.value.resetFields() // 第二个form清空
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
