<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" label-width="80px">
		<el-form-item label="每页数量" prop="pageNum">
			<Select v-model:value="formData.pageNum" :selectData="selectData"></Select>
		</el-form-item>
	</el-form>
</template>

<script setup name="change">
const { proxy } = getCurrentInstance()
import useUserStore from '@/store/modules/user'
import Select from '@/components/Select'
const userStore = useUserStore()
const formData = reactive({
	pageNum: userStore.pageNum,
})
const selectData = ref([
	{ label: '20条/页', value: '20' },
	{ label: '30条/页', value: '30' },
	{ label: '50条/页', value: '50' },
	{ label: '100条/页', value: '100' },
	{ label: '500条/页', value: '500' },
	{ label: '1000条/页', value: '1000' },
	{ label: '1500条/页', value: '1500' },
	{ label: '2000条/页', value: '2000' },
])
const rules = ref({
	pageNum: [{ required: true, message: '每页数量不能为空', trigger: 'blur' }],
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
