<template>
	<div class="equipment-allocate-index">
		<BaseTable
			ref="baseTableRef"
			:showSearchHeader="false"
			:tableData="tableData"
			:tableColumns="tableColumns"
			name="equipmentAllocateTable"
			:loading="loading"
			:total="pagination.total"
			:pageSize="pagination.size"
			:currentPage="pagination.current"
			:searchClick="handleSearchClick"
			tableHeight="tabTableHeight"
			:minHeight="200"
		/>

		<el-drawer v-model="open" :title="title" size="70%" :before-close="handleClose">
			<operation ref="operationRef" :readonly="isReadonly" :mode="detailMode" @saved="handleSaved" />
			<template #footer>
				<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
					<el-button @click="handleClose">关闭</el-button>
					<el-button v-if="!isReadonly && detailMode === 'add'" type="primary" @click="handleAddSubmit" v-hasPermi="['equipment:equipAllocate:add']">
						提交
					</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="equipmentAllocateIndex">
import { ref, reactive, getCurrentInstance, nextTick, watch, onMounted, h } from 'vue'
import { ElButton, ElTag, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import BaseTable from '@/components/BaseTable/index.vue'
import operation from './operation.vue'
import DropDown from '@/components/DropDown/newIndex'
import api from '@/api/equipment/equipmentChangeApply/equipmentAllocate'
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'

const props = defineProps({
	searchParams: {
		type: Object,
		default: () => ({})
	}
})

const emit = defineEmits(['showDrawer'])

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const { startProcess, loading: processLoading } = useProcessStarter()

const baseTableRef = ref()
const operationRef = ref()

const title = ref('')
const open = ref(false)
const isReadonly = ref(false)
const detailMode = ref('add')

const tableData = ref([])
const loading = ref(false)

const pagination = reactive({
	current: 1,
	size: 20,
	total: 0
})

const currentSearchParams = ref({
	allocateCode: '',
	title: '',
	toCompanyId: null,
	toOrgId: null,
	processStatus: null
})

// 表格列配置
const tableColumns = ref([
	{
		label: '序号',
		type: 'seq',
		width: 60,
		align: 'center',
		fixed: 'left'
	},
	{
		prop: 'allocateCode',
		label: '申请单号',
		align: 'center',
		width: 130,
		fixed: 'left'
	},
	{
		prop: 'title',
		label: '标题',
		align: 'center',
		minWidth: 160
	},
	{
		prop: 'toCompanyName',
		label: '调入单位',
		align: 'left',
		minWidth: 150
	},
	{
		prop: 'toOrgName',
		label: '调入部门',
		align: 'left',
		minWidth: 150
	},
	{
		prop: 'applyUserName',
		label: '申请人',
		align: 'left',
		width: 100
	},
	{
		prop: 'processStatus',
		label: '审批状态',
		align: 'center',
		width: 120,
		render: (row) => {
			const statusMap = {
				0: { label: '未发起', type: 'info' },
				1: { label: '审批中', type: 'warning' },
				2: { label: '审批通过', type: 'success' },
				3: { label: '审批不通过', type: 'danger' },
				4: { label: '已办结', type: 'success' },
				5: { label: '作废', type: 'danger' },
			}
			const status = statusMap[row.processStatus] || { label: '未知', type: 'info' }
			return h(ElTag, { type: status.type}, () => status.label)
		}
	},
	{
		prop: 'allocateTime',
		label: '调拨时间',
		align: 'center',
		width: 160
	},
	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: (row) => {
			const dropDownList = [
				{
					name: '查看',
					command: '查看',
					type: 'primary',
					icon: 'View',
					click: () => openDrawer('view', row),
					permission: 'equipment:equipAllocate:query',
					vif: true
				},
				{
					name: '发起',
					command: '发起',
					type: 'primary',
					icon: 'Promotion',
					click: () => handleInitiate(row),
					permission: 'bpm:equipment:controller:submitEquipAllocate',
					vif: row.processStatus == 0 || row.processStatus == null
				},
				{
					name: '审批历史',
					command: '审批历史',
					type: 'primary',
					icon: 'Histogram',
					permission: 'equipment:equipAllocate:history',
					click: () => handleHistory(row),
					vif: row.processStatus != 0 && row.processStatus != null
				},
				{
					name: '删除',
					command: '删除',
					type: 'danger',
					icon: 'Delete',
					click: () => handleDelete(row),
					permission: 'equipment:equipAllocate:delete',
					vif: row.processStatus == 0 || row.processStatus == null
				},
			]
			return [
				h(DropDown, {
					dropDownList,
				}),
			]
		}
	}
])

