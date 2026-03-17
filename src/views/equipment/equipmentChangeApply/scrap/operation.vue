<template>
	<div class="equipment-scrap-operation">
		<el-form
			ref="baseFormRef"
			:model="baseForm"
			:rules="baseFormRules"
			:disabled="readonly"
			label-width="120px"
		>
			<el-row>
				<el-col :span="12">
					<el-form-item label="使用单位" prop="useCompanyId">
					<el-select
						v-model="baseForm.useCompanyId"
						placeholder="请选择使用单位"
						clearable
						filterable
						:disabled="readonly"
						@change="handleCompanyChange"
					>
							<el-option
								v-for="item in companyList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="使用部门" prop="useOrgId">
					<el-select
						v-model="baseForm.useOrgId"
						placeholder="请选择使用部门"
						clearable
						filterable
						:disabled="readonly || !baseForm.useCompanyId"
						@change="handleDeptChange"
					>
							<el-option
								v-for="item in deptList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="24">
					<el-form-item label="申请原因" prop="applyReason">
						<el-input
							v-model="baseForm.applyReason"
							type="textarea"
							:rows="4"
							placeholder="请输入申请原因"
							maxlength="225"
							show-word-limit
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>

		<el-card header="设备列表" style="margin-top: 20px">
			<!-- 非只读模式下显示添加按钮 -->
			<div v-if="!readonly" class="equip-actions" style="margin-bottom: 15px">
				<el-button type="primary" icon="Plus" @click="handleShowEquipSelect" :disabled="!baseForm.useOrgId">
					添加设备
				</el-button>
				<span v-if="!baseForm.useOrgId" style="color: var(--el-color-warning); margin-left: 10px">
					请先选择使用部门
				</span>
			</div>

			<el-table :data="selectedEquipList" border style="width: 100%">
				<el-table-column type="index" label="序号" width="60" align="center" />
				<el-table-column label="使用单位" prop="useCompanyName" min-width="120" />
				<el-table-column label="使用部门" prop="useOrgName" min-width="120" />
				<el-table-column label="设备名称" prop="equipName" min-width="120" />
				<el-table-column label="设备编号" prop="equipCode" min-width="120" />
				<el-table-column label="设备小类" prop="equipSmallCategoryName" min-width="100" />
				<el-table-column label="原值（元）" prop="price" width="120" align="right">
					<template #default="{ row }">
						{{ row.price ? Number(row.price).toFixed(2) : '-' }}
					</template>
				</el-table-column>
				<el-table-column label="净值（元）" prop="netValue" width="120" align="right">
					<template #default="{ row }">
						{{ row.netValue ? Number(row.netValue).toFixed(2) : '-' }}
					</template>
				</el-table-column>
				<!-- 非只读模式下显示操作列 -->
				<el-table-column v-if="!readonly" label="操作" width="80" align="center" fixed="right">
					<template #default="{ $index }">
						<el-button type="danger" link @click="handleDeleteEquip($index)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-empty v-if="selectedEquipList.length === 0" :description="readonly ? '暂无设备' : '暂无设备，请点击上方按钮添加设备'" />
		</el-card>

		<el-dialog
			v-model="dialogVisible"
			title="选择设备"
			width="88%"
			top="5vh"
			:close-on-click-modal="false"
			@close="handleDialogClose"
		>
			<!-- 搜索条件 -->
			<el-form :model="equipSearchForm" :inline="true" label-width="70px">
				<el-form-item label="设备名称" prop="equipName">
					<el-input v-model="equipSearchForm.equipName" placeholder="请输入设备名称" clearable @keyup.enter="loadEquipList" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="Search" @click="loadEquipList">查询</el-button>
				</el-form-item>
			</el-form>

			<!-- 左右布局 -->
			<div class="dialog-content">
				<!-- 左边：待添加设备 -->
				<div class="left-table">
					<el-table :data="equipList" border height="50vh" v-loading="equipLoading">
						<el-table-column type="index" label="序号" width="50" align="center" />
						<el-table-column label="使用单位" prop="useCompanyName" min-width="120" />
						<el-table-column label="使用部门" prop="useOrgName" min-width="120" />
						<el-table-column label="设备名称" prop="equipName" min-width="120" />
						<el-table-column label="设备编号" prop="equipCode" min-width="120" />
						<el-table-column label="设备小类" prop="equipSmallCategoryName" min-width="100" />
						<el-table-column label="原值（元）" prop="price" width="120" align="right">
							<template #default="{ row }">
								{{ row.price ? Number(row.price).toFixed(2) : '-' }}
							</template>
						</el-table-column>
						<el-table-column label="净值（元）" prop="netValue" width="120" align="right">
							<template #default="{ row }">
								{{ row.netValue ? Number(row.netValue).toFixed(2) : '-' }}
							</template>
						</el-table-column>
						<el-table-column label="操作" width="80" align="center" fixed="right">
							<template #default="{ row }">
								<el-button type="primary" link icon="Plus" @click="handleAddToPreSelect(row)" title="添加" />
							</template>
						</el-table-column>
					</el-table>
					<el-pagination
						v-model:current-page="equipPagination.current"
						v-model:page-size="equipPagination.size"
						:page-sizes="[10, 20, 50, 100]"
						:total="equipPagination.total"
						layout="total, sizes, prev, pager, next, jumper"
						@current-change="handleEquipPageChange"
						@size-change="handleEquipSizeChange"
						style="margin-top: 10px"
					/>
				</div>

				<!-- 右边：已添加设备 -->
				<div class="right-table">
					<div class="right-table-header">已添加设备</div>
					<el-table :data="preSelectedEquipList" border height="50vh">
						<el-table-column label="设备名称" prop="equipName" min-width="120" />
						<el-table-column label="操作" width="60" align="center">
							<template #default="{ $index }">
								<el-button type="danger" link icon="Minus" @click="handleRemoveFromPreSelect($index)" title="移除" />
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>

			<template #footer>
				<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px">
					<el-button @click="handleDialogClose">取消</el-button>
					<el-button type="primary" @click="handleConfirmEquip">确定</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="equipmentScrapOperation">
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
import { formatDate } from '@/utils'
import api from '@/api/equipment/equipmentChangeApply/equipmentScrap'
import { getListByLevel, getListByParentId } from '@/api/system/dept'

