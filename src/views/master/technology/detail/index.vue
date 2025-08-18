<template>
	<el-form :model="formData" ref="ruleForm" label-width="auto" :rules="rules">
		<el-row>
			<el-col :span="12">
				<el-form-item label="作业工艺名称" prop="techniqueName">
					<el-input v-model="formData.techniqueName" placeholder="请输入作业工艺名称" />
				</el-form-item>
			</el-col>
			<el-col :span="12">
				<el-form-item label="作业过程" prop="processCodes">
					<!-- <el-select filterable v-model="formData.processCodes" multiple placeholder="请选择作业过程" style="width: 100%">
						<el-option
							v-for="item in operationProcessList"
							:key="item.id"
							:label="item.processName"
							:value="item.processCode"
						></el-option>
					</el-select> -->
					<div style="width: 100%">
						<Select
							v-model:value="formData.processCodes"
							v-model:label="formData.processNames"
							placeholder="请选择作业过程"
							selectLabel="processName"
							selectValue="processCode"
							:dataConfig="processSelectConfig"
							:defaultValue="formData.processCodes"
							:remoteMethod="remoteMethod"
							:filterable="true"
							:multiple="true"
							:number="30"
							:remote="true"
						/>
					</div>
				</el-form-item>
			</el-col>
		</el-row>
		<el-row>
			<!-- labelContent=${cargoName}& -->
			<el-col :span="12">
				<el-form-item label="货物名称" prop="cargoCodes">
					<div style="width: 100%">
						<Select
							v-model:value="formData.cargoCodes"
							v-model:label="formData.cargoNameS"
							placeholder="请选择货物名称"
							type="CARGO_INFO"
							:defaultValue="formData.cargoCodes"
							:filterable="true"
							:multiple="true"
							:number="30"
							:remote="true"
							selectLabel="label"
							selectValue="value"
						/>
					</div>
				</el-form-item>
			</el-col>
			<el-col :span="12">
				<el-form-item label="状态" prop="status">
					<el-switch v-model="formData.status"></el-switch>
				</el-form-item>
			</el-col>
		</el-row>
	</el-form>
</template>

<script setup name="macType">
import Select from '@/components/Select'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

// 作业过程下拉框地址配置
const processSelectConfig = ref({
	url: '/api/internal/public/getprocesslist',
})
const ruleForm = ref()
const formData = reactive({
	processCodes: null,
	processName: null,
	techniqueName: null,
	cargoCodes: null,
	cargoNames: null,
	status: false,
})
const rules = reactive({
	techniqueName: [{ required: true, message: '请输入作业工艺名称', trigger: 'blur' }],
	processCodes: [{ required: true, message: '请选择作业过程', trigger: 'blur' }],
	cargoCodes: [{ required: true, message: '请至少选择一项货物', trigger: 'blur' }],
})

const remoteMethod = async query => {
	const url = '/api/internal/public/getprocesslist?name='
	processSelectConfig.value.url = url + query
}

const validate = async () => {
	//表单验证
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			console.log('succ')
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
			console.log('err')
		}
	})

	return flag
}
const resetForm = () => {
	console.log(ruleForm, 'ruleForm')
	ruleForm.value.resetFields()
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
