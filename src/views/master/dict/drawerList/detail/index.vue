<template>
	<div class="formData">
		<el-form ref="ruleForm" :model="formData" :rules="rules" :inline="true" label-width="80">
			<el-form-item label="字典名称" prop="dictLabel">
				<el-input v-model="formData.dictLabel" placeholder="请输入字典名称" />
			</el-form-item>
			<el-form-item label="字典编号" prop="dictValue">
				<el-input v-model="formData.dictValue" placeholder="请输入字典编号" />
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
				<el-input v-model="formData.remark" type="textarea" placeholder="请输入备注"></el-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="dict">
import { ref, reactive } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const ruleForm = ref()
const formData = reactive({
	dictLabel: '',
	dictValue: '',
	status: '',
	remark: '',
	sortNum: '',
	id: '',
	dictType: '', //字典类型
	dictName: '', //类型名称
})
const rules = reactive({
	dictLabel: proxy.getRules({
		required: true,
		length: '1-100',
	}),
	dictValue: proxy.getRules({
		required: true,
		length: '1-100',
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
	formData.id = ''
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
