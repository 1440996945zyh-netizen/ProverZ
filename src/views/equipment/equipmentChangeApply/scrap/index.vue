<template>
	<div class="equipment-scrap-index">
		<BaseTable
			ref="baseTableRef"
			:showSearchHeader="false"
			:tableData="tableData"
			:tableColumns="tableColumns"
			name="equipmentScrapTable"
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
					<el-button v-if="!isReadonly && detailMode === 'add'" type="primary" @click="handleAddSubmit" v-hasPermi="['equipment:equipScrap:add']">
						提交
					</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="equipmentScrapIndex">
import { ref, reactive, getCurrentInstance, nextTick, watch, onMounted, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import operation from './operation.vue'
import api from '@/api/equipment/equipmentChangeApply/equipmentScrap'

const props = defineProps({
	searchParams: {
		type: Object,
		default: () => ({})
	}
})

const emit = defineEmits(['showDrawer'])

const { proxy } = getCurrentInstance()

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
	scrapCode: '',
	title: '',
	useCompanyId: null,
	useOrgId: null,
	status: null
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
		prop: 'scrapCode',
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
		prop: 'useCompanyName',
		label: '使用单位',
		align: 'left',
		minWidth: 150
	},
	{
		prop: 'useOrgName',
		label: '使用部门',
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
		prop: 'status',
		label: '审批状态',
		align: 'center',
		width: 120,
		render: (row) => {
			const statusMap = {
				'1': { type: 'warning', text: '审批中' },
				'2': { type: 'success', text: '审批成功' },
				'3': { type: 'danger', text: '审批未通过' }
			}
			const status = statusMap[row.status] || { type: 'info', text: '未知' }
			return h(ElTag, { type: status.type, effect: 'dark' }, () => status.text)
		}
	},
	{
		prop: 'createTime',
		label: '创建时间',
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
			return [
				h(
					ElButton,
					{
						onClick: () => openDrawer('view', row),
						type: 'primary',
						link: true,
						icon: 'View',
						permission: 'equipment:equipScrap:query'
					},
					{ default: () => '查看' }
				)
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
		title.value = '查看设备报废申请'
		isReadonly.value = true
		nextTick(() => {
			operationRef.value.resetForm()
			loadDetail(data.id)
		})
	} else if (mode === 'add') {
		title.value = '新增设备报废申请'
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

const handleAddSubmit = async () => {
	if (await operationRef.value.validate()) {
		proxy.$modal.confirm('确定提交该报废申请？').then(() => {
			const submitData = {
				...operationRef.value.baseForm,
				title: '报废计划-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
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
.equipment-scrap-index {
	padding: 0;
	height: 100%;
	display: flex;
	flex-direction: column;
}
</style>
