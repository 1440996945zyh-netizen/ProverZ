<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
			:expandConfig="{ trigger: 'default' }"
			:cellClickEvent="cellClickEvent"
		/>
	</div>

	<el-drawer v-model="purchaseVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="purchaseVisible = false">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
				<template v-if="title !== '查看详情'">
					<el-button type="primary" @click="save" v-hasPermi="['equipment:materialPurchase:add', 'equipment:materialPurchase:update']">保存</el-button>
				</template>
			</div>
		</template>
	</el-drawer>

	<!-- 失败原因对话框 -->
	<!-- <el-dialog v-model="failureDialogVisible" title="采购失败原因" width="500px">
		<el-form :model="failureForm" label-width="100px">
			<el-form-item label="失败原因" required>
				<el-input
					v-model="failureForm.failureReason"
					type="textarea"
					:rows="4"
					placeholder="请输入采购失败原因"
					maxlength="500"
					show-word-limit
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="failureDialogVisible = false">取消</el-button>
				<el-button type="danger" @click="confirmFailure">确定</el-button>
			</div>
		</template>
	</el-dialog> -->

	<!-- 审核弹窗 -->
	<el-dialog v-model="approvalVisible" title="审核" width="500px">
		<el-form :model="approvalForm" label-width="100px">
			<el-form-item label="审核结果">
				<el-radio-group v-model="approvalForm.status">
					<el-radio :label="1">通过</el-radio>
					<el-radio :label="2">驳回</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="审核备注">
				<el-input
					v-model="approvalForm.approvalRemark"
					type="textarea"
					:rows="4"
					placeholder="请输入审核备注"
					maxlength="500"
					show-word-limit
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="approvalVisible = false">取消</el-button>
				<el-button type="primary" @click="handleApprove">确定</el-button>
			</div>
		</template>
	</el-dialog>
</template>
<script setup name="materialPurchase">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance, toRaw, watch } from 'vue'
import { ElButton, ElTag, ElDialog, ElForm, ElFormItem, ElInput, ElRadioGroup, ElRadio, ElTable, ElTableColumn } from 'element-plus'
import materialPurchaseApi from '@/api/equipment/materialPurchase/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

/**--------------变量定义------------ */
const tableData = ref([]) // 表数据
const title = ref('') // 详情标题
const total = ref('') // 数据总数
const purchaseVisible = ref(false) // 是否显示详情
const detailRef = ref(null) // 明细组件ref
const isAdd = ref(false) // 是否新增
const clickRow = ref(null) // 点击的行数据
const failureDialogVisible = ref(false) // 是否显示失败原因对话框
const failureForm = reactive({
	id: null,
	failureReason: '',
}) // 失败原因表单
const approvalVisible = ref(false) // 是否显示审核弹窗
const approvalForm = reactive({
	id: null,
	status: 1, // 默认通过
	approvalRemark: '',
})

const baseTable = ref(null)
const selectData = reactive([
	// 查询条件
	{ name: '采购单号', type: 'input', modelValue: 'purchaseNo', span: 8 },
	{ name: '采购单主题', type: 'input', modelValue: 'purchaseTitle', span: 8 },
	{ name: '供应商名称', type: 'input', modelValue: 'supplierName', span: 8 },
	{
		name: '采购类型',
		type: 'select',
		modelValue: 'purchaseTypeCode',
		span: 2,
		selectData: [
			{ value: '01', label: '比价' },
			{ value: '02', label: '招标' },
			{ value: '03', label: '定点服务' },
		],
	},
	{
		name: '采购状态',
		type: 'select',
		modelValue: 'purchaseStatus',
		span: 2,
		clearable: true,
		selectData: [
			{ value: '0', label: '待审核' },
			{ value: 1, label: '审核通过' },
			{ value: 2, label: '驳回' },
		],
	},
])

// 行点击事件
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	// 更新审核按钮状态
	updateApprovalButton()
}

// 更新审核按钮状态
const updateApprovalButton = () => {
	if (clickRow.value && clickRow.value.purchaseStatus === 0) {
		// 状态为待审核，启用按钮
		buttonList[1].disabled = false
	} else {
		// 其他状态，禁用按钮
		buttonList[1].disabled = true
	}
}

// 批量审核处理（从右上角按钮点击）
const handleBatchApproval = () => {
	// 检查是否有选中的行
	if (!clickRow.value) {
		proxy.$message.warning('请先选择要审核的记录')
		return
	}
	// 检查选中的行状态是否为待审核
	if (clickRow.value.purchaseStatus !== 0) {
		proxy.$message.warning('只能审核状态为"待审核"的记录')
		return
	}
	// 打开审核弹窗
	openApprovalDialog(clickRow.value)
}

