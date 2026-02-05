<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
			:buttonList="buttonList"
		/>
	</div>

	<!-- 库存详情抽屉 -->
	<el-drawer v-model="detailDrawerVisible" title="库存详情" size="85%">
		<!-- 公共查询条件 -->
		<div style="margin: 10px 10px 16px 10px;">
			<el-form :inline="true" :model="detailQueryParams">
				<el-form-item label="入库日期">
					<el-date-picker
						v-model="detailQueryParams.warehouseInTimeRange"
						type="daterange"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="YYYY-MM-DD"
						style="width: 240px"
					/>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="Search" @click="handleDetailSearch">查询</el-button>
					<el-button icon="RefreshRight" @click="handleDetailReset">重置</el-button>
				</el-form-item>
			</el-form>
		</div>
		<el-tabs v-model="activeTab" type="border-card">
			<el-tab-pane label="入库流水" name="detail">
				<stockDetailTable ref="stockDetailTableRef" />
			</el-tab-pane>
			<el-tab-pane label="出库流水" name="flow">
				<stockFlowTable ref="stockFlowTableRef" />
			</el-tab-pane>
		</el-tabs>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="detailDrawerVisible = false">关闭</el-button>
			</div>
		</template>
	</el-drawer>

	<!-- 新建盘点单对话框 -->
	<!-- <el-dialog v-model="checkDialogVisible" :title="checkForm.materialName ? `盘点 - ${checkForm.materialName}` : '新建盘点单'" width="800px">
		<el-form :model="checkForm" label-width="120px">
			<el-descriptions :column="2" border style="margin-bottom: 20px;">
				<el-descriptions-item label="仓库名称">{{ checkForm.warehouseName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="物资名称">{{ checkForm.materialName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="规格型号">{{ checkForm.specificationModel || '-' }}</el-descriptions-item>
				<el-descriptions-item label="计量单位">{{ checkForm.unitName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="账面数量" :span="2">
					<span style="font-size: 16px; font-weight: bold; color: #409EFF;">
						{{ formatNumber(checkForm.bookQuantity) }}
					</span>
				</el-descriptions-item>
			</el-descriptions>
			<el-form-item label="盘点日期" required>
				<el-date-picker
					v-model="checkForm.checkDate"
					type="date"
					placeholder="请选择盘点日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
				/>
			</el-form-item>
			<el-form-item label="盘点数量" required>
				<el-input-number
					v-model="checkForm.checkQuantity"
					:min="0"
					:precision="2"
					controls-position="right"
					style="width: 100%"
					placeholder="请输入盘点数量"
				/>
			</el-form-item>
			<el-form-item label="差异数量">
				<span :style="{ color: getDifferenceColor(checkForm.differenceQuantity), fontSize: '16px', fontWeight: 'bold' }">
					{{ formatDifference(checkForm.differenceQuantity) }}
				</span>
			</el-form-item>
			<el-form-item label="备注">
				<el-input v-model="checkForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="checkDialogVisible = false">取消</el-button>
			<el-button type="primary" @click="handleSaveCheck" :loading="savingCheck">保存</el-button>
		</template>
	</el-dialog> -->

	<!-- 库存盘点抽屉 -->
	<!-- <el-drawer v-model="checkDrawerVisible" title="库存盘点" size="80%">
		<stockCheckTable ref="stockCheckTableRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="checkDrawerVisible = false">关闭</el-button>
			</div>
		</template>
	</el-drawer> -->
</template>
<script setup name="materialStock">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import stockDetailTable from './stockDetailTable/index.vue'
import stockFlowTable from './stockFlowTable/index.vue'
// import stockCheckTable from './stockCheckTable/index.vue'
import { ref, reactive, getCurrentInstance, h, nextTick, watch, computed } from 'vue'
import { ElButton, ElTabs, ElTabPane, ElForm, ElFormItem, ElDatePicker, ElDialog, ElInputNumber, ElInput, ElDescriptions, ElDescriptionsItem, ElMessage, ElMessageBox, ElDrawer } from 'element-plus'
import materialStockApi from '@/api/equipment/materialStock/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

/**--------------变量定义------------ */
const tableData = ref([]) // 表数据
const total = ref('') // 数据总数
const detailDrawerVisible = ref(false) // 库存详情抽屉显示状态
// const checkDrawerVisible = ref(false) // 库存盘点抽屉显示状态
const stockDetailTableRef = ref() // 库存明细表格ref
const stockFlowTableRef = ref() // 库存流水表格ref
// const stockCheckTableRef = ref() // 库存盘点表格ref
const activeTab = ref('detail') // 当前激活的tab
const clickRow = ref(null) // 点击的行数据
const detailQueryParams = ref({
	warehouseInTimeRange: null, // 入库日期区间
})

// 盘点相关
// const checkDialogVisible = ref(false)
// const savingCheck = ref(false)
// const checkForm = reactive({
// 	warehouseId: null,
// 	warehouseName: '',
// 	materialId: null,
// 	materialName: '',
// 	specificationModel: '',
// 	unitName: '',
// 	bookQuantity: 0,
// 	checkDate: new Date().toISOString().split('T')[0],
// 	checkQuantity: null,
// 	differenceQuantity: 0,
// 	remark: '',
// })

// 计算差异数量
// watch(() => checkForm.checkQuantity, (newVal) => {
// 	if (newVal != null && checkForm.bookQuantity != null) {
// 		checkForm.differenceQuantity = Number(newVal) - Number(checkForm.bookQuantity)
// 	} else {
// 		checkForm.differenceQuantity = 0
// 	}
// })

const baseTable = ref(null)
const selectData = reactive([
	// 查询条件
	{ name: '仓库名称', type: 'input', modelValue: 'warehouseName', span: 8 },
	{ name: '物资名称', type: 'input', modelValue: 'materialName', span: 8 },
	{ name: '规格型号', type: 'input', modelValue: 'specificationModel', span: 8 },
	{ name: '品牌', type: 'input', modelValue: 'brand', span: 3 },
])

// 按钮列表（右上角按钮）
const buttonList = reactive([
	{
		label: '导出',
		type: 'primary',
		icon: 'Download',
		click: () => {
			pageExport()
		},
		permission: 'equipment:materialStock:record',
	},
	// {
	// 	label: '盘点记录',
	// 	type: 'primary',
	// 	icon:'list',
	// 	click: () => {
	// 		checkDrawerVisible.value = true
	// 	},
	//   permission: 'equipment:materialStock:record',
	// },
])

// 监听盘点抽屉打开，自动查询
// watch(checkDrawerVisible, (newVal) => {
// 	if (newVal && stockCheckTableRef.value) {
// 		// 抽屉打开时，触发查询
// 		nextTick(() => {
// 			if (stockCheckTableRef.value && stockCheckTableRef.value.getCheckList) {
// 				stockCheckTableRef.value.getCheckList()
// 			}
// 		})
// 	}
// })

const tableColumns = ref([
	// 表头列
	{ label: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
	{ label: '仓库名称', prop: 'warehouseName', align: 'left', minWidth: 150 },
	{ label: '物资名称', prop: 'materialName', align: 'left', minWidth: 200 },
	{ label: '物资类别', prop: 'categoryName', align: 'left', minWidth: 200 },
	{ label: '规格型号', prop: 'specificationModel', align: 'left', minWidth: 150 },
	{ label: '品牌', prop: 'brand', align: 'left', minWidth: 120 },
	{ label: '计量单位', prop: 'unitName', align: 'center', width: 100 },
	{
		label: '库存数量',
		prop: 'stockQuantity',
		align: 'right',
		width: 120,
	},
	{
		label: '单价(元)',
		prop: 'stockUnitPrice',
		align: 'right',
		width: 120,
		isThousandth: true, // 千分位格式化
	},
	{
		label: '库存总价(元)',
		prop: 'stockTotalPrice',
		align: 'right',
		width: 150,
		isThousandth: true, // 千分位格式化
	},
	{
		prop: '',
		label: '操作',
		width: 150,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							viewStockDetail(row)
						},
						type: 'primary', icon:'view',
						link: true,
						style: { marginRight: '8px' },
					},
					{ default: () => '库存详情' }
				),
				// h(
				// 	ElButton,
				// 	{
				// 		onClick: () => {
				// 			handleCreateCheck(row)
				// 		},
				// 		type: 'success',icon:'edit',
				// 		link: true,
				//       permission: 'equipment:materialStock:add',
				// 	},
				// 	{ default: () => '盘点' }
				// ),
			]
		},
	},
])

const queryParams = ref({
	// 分页变量
	startPage: 1,
	pageSize: 20,
})

/**--------------方法------------ */
// 点击查询按钮的事件
const getList = e => {
	queryParams.value = e || queryParams.value
	materialStockApi.getList(queryParams.value).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

// 查看库存详情
const viewStockDetail = row => {
	clickRow.value = row
	activeTab.value = 'detail' // 默认显示库存详情
	detailQueryParams.value.warehouseInTimeRange = null // 重置日期查询条件
	detailDrawerVisible.value = true
	// 加载默认 tab（库存详情）的数据
	nextTick(() => {
		loadCurrentTabData()
	})
}

// 加载当前 tab 的数据
const loadCurrentTabData = () => {
	if (!clickRow.value || !detailDrawerVisible.value) {
		return
	}
	const params = {}
	if (detailQueryParams.value.warehouseInTimeRange && Array.isArray(detailQueryParams.value.warehouseInTimeRange) && detailQueryParams.value.warehouseInTimeRange.length === 2) {
		params.warehouseInTimeStart = detailQueryParams.value.warehouseInTimeRange[0]
		params.warehouseInTimeEnd = detailQueryParams.value.warehouseInTimeRange[1]
	}

	if (activeTab.value === 'detail' && stockDetailTableRef.value) {
		// 加载库存明细数据
		stockDetailTableRef.value.loadDetailList(clickRow.value.warehouseId, clickRow.value.materialId, params)
	} else if (activeTab.value === 'flow' && stockFlowTableRef.value) {
		// 加载库存流水数据
		stockFlowTableRef.value.loadFlowList(clickRow.value.warehouseId, clickRow.value.materialId, params)
	}
}

// 查询按钮
const handleDetailSearch = () => {
	loadCurrentTabData()
}

// 重置按钮
const handleDetailReset = () => {
	detailQueryParams.value.warehouseInTimeRange = null
	loadCurrentTabData()
}

// 监听 tab 切换，切换时加载对应的数据
watch(activeTab, (newTab) => {
	if (!clickRow.value || !detailDrawerVisible.value) {
		return
	}
	nextTick(() => {
		loadCurrentTabData()
	})
})

// 新建盘点单
// const handleCreateCheck = row => {
// 	checkForm.warehouseId = row.warehouseId
// 	checkForm.warehouseName = row.warehouseName
// 	checkForm.materialId = row.materialId
// 	checkForm.materialName = row.materialName
// 	checkForm.specificationModel = row.specificationModel
// 	checkForm.unitName = row.unitName
// 	checkForm.bookQuantity = row.stockQuantity || 0
// 	checkForm.checkDate = new Date().toISOString().split('T')[0]
// 	checkForm.checkQuantity = null
// 	checkForm.differenceQuantity = 0
// 	checkForm.remark = ''
// 	checkDialogVisible.value = true
// }

// 保存盘点（快速盘点：直接生成盘点数据和出入库数据）
// const handleSaveCheck = () => {
// 	if (!checkForm.checkDate) {
// 		ElMessage.warning('请选择盘点日期')
// 		return
// 	}
// 	if (checkForm.checkQuantity == null || checkForm.checkQuantity === '') {
// 		ElMessage.warning('请输入盘点数量')
// 		return
// 	}

// 	savingCheck.value = true

// 	// 调用快速盘点接口，一次性完成：创建盘点单、保存盘点数量、完成盘点并生成出入库单
// 	materialStockApi.quickCheck({
// 		warehouseId: checkForm.warehouseId,
// 		materialId: checkForm.materialId,
// 		checkDate: checkForm.checkDate,
// 		checkQuantity: checkForm.checkQuantity,
// 		remark: checkForm.remark,
// 	}).then(res => {
// 		if (res.code === '0000') {
// 			ElMessage.success('盘点成功，已自动生成出入库单')
// 			checkDialogVisible.value = false
// 			getList() // 刷新列表
// 		} else {
// 			ElMessage.error(res.msg || '盘点失败')
// 		}
// 	}).catch(err => {
// 		ElMessage.error(err.msg || '盘点失败')
// 	}).finally(() => {
// 		savingCheck.value = false
// 	})
// }

// 创建新盘点单（只包含当前物资）
// const createNewCheck = () => {
// 	return materialStockApi.createCheckForMaterial({
// 		warehouseId: checkForm.warehouseId,
// 		materialId: checkForm.materialId,
// 		checkDate: checkForm.checkDate,
// 		remark: checkForm.remark,
// 	}).then(res => {
// 		if (res.code === '0000' && res.data) {
// 			const checkId = res.data.id
// 			// 查询盘点明细，找到当前物资的明细ID
// 			return materialStockApi.getCheckDetailList(checkId).then(detailRes => {
// 				if (detailRes.code === '0000' && detailRes.data) {
// 					const detail = detailRes.data.find(item => item.materialId === checkForm.materialId)
// 					if (detail) {
// 						// 更新盘点数量
// 						return materialStockApi.updateCheckQuantity({
// 							checkId,
// 							detailList: [{
// 								id: detail.id,
// 								checkQuantity: checkForm.checkQuantity,
// 								differenceQuantity: checkForm.differenceQuantity,
// 								differenceType: checkForm.differenceQuantity > 0 ? 1 : checkForm.differenceQuantity < 0 ? 2 : 0,
// 								remark: checkForm.remark,
// 							}],
// 						})
// 					} else {
// 						throw new Error('创建盘点单后未找到该物资的明细')
// 					}
// 				} else {
// 					throw new Error('查询盘点明细失败')
// 				}
// 			})
// 		} else {
// 			throw new Error(res.msg || '创建盘点单失败')
// 		}
// 	})
// }

// 更新盘点明细
// const updateCheckDetail = checkId => {
// 	// 先查询该盘点单的明细，看是否已有该物资
// 	return materialStockApi.getCheckDetailList(checkId).then(res => {
// 		if (res.code === '0000' && res.data) {
// 			const existingDetail = res.data.find(item => item.materialId === checkForm.materialId)

// 			// 构建明细数据
// 			const detailData = {
// 				materialId: checkForm.materialId,
// 				materialName: checkForm.materialName,
// 				specificationModel: checkForm.specificationModel,
// 				unitCode: '',
// 				unitName: checkForm.unitName,
// 				bookQuantity: checkForm.bookQuantity,
// 				checkQuantity: checkForm.checkQuantity,
// 				differenceQuantity: checkForm.differenceQuantity,
// 				differenceType: checkForm.differenceQuantity > 0 ? 1 : checkForm.differenceQuantity < 0 ? 2 : 0,
// 				remark: checkForm.remark,
// 			}

// 			if (existingDetail) {
// 				// 更新现有明细
// 				detailData.id = existingDetail.id
// 			}
// 			// 如果没有id，后端会自动添加新明细

// 			return materialStockApi.updateCheckQuantity({
// 				checkId,
// 				detailList: [detailData],
// 			})
// 		}
// 	})
// }

// 格式化数字
const formatNumber = num => {
	if (num == null) return '-'
	return proxy.$formatNumber ? proxy.$formatNumber(num) : num.toLocaleString()
}

// 格式化差异数量
// const formatDifference = diff => {
// 	if (diff == null || diff === 0) return '0'
// 	const sign = diff > 0 ? '+' : ''
// 	return sign + formatNumber(diff)
// }

// 获取差异颜色
// const getDifferenceColor = diff => {
// 	if (diff == null || diff === 0) return '#909399'
// 	return diff > 0 ? '#67C23A' : '#F56C6C'
// }

// 导出功能
const pageExport = e => {
	// 获取当前查询条件
	const searchParams = baseTable.value?.SearchHeaderRef?.searchData || {}
	const exportParams = Object.assign(queryParams.value, searchParams, e || {})

	materialStockApi.pageExport(exportParams).then(res => {
		downLoadBlob(res, '库存查询')
	}).catch(err => {
		ElMessage.error(err.msg || '导出失败')
	})
}

// 下载excel事件
const downLoadBlob = (file, filename) => {
	let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	let url = URL.createObjectURL(blob)
	let a = document.createElement('a')
	a.href = url
	a.style.display = 'none'
	document.body.appendChild(a)
	a.setAttribute('download', filename)
	a.click()
	document.body.removeChild(a)
}

// 初始化方法
const init = async () => {
	getList(null)
}

init()
</script>
<style scoped>
</style>

