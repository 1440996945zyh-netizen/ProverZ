<template>
	<div class="spare">
		<!-- 查询条件 -->
		<div class="search-header">
			<div class="search-form">
				<el-form :inline="true" :model="searchForm" class="demo-form-inline">
					<el-form-item label="物资名称">
						<el-input
							v-model="searchForm.materialName"
							placeholder="请输入物资名称"
							style="width: 200px"
							clearable
						/>
					</el-form-item>
					<el-form-item label="仓库名">
						<el-input
							v-model="searchForm.warehouseName"
							placeholder="请输入仓库名"
							style="width: 200px"
							clearable
						/>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>

		<!-- 表格 -->
		<BaseTable
			ref="baseTableRef"
			name="equipmentSpare"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:loading="loading"
			:total="total"
			:queryParams="queryParams"
			@pageChange="handlePageChange"
			:showSearchHeader="false"
			:showToolBar="false"
			:showPagination="true"
			:tableHeight="tableHeight"
		/>
	</div>
</template>

<script setup name="Spare">
import { ref, reactive, onMounted, getCurrentInstance, nextTick, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import BaseTable from '@/components/BaseTable/index.vue'
import equipmentInfoApi from '@/api/equipment/equipmentInfo/index'

const props = defineProps({
	equipId: {
		type: [Number, String],
		default: null,
	},
})

const { proxy } = getCurrentInstance()
const tableHeight = reactive(window.innerHeight - 340)

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const baseTableRef = ref(null)

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})

const searchForm = reactive({
	materialName: '',
	warehouseName: '',
})

// 表格列定义
const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center' },
	{ label: '仓库名', prop: 'warehouseName', align: 'left', width: 120 },
	{ label: '物资编码', prop: 'materialCode', align: 'left', width: 150 },
	{ label: '物资名称', prop: 'materialName', align: 'left', minWidth: 150 },
	{ label: '物资类别名', prop: 'categoryName', align: 'left', minWidth: 200 },
	{ label: '规格型号', prop: 'specification', align: 'left', width: 150 },
	{ label: '可使用库存', prop: 'availableStock', align: 'center', width: 120 },
	{ label: '品牌', prop: 'brand', align: 'left', width: 120 },
	{ label: '计量单位', prop: 'unit', align: 'center', width: 100 },
])

// 查询列表
const loadData = async () => {
	if (!props.equipId) {
		tableData.value = []
		total.value = 0
		return
	}

	loading.value = true
	try {
		const params = {
			equipId: props.equipId,
			materialName: searchForm.materialName || null,
			warehouseName: searchForm.warehouseName || null,
		}
		const res = await equipmentInfoApi.getSpareList(params)
		if (res.code === '0000' && res.data) {
			tableData.value = res.data || []
			total.value = res.data.length || 0
		} else {
			tableData.value = []
			total.value = 0
		}
	} catch (error) {
		console.error('加载备品备件数据失败:', error)
		proxy.$message.error('加载备品备件数据失败')
		tableData.value = []
		total.value = 0
	} finally {
		loading.value = false
		// 数据加载后，延迟刷新表格以确保表头正确渲染
		nextTick(() => {
			setTimeout(() => {
				if (baseTableRef.value) {
					// 如果 BaseTable 暴露了 xTable，直接调用 refreshColumn
					if (baseTableRef.value.xTable && baseTableRef.value.xTable.value) {
						baseTableRef.value.xTable.value.refreshColumn()
					} else if (baseTableRef.value.resetColEvent) {
						// 备用方案：使用 resetColEvent
						baseTableRef.value.resetColEvent()
					}
				}
			}, 150)
		})
	}
}

// 查询
const handleSearch = () => {
	queryParams.value.startPage = 1
	loadData()
}

// 分页改变
const handlePageChange = (params) => {
	queryParams.value.startPage = params.startPage
	queryParams.value.pageSize = params.pageSize
	loadData()
}

// 刷新表头
const refreshTableHeader = () => {
	nextTick(() => {
		setTimeout(() => {
			if (baseTableRef.value) {
				// 如果 BaseTable 暴露了 xTable，直接调用 refreshColumn
				if (baseTableRef.value.xTable && baseTableRef.value.xTable.value) {
					try {
						baseTableRef.value.xTable.value.refreshColumn()
					} catch (error) {
						console.warn('刷新表头失败:', error)
					}
				} else if (baseTableRef.value.resetColEvent) {
					// 备用方案：使用 resetColEvent
					try {
						baseTableRef.value.resetColEvent()
					} catch (error) {
						console.warn('重置列失败:', error)
					}
				}
			}
		}, 200)
	})
}

// 监听equipId变化，重新加载数据
watch(
	() => props.equipId,
	(newEquipId, oldEquipId) => {
		if (newEquipId && newEquipId !== oldEquipId) {
			loadData()
		} else if (!newEquipId) {
			tableData.value = []
			total.value = 0
		}
	},
	{ immediate: true }
)

onMounted(() => {
	// 如果有设备ID，加载数据
	if (props.equipId) {
		loadData()
	}
	// 组件挂载后，延迟刷新表格以确保表头正确渲染
	nextTick(() => {
		setTimeout(() => {
			if (baseTableRef.value && baseTableRef.value.xTable && baseTableRef.value.xTable.value) {
				baseTableRef.value.xTable.value.refreshColumn()
			}
		}, 200)
	})
})

defineExpose({
	loadData,
	refreshTableHeader,
})
</script>

<style scoped lang="scss">
.spare {
	padding: 20px;

	.search-header {
		background: #fff;
		padding: 15px;
		margin-bottom: 10px;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);

		.search-form {
			:deep(.el-form-item) {
				margin-bottom: 0;
			}
		}
	}
}
</style>