// 打开审核弹窗
const openApprovalDialog = row => {
	approvalForm.id = row.id
	approvalForm.status = 1 // 默认通过
	approvalForm.approvalRemark = ''
	approvalVisible.value = true
}

// 获取状态标签
const getStatusLabel = (status) => {
	const statusMap = {
		0: '待审核',
		1: '审核通过',
		2: '驳回',
	}
	return statusMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
	const typeMap = {
		0: 'warning',
		1: 'success',
		2: 'danger',
	}
	return typeMap[status] || 'info'
}

// 查看详情事件（只读）
const viewDetail = row => {
	const viewRow = row
	purchaseVisible.value = true
	title.value = '查看详情'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = true // 设置为只读
		materialPurchaseApi.getById(viewRow.id).then(res => {
			if (res.code === '0000' && res.data) {
				proxy.setFormData(detailRef.value.formData.form, res.data)
				detailRef.value.editDetailList(res.data.detailList || [])
				detailRef.value.editComparisonList(res.data.comparisonList || [])
				detailRef.value.init(false)
			}
		})
	})
}

// 展开明细表格组件
const DetailTable = {
	props: ['row', 'onRowCountChange'],
	setup(props) {
		const detailList = ref([])
		const loading = ref(false)
		const loaded = ref(false) // 标记是否已加载

		// 懒加载明细数据
		const loadDetailList = async () => {
			if (loaded.value) {
				return // 已经加载过，不再重复加载
			}
			loading.value = true
			loaded.value = true // 标记为已加载，避免重复请求
			try {
				const res = await materialPurchaseApi.getById(props.row.id)
				if (res.code === '0000' && res.data) {
					detailList.value = res.data.detailList || []
					// 数据加载完成后，将行数传递给 BaseTable
					if (props.onRowCountChange && typeof props.onRowCountChange === 'function') {
						nextTick(() => {
							props.onRowCountChange(detailList.value.length)
						})
					}
				}
			} catch (error) {
				console.error('加载明细数据失败:', error)
				loaded.value = false // 加载失败，允许重试
			} finally {
				loading.value = false
			}
		}

		// 立即加载数据（当组件被渲染时）
		loadDetailList()

		// 监听 detailList 变化，更新行数
		watch(detailList, (newList) => {
			if (props.onRowCountChange && typeof props.onRowCountChange === 'function') {
				nextTick(() => {
					props.onRowCountChange(newList.length)
				})
			}
		}, { immediate: false })

		// 格式化金额（千分位）
		const formatAmount = (value) => {
			if (value == null || value === '') {
				return '-'
			}
			const num = Number(value)
			if (isNaN(num)) {
				return value
			}
			return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
		}

		return () => {
			if (loading.value) {
				return h('div', { style: 'padding: 20px; text-align: center;' }, '加载中...')
			}
			if (detailList.value.length === 0) {
				return h('div', { style: 'padding: 20px; text-align: center; color: #999;' }, '暂无明细数据')
			}
			return h('div', { class: 'detail-table-wrapper' }, [
				h(ElTable, {
					data: detailList.value,
					border: true,
					size: 'small',
					style: 'width: 100%'
				}, [
					h(ElTableColumn, { prop: 'applicationNo', label: '申请单号', align: 'center', width: 150 }),
					h(ElTableColumn, { prop: 'materialName', label: '物资名称', width: 150 }),
					h(ElTableColumn, { prop: 'specificationModel', label: '规格型号', width: 100 }),
					h(ElTableColumn, { prop: 'unit', label: '单位', align: 'center', width: 80 }),
					h(ElTableColumn, { 
						prop: 'applicationQuantity', 
						label: '申报数量', 
						align: 'right', 
						width: 100,
						formatter: (row) => {
							return row.applicationQuantity != null ? row.applicationQuantity : '-'
						}
					}),
					h(ElTableColumn, { 
						prop: 'purchaseQuantity', 
						label: '采购数量', 
						align: 'right', 
						width: 110,
						formatter: (row) => {
							return row.purchaseQuantity != null ? row.purchaseQuantity : '-'
						}
					}),
					h(ElTableColumn, { 
						prop: 'taxRate', 
						label: '税率(%)', 
						align: 'right', 
						width: 100,
						formatter: (row) => {
							return row.taxRate != null ? row.taxRate : '-'
						}
					}),
					h(ElTableColumn, { 
						prop: 'taxIncludedUnitPrice', 
						label: '单价', 
						align: 'right', 
						width: 100,
						formatter: (row) => {
							return row.taxIncludedUnitPrice != null ? formatAmount(row.taxIncludedUnitPrice) : '-'
						}
					}),
					h(ElTableColumn, { 
						prop: 'taxIncludedAmount', 
						label: '金额', 
						align: 'right', 
						width: 110,
						formatter: (row) => {
							return row.taxIncludedAmount != null ? formatAmount(row.taxIncludedAmount) : '-'
						}
					}),
					h(ElTableColumn, { 
						prop: 'taxExcludedAmount', 
						label: '不含税金额', 
						align: 'right', 
						width: 110,
						formatter: (row) => {
							return row.taxExcludedAmount != null ? formatAmount(row.taxExcludedAmount) : '-'
						}
					}),
				])
			])
		}
	}
}

