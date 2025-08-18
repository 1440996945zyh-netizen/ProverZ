<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-width="100px" :rules="rules">
			<el-form-item label="缆桩代码" prop="bollardCode">
				<el-input v-model="formData.bollardCode" placeholder="缆桩代码" />
			</el-form-item>
			<el-form-item label="缆桩名称" prop="bollardName">
				<el-input v-model="formData.bollardName" placeholder="缆桩名称" />
			</el-form-item>
			<el-form-item label="经度" prop="lon">
				<el-input v-model="formData.lon" @input="formData.lon = proxy.verify('sixDecimal', formData.lon)" placeholder="经度" />
			</el-form-item>
			<el-form-item label="纬度" prop="lat">
				<el-input v-model="formData.lat" @input="formData.lat = proxy.verify('sixDecimal', formData.lat)" placeholder="经度" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="berth">
import { ref, reactive, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'

const ruleForm = ref()
const formData = reactive({
	bollardCode: '',
	bollardName: '',
	lon: 0,
	lat: 0,
	id: '',
	berthId: '',
})
const rules = reactive({
	bollardCode: proxy.getRules({
		required: true,
	}),
	bollardName: proxy.getRules({
		required: true,
	}),
	lon: proxy.getRules({
		required: true,
		numberCheck: {
			int: 3,
			dec: 6,
		},
	}),
	lat: proxy.getRules({
		required: true,
		numberCheck: {
			int: 3,
			dec: 6,
		},
	}),
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
			console.log('succ')
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
			console.log('err')
		}
	})
	return flag
}
const resetForm = () => {
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
.el-form {
	width: 90%;
	margin-top: 20px;
}
</style>
