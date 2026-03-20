<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="物资" prop="materialId">
				<el-input v-model="formData.materialName" placeholder="请选择物资" readonly @click="openMaterialSelect">
					<template #suffix>
						<el-icon style="cursor: pointer"><Search /></el-icon>
					</template>
				</el-input>
			</el-form-item>

			<el-form-item label="物资编码">
				<el-input v-model="formData.materialCode" disabled placeholder="自动带出" />
			</el-form-item>

			<el-form-item label="规格型号">
				<el-input v-model="formData.specificationModel" disabled placeholder="自动带出" />
			</el-form-item>

			<el-form-item label="计量单位">
				<el-input v-model="formData.unitName" disabled placeholder="自动带出" />
			</el-form-item>

			<el-form-item label="预警阈值" prop="warningThreshold">
				<el-input-number
					v-model="formData.warningThreshold"
					:min="0"
					:precision="2"
					controls-position="right"
					style="width: 100%"
					placeholder="请输入预警阈值"
				/>
			</el-form-item>

			<el-form-item label="预警接收人" prop="receivers">
				<div class="receiver-wrapper">
					<div class="selected-users">
						<el-tag
							v-for="user in selectedUsers"
							:key="user.id"
							closable
							@close="removeUser(user)"
							style="margin-right: 8px; margin-bottom: 8px"
						>
							{{ user.name }}
						</el-tag>
					</div>
					<el-button type="primary" link @click="openUserSelect">
						<el-icon><Plus /></el-icon>
						选择人员
					</el-button>
				</div>
			</el-form-item>

			<el-form-item label="状态" prop="status">
				<el-radio-group v-model="formData.status">
					<el-radio label="1">启用</el-radio>
					<el-radio label="0">禁用</el-radio>
				</el-radio-group>
			</el-form-item>
		</el-form>

		<el-dialog v-model="materialDialogVisible" title="选择物资" width="800px" append-to-body>
			<el-form :inline="true" :model="materialQueryParams" style="margin-bottom: 16px">
				<el-form-item label="物资名称">
					<el-input v-model="materialQueryParams.materialName" placeholder="请输入物资名称" clearable />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="getMaterialList">查询</el-button>
					<el-button @click="resetMaterialQuery">重置</el-button>
				</el-form-item>
			</el-form>
			<el-table
				:data="materialTableData"
				v-loading="materialLoading"
				highlight-current-row
				@current-change="handleMaterialCurrentChange"
				style="width: 100%"
				max-height="400"
			>
				<el-table-column type="index" width="50" label="序号" align="center" />
				<el-table-column prop="materialCode" label="物资编码" min-width="150" show-overflow-tooltip />
				<el-table-column prop="materialName" label="物资名称" min-width="180" show-overflow-tooltip />
				<el-table-column prop="specificationModel" label="规格型号" min-width="150" show-overflow-tooltip />
				<el-table-column prop="unitName" label="计量单位" width="100" align="center" />
			</el-table>
			<el-pagination
				v-model:current-page="materialQueryParams.startPage"
				v-model:page-size="materialQueryParams.pageSize"
				:page-sizes="[10, 20, 50]"
				:total="materialTotal"
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="getMaterialList"
				@current-change="getMaterialList"
				style="margin-top: 16px; justify-content: flex-end"
			/>
			<template #footer>
				<el-button @click="materialDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmMaterialSelect">确定</el-button>
			</template>
		</el-dialog>

		<UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
	</div>
</template>

<script setup name="materialWarningConfigDetail">
import { ref, reactive, toRefs, getCurrentInstance } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import UserSelectForm from '@/components/UserSelectForm/index.vue'
import materialCodeApi from '@/api/equipment/materialCode/index'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const userSelectFormRef = ref()
const selectedUsers = ref([])

const materialDialogVisible = ref(false)
const materialLoading = ref(false)
const materialTableData = ref([])
const materialTotal = ref(0)
const currentMaterialRow = ref(null)

const materialQueryParams = ref({
	startPage: 1,
	pageSize: 10,
	materialName: '',
})

const data = reactive({
	formData: {
		id: null,
		materialId: null,
		materialName: '',
		materialCode: '',
		specificationModel: '',
		unitName: '',
		warningThreshold: null,
		receivers: '',
		receiverNames: '',
		status: '1',
	},
})
const { formData } = toRefs(data)

const rules = reactive({
	materialId: proxy.getRules({ required: true, message: '请选择物资' }),
	warningThreshold: proxy.getRules({ required: true, message: '请输入预警阈值' }),
	status: proxy.getRules({ required: true }),
})

const openMaterialSelect = () => {
	materialDialogVisible.value = true
	getMaterialList()
}

const getMaterialList = () => {
	materialLoading.value = true
	materialCodeApi.getList(materialQueryParams.value).then(res => {
		materialLoading.value = false
		if (res.code === '0000') {
			materialTableData.value = res.data.pages || []
			materialTotal.value = res.data.totalNum || 0
		}
	})
}

const resetMaterialQuery = () => {
	materialQueryParams.value.materialName = ''
	materialQueryParams.value.startPage = 1
	getMaterialList()
}

const handleMaterialCurrentChange = row => {
	currentMaterialRow.value = row
}

const confirmMaterialSelect = () => {
	if (!currentMaterialRow.value) {
		proxy.$message.warning('请选择物资')
		return
	}
	formData.value.materialId = currentMaterialRow.value.id
	formData.value.materialName = currentMaterialRow.value.materialName
	formData.value.materialCode = currentMaterialRow.value.materialCode
	formData.value.specificationModel = currentMaterialRow.value.specificationModel || ''
	formData.value.unitName = currentMaterialRow.value.unitName || ''
	materialDialogVisible.value = false
}

const openUserSelect = () => {
	userSelectFormRef.value.open(formData.value.id, selectedUsers.value)
}

const handleUserSelectConfirm = (activityId, userList) => {
	selectedUsers.value = userList || []
	updateReceivers()
}

const removeUser = user => {
	selectedUsers.value = selectedUsers.value.filter(item => item.id !== user.id)
	updateReceivers()
}

const updateReceivers = () => {
	formData.value.receivers = selectedUsers.value.map(item => item.id).join(',')
	formData.value.receiverNames = selectedUsers.value.map(item => item.name).join(',')
}

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		}
	})
	return flag
}

const resetForm = () => {
	formData.value.id = null
	formData.value.materialId = null
	formData.value.materialName = ''
	formData.value.materialCode = ''
	formData.value.specificationModel = ''
	formData.value.unitName = ''
	formData.value.warningThreshold = null
	formData.value.receivers = ''
	formData.value.receiverNames = ''
	formData.value.status = '1'
	selectedUsers.value = []
	ruleForm.value?.clearValidate()
}

defineExpose({
	validate,
	resetForm,
	formData,
	selectedUsers,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';

.receiver-wrapper {
	width: 100%;
	.selected-users {
		min-height: 32px;
		margin-bottom: 8px;
	}
}
</style>
