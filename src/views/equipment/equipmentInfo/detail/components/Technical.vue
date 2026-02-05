<template>
	<div class="technical">
		<!-- 查询条件 -->
		<div class="search-header">
			<div class="search-form">
				<el-form :inline="true" :model="searchForm" class="demo-form-inline">
					<el-form-item label="资料名称">
						<el-input
							v-model="searchForm.fileTableName"
							placeholder="请输入资料名称"
							style="width: 200px"
							clearable
						/>
					</el-form-item>
					<el-form-item label="资料类型">
						<Select
							:dataConfig="{ url: '/api/internal/public/getDictListByType/FILE_TYPE' }"
							v-model:value="searchForm.dataTypeCode"
							v-model:label="searchForm.dataTypeName"
							placeholder="请选择资料类型"
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
			name="equipmentTechnical"
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

<script setup name="Technical">
import { ref, reactive, onMounted, getCurrentInstance, h, nextTick, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Select from '@/components/Select'
import eqptFileApi from '@/api/equipment/eqptFile/index'
import publicApi from '@/api/public/index'

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
	fileTableName: '',
	dataTypeCode: '',
	dataTypeName: '',
})

// 表格列定义
const tableColumns = ref([
	{ label: '设备小类名称', prop: 'equipSmallCategoryName', align: 'left', minWidth: 150 },
	{ label: '规格', prop: 'specificCode', align: 'left', width: 120 },
	{ label: '型号', prop: 'modelNumber', align: 'left', width: 120 },
	{ label: '制造厂家', prop: 'manufacturer', align: 'left', minWidth: 150 },
	{ label: '资料类型', prop: 'dataTypeName', align: 'left', minWidth: 150 },
	{ label: '资料名称', prop: 'fileTableName', align: 'left', width: 180 },
	{ label: '创建人', prop: 'createByName', align: 'center', width: 120 },
	{
		label: '创建时间',
		prop: 'createTime',
		align: 'center',
		width: 160,
		formatter: ({ cellValue }) => {
			if (!cellValue) return ''
			const date = new Date(cellValue)
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hours = String(date.getHours()).padStart(2, '0')
			const minutes = String(date.getMinutes()).padStart(2, '0')
			return `${year}-${month}-${day} ${hours}:${minutes}`
		},
	},
	{ label: '备注', prop: 'remark', align: 'left', minWidth: 150 },
	{
		label: '操作',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: (params) => {
			const row = params.row || params
			return [
				h(
					ElButton,
					{
						link: true,
						type: 'primary',
						icon: 'Download',
						onClick: () => handleDownload(row),
					},
					{ default: () => '下载' }
				),
			]
		},
	},
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
			fileTableName: searchForm.fileTableName || undefined,
			dataTypeCode: searchForm.dataTypeCode || undefined,
			startPage: queryParams.value.startPage,
			pageSize: queryParams.value.pageSize,
		}

		const res = await eqptFileApi.getList(params)
		if (res.code === '0000') {
			tableData.value = res.data.pages || []
			total.value = res.data.totalNum || 0
		} else {
			proxy.$message.error(res.msg || '查询失败')
			tableData.value = []
			total.value = 0
		}
	} catch (error) {
		console.error('查询技术资料失败:', error)
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

// 下载
const handleDownload = async (row) => {
	if (!row.fileTableId) {
		proxy.$message.warning('该记录没有关联文件')
		return
	}

	try {
		const res = await publicApi.down(row.fileTableId)
		const content = res.data
		const blob = new Blob([content])
		const link = document.createElement('a')
		link.download = row.fileTableName || '文件'
		link.style.display = 'none'
		link.href = URL.createObjectURL(blob)
		document.body.appendChild(link)
		link.click()
		URL.revokeObjectURL(link.href)
		document.body.removeChild(link)
		proxy.$message.success('下载成功')
	} catch (error) {
		console.error('下载文件失败:', error)
		proxy.$message.error('下载失败')
	}
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
	(newId) => {
		if (newId) {
			queryParams.value.startPage = 1
			loadData()
		} else {
			tableData.value = []
			total.value = 0
		}
	},
	{ immediate: true }
)

onMounted(() => {
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
.technical {
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