const props = defineProps({
	readonly: {
		type: Boolean,
		default: false
	},
	mode: {
		type: String,
		default: 'add'
	}
})

const emit = defineEmits(['saved'])

const { proxy } = getCurrentInstance()

const baseFormRef = ref()

const baseForm = reactive({
	id: null,
	scrapCode: '',
	title: '',
	useCompanyId: null,
	useCompanyName: '',
	useOrgId: null,
	useOrgName: '',
	applyUserId: null,
	applyUserName: '',
	applyReason: '',
	status: 1
})

const baseFormRules = {
	useCompanyId: [
		{ required: true, message: '请选择使用单位', trigger: 'change' }
	],
	useOrgId: [
		{ required: true, message: '请选择使用部门', trigger: 'change' }
	],
	applyReason: [
		{ required: true, message: '请输入申请原因', trigger: 'blur' },
		{ min: 1, max: 225, message: '申请原因长度在1-225字符之间', trigger: 'blur' }
	]
}

const selectedEquipList = ref([])

const dialogVisible = ref(false)
const equipSearchForm = reactive({
	equipName: ''
})

const equipList = ref([])
const equipLoading = ref(false)
const preSelectedEquipList = ref([]) // 预选中设备列表（弹窗中已添加但未确认）

const equipPagination = reactive({
	current: 1,
	size: 20,
	total: 0
})

const companyList = ref([])
const deptList = ref([])

// 加载公司列表（DEPT_LEVEL=1）
const loadCompanyList = () => {
	getListByLevel(1).then(res => {
		if (res.code == '0000') {
			companyList.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id
			}))
		}
	})
}

// 加载部门列表（根据公司ID）
const loadDeptList = (companyId) => {
	if (!companyId) {
		deptList.value = []
		return
	}
	getListByParentId(companyId).then(res => {
		if (res.code == '0000') {
			deptList.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id
			}))
		}
	})
}

// 处理公司选择变化
const handleCompanyChange = (value) => {
	// 清空部门和已选设备
	baseForm.useOrgId = null
	baseForm.useOrgName = ''
	selectedEquipList.value = []

	if (value) {
		const selectedCompany = companyList.value.find(item => item.value === value)
		if (selectedCompany) {
			baseForm.useCompanyName = selectedCompany.label
		}
		loadDeptList(value)
	} else {
		baseForm.useCompanyName = ''
		deptList.value = []
	}
}

// 处理部门选择变化
const handleDeptChange = (value) => {
	if (value) {
		const selectedDept = deptList.value.find(item => item.value === value)
		if (selectedDept) {
			baseForm.useOrgName = selectedDept.label
		}
		// 清空已选设备，因为部门变了
		selectedEquipList.value = []
	} else {
		baseForm.useOrgName = ''
	}
}

// 获取当前用户信息（仅用于设置申请人）
const getCurrentUserInfo = () => {
	const userInfoStr = localStorage.getItem('userInfo')
	if (userInfoStr) {
		try {
			const userInfo = JSON.parse(userInfoStr)
			// 设置申请人信息
			if (userInfo.userId) {
				baseForm.applyUserId = userInfo.userId
			}
			if (userInfo.userName) {
				baseForm.applyUserName = userInfo.userName
			}
		} catch (e) {
			console.error('解析用户信息失败:', e)
		}
	}
}

