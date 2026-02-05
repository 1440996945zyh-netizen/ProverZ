<template>
	<div class="indicator">
		<!-- 查询条件 -->
		<div class="search-header">
			<div class="search-form">
				<el-form :inline="true" :model="searchForm" class="demo-form-inline">
					<el-form-item label="年份">
						<el-date-picker
							v-model="searchForm.year"
							type="year"
							placeholder="选择年份"
							value-format="YYYY"
							style="width: 150px"
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
			name="equipmentIndicator"
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

<script setup name="Indicator">
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
	year: new Date().getFullYear().toString(),
})

// 表格列定义
const tableColumns = ref([
	{ label: '月份', prop: 'month', align: 'center', width: 100, formatter: ({ cellValue }) => cellValue ? `${cellValue}月` : '' },
	{ label: '自然时长(时)', prop: 'naturalDuration', align: 'right',  formatter: ({ cellValue }) => cellValue ? Number(cellValue).toFixed(2) : '0.00' },
	{ label: '故障时长(时)', prop: 'faultDuration', align: 'right',  formatter: ({ cellValue }) => cellValue ? Number(cellValue).toFixed(2) : '0.00' },
	{ label: '运行台时(时)', prop: 'runTime', align: 'right',  formatter: ({ cellValue }) => cellValue ? Number(cellValue).toFixed(2) : '0.00' },
	{ label: '故障率(%)', prop: 'failureRate', align: 'right',  formatter: ({ cellValue }) => cellValue ? Number(cellValue).toFixed(2) : '0.00' },
	{ label: '利用率(%)', prop: 'utilizationRate', align: 'right',  formatter: ({ cellValue }) => cellValue ? Number(cellValue).toFixed(2) : '0.00' },
	{ label: '完好率(%)', prop: 'goodRate', align: 'right',  formatter: ({ cellValue }) => cellValue ? Number(cellValue).toFixed(2) : '0.00' },
])

// 查询列表
const loadData = async () => {
	if (!props.equipId || !searchForm.year) {
		tableData.value = []
		total.value = 0
		return
	}

	loading.value = true
	try {
		const params = {
			equipId: props.equipId,
			year: searchForm.year,
		}
		const res = await equipmentInfoApi.getIndicatorByMonth(params)
		if (res.code === '0000') {
			// 确保 res.data 是数组
			const data = Array.isArray(res.data) ? res.data : []
			tableData.value = data
			total.value = data.length
		} else {
			proxy.$message.error(res.msg || '查询失败')
			tableData.value = []
			total.value = 0
		}
	} catch (error) {
		console.error('查询设备指标失败:', error)
		proxy.$message.error('查询失败')
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

// 监听equipId和年份变化，重新加载数据
watch(
	() => [props.equipId, searchForm.year],
	([newEquipId, newYear], oldValue) => {
		// 处理 immediate 执行时 oldValue 为 undefined 的情况
		const [oldEquipId, oldYear] = oldValue || [undefined, undefined]
		if (newEquipId && newYear && (newEquipId !== oldEquipId || newYear !== oldYear)) {
			loadData()
		} else if (!newEquipId || !newYear) {
			tableData.value = []
			total.value = 0
		}
	},
	{ immediate: true }
)

onMounted(() => {
	if (props.equipId && searchForm.year) {
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
.indicator {
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