const getList = (params = {}) => {
	loading.value = true
	const requestParams = {
		startPage: pagination.current,
		pageSize: pagination.size,
		...currentSearchParams.value,
		...params
	}
	api.getList(requestParams).then(res => {
		loading.value = false
		if (res.code == '0000') {
			tableData.value = res.data.pages || []
			pagination.total = res.data.totalNum || 0
		} else {
			proxy.$message.error(res.msg)
		}
	}).catch(() => {
		loading.value = false
	})
}

const handleSearchClick = (params) => {
	// BaseTable 返回的分页参数包含 startPage 和 pageSize
	if (params) {
		pagination.current = params.startPage || 1
		pagination.size = params.pageSize || 20
	}
	getList()
}

const openDrawer = (mode = 'add', data = null) => {
	detailMode.value = mode
	if (mode === 'view' && data) {
		title.value = '查看设备调拨申请'
		isReadonly.value = true
		nextTick(() => {
			operationRef.value.resetForm()
			loadDetail(data.id)
		})
	} else if (mode === 'add') {
		title.value = '新增设备调拨申请'
		isReadonly.value = false
		nextTick(() => {
			operationRef.value.resetForm()
		})
	}
	open.value = true
}

const loadDetail = id => {
	api.getDetail(id).then(res => {
		if (res.code == '0000') {
			const data = res.data
			operationRef.value.loadDetailData(data)
			if (data.equipList && data.equipList.length > 0) {
				operationRef.value.selectedEquipList = data.equipList.map(item => {
					try {
						return typeof item.lastChangeInfo === 'string' ? JSON.parse(item.lastChangeInfo) : item
					} catch (e) {
						return item
					}
				})
			}
		} else {
			proxy.$message.error(res.msg)
		}
	})
}

/** 发起审批回调 */
const submitEquipAllocateCallback = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return api.submitEquipAllocate(params)
}

/** 发起审批 */
const handleInitiate = (row) => {
	api.getDetail(row.id).then(res => {
		if (res.code === '0000' && res.data) {
			startProcess({
				rowData: res.data,
				businessId: route.meta?.menuId,
				businessTypeCode: 'bpm:equipment:controller:submitEquipAllocate',
				businessSubmit: submitEquipAllocateCallback,
				onSuccess() {
					proxy.$modal.msgSuccess('发起成功')
					getList()
				},
				onError(err) {
					proxy.$modal.msgError(err.message || '发起失败')
				}
			})
		}
	})
}

/** 审批历史 */
const handleHistory = (row) => {
	if (!row.procInstId) {
		proxy.$message.warning('暂无审批历史')
		return
	}
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.procInstId,
		},
	})
}

const handleDelete = (row) => {
	ElMessageBox.confirm('是否确定删除该条调拨申请数据？', '提示', {
		type: 'warning',
	}).then(() => {
		api.delete(row.id).then(res => {
			if (res.code === '0000') {
				proxy.$message.success('删除成功')
				getList()
			} else {
				proxy.$message.error(res.msg || '删除失败')
			}
		})
	}).catch(() => {})
}

const generateUniqueId = () => {
	const timestamp = Date.now().toString(36)
	const random = Math.random().toString(36).substr(2, 5)
	return timestamp + random
}

const handleAddSubmit = async () => {
	if (await operationRef.value.validate()) {
		proxy.$modal.confirm('确定提交该调拨申请？').then(() => {
			const submitData = {
				...operationRef.value.baseForm,
				equipList: operationRef.value.selectedEquipList.map((equip) => ({
					equipId: equip.id || equip.equipId,
					lastChangeInfo: JSON.stringify(equip)
				}))
			}
			api.create(submitData).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList()
					open.value = false
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
	}
}

const handleSaved = () => {
	getList()
	open.value = false
}

const handleClose = () => {
	open.value = false
}

// 监听 searchParams 变化，但只在初始加载时自动搜索
const isFirstLoad = ref(true)
watch(() => props.searchParams, (newParams) => {
	if (newParams) {
		currentSearchParams.value = { ...newParams }
		if (isFirstLoad.value) {
			pagination.current = 1
			getList()
			isFirstLoad.value = false
		}
	}
}, { deep: true, immediate: true })

onMounted(() => {
	// 初始加载已在 watch 中处理
})

defineExpose({
	getList,
	openDrawer
})
</script>

<style scoped lang="scss">
.equipment-allocate-index {
	padding: 0;
	height: 100%;
	display: flex;
	flex-direction: column;
}
</style>
