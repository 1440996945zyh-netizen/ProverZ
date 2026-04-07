<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" label-width="80px">
		<el-form-item label="旧手机号" prop="oldMobile">
			<el-input v-model="formData.oldMobile" placeholder=" " disabled />
		</el-form-item>
		<el-form-item label="新手机号" prop="mobile">
			<el-input v-model="formData.mobile" placeholder="请输入新手机号" />
		</el-form-item>
	</el-form>
</template>

<script setup name="change">
import TipMessage from '@/components/TipMessage/index.vue'
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
const { proxy } = getCurrentInstance()

const formData = reactive({
	oldMobile: undefined,
	mobile: undefined,
})

const rules = ref({
	mobile: [{ required: true, message: '新手机号不能为空', trigger: 'blur' }],
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
