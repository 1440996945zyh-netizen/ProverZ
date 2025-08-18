<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" :inline="true" label-width="110">
			<el-form-item label="字典类型名称" prop="dictName">
				<el-input v-model="formData.dictName" placeholder="请输入字典类型名称" />
			</el-form-item>
			<el-form-item label="字典类型编号" prop="dictType">
				<el-input v-model="formData.dictType" placeholder="请输入字典类型编号" />
			</el-form-item>
			<el-form-item label="状态" prop="status">
				<el-radio-group v-model="formData.status">
					<el-radio key="0" label="0">停用</el-radio>
					<el-radio key="1" label="1">在用</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="排序号" prop="sortNum">
				<el-input v-model="formData.sortNum" placeholder="请输入数字" />
			</el-form-item>
			<el-form-item label="备注" prop="remark">
				<el-input v-model="formData.remark" type="textarea" placeholder="请输入内容"></el-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="dict">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'

const ruleForm = ref()
const formData = reactive({
	id: null,
	dictName: '',
	dictType: '',
	status: '',
	remark: '',
	sortNum: '',
})
const rules = reactive({
	dictName: proxy.getRules({
		required: true,
		length: '1-100',
	}),
	dictType: proxy.getRules({
		required: true,
		length: '1-50',
	}),
	sortNum: proxy.getRules({
		numberCheck: {
			int: 4,
			dec: 0,
		},
	}),
	remark: proxy.getRules({
		length: '1-200',
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
			proxy.$message.warning('请完善表单信息！')
			console.log('err')
		}
	})
	return flag
}
const resetForm = () => {
	formData.id = null
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
