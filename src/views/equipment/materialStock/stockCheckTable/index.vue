<template>
	<div class="stock-check-container">
		<!-- 盘点单列表 -->
		<div class="check-list-section">

			<BaseTable
				ref="checkListTableRef"
				:showSearchHeader="true"
				:selectData="checkListSelectData"
				:searchClick="getCheckList"
				:tableColumns="checkListColumns"
				:tableData="checkListData"
		  		:tableHeight="tableHeight"
				:total="checkListTotal"
				:sortNum='2'
			/>
		</div>

		<!-- 新建盘点单对话框 -->
		<el-dialog v-model="createDialogVisible" title="新建盘点单" width="500px">
			<el-form :model="createForm" label-width="100px">
				<el-form-item label="仓库" required>
					<el-select v-model="createForm.warehouseId" placeholder="请选择仓库" filterable style="width: 100%">
						<el-option
							v-for="item in warehouseList"
							:key="item.id"
							:label="item.name"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="盘点日期" required>
					<el-date-picker
						v-model="createForm.checkDate"
						type="date"
						placeholder="请选择盘点日期"
						value-format="YYYY-MM-DD"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="createDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleConfirmCreate" :loading="creating">确定</el-button>
			</template>
		</el-dialog>

		<!-- 盘点明细抽屉 -->
		<el-drawer v-model="detailDrawerVisible" :title="currentCheck?.checkNo || '盘点明细'" size="70%">
			<div v-if="currentCheck" style="margin-bottom: 16px;">
				<el-descriptions :column="3" border>
					<el-descriptions-item label="盘点单号">{{ currentCheck.checkNo }}</el-descriptions-item>
					<el-descriptions-item label="仓库名称">{{ currentCheck.warehouseName }}</el-descriptions-item>
					<el-descriptions-item label="盘点日期">{{ formatDate(currentCheck.checkDate) }}</el-descriptions-item>
					<el-descriptions-item label="盘点状态">
						<el-tag :type="getStatusTagType(currentCheck.checkStatus)">
							{{ currentCheck.checkStatusName }}
						</el-tag>
					</el-descriptions-item>
					<el-descriptions-item label="盘点人">{{ currentCheck.createByName || '-' }}</el-descriptions-item>
					<el-descriptions-item label="备注">{{ currentCheck.remark || '-' }}</el-descriptions-item>
				</el-descriptions>
			</div>

			<EditTable
				ref="detailTableRef"
				:tableColumns="detailColumns"
				:tableData="detailData"
				:syncResize="true"
				:tableHeight="tableHeight"
			/>
			<template #footer>
				<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
					<el-button @click="detailDrawerVisible = false">取消</el-button>
					<template v-if="currentCheck && (currentCheck.checkStatus === 0 || currentCheck.checkStatus === 1)">
						<el-button type="primary" @click="handleSaveQuantity" :loading="saving">保存盘点数量</el-button>
<!--						<el-button type="success" @click="handleCompleteCheck" :disabled="!canComplete">完成盘点</el-button>-->
					</template>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="stockCheckTable">
import BaseTable from '@/components/BaseTable/index.vue'
import EditTable from '@/components/EditTable/index.vue'
import { ref, reactive, getCurrentInstance, h, computed, onMounted } from 'vue'
import { ElButton, ElTag, ElDescriptions, ElDescriptionsItem, ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElDatePicker, ElInput } from 'element-plus'
import { ElInputNumber } from 'element-plus'
import materialStockApi from '@/api/equipment/materialStock/index'
// import { getWarehouseList } from '@/api/equipment/materialWarehouse/index'
const { proxy } = getCurrentInstance()

// 盘点单列表相关
const checkListTableRef = ref()
const checkListData = ref([])
const checkListTotal = ref(0)
const checkListSelectData = reactive([
	{ name: '盘点单号', type: 'input', modelValue: 'checkNo', span: 12 },
	{ name: '仓库名称', type: 'input', modelValue: 'warehouseName', span: 12 },
	// {
	// 	name: '盘点状态',
	// 	type: 'select',
	// 	modelValue: 'status',
	// 	span: 8,
	// 	selectData: [
	// 	{ label: '待盘点', value: 0 },
	// 	{ label: '盘点中', value: 1 },
	// 	{ label: '已完成', value: 2 },
	// 	],
	// },
	 //{ name: '盘点日期', type: 'daterange', modelValue: 'checkDateRange', span: 2},

])

