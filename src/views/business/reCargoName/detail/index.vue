<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="80px" :rules="rules" style="margin: 20px 20px">
      <el-form-item label="标识码">
        <el-input v-model="formData.sign"  placeholder="请输入名称"  readonly/>
      </el-form-item>
      <el-form-item label="原货名" prop="oldCargoName">
				<el-input v-model="formData.oldCargoName"  placeholder="请输入名称" readonly />
			</el-form-item>
			<el-form-item label="新货名" prop="newCargoName">
        <el-input v-model="formData.newCargoName"  placeholder="请输入名称" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="system">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import { creatShortCd } from '@/utils/index.js'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const formData = reactive({
  oldCargoName: '',
  newCargoName: '',
	cargoCode:'',
  cargoCategoryCode:''
})
const rules = reactive({
  oldCargoName: proxy.getRules({
		required: true,
	}),
  newCargoName: proxy.getRules({
		required: true,
	}),
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
	ruleForm.value.resetFields()
	formData.oldCargoName = null
	formData.newCargoName = null
	formData.cargoCode = null
	formData.cargoCategoryCode = null

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
