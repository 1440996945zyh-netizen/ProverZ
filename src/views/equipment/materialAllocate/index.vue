<template>
	<div class="app-container material-allocate-index">
		<el-card shadow="never" class="search-card">
			<el-form :model="searchForm" :inline="true">
				<el-form-item>
					<el-input v-model="searchForm.allocateCode" placeholder="调拨单号" clearable style="width: 160px" />
				</el-form-item>
				<el-form-item>
					<el-input v-model="searchForm.title" placeholder="标题" clearable style="width: 180px" />
				</el-form-item>
				<el-form-item>
					<el-select
						v-model="searchForm.fromCompanyId"
						placeholder="调出单位"
						clearable
						filterable
						style="width: 150px"
						@change="handleFromCompanyChange"
					>
						<el-option v-for="item in companyList" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-select
						v-model="searchForm.fromWarehouseId"
						placeholder="调出仓库"
						clearable
						filterable
						style="width: 150px"
						:disabled="!searchForm.fromCompanyId"
					>
						<el-option v-for="item in fromWarehouseOptions" :key="item.id" :label="item.warehouseName" :value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-select
						v-model="searchForm.toCompanyId"
						placeholder="调入单位"
						clearable
						filterable
						style="width: 150px"
						@change="handleToCompanyChange"
					>
						<el-option v-for="item in companyList" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-select
						v-model="searchForm.toWarehouseId"
						placeholder="调入仓库"
						clearable
						filterable
						style="width: 150px"
						:disabled="!searchForm.toCompanyId"
					>
						<el-option v-for="item in toWarehouseOptions" :key="item.id" :label="item.warehouseName" :value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-select v-model="searchForm.executeStatus" placeholder="执行状态" clearable style="width: 120px">
						<el-option label="未执行" :value="0" />
						<el-option label="执行成功" :value="1" />
						<el-option label="执行失败" :value="2" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
					<el-button icon="Refresh" @click="handleReset">重置</el-button>
					<el-divider direction="vertical" style="height: 24px; margin: 0 8px" />
				</el-form-item>
				<el-form-item style="margin-left: auto;">
					<el-button
						type="primary"
						icon="Plus"
						@click="openDrawer('add')"
						v-hasPermi="['equipment:materialAllocate:add']"
					>
						新增
					</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<BaseTable
			ref="baseTableRef"
			:showSearchHeader="false"
			:tableData="tableData"
			:tableColumns="tableColumns"
			name="materialAllocateTable"
			:loading="loading"
			:total="pagination.total"
			:pageSize="pagination.size"
			:currentPage="pagination.current"
			:searchClick="handleSearchClick"
			tableHeight="tabTableHeight"
			:minHeight="200"
		/>

		<el-drawer v-model="open" :title="title" size="75%" :before-close="handleClose">
			<operation ref="operationRef" :readonly="isReadonly" :mode="detailMode" />
			<template #footer>
				<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
					<el-button @click="handleClose">关闭</el-button>
					<el-button
						v-if="!isReadonly"
						type="primary"
						@click="handleSubmit"
						v-hasPermi="['equipment:materialAllocate:add', 'equipment:materialAllocate:update']"
					>
						保存
					</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="materialAllocateIndex">
import { ref, reactive, getCurrentInstance, nextTick, onMounted, h } from 'vue'
import { ElMessageBox, ElTag } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import BaseTable from '@/components/BaseTable/index.vue'
import DropDown from '@/components/DropDown/newIndex'
import operation from './operation.vue'
import api from '@/api/equipment/materialAllocate'
import materialWarehouseApi from '@/api/equipment/materialWarehouse'
import { getListByLevel } from '@/api/system/dept'
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const { startProcess } = useProcessStarter()

const baseTableRef = ref()
const operationRef = ref()
const open = ref(false)
const title = ref('')
const detailMode = ref('add')
const isReadonly = ref(false)
const loading = ref(false)
const tableData = ref([])
const companyList = ref([])
const warehouseList = ref([])
const fromWarehouseOptions = ref([])
const toWarehouseOptions = ref([])

const pagination = reactive({
	current: 1,
	size: 20,
	total: 0,
})

const searchForm = reactive({
	allocateCode: '',
	title: '',
	fromCompanyId: null,
	fromWarehouseId: null,
	toCompanyId: null,
	toWarehouseId: null,
	executeStatus: null,
})