const checkListColumns = ref([
	{ label: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
	{ label: '盘点单号', prop: 'checkNo', align: 'left', minWidth: 150 },
	{ label: '仓库名称', prop: 'warehouseName', align: 'left', minWidth: 150 },
	{ label: '物资名称', prop: 'materialName', align: 'left', minWidth: 150 },
	{ label: '规格型号', prop: 'specificationModel', align: 'left', minWidth: 130 },
	{ label: '计量单位', prop: 'unitName', align: 'center', width: 100 },
	{ label: '账面数量', prop: 'bookQuantity', align: 'right', width: 120, formatter: ({ cellValue }) => formatNumber(cellValue) },
	{ label: '盘点数量', prop: 'checkQuantity', align: 'right', width: 120, formatter: ({ cellValue }) => formatNumber(cellValue) },
	{ label: '差异数量', prop: 'differenceQuantity', align: 'right', width: 120, },
	{ label: '盘点日期', prop: 'checkDate', align: 'center', width: 120, formatter: ({ cellValue }) => formatDate(cellValue) },
	{ label: '盘点人', prop: 'createByName', align: 'left', width: 100 },
	{ label: '创建时间', prop: 'createTime', align: 'center', width: 150 },
	// {
	// 	prop: '',
	// 	label: '操作',
	// 	width: 150,
	// 	fixed: 'right',
	// 	align: 'center',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElButton,
	// 				{
	// 					onClick: () => {
	// 			    viewCheckDetail(row)
	// 					},
	// 					type: 'primary', icon:'view',
	// 					link: true,
	// 					style: { marginRight: '8px' },
	// 				},
	// 				{ default: () => '查看明细' }
	// 			),
	// 			h(
	// 				ElButton,
	// 				{
	// 		    onClick: () => handleCompleteCheckById(row.id),
	// 					type: 'success',icon:'edit',
	// 					link: true,
	// 				},
	// 				{ default: () => '完成盘点' }
	// 			),
	// 		]
	// 	},
	// },
])

// 盘点明细相关
const detailDrawerVisible = ref(false)
const detailTableRef = ref()
const detailData = ref([])
const currentCheck = ref(null)
const saving = ref(false)
const tableHeight = reactive(window.innerHeight - 250)

const detailColumns = reactive([
	{ label: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
	{ label: '物资名称', prop: 'materialName', align: 'left', minWidth: 200 },
	{ label: '规格型号', prop: 'specificationModel', align: 'left', minWidth: 150 },
	{ label: '计量单位', prop: 'unitName', align: 'center', width: 100 },
	{ label: '账面数量', prop: 'bookQuantity', align: 'right', width: 120, isThousandth: true },
	{
		label: '盘点数量',
		prop: 'checkQuantity',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 0,
				precision: 2,
			},
		},
		width: 150,
		align: 'right',
	},
	{ label: '备注', prop: 'remark', align: 'left', minWidth: 150 },
])

const canComplete = computed(() => {
	return detailData.value.every(item => item.checkQuantity != null && item.checkQuantity !== '')
})

// 新建盘点单相关
const createDialogVisible = ref(false)
const creating = ref(false)
const createForm = reactive({
	warehouseId: null,
	checkDate: new Date().toISOString().split('T')[0],
	remark: '',
})
const warehouseList = ref([])

// 查询盘点单列表
const getCheckList = e => {
	const params = e || {}
	if (params.checkDateRange && Array.isArray(params.checkDateRange) && params.checkDateRange.length === 2) {
		params.checkDateStart = params.checkDateRange[0]
		params.checkDateEnd = params.checkDateRange[1]
		delete params.checkDateRange
	}
	materialStockApi.getCheckList(params).then(res => {
		if (res.code === '0000' && res.data) {
			checkListData.value = res.data.pages || []
			checkListTotal.value = res.data.totalNum || 0
		}
	})
}

// 查看盘点明细
const viewCheckDetail = row => {
	currentCheck.value = row
	detailDrawerVisible.value = true
	loadCheckDetail(row.id)
}

// 加载盘点明细
const loadCheckDetail = checkId => {
	materialStockApi.getCheckDetailList(checkId).then(res => {
		if (res.code === '0000' && res.data) {
			detailData.value = res.data || []
		}
	})
}

// 保存盘点数量
const handleSaveQuantity = () => {
	if (!currentCheck.value) return

	// 直接从 detailData 获取数据，因为 EditTable 的数据是响应式的
	const tableData = detailData.value
	if (!tableData || tableData.length === 0) {
		ElMessage.warning('没有可保存的数据')
		return
	}

	// 计算差异数量和差异类型
	const detailList = tableData.map(item => {
		const checkQuantity = item.checkQuantity
		const bookQuantity = item.bookQuantity || 0
		let differenceQuantity = 0
		let differenceType = 0

		if (checkQuantity != null && checkQuantity !== '') {
			differenceQuantity = Number(checkQuantity) - Number(bookQuantity)
			if (differenceQuantity > 0) {
				differenceType = 1 // 盘盈
			} else if (differenceQuantity < 0) {
				differenceType = 2 // 盘亏
			}
		}

		return {
			id: item.id,
			checkQuantity: checkQuantity ? Number(checkQuantity) : null,
			differenceQuantity,
			differenceType,
			remark: item.remark,
		}
	})

	saving.value = true
	materialStockApi.updateCheckQuantity({
		checkId: currentCheck.value.id,
		detailList,
	}).then(res => {
		if (res.code === '0000') {
			ElMessage.success('保存成功')
			loadCheckDetail(currentCheck.value.id)
			getCheckList()
		} else {
			ElMessage.error(res.msg || '保存失败')
		}
	}).finally(() => {
		saving.value = false
	})
}

