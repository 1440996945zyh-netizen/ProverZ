<template>
	<el-link type="warning" style="font-size: 12px; margin-bottom: 10px">
		密码必须包含大写字母、小写字母、数字和特殊字符，长度8~16位
	</el-link>
	<el-form ref="ruleForm" :model="formData" :rules="rules" label-width="80px">
		<el-form-item label="旧密码" prop="oldPassword">
			<el-input v-model="formData.oldPassword" placeholder="请输入旧密码" type="password" show-password />
		</el-form-item>
		<el-form-item label="新密码" prop="newPassword">
			<el-input v-model="formData.newPassword" placeholder="请输入新密码" type="password" show-password />
		</el-form-item>
		<el-form-item label="确认密码" prop="confirmPassword">
			<el-input v-model="formData.confirmPassword" placeholder="请确认新密码" type="password" show-password />
		</el-form-item>
	</el-form>
</template>

<script setup name="change">
const { proxy } = getCurrentInstance()

const formData = reactive({
	oldPassword: undefined,
	newPassword: undefined,
	confirmPassword: undefined,
})

const equalToPassword = (rule, value, callback) => {
	if (formData.newPassword !== value) {
		callback(new Error('两次输入的密码不一致'))
		// 密码不复杂
	} else if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/.test(value) == false) {
		callback(new Error('密码必须包含大写字母、小写字母、数字和特殊字符，长度8~16位'))
	} else {
		callback()
	}
}
const rules = ref({
	oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
	newPassword: [
		{ required: true, message: '新密码不能为空', trigger: 'blur' },
		{ min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' },
	],
	confirmPassword: [
		{ required: true, message: '确认密码不能为空', trigger: 'blur' },
		{ required: true, validator: equalToPassword, trigger: 'blur' },
	],
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