const tableColumns = ref([
	// 表头列
	{
		type: 'expand',
		width: 50,
		fixed: 'left',
		expandSlot: DetailTable
	},
	{ label: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
	{
		label: '采购单号',
		prop: 'purchaseNo',
		align: 'center',
		width: 150,
		render: row => {
			if (!row || !row.purchaseNo) {
				return []
			}
			return [
				h(
					'span',
					{
						style: 'color: #409EFF; cursor: pointer;',
						onClick: () => {
							viewDetail(row)
						},
					},
					row.purchaseNo
				),
			]
		},
	},
	{ label: '采购单主题', prop: 'purchaseTitle', align: 'left', width: 150 },
	{ label: '供应商名称', prop: 'supplierName', align: 'left', minWidth: 200 },
	{ label: '采购类型', prop: 'purchaseTypeName', align: 'center', width: 120 },
	{ label: '定点服务类别', prop: 'fixedServiceCategoryName', align: 'center', width: 130 },
	{ label: '含税金额', prop: 'taxIncludedAmount', align: 'right', width: 120, isThousandth: true },
	{ label: '不含税金额', prop: 'taxExcludedAmount', align: 'right', width: 120, isThousandth: true },
	{ label: '采购人', prop: 'createByName', align: 'left', width: 100 },
	{ label: '采购时间', prop: 'createTime', align: 'center', width: 150 },
	{ label: '审核人', prop: 'approvalByName', align: 'left', width: 100 },
	{ label: '审核时间', prop: 'approvalTime', align: 'center', width: 150 },
	{ label: '审核备注', prop: 'approvalRemark', align: 'left', minWidth: 150 },
	{
		label: '采购状态',
		prop: 'purchaseStatus',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: getStatusType(row.purchaseStatus),
					},
					{
						default: () => {
							return getStatusLabel(row.purchaseStatus)
						},
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 150,
		fixed: 'right',
		align: 'center',
		render: row => {
			const buttons = []

			buttons.push(
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						disabled: row.purchaseStatus === 1, // 审核通过后不可编辑
					},
					{ default: () => '编辑' }
				),
				// h(
				// 	ElButton,
				// 	{
				// 		onClick: () => {
				// 			handleFailure(row)
				// 		},
				// 		type: 'danger',
				// 		link: true,
				// 		icon: 'Close',
				// 		disabled: row.purchaseStatus === 1, // 已失败的不能再标记失败
				// 		permission: 'equipment:materialPurchase:update',
				// 	},
				// 	{ default: () => '失败' }
				// ),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'equipment:materialPurchase:delete',
						disabled: row.purchaseStatus === 1, // 审核通过后不可删除
					},
					{ default: () => '删除' }
				)
			)

			return buttons
		},
	},
])

const queryParams = ref({
	// 分页变量
	startPage: 1,
	pageSize: 20,
	// 明确设置采购状态为 null，避免默认选中
	purchaseStatus: null,
})

/**--------------方法------------ */
// 点击查询按钮的事件
const getList = e => {
	if (e) {
		queryParams.value = { ...queryParams.value, ...e }
	}
	// 确保采购状态为空时不传递该参数
	if (queryParams.value.purchaseStatus === '' || queryParams.value.purchaseStatus === null || queryParams.value.purchaseStatus === undefined) {
		delete queryParams.value.purchaseStatus
	}
	buttonList[1].disabled = true // 查询时禁用审核按钮
	clickRow.value = null // 清空选中的行
	materialPurchaseApi.getList(queryParams.value).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

// 新增事件
const add = () => {
	purchaseVisible.value = true
	title.value = '新增'
	isAdd.value = true

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		detailRef.value.init(true)
	})
}

