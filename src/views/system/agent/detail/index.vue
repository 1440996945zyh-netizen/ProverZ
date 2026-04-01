<template>
	<div class="formData">
		<el-form :model="formData" style="padding: 10px" ref="ruleForm" :rules="rules" :inline="true" label-width="auto">
			<el-form-item label="智能体名称" prop="agentName">
				<el-input v-model="formData.agentName" placeholder="请输入智能体名称" maxlength="100" />
			</el-form-item>
			<el-form-item label="简介" prop="introduction">
				<el-input v-model="formData.introduction" type="textarea" placeholder="请输入简介" :rows="3" maxlength="1000" show-word-limit />
			</el-form-item>
			<el-form-item label="智能体标识" prop="agentCode">
				<el-input v-model="formData.agentCode" placeholder="请输入智能体标识（如PORT，BILL）" />
			</el-form-item>
			<el-form-item label="头像" prop="avatar">
				<el-input v-model="formData.avatar" placeholder="头像路径或URL" maxlength="500" />
			</el-form-item>
			<el-form-item label="排序" prop="agentSort">
				<el-input-number v-model="formData.agentSort" :min="0" :max="9999" placeholder="数值越小越靠前" style="width: 100%" />
			</el-form-item>
			<el-form-item label="类型" prop="type">
				<Select
          :selectData="[
					{ label: '对话', value: '1' },
					{ label: '应用', value: '2' },
				]"
          v-model:value="formData.type"
        />
			</el-form-item>
			<el-form-item label="API Key" prop="apiKey">
				<el-input v-model="formData.apiKey" placeholder="智能体API Key（内部使用）" maxlength="200" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { reactive } from 'vue'
import Select from "@/components/Select/index.vue";

const ruleForm = ref()
const { proxy } = getCurrentInstance()
const formData = reactive({
	id: null,
	agentName: '',
	introduction: '',
	avatar: '',
	status: '1',
	apiKey: '',
	agentSort: 0,
	type: '',
	agentCode: '',
})

const rules = reactive({
	agentName: proxy.getRules({
		required: true,
		length: '1-100'
	})
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid) => {
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
	ruleForm.value?.resetFields()
	formData.id = null
	formData.agentName = ''
	formData.introduction = ''
	formData.avatar = ''
	formData.status = '1'
	formData.apiKey = ''
	formData.agentSort = 0
}

defineExpose({
	validate,
	resetForm,
	formData
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/formData.scss';
</style>