const handleShowEquipSelect = () => {
	if (!baseForm.useOrgId) {
		proxy.$message.warning('请先选择使用部门')
		return
	}
	dialogVisible.value = true
	// 初始化预选中列表为当前已选设备
	preSelectedEquipList.value = [...selectedEquipList.value]
	loadEquipList()
}

const loadEquipList = () => {
	equipLoading.value = true
	const params = {
		startPage: equipPagination.current,
		pageSize: equipPagination.size,
		useOrgId: baseForm.useOrgId
	}
	if (equipSearchForm.equipName) {
		params.equipName = equipSearchForm.equipName
	}
	api.selectEquip(params).then(res => {
		equipLoading.value = false
		if (res.code == '0000') {
			equipList.value = res.data.pages || []
			equipPagination.total = res.data.totalNum || 0
		} else {
			proxy.$message.error(res.msg)
		}
	}).catch(() => {
		equipLoading.value = false
	})
}

const handleEquipPageChange = (current) => {
	equipPagination.current = current
	loadEquipList()
}

const handleEquipSizeChange = (size) => {
	equipPagination.size = size
	equipPagination.current = 1
	loadEquipList()
}

// 添加到预选中列表
const handleAddToPreSelect = (row) => {
	const equipId = row.equipId || row.id
	const isExist = preSelectedEquipList.value.some(item => (item.equipId || item.id) === equipId)
	if (isExist) {
		proxy.$message.warning('该设备已添加')
		return
	}
	preSelectedEquipList.value.push(row)
	proxy.$message.success('添加成功')
}

// 从预选中列表移除
const handleRemoveFromPreSelect = (index) => {
	preSelectedEquipList.value.splice(index, 1)
}

const handleConfirmEquip = () => {
	if (preSelectedEquipList.value.length === 0) {
		proxy.$message.warning('请至少添加一台设备')
		return
	}

	selectedEquipList.value = [...preSelectedEquipList.value]
	dialogVisible.value = false
	preSelectedEquipList.value = []
	equipSearchForm.equipName = ''
}

const handleDialogClose = () => {
	dialogVisible.value = false
	preSelectedEquipList.value = []
	equipSearchForm.equipName = ''
}

const handleDeleteEquip = (index) => {
	selectedEquipList.value.splice(index, 1)
}

const validate = async () => {
	if (selectedEquipList.value.length === 0) {
		proxy.$message.warning('请至少添加一台设备')
		return false
	}

	try {
		await baseFormRef.value.validate()
		return true
	} catch (error) {
		return false
	}
}

const resetForm = () => {
	baseFormRef.value?.resetFields()
	Object.assign(baseForm, {
		id: null,
		scrapCode: '',
		title: '',
		useCompanyId: null,
		useCompanyName: '',
		useOrgId: null,
		useOrgName: '',
		applyUserId: null,
		applyUserName: '',
		applyReason: '',
		status: 1
	})
	selectedEquipList.value = []
	preSelectedEquipList.value = []
	deptList.value = []
	equipSearchForm.equipName = ''
	equipPagination.current = 1
}

// 加载详情数据（用于查看和编辑）
const loadDetailData = (data) => {
	console.log('loadDetailData data:', data)
	// 先加载公司列表
	loadCompanyList()

	// 如果有公司ID，先加载部门列表
	if (data.useCompanyId) {
		loadDeptList(data.useCompanyId)
	}

	// 设置表单数据
	nextTick(() => {
		Object.keys(data).forEach(key => {
			if (baseForm.hasOwnProperty(key)) {
				baseForm[key] = data[key]
			}
		})
	})
}

onMounted(() => {
	loadCompanyList()
	getCurrentUserInfo()
	if (props.mode === 'add') {
		const today = formatDate(new Date(), 'yyyyMMdd')
		baseForm.title = '报废计划-' + today
		console.log('baseForm.title:', baseForm.title)
	}
})

defineExpose({
	baseForm,
	selectedEquipList,
	validate,
	resetForm,
	loadDetailData
})
</script>

<style scoped lang="scss">
.equipment-scrap-operation {
	padding: 20px;
}

.equip-actions {
	display: flex;
	align-items: center;
}

:deep(.el-card__header) {
	padding: 12px 20px;
	font-weight: bold;
}

:deep(.el-card__body) {
	padding: 15px 20px;
}

// 弹窗左右布局样式
.dialog-content {
	display: flex;
	gap: 15px;
	margin-top: 15px;

	.left-table {
		flex: 1;
		min-width: 0;
	}

	.right-table {
		width: 260px;
		flex-shrink: 0;

		.right-table-header {
			padding: 8px 12px;
			background-color: var(--el-fill-color-light);
			border: 1px solid var(--el-border-color);
			border-bottom: none;
			font-weight: bold;
			font-size: 14px;
		}
	}
}
</style>
