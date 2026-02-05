<template>
	<div class="dispatch-wrapper">
		<el-form ref="formRef" :model="formData" :rules="rules" label-position="top" :inline="true">
			<el-collapse v-model="activeNames">
				<!-- 基本信息（只读） -->
				<el-collapse-item title="基本信息" name="basic">
					<el-form :model="formData" label-position="top" :inline="true" :disabled="true">
						<el-row :gutter="20">
							<el-col :span="8">
								<el-form-item label="设备名称">
									<el-input v-model="formData.equipName" placeholder="设备名称" readonly />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="设备编码">
									<el-input v-model="formData.equipCode" placeholder="设备编码" readonly />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="故障发现时间">
									<el-input v-model="formData.faultFindTime" placeholder="故障发现时间" readonly />
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="20">
							<el-col :span="8">
								<el-form-item label="紧急程度">
									<el-input v-model="emergencyLevelText" placeholder="紧急程度" readonly />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="维修类型">
									<el-input v-model="formData.maintTypeName" placeholder="维修类型" readonly />
								</el-form-item>
							</el-col>
							<el-col :span="8">
								<el-form-item label="是否停机">
									<el-input v-model="isStoppedText" placeholder="是否停机" readonly />
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="20">
							<el-col :span="24">
								<el-form-item label="故障描述">
									<el-input v-model="formData.faultDesc" type="textarea" :rows="3" placeholder="故障描述" readonly />
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
				</el-collapse-item>
				<!-- 派工信息 -->
				<el-collapse-item title="派工信息" name="dispatch">
					<el-row :gutter="20">
						<el-col :span="8">
							<el-form-item label="派工类型" prop="dispatchTypeCode">
								<el-select v-model="formData.dispatchTypeCode" placeholder="请选择派工类型" style="width: 100%" @change="handleDispatchTypeChange">
									<el-option label="委内" :value="'1'" />
									<el-option label="委外" :value="'2'" />
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="承修单位" prop="maintOrgId">
								<Select
									:selectData="deptList"
									v-model:value="formData.maintOrgId"
									v-model:label="formData.maintOrgName"
									:disabled="!formData.dispatchTypeCode"
									:placeholder="formData.dispatchTypeCode ? '请选择承修单位' : '请先选择派工类型'"
									@change="handleDeptChange"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="8">
							<el-form-item label="维修负责人" prop="maintLeaderId">
								<Select
									:selectData="userList"
									v-model:value="formData.maintLeaderId"
									v-model:label="formData.maintLeaderName"
									:disabled="!formData.maintOrgId"
									placeholder="请先选择承修单位"
								/>
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
			</el-collapse>
		</el-form>
	</div>
</template>

<script setup name="dispatch">
import { ref, reactive, computed, getCurrentInstance, onMounted, watch, nextTick } from 'vue'
import Select from '@/components/Select'
import { listDept } from '@/api/system/dept'
import publicApi from '@/api/public/index'

const props = defineProps({
	maintInfoId: {
		type: Number,
		default: null,
	},
})

const emit = defineEmits(['saved'])

const { proxy } = getCurrentInstance()
const formRef = ref(null)

// 折叠面板展开项
const activeNames = ref(['basic', 'dispatch'])

// 部门列表
const deptList = ref([])

// 用户列表（维修负责人）
const userList = ref([])

// 表单数据
const formData = reactive({
	id: null,
	equipId: null,
	equipName: '',
	equipCode: '',
	faultFindTime: '',
	emergencyLevel: '0',
	maintTypeCode: '',
	maintTypeName: '',
	isStopped: 0,
	faultDesc: '',
	reportTypeCode: '1',
	reportTypeName: '日常维修',
	dispatchTypeCode: '', // 派工类型：1-委内，2-委外
	dispatchTypeName: '',
	maintOrgId: null,
	maintOrgName: '',
	maintLeaderId: null,
	maintLeaderName: '',
	status: 1, // 派工后状态为1-已派工
})

// 紧急程度文本
const emergencyLevelText = computed(() => {
	const levelMap = {
		'0': '常规',
		'1': '紧急',
		'2': '特急'
	}
	return levelMap[formData.emergencyLevel] || formData.emergencyLevel
})

// 是否停机文本
const isStoppedText = computed(() => {
	return formData.isStopped === 1 ? '是' : '否'
})

// 表单验证规则
const rules = reactive({
	dispatchTypeCode: [{ required: true, message: '派工类型不能为空', trigger: 'change' }],
	maintOrgId: [{ required: true, message: '承修单位不能为空', trigger: 'change' }],
	maintLeaderId: [{ required: true, message: '维修负责人不能为空', trigger: 'change' }],
})