const processStatusMap = {
	0: { label: '未发起', type: 'info' },
	1: { label: '审批中', type: 'warning' },
	2: { label: '审批通过', type: 'success' },
	3: { label: '审批驳回', type: 'danger' },
	4: { label: '已办结', type: 'success' },
	5: { label: '已作废', type: 'danger' },
}

const executeStatusMap = {
	0: { label: '未执行', type: 'info' },
	1: { label: '执行成功', type: 'success' },
	2: { label: '执行失败', type: 'danger' },
}

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ prop: 'allocateCode', label: '调拨单号', align: 'center', width: 150, fixed: 'left' },
	{ prop: 'title', label: '标题', align: 'left', minWidth: 180 },
	{ prop: 'fromCompanyName', label: '调出单位', align: 'left', minWidth: 140 },
	{ prop: 'fromWarehouseName', label: '调出仓库', align: 'left', minWidth: 140 },
	{ prop: 'toCompanyName', label: '调入单位', align: 'left', minWidth: 140 },
	{ prop: 'toWarehouseName', label: '调入仓库', align: 'left', minWidth: 140 },
	{
		prop: 'processStatus',
		label: '审批状态',
		align: 'center',
		width: 110,
		render: row => {
			const status = processStatusMap[row.processStatus] || { label: row.processStatusLabel || '未知', type: 'info' }
			return h(ElTag, { type: status.type }, () => status.label)
		},
	},
	{
		prop: 'executeStatus',
		label: '执行状态',
		align: 'center',
		width: 110,
		render: row => {
			const status = executeStatusMap[row.executeStatus] || { label: '未知', type: 'info' }
			return h(ElTag, { type: status.type }, () => status.label)
		},
	},
	{ prop: 'applyUserName', label: '申请人', align: 'center', width: 100 },
	{ prop: 'allocateTime', label: '调拨时间', align: 'center', width: 160 },
	{ prop: 'outWarehouseNo', label: '调出库单号', align: 'center', minWidth: 150 },
	{ prop: 'inWarehouseNo', label: '调入库单号', align: 'center', minWidth: 150 },
	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 120,
		fixed: 'right',
		render: row => {
			const canEdit = String(row.processStatus || '0') === '0' && row.executeStatus !== 1
			const dropDownList = [
				{ name: '查看', command: '查看', type: 'primary', icon: 'View', click: () => openDrawer('view', row), permission: 'equipment:materialAllocate:query', vif: true },
				{ name: '编辑', command: '编辑', type: 'primary', icon: 'Edit', click: () => openDrawer('edit', row), permission: 'equipment:materialAllocate:update', vif: canEdit },
				{ name: '发起', command: '发起', type: 'primary', icon: 'Promotion', click: () => handleInitiate(row), permission: 'bpm:equipment:controller:submitMaterialAllocate', vif: canEdit },
				{ name: '审批历史', command: '审批历史', type: 'primary', icon: 'Histogram', click: () => handleHistory(row), permission: 'equipment:materialAllocate:query', vif: String(row.processStatus || '0') !== '0' },
				{ name: '删除', command: '删除', type: 'danger', icon: 'Delete', click: () => handleDelete(row), permission: 'equipment:materialAllocate:delete', vif: canEdit },
			]
			return [h(DropDown, { dropDownList })]
		},
	},
])

/**
 * 初始化单位和仓库下拉，供搜索与表单复用
 */
const loadOptions = async () => {
	const [companyRes, warehouseRes] = await Promise.all([getListByLevel(1), materialWarehouseApi.getListForSelect()])
	if (companyRes.code === '0000') {
		companyList.value = (companyRes.data || []).map(item => ({ label: item.deptName, value: item.id }))
	}
	if (warehouseRes.code === '0000') {
		warehouseList.value = warehouseRes.data || []
		updateWarehouseOptions()
	}
}

/**
 * 根据单位刷新仓库候选项
 */
const updateWarehouseOptions = () => {
	fromWarehouseOptions.value = warehouseList.value.filter(item => item.companyId === searchForm.fromCompanyId)
	toWarehouseOptions.value = warehouseList.value.filter(item => item.companyId === searchForm.toCompanyId)
}

const handleFromCompanyChange = () => {
	searchForm.fromWarehouseId = null
	updateWarehouseOptions()
}

