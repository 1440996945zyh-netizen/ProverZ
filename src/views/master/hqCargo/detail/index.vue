<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="货物名称" prop="cargoName">
				<el-input v-model="formData.cargoName" placeholder="请输入货物名称"  />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="detail">
import api from '@/api/master/hqCargo/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this


const ruleForm = ref()
const formData = reactive({
	id: '',
	cargoName: '',
})
const rules = reactive({
	cargoName: proxy.getRules({ required: true }),
})

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
	proxy.resetObj(formData)
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