// 完成盘点
const handleCompleteCheck = () => {
	if (!currentCheck.value) return

	ElMessageBox.confirm('确定要完成盘点吗？完成后将自动生成出入库单并更新库存数量，且无法再修改盘点数量。', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		materialStockApi.completeCheck(currentCheck.value.id).then(res => {
			if (res.code === '0000') {
				ElMessage.success('完成盘点成功，已自动生成出入库单')
				loadCheckDetail(currentCheck.value.id)
				getCheckList()
				// 重新加载当前盘点单信息
				materialStockApi.getCheckById(currentCheck.value.id).then(res => {
					if (res.code === '0000' && res.data) {
						currentCheck.value = res.data
					}
				})
			} else {
				ElMessage.error(res.msg || '完成盘点失败')
			}
		})
	}).catch(() => {})
}

// 完成盘点（从列表操作）
const handleCompleteCheckById = checkId => {
	ElMessageBox.confirm('确定要完成盘点吗？完成后将自动生成出入库单并更新库存数量，且无法再修改盘点数量。', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		materialStockApi.completeCheck(checkId).then(res => {
			if (res.code === '0000') {
				ElMessage.success('完成盘点成功，已自动生成出入库单')
				getCheckList()
			} else {
				ElMessage.error(res.msg || '完成盘点失败')
			}
		})
	}).catch(() => {})
}

// 盘点调整
const handleAdjustCheck = checkId => {
	ElMessageBox.confirm('确定要进行盘点调整吗？调整后将生成入库/出库单并更新库存数量。', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
		inputPlaceholder: '请输入调整备注（可选）',
		showInput: true,
	}).then(({ value }) => {
		materialStockApi.adjustCheck({
			checkId,
			remark: value || '',
		}).then(res => {
			if (res.code === '0000') {
				ElMessage.success('盘点调整成功')
				getCheckList()
				if (currentCheck.value && currentCheck.value.id === checkId) {
					loadCheckDetail(checkId)
					materialStockApi.getCheckById(checkId).then(res => {
						if (res.code === '0000' && res.data) {
							currentCheck.value = res.data
						}
					})
				}
			} else {
				ElMessage.error(res.msg || '盘点调整失败')
			}
		})
	}).catch(() => {})
}

// 删除盘点单
const handleDeleteCheck = checkId => {
	ElMessageBox.confirm('确定要删除该盘点单吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		materialStockApi.deleteCheck(checkId).then(res => {
			if (res.code === '0000') {
				ElMessage.success('删除成功')
				getCheckList()
			} else {
				ElMessage.error(res.msg || '删除失败')
			}
		})
	}).catch(() => {})
}

// 格式化日期
const formatDate = date => {
	if (!date) return '-'
	if (typeof date === 'string') return date
	const d = new Date(date)
	const year = d.getFullYear()
	const month = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

// 格式化数字
const formatNumber = num => {
	if (num == null || num === '') return '-'
	return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取状态标签类型
const getStatusTagType = status => {
	const typeMap = {
		0: 'info',    // 待盘点
		1: 'warning', // 盘点中
		2: 'success', // 已完成
		3: '',        // 已调整
	}
	return typeMap[status] || 'info'
}

// 新建盘点单
const handleCreateCheck = () => {
	createForm.warehouseId = null
	createForm.checkDate = new Date().toISOString().split('T')[0]
	createForm.remark = ''
	createDialogVisible.value = true
}

// 确认创建盘点单
const handleConfirmCreate = () => {
	if (!createForm.warehouseId) {
		ElMessage.warning('请选择仓库')
		return
	}
	if (!createForm.checkDate) {
		ElMessage.warning('请选择盘点日期')
		return
	}

	creating.value = true
	materialStockApi.createCheck({
		warehouseId: createForm.warehouseId,
		checkDate: createForm.checkDate,
		remark: createForm.remark,
	}).then(res => {
		if (res.code === '0000') {
			ElMessage.success('创建盘点单成功')
			createDialogVisible.value = false
			getCheckList()
		} else {
			ElMessage.error(res.msg || '创建盘点单失败')
		}
	}).finally(() => {
		creating.value = false
	})
}

// 加载仓库列表（从库存查询中获取仓库列表）
const loadWarehouseList = () => {
	// 从库存查询接口获取仓库列表
	materialStockApi.getList({ startPage: 1, pageSize: 1000 }).then(res => {
		if (res.code === '0000' && res.data && res.data.pages) {
			// 去重获取仓库列表
			const warehouseMap = new Map()
			res.data.pages.forEach(item => {
				if (item.warehouseId && !warehouseMap.has(item.warehouseId)) {
					warehouseMap.set(item.warehouseId, {
						id: item.warehouseId,
						name: item.warehouseName,
					})
				}
			})
			warehouseList.value = Array.from(warehouseMap.values())
		}
	})
}

// 初始化
const init = () => {
	getCheckList()
	loadWarehouseList()
}

// 暴露方法给父组件
defineExpose({
	getCheckList,
})

init()
</script>

<style scoped>
.stock-check-container {
	padding: 0;
}
</style>

