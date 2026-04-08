<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" label-width="80px">
		<el-form-item label="旧邮箱" prop="oldEmail">
			<el-input v-model="formData.oldEmail" placeholder=" " disabled />
		</el-form-item>
		<el-form-item label="新邮箱" prop="email">
			<el-input v-model="formData.email" placeholder="请输入新邮箱" />
		</el-form-item>
	</el-form>
</template>

<script setup name="change">
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
const { proxy } = getCurrentInstance()

const formData = reactive({
	oldEmail: undefined,
	email: undefined,
})

const rules = ref({
	email: [{ required: true, message: '新邮箱不能为空', trigger: 'blur' }],
})
const ruleForm = ref()
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
	proxy.clearObjectValues(formData)
}
defineExpose({
	formData,
	validate,
	resetForm,
})
</script>
