<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="50px" :rules="rules" style="margin: 20px 20px">
      <el-form-item label="位置" prop="location">
        <el-input v-model="formData.location" placeholder="请输入位置" />
      </el-form-item>
		</el-form>
	</div>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this


const ruleForm = ref()
const formData = reactive({
  weighbridgeId:'',
  location: ''
})

const rules = reactive({
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
})

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
	formData.weighbridgeId = ''
	ruleForm.value.resetFields()
}
const init = () => {

}
init()

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
