<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="auto" :rules="rules">
			<el-form-item label="机械类型名称" prop="macTypeName">
				<el-input v-model="formData.macTypeName" placeholder="机械类型名称" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="macType">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, toRefs } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const data = reactive({
	formData: {
		macTypeName: '',
	},
})
const { formData } = toRefs(data)
const rules = reactive({
	macTypeName: proxy.getRules({
		required: true,
	}),
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			// console.log('succ')
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
			// console.log('err')
		}
	})

	return flag
}
const resetForm = () => {
	console.log(ruleForm, 'ruleForm')
	// ruleForm.value.resetFields()
	formData.value = {}
	// console.log('chongzhi',formData.value);
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
