<template>
	<div class="change-log">
		<BaseTable
			ref="baseTableRef"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:loading="loading"
			:total="total"
			:queryParams="queryParams"
			@pageChange="handlePageChange"
			:showSearchHeader="false"
			:showToolBar="false"
			:tableHeight="tableHeight"
		/>

		<!-- 变更详情对话框 -->
		<el-dialog v-model="detailVisible" title="变更详情" width="800px">
			<div v-if="detailData" class="detail-content">
				<el-descriptions :column="2" border>
					<el-descriptions-item label="变更人">{{ detailData.changeByName }}</el-descriptions-item>
					<el-descriptions-item label="变更时间">{{ formatDate(detailData.changeTime) }}</el-descriptions-item>
					<el-descriptions-item label="变更类型" :span="2">{{ detailData.changeTypeName }}</el-descriptions-item>
				</el-descriptions>

				<div class="detail-table">
					<el-table :data="detailData.detailList" border>
						<el-table-column type="index" label="序号" width="60" align="center" />
						<el-table-column prop="changeFieldName" label="变更字段" width="150" align="center" />
						<el-table-column prop="oldValue" label="变更前值" min-width="200" />
						<el-table-column prop="newValue" label="变更后值" min-width="200" />
					</el-table>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script setup name="ChangeLog">
import { ref, onMounted, watch, h, nextTick } from 'vue'
import { getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/equipment/equipmentInfo/index'

const { proxy } = getCurrentInstance()

const props = defineProps({
	equipId: {
		type: [Number, String],
		default: null,
	},
	changeType: {
		type: String,
		default: null, // BASIC_INFO, FINANCE, SUPPLY, SPECIAL_INFO
	},
	readonly: {
		type: Boolean,
		default: false,
	},
	height: {
		type: [Number, String],
		default: 400, // 默认高度400px
	},
})

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const baseTableRef = ref(null)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const tableHeight = ref(props.height) // 表格高度

const detailVisible = ref(false)
const detailData = ref(null)

// 表格列定义
const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center' },
	{ label: '变更人', prop: 'changeByName', align: 'center', },
	{
		label: '变更时间',
		prop: 'changeTime',
		align: 'center',
	},
	{ label: '变更类型', prop: 'changeTypeName', align: 'center' },
	{
		label: '操作',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						link: true,
						type: 'primary',
						icon: 'View',
						onClick: () => handleView(row),
					},
					{ default: () => '查看' }
				),
			]
		},
	},
])

// 格式化日期
const formatDate = (date) => {
	if (!date) return ''
	const d = new Date(date)
	const year = d.getFullYear()
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	const hours = String(d.getHours()).padStart(2, '0')
	const minutes = String(d.getMinutes()).padStart(2, '0')
	const seconds = String(d.getSeconds()).padStart(2, '0')
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 查询列表
const loadData = async () => {
	if (!props.equipId) {
		tableData.value = []
		total.value = 0
		return
	}

	loading.value = true
	try {
		const res = await api.getChangeLogList({
			equipId: props.equipId,
			changeType: props.changeType,
			pageNum: queryParams.value.startPage,
			pageSize: queryParams.value.pageSize,
		})
		if (res.code === '0000') {
			tableData.value = res.data.list || res.data.pages || []
			total.value = res.data.total || res.data.totalNum || 0
			// 数据加载后，延迟刷新表格以确保表头正确渲染
			await nextTick()
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
		} else {
			proxy.$message.error(res.msg || '查询失败')
		}
	} catch (error) {
		console.error('查询变更记录失败:', error)
		proxy.$message.error('查询失败')
	} finally {
		loading.value = false
	}
}

// 查看详情
const handleView = async (row) => {
	loading.value = true
	try {
		const res = await api.getChangeLogById(row.id)
		if (res.code === '0000') {
			detailData.value = res.data
			detailVisible.value = true
		} else {
			proxy.$message.error(res.msg || '查询失败')
		}
	} catch (error) {
		console.error('查询变更详情失败:', error)
		proxy.$message.error('查询失败')
	} finally {
		loading.value = false
	}
}

// 分页改变
const handlePageChange = (params) => {
	queryParams.value.startPage = params.startPage
	queryParams.value.pageSize = params.pageSize
	loadData()
}

// 监听equipId变化
watch(
	() => props.equipId,
	() => {
		if (props.equipId) {
			queryParams.value.startPage = 1
			loadData()
		}
	},
	{ immediate: true }
)

// 监听changeType变化
watch(
	() => props.changeType,
	() => {
		if (props.equipId) {
			queryParams.value.startPage = 1
			loadData()
		}
	}
)

// 监听height变化
watch(
	() => props.height,
	(newVal) => {
		tableHeight.value = newVal
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
})
</script>

<style scoped lang="scss">
.change-log {
	.detail-content {
		margin-top: 20px;

		.detail-table {
			margin-top: 20px;
		}
	}
}
</style>

