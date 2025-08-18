<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="130px" :rules="rules" style="margin: 20px 20px">
      <el-form-item label="放货原因" prop="releaseRemark">
        <el-input type="textarea" v-model="formData.releaseRemark" placeholder="请输入放货原因" />
      </el-form-item>
      <el-form-item prop="" label="放货凭证">
        <upload :fileTypeName="fileTypeName" businessType="RELEASE_MANAGE" :businessId="formData.id" @changeFile="changeFile" />
      </el-form-item>
		</el-form>
	</div>
</template>

<script setup name="system">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Upload from "@/components/upload/index.vue";
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const fileTypeName = ref('.pdf, .png, .jpeg')
const ruleForm = ref()
const formData = reactive({
	id: '',
  releaseRemark: '',
  fileIds:[],
})

const rules = reactive({
  releaseRemark: [{ required: true, message: '请输入放货原因', trigger: 'blur' }],
})
const changeFile = file => {
  formData.fileIds = file
}
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
	formData.id = ''
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
