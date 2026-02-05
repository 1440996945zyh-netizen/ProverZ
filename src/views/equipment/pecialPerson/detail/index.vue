<template>
	<div class="pecial-person-detail-wrapper">
		<el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" :disabled="readonly">
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="所属部门" prop="useOrgId">
						<Select
							:selectData="deptList"
							v-model:value="formData.useOrgId"
							v-model:label="formData.useOrgName"
							placeholder="请选择所属部门"
							@change="handleDeptChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="证书所属人" prop="certifiUser">
						<Select
							:selectData="userList"
							v-model:value="formData.certifiUser"
							v-model:label="formData.certifiUserName"
							:disabled="!formData.useOrgId"
							placeholder="请先选择所属部门"
						/>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="作业项目" prop="certificateName">
						<Select
							:dataConfig="{ params: { type: 'DICT', dictType: 'E_PROJECT' } }"
							v-model:value="formData.certifiType"
							v-model:label="formData.certificateName"
							placeholder="请选择作业项目"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="项目代号">
						<el-input v-model="formData.certifiType" placeholder="项目代号" :readonly="true" />
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="证书编号" prop="certifiNumber">
						<el-input v-model="formData.certifiNumber" placeholder="请输入证书编号" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="档案编号" prop="certifiCode">
						<el-input v-model="formData.certifiCode" placeholder="请输入档案编号" />
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="批准时间" prop="firstDate">
						<el-date-picker
							v-model="formData.firstDate"
							type="date"
							placeholder="请选择批准时间"
							format="YYYY-MM-DD"
							value-format="YYYY-MM-DD"
							style="width: 100%"
							@change="calculateValidDate"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="到期时间" prop="expireDate">
						<el-date-picker
							v-model="formData.expireDate"
							type="date"
							placeholder="请选择到期时间"
							format="YYYY-MM-DD"
							value-format="YYYY-MM-DD"
							style="width: 100%"
							@change="calculateValidDate"
						/>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="有效期(月)" prop="validDate">
						<el-input-number v-model="formData.validDate" :min="0" style="width: 100%" :readonly="true" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="证书状态" prop="certifiState">
						<el-select v-model="formData.certifiState" placeholder="请选择证书状态" style="width: 100%">
							<el-option label="首发" :value="'1'" />
							<el-option label="复审" :value="'2'" />
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="认证单位" prop="certificationAuthority">
						<el-input v-model="formData.certificationAuthority" placeholder="请输入认证单位" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="考试机构" prop="examOrg">
						<el-input v-model="formData.examOrg" placeholder="请输入考试机构" />
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="是否聘用" prop="isEmploy">
						<el-select v-model="formData.isEmploy" placeholder="请选择是否聘用" style="width: 100%">
							<el-option label="未聘用" :value="'0'" />
							<el-option label="已聘用" :value="'1'" />
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="20">
				<el-col :span="24">
					<el-form-item label="备注" prop="remark">
						<el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup name="pecialPersonDetail">
import { ref, reactive, getCurrentInstance, onMounted, watch } from 'vue'
import Select from '@/components/Select'
import publicApi from '@/api/public/index'
import { getListByLevel } from '@/api/system/dept'

const props = defineProps({
	readonly: {
		type: Boolean,
		default: false,
	},
	mode: {
		type: String,
		default: 'add',
	},
})

const emit = defineEmits(['saved'])

const { proxy } = getCurrentInstance()
const formRef = ref(null)

// 部门列表
const deptList = ref([])

// 用户列表
const userList = ref([])

// 表单数据
const formData = reactive({
	id: null,
	certifiType: null,
	certifiCode: '',
	certificateName: '',
	certifiNumber: '',
	certifiUser: '',
	certifiUserName: '',
	expireDate: '',
	validDate: null,
	certifiState: null,
	firstDate: '',
	remark: '',
	useOrgId: null,
	useOrgName: '',
	certificationAuthority: '',
	examOrg: '',
	isEmploy: null,
})

// 表单验证规则
const rules = {
	useOrgId: [{ required: true, message: '所属部门不能为空', trigger: 'change' }],
	certifiUser: [{ required: true, message: '证书所属人不能为空', trigger: 'change' }],
	expireDate: [{ required: true, message: '到期时间不能为空', trigger: 'change' }],
	validDate: [{ required: true, message: '有效期不能为空', trigger: 'blur' }],
	firstDate: [{ required: true, message: '批准时间不能为空', trigger: 'change' }],
}

// 计算有效期（根据批准时间和到期时间）
const calculateValidDate = () => {
	if (!formData.firstDate || !formData.expireDate) {
		formData.validDate = null
		return
	}
	const firstDate = new Date(formData.firstDate)
	const expireDate = new Date(formData.expireDate)
	if (expireDate < firstDate) {
		formData.validDate = null
		return
	}
	const yearDiff = expireDate.getFullYear() - firstDate.getFullYear()
	const monthDiff = expireDate.getMonth() - firstDate.getMonth()
	const totalMonths = yearDiff * 12 + monthDiff
	let months = totalMonths
	if (expireDate.getDate() < firstDate.getDate()) {
		months--
	}
	formData.validDate = Math.max(1, months)
}

// 加载部门列表（DEPT_LEVEL=2）
const loadDeptList = () => {
	getListByLevel(2).then(res => {
		if (res.code == '0000') {
			deptList.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id,
			}))
		}
	})
}

// 加载用户列表（根据部门ID）
const loadUserList = (deptId) => {
	if (!deptId) {
		userList.value = []
		return
	}
	publicApi.getLocalSelect({
		type: 'USER',
		deptId: deptId
	}).then(res => {
		if (res.code == '0000') {
			userList.value = res.data.map(item => ({
				label: item.label || item.userName,
				value: item.value || item.id,
			}))
		}
	})
}

// 部门变化时，清空证书所属人并重新加载用户列表
const handleDeptChange = () => {
	formData.certifiUser = ''
	formData.certifiUserName = ''
	if (formData.useOrgId) {
		loadUserList(formData.useOrgId)
	} else {
		userList.value = []
	}
}

// 监听useOrgId变化，编辑时自动加载用户列表
watch(() => formData.useOrgId, (newVal) => {
	if (newVal && !userList.value.length) {
		loadUserList(newVal)
	}
})

// 重置表单
const resetForm = () => {
	if (formRef.value) {
		formRef.value.resetFields()
	}
	Object.keys(formData).forEach(key => {
		if (key === 'id') {
			formData[key] = null
		} else if (typeof formData[key] === 'string') {
			formData[key] = ''
		} else if (typeof formData[key] === 'number') {
			formData[key] = null
		} else {
			formData[key] = null
		}
	})
}

// 表单验证
const validate = () => {
	return new Promise((resolve, reject) => {
		formRef.value.validate(valid => {
			if (valid) {
				resolve(true)
			} else {
				reject(false)
			}
		})
	})
}

// 暴露方法给父组件
defineExpose({
	resetForm,
	validate,
	formData,
})

onMounted(() => {
	loadDeptList()
})
</script>

<style scoped>
.pecial-person-detail-wrapper {
	padding: 20px;
}
</style>

