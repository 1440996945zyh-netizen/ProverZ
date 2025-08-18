<template>
	<div class="formData">
		<el-form label-position="left" :model="formData" label-width="80" :rules="rules" ref="ruleForm">
			<el-form-item label="date" prop="date">
				<el-input v-model="formData.date" placeholder="请输入date" />
			</el-form-item>
			<el-form-item label="Name" prop="name">
				<el-input v-model="formData.name" placeholder="请输入Name" />
			</el-form-item>
			<el-form-item label="age" prop="age">
				<el-input v-model="formData.age" placeholder="请输入age" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="Detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const formData = reactive({
	name: '',
	date: '',
	age: '',
})
const rules = reactive({
	date: proxy.getRules({ required: true }),
	name: proxy.getRules({ required: true }),
	// 最多2位整数 2位小数
	age: proxy.getRules({
		required: true,
		numberCheck: {
			int: 2,
			dec: 2,
		},
	}),
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			console.log('succ')
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
			console.log('err')
		}
	})
	return flag
}
const resetForm = () => {}
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '../../src/assets/styles/formData.scss';
</style>
