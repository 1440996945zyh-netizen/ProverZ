<template>
	<!-- 新增或修改用户配置对话框 -->
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
			<el-row>
				<el-col :span="12">
					<el-form-item label="用户账号" prop="userAccount">
						<el-input v-model="formData.userAccount" placeholder="请输入用户账号" maxlength="30" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="身份证号" prop="idCard">
						<el-input v-model="formData.idCard" @change="isValidIdCard" placeholder="请输入身份证号" maxlength="18" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="用户姓名" prop="userName">
						<el-input v-model="formData.userName" placeholder="请输入用户姓名" maxlength="30" />
					</el-form-item>
				</el-col>

				<el-col :span="12">
					<el-form-item label="用户性别">
						<el-radio-group v-model="formData.sex">
							<el-radio key="1" label="1">男</el-radio>
							<el-radio key="0" label="0">女</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="所属部门" prop="deptId">
						<el-tree-select
							v-model="formData.deptId"
							:data="deptOptions"
							:props="{ value: 'id', label: 'deptName', children: 'children' }"
							value-key="id"
							placeholder="请选择归属部门"
							check-strictly
							style="width: 100%"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="状态" prop="status">
						<el-radio-group v-model="formData.status">
							<el-radio key="1" label="1">在用</el-radio>
							<el-radio key="0" label="0">停用</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="超级管理员" prop="isSuperadmin">
						<el-radio-group v-model="formData.isSuperadmin">
							<el-radio key="1" label="1">是</el-radio>
							<el-radio key="0" label="0">否</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="角色" prop="roleIds">
						<el-select v-model="formData.roleIds" multiple placeholder="请选择" style="width: 100%" :filterable="true">
							<el-option
								v-for="item in roleOptions"
								:key="item.id"
								:label="item.roleName"
								:value="item.id"
								:disabled="item.status == 0"
							></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="手机号码" prop="mobile">
						<el-input v-model="formData.mobile" placeholder="请输入手机号码" maxlength="11" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="邮箱" prop="email">
						<el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
					</el-form-item>
				</el-col>

				<el-col :span="12">
					<el-form-item label="单位类型" prop="unitTypeCode">
						<Select v-model:value="formData.unitTypeCode" v-model:label="formData.unitTypeName" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="岗位" prop="postCode">
						<Select v-model:value="formData.postCode" v-model:label="formData.postName" />
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
import api from '@/api/system/user'
import { reactive } from 'vue'
import publicApi from '@/api/public/index'
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
const ruleForm = ref()
const deptOptions = ref([])
const roleOptions = ref([])
const { proxy } = getCurrentInstance()
const formData = reactive({
	id: '',
	userAccount: '',
	userName: '',
	idCard: '',
	deptId: '',
	status: '1',
	isSuperadmin: '0',
	remark: '',
	isLabor: '0',
	sex: '',
})
// 表单验证规则
const rules = reactive({
	remark: proxy.getRules({
		length: '1-200',
	}),
	userName: proxy.getRules({
		required: true,
		length: '2-20',
	}),
	userAccount: proxy.getRules({
		required: true,
	}),
	deptId: proxy.getRules({
		required: true,
	}),
	email: proxy.getRules({
		email: {},
	}),
	mobile: proxy.getRules({
		handset: {},
	}),
	status: proxy.getRules({
		required: true,
	}),
	isSuperadmin: proxy.getRules({
		required: true,
	}),
	unitTypeCode: proxy.getRules({
		required: true,
	}),
	idCard: proxy.getRules({
		required: true,
	}),
	/*  postCode: proxy.getRules({
    required: true
  })*/
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
// 重置
const resetForm = () => {
	console.log('重置', 'ruleForm')
	ruleForm.value.resetFields()
	formData.id = ''
}
/** 查询角色列表 */
function getRoleList() {
	api.getListNoPage().then(res => {
		roleOptions.value = res.data
	})
}
/** 查询部门下拉树结构 */
function getDeptTree() {
	publicApi.getDeptList().then(response => {
		deptOptions.value = proxy.handleTree(response.data)
	})
}
//身份证号是否合理
const isValidIdCard = () => {
	formData.sex = null
	formData.birthday = null
	// 1. 检查长度是否为18位
	if (formData.idCard.length !== 18) {
		proxy.$modal.msgError(`身份证号不正确`)
		return false
	}

	// 2. 校验码验证
	const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
	const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
	let sum = 0
	for (let i = 0; i < 17; i++) {
		const digit = parseInt(formData.idCard[i])
		if (isNaN(digit)) {
			proxy.$modal.msgError(`身份证号不正确`)
			return false
		}
		sum += digit * weights[i]
	}
	const remainder = sum % 11
	console.log(typeof formData.idCard, 'type')
	if (checkCodes[remainder] !== formData.idCard[17].toUpperCase()) {
		proxy.$modal.msgError(`身份证号不正确`)
		return false
	}

	// 3. 出生日期合法性验证
	const year = formData.idCard.slice(6, 10)
	const month = formData.idCard.slice(10, 12)
	const day = formData.idCard.slice(12, 14)
	const date = new Date(year, parseInt(month) - 1, parseInt(day))
	if (date.getFullYear() !== parseInt(year) || date.getMonth() + 1 !== parseInt(month) || date.getDate() !== parseInt(day)) {
		proxy.$modal.msgError(`身份证号不正确`)
		return false
	}
	const sexCode = parseInt(formData.idCard.slice(16, 17))
	if (sexCode % 2 === 1) {
		formData.sex = '1'
	} else {
		formData.sex = '0'
	}
	formData.birthday = year + '-' + month + '-' + day
}
getDeptTree()
getRoleList()
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="less" scoped>
@import '@/assets/styles/formData.scss';
</style>