const handleToCompanyChange = () => {
	searchForm.toWarehouseId = null
	updateWarehouseOptions()
}

/**
 * 查询调拨列表
 */
const getList = (params = {}) => {
	loading.value = true
	api.getList({
		startPage: pagination.current,
		pageSize: pagination.size,
		...searchForm,
		...params,
	}).then(res => {
		if (res.code === '0000') {
			tableData.value = res.data.pages || []
			pagination.total = res.data.totalNum || 0
		} else {
			proxy.$message.error(res.msg || '查询失败')
		}
	}).finally(() => {
		loading.value = false
	})
}

const handleSearchClick = params => {
	if (params) {
		pagination.current = params.startPage || 1
		pagination.size = params.pageSize || 20
	}
	getList()
}

const handleSearch = () => {
	pagination.current = 1
	getList()
}

const handleReset = () => {
	searchForm.allocateCode = ''
	searchForm.title = ''
	searchForm.fromCompanyId = null
	searchForm.fromWarehouseId = null
	searchForm.toCompanyId = null
	searchForm.toWarehouseId = null
	searchForm.executeStatus = null
	updateWarehouseOptions()
	handleSearch()
}

/**
 * 打开新增、编辑、查看抽屉
 */
const openDrawer = (mode = 'add', row = null) => {
  detailMode.value = mode
	isReadonly.value = mode === 'view'
	title.value = mode === 'add' ? '新增物资调拨' : mode === 'edit' ? '编辑物资调拨' : '查看物资调拨'
	open.value = true
	nextTick(() => {
		operationRef.value.resetForm()
		if (row?.id) {
			loadDetail(row.id)
		}
	})
}

/**
 * 详情回显
 */
const loadDetail = id => {
	api.getById(id).then(res => {
		if (res.code === '0000') {
			operationRef.value.loadDetailData(res.data)
		} else {
			proxy.$message.error(res.msg || '查询详情失败')
		}
	})
}

/**
 * 保存草稿
 */
const handleSubmit = async () => {
	if (!(await operationRef.value.validate())) {
		return
	}
	const submitData = operationRef.value.buildSubmitData()
	const request = submitData.id ? api.update(submitData) : api.add(submitData)
	request.then(res => {
		if (res.code === '0000') {
			proxy.$modal.msgSuccess(res.msg || '保存成功')
			open.value = false
			getList()
		} else {
			proxy.$message.error(res.msg || '保存失败')
		}
	})
}

/**
 * 审批提交流程回调
 */
const submitMaterialAllocateCallback = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	return api.submitMaterialAllocate({
		businessDataId: rowData.id,
		variables,
		startUserSelectAssignees,
		processDefinitionId,
		businessId,
	})
}

const handleInitiate = row => {
	api.getById(row.id).then(res => {
		if (res.code !== '0000' || !res.data) {
			proxy.$modal.msgError(res.msg || '获取调拨详情失败')
			return
		}
		startProcess({
			rowData: res.data,
			businessId: route.meta?.menuId,
			businessTypeCode: 'bpm:equipment:controller:submitMaterialAllocate',
			businessSubmit: submitMaterialAllocateCallback,
			onSuccess() {
				proxy.$modal.msgSuccess('发起成功')
				getList()
			},
			onError(err) {
				proxy.$modal.msgError(err.message || '发起失败')
			},
		})
	})
}

const handleHistory = row => {
	if (!row.procInstId) {
		proxy.$message.warning('暂无审批历史')
		return
	}
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: { id: row.procInstId },
	})
}

const handleDelete = row => {
	ElMessageBox.confirm('是否确定删除该调拨单？', '提示', { type: 'warning' })
		.then(() => api.delete(row.id))
		.then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('删除成功')
				getList()
			} else {
				proxy.$modal.msgError(res.msg || '删除失败')
			}
		})
		.catch(() => {})
}

const handleClose = () => {
	open.value = false
}

onMounted(async () => {
	await loadOptions()
	getList()
})
</script>

<style scoped lang="scss">
.material-allocate-index {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 84px);
	overflow: hidden;

	.search-card {
		margin-bottom: 10px;
		flex-shrink: 0;

		:deep(.el-card__body) {
			padding: 10px 15px;
		}

		:deep(.el-form) {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 5px;
		}

		:deep(.el-form-item) {
			margin-right: 0;
			margin-bottom: 0;
		}
	}
}
</style>
