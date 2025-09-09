<template>
	<!-- 新增或修改版本配置对话框 -->
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
			<el-row>
				<el-col :span="12">
					<el-form-item label="版本名称" prop="versionName">
						<el-input v-model="formData.versionName" placeholder="请输入版本名称" maxlength="30" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="版本号" prop="versionCode">
						<el-input v-model="formData.versionCode" placeholder="请输入版本号" maxlength="30" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="下载地址" prop="linkAddress">
						<el-input v-model="formData.linkAddress" placeholder="请输入下载地址" maxlength="255" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="版本类型" prop="versionType">
						<Select
							:dataConfig="{ params: { type: 'DICT', dictType: 'VERSION_CONTROL' } }"
							v-model:value="formData.versionType"
							v-model:label="formData.versionTypeName"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item prop="" label="附件" style="line-height: 50px; display: inline">
						<upload
							:fileTypeName="fileTypeName"
							businessType="VERSION_CONTROL"
							:businessId="formData.id"
							@changeFile="changeFile"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="备注" prop="remark">
						<el-input v-model="formData.remark" type="textarea" placeholder="请输入内容"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup>
import api from '@/api/system/version'
import upload from '../../../../components/upload/index'
import { reactive } from 'vue'
import publicApi from '@/api/public/index'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
const ruleForm = ref()
const fileTypeName = ref('.apk')
const { proxy } = getCurrentInstance()
const formData = reactive({
	id: '',
	remark: '',
	versionCode: '',
	remaversionNamerk: '',
	linkAddress: '',
	versionType: '',
	versionTypeName: '',
	fileId: '',
})
// 表单验证规则
const rules = reactive({
	remark: proxy.getRules({
		length: '1-255',
	}),
	versionCode: proxy.getRules({
		required: true,
		length: '1-10',
	}),
	versionName: proxy.getRules({
		required: true,
		length: '1-20',
	}),
	linkAddress: proxy.getRules({
		required: true,
		length: '1-255',
	}),
	versionType: proxy.getRules({
		required: true,
		length: '2-255',
	}),
	fileId: proxy.getRules({
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
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
// 文件上传
const changeFile = file => {
	formData.fileId = file[0]
}
// 重置
const resetForm = () => {
	formData.id = ''
	ruleForm.value.resetFields()
}
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/formData.scss';
</style>