// 加载部门列表
const loadDeptList = () => {
	if (!formData.dispatchTypeCode) {
		deptList.value = []
		return
	}

	// 委内(1)查询内部部门(IN_OUT_TYPE='I')，委外(2)查询外部部门(IN_OUT_TYPE='O')
	const inOutType = formData.dispatchTypeCode === '1' ? 'I' : 'O'

	// 查询部门列表：DEPT_LEVEL=2（部门级别），IN_OUT_TYPE=I/O（内外部），STATUS=1（在用）
	listDept({
		deptLevel: 2,
		inOutType: inOutType,
		status: '1'
	}).then(res => {
		if (res.code === '0000') {
			deptList.value = res.data.map(item => ({
				value: item.id,
				label: item.deptName,
			}))
		} else {
			proxy.$message.error(res.msg || '加载部门列表失败')
		}
	}).catch(error => {
		console.error('加载部门列表失败:', error)
		proxy.$message.error('加载部门列表失败')
	})
}

// 加载用户列表
const loadUserList = (deptId) => {
	if (!deptId) {
		userList.value = []
		formData.maintLeaderId = null
		formData.maintLeaderName = ''
		return
	}

	publicApi.getLocalSelect({
		type: 'USER',
		deptId: deptId
	}).then(res => {
		if (res.code === '0000') {
			userList.value = res.data.map(item => ({
				value: item.value || item.id,
				label: item.label || item.userName,
			}))
		} else {
			proxy.$message.error(res.msg || '加载用户列表失败')
		}
	}).catch(error => {
		console.error('加载用户列表失败:', error)
		proxy.$message.error('加载用户列表失败')
	})
}

// 派工类型变化
const handleDispatchTypeChange = (newVal) => {
	const typeMap = {
		'1': '委内',
		'2': '委外'
	}
	formData.dispatchTypeName = typeMap[newVal] || ''
	// 清空承修单位和维修负责人
	formData.maintOrgId = null
	formData.maintOrgName = ''
	formData.maintLeaderId = null
	formData.maintLeaderName = ''
	userList.value = []
	// 加载对应的部门列表
	loadDeptList()
}

// 承修单位变化
const handleDeptChange = () => {
	// 清空维修负责人
	formData.maintLeaderId = null
	formData.maintLeaderName = ''
	// 加载对应的用户列表
	if (formData.maintOrgId) {
		loadUserList(formData.maintOrgId)
	} else {
		userList.value = []
	}
}

// 监听派工类型变化，自动加载部门列表
watch(() => formData.dispatchTypeCode, (newVal) => {
	if (newVal) {
		loadDeptList()
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
		} else if (key === 'status') {
			formData[key] = 1
		} else if (typeof formData[key] === 'number') {
			formData[key] = null
		} else {
			formData[key] = ''
		}
	})
	deptList.value = []
	userList.value = []
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

// 加载数据
const loadData = (data) => {
	resetForm()
	if (data) {
		// 基本信息
		formData.id = data.id
		formData.equipId = data.equipId
		formData.equipName = data.equipName || ''
		formData.equipCode = data.equipCode || ''
		formData.faultFindTime = data.faultFindTime || ''
		formData.emergencyLevel = data.emergencyLevel || '0'
		formData.maintTypeCode = data.maintTypeCode || ''
		formData.maintTypeName = data.maintTypeName || ''
		formData.isStopped = data.isStopped !== undefined ? data.isStopped : 0
		formData.faultDesc = data.faultDesc || ''
		formData.reportTypeCode = data.reportTypeCode || '1'
		formData.reportTypeName = data.reportTypeName || '日常维修'
		
		// 派工信息
		formData.dispatchTypeCode = data.dispatchTypeCode || ''
		formData.dispatchTypeName = data.dispatchTypeName || ''
		formData.maintOrgId = data.maintOrgId
		formData.maintOrgName = data.maintOrgName || ''
		formData.maintLeaderId = data.maintLeaderId
		formData.maintLeaderName = data.maintLeaderName || ''
		formData.status = data.status || 0
		
		// 如果维修类型代码存在但名称为空，设置名称
		if (formData.maintTypeCode && !formData.maintTypeName) {
			const typeMap = {
				'1': '计划维修',
				'2': '应急维修'
			}
			formData.maintTypeName = typeMap[formData.maintTypeCode] || ''
		}
		
		// 如果有派工类型，加载对应的部门列表
		if (formData.dispatchTypeCode) {
			nextTick(() => {
				loadDeptList()
				// 如果有承修单位，加载对应的用户列表
				if (formData.maintOrgId) {
					setTimeout(() => {
						loadUserList(formData.maintOrgId)
					}, 300)
				}
			})
		}
	}
}

onMounted(() => {
	// 初始化
})

// 暴露方法给父组件
defineExpose({
	resetForm,
	validate,
	formData,
	loadData,
	loadDeptList,
	loadUserList,
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/formData.scss';
</style>