// 编辑事件
const edit = row => {
	const editRow = row
	purchaseVisible.value = true
	title.value = '编辑'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		materialPurchaseApi.getById(editRow.id).then(res => {
			if (res.code === '0000' && res.data) {
				proxy.setFormData(detailRef.value.formData.form, res.data)
				detailRef.value.editDetailList(res.data.detailList || [])
				detailRef.value.editComparisonList(res.data.comparisonList || [])
				detailRef.value.init(false)
			}
		})
	})
}

// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		let { form, detailList, comparisonList } = JSON.parse(JSON.stringify(toRaw(detailRef.value.formData)))

		// 验证：必须至少有一条有效明细
		const validDetailList = detailList.filter(item => item.applicationDetailId != null && item.applicationDetailId !== '')
		if (validDetailList.length === 0) {
			proxy.$message.warning('至少需要添加一条明细数据')
			return
		}
		detailList = validDetailList

		// 如果采购类型为比价，验证比价信息
		if (form.purchaseTypeCode === '01') {
			const validComparisonList = comparisonList.filter(item => item.supplierId != null && item.supplierId !== '')
			if (validComparisonList.length === 0) {
				proxy.$message.warning('采购类型为比价时，至少需要添加一条比价信息')
				return
			}
			comparisonList = validComparisonList
		} else {
			comparisonList = []
		}

		proxy.$modal.confirm('确定保存?').then(res => {
			let params = {
				...form,
				detailList: detailList,
				comparisonList: comparisonList,
			}
			if (params.id == null) {
				materialPurchaseApi.add(params).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					purchaseVisible.value = false
				})
			} else {
				materialPurchaseApi.update(params).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					purchaseVisible.value = false
				})
			}
		})
	}
}

// 失败事件（已注释）
// const handleFailure = row => {
// 	failureForm.id = row.id
// 	failureForm.failureReason = row.failureReason || ''
// 	failureDialogVisible.value = true
// }

// 确认失败（已注释）
// const confirmFailure = () => {
// 	if (!failureForm.failureReason || failureForm.failureReason.trim() === '') {
// 		proxy.$message.warning('请输入采购失败原因')
// 		return
// 	}
// 	proxy.$modal
// 		.confirm('确定标记为失败?')
// 		.then(res => {
// 			materialPurchaseApi.markAsFailed(failureForm.id, failureForm.failureReason.trim()).then(res => {
// 				if (res.code == '0000') {
// 					proxy.$message.success(res.msg)
// 					failureDialogVisible.value = false
// 					failureForm.id = null
// 					failureForm.failureReason = ''
// 					getList(queryParams.value)
// 				} else {
// 					proxy.$message.error(res.msg)
// 				}
// 			})
// 		})
// 		.catch(err => {})
// }

// 审核事件
const handleApprove = () => {
	if (approvalForm.status === null || approvalForm.status === undefined) {
		proxy.$message.warning('请选择审核结果')
		return
	}
	const statusName = approvalForm.status === 1 ? '审核通过' : '驳回'
	proxy.$modal.confirm(`确定${statusName}?`).then(() => {
		materialPurchaseApi
			.approve(approvalForm.id, approvalForm.status, approvalForm.approvalRemark)
			.then(res => {
				proxy.$message.success(res.msg)
				approvalVisible.value = false
				clickRow.value = null // 清空选中行
				buttonList[1].disabled = true // 禁用审核按钮
				getList(queryParams.value)
			})
			.catch(err => {
				proxy.$message.error(err.msg || '审核失败')
			})
	})
}

// 删除事件
const handleDelete = row => {
	const deleteRow = row
	proxy.$modal
		.confirm('确定删除?')
		.then(res => {
			materialPurchaseApi.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(err => {})
}

// 初始化方法
const init = async () => {
	// 重置查询参数，确保采购状态为空
	queryParams.value = {
		startPage: 1,
		pageSize: 20,
		purchaseStatus: null,
	}
	getList(null)
}

// 按钮列表
const buttonList = reactive([
	// 搜索区域的按钮
	{
		label: '新建',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:materialPurchase:add',
	},
	{
		label: '审核',
		type: 'primary',
		icon: 'View',
		click: handleBatchApproval,
		permission: 'equipment:materialPurchase:approve',
		disabled: true, // 默认禁用，点击行后根据状态启用
	},
])

init()
</script>
<style scoped>
/* 修复展开行明细表格样式 - 确保在正常文档流中 */
.detail-table-wrapper {
	padding: 10px;
	background: #f5f7fa;
}
</style>

