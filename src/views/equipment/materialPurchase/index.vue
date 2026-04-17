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
			:expand-config="{ trigger: 'default', accordion: true }"
			:cellClickEvent="cellClickEvent"
		>
			<!-- 1. 展开行插槽：展示明细子表格 -->
			<template #expand="{ row }">
				<DetailTable :row="row" />
			</template>
		</BaseTable>
	</div>

	<el-drawer v-model="purchaseVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="purchaseVisible = false">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
				<template v-if="title !== '查看详情'">
					<el-button
						type="primary"
						@click="save"
						v-hasPermi="['equipment:materialPurchase:add', 'equipment:materialPurchase:update']"
					>
						保存
					</el-button>
				</template>
			</div>
		</template>
	</el-drawer>
</template>
<script setup name="materialPurchase">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance, toRaw, watch } from 'vue'
import { ElButton, ElTag, ElTable, ElTableColumn } from 'element-plus'
import { Edit, View, Delete, Promotion, Histogram } from '@element-plus/icons-vue'
import DropDown from '@/components/DropDown/newIndex.vue'
import materialPurchaseApi from '@/api/equipment/materialPurchase/index'
import { useRoute, useRouter } from 'vue-router'
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
const { proxy } = getCurrentInstance()

const route = useRoute()
const router = useRouter()

const { startProcess, loading } = useProcessStarter()

/**--------------变量定义------------ */
const tableData = ref([])
const title = ref('')
const total = ref('')
const purchaseVisible = ref(false)
const detailRef = ref(null)
const isAdd = ref(false)
const clickRow = ref(null)

const baseTable = ref(null)
const selectData = reactive([
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
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
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
		detailRef.value.getBelongDeptList()
		materialPurchaseApi.getById(viewRow.id).then(res => {
			if (res.code === '0000' && res.data) {
				proxy.setFormData(detailRef.value.formData.form, res.data)
				detailRef.value.editDetailList(res.data.detailList || [])
				detailRef.value.editComparisonList(res.data.comparisonList || [])
				detailRef.value.init(false)
				if (res.data.useCompanyId) {
					const userDeptId = userStore.deptId
					if (userDeptId && String(res.data.useCompanyId) === String(userDeptId)) {
						detailRef.value.belongDeptDisabled = true
					}
				}
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
		watch(
			detailList,
			newList => {
				if (props.onRowCountChange && typeof props.onRowCountChange === 'function') {
					nextTick(() => {
						props.onRowCountChange(newList.length)
					})
				}
			},
			{ immediate: false },
		)

		// 格式化金额（千分位）
		const formatAmount = value => {
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
				h(
					ElTable,
					{
						data: detailList.value,
						border: true,
						size: 'small',
						style: 'width: 100%',
					},
					[
						h(ElTableColumn, { prop: 'applicationNo', label: '申请单号', align: 'center', width: 150 }),
						h(ElTableColumn, { prop: 'materialName', label: '物资名称', width: 150 }),
						h(ElTableColumn, { prop: 'specificationModel', label: '规格型号', width: 100 }),
						h(ElTableColumn, { prop: 'unit', label: '单位', align: 'center', width: 80 }),
						h(ElTableColumn, {
							prop: 'applicationQuantity',
							label: '申报数量',
							align: 'right',
							width: 100,
							formatter: row => {
								return row.applicationQuantity != null ? row.applicationQuantity : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'purchaseQuantity',
							label: '采购数量',
							align: 'right',
							width: 110,
							formatter: row => {
								return row.purchaseQuantity != null ? row.purchaseQuantity : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'taxRate',
							label: '税率(%)',
							align: 'right',
							width: 100,
							formatter: row => {
								return row.taxRate != null ? row.taxRate : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'taxIncludedUnitPrice',
							label: '单价',
							align: 'right',
							width: 100,
							formatter: row => {
								return row.taxIncludedUnitPrice != null ? formatAmount(row.taxIncludedUnitPrice) : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'taxIncludedAmount',
							label: '金额',
							align: 'right',
							width: 110,
							formatter: row => {
								return row.taxIncludedAmount != null ? formatAmount(row.taxIncludedAmount) : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'taxExcludedAmount',
							label: '不含税金额',
							align: 'right',
							width: 110,
							formatter: row => {
								return row.taxExcludedAmount != null ? formatAmount(row.taxExcludedAmount) : '-'
							},
						}),
					],
				),
			])
		}
	},
}

const tableColumns = ref([
	// 表头列
	{ label: '序号', type: 'seq', width: 50, align: 'center' },
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
					row.purchaseNo,
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
	{
		label: '状态',
		prop: 'processStatus',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			const statusMap = {
				0: { label: '未发起', type: 'info' },
				1: { label: '审批中', type: 'warning' },
				2: { label: '审批通过', type: 'success' },
				3: { label: '审批不通过', type: 'danger' },
				4: { label: '已办结', type: 'success' },
				5: { label: '作废', type: 'danger' },
			}
			const status = statusMap[row.processStatus] || { label: '未知', type: 'info' }
			return [
				h(
					ElTag,
					{
						type: status.type,
					},
					{
						default: () => {
							return status.label
						},
					},
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 120,
		fixed: 'right',
		align: 'center',
		render: row => {
			const dropDownList = []

			dropDownList.push(
				{
					name: '详情',
					command: '详情',
					click: () => viewDetail(row),
					icon: View,
				},
				{
					name: '编辑',
					command: '编辑',
					click: () => edit(row),
					icon: Edit,
					disabled: row.processStatus !== '0',
				},
				{
					name: '发起',
					command: '发起',
					click: () => handleSubmit(row),
					icon: Promotion,
					disabled: row.processStatus !== '0',
				},
				{
					name: '审批历史',
					command: '审批历史',
					click: () => handleHistory(row),
					icon: Histogram,
					type: 'primary',
				},
				{
					name: '删除',
					command: '删除',
					click: () => handleDelete(row),
					type: 'danger',
					icon: Delete,
					permission: 'equipment:materialPurchase:delete',
					disabled: row.processStatus !== '0',
				},
			)

			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }),
					},
				),
			]
		},
	},
])

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})

/**--------------方法------------ */
// 点击查询按钮的事件
const getList = e => {
	if (e) {
		queryParams.value = { ...queryParams.value, ...e }
	}
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
		detailRef.value.getBelongDeptList()
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
		detailRef.value.getBelongDeptList()
		materialPurchaseApi.getById(editRow.id).then(res => {
			if (res.code === '0000' && res.data) {
				proxy.setFormData(detailRef.value.formData.form, res.data)
				detailRef.value.editDetailList(res.data.detailList || [])
				detailRef.value.editComparisonList(res.data.comparisonList || [])
				detailRef.value.init(false)
				if (res.data.useCompanyId) {
					const userDeptId = userStore.deptId
					if (userDeptId && String(res.data.useCompanyId) === String(userDeptId)) {
						detailRef.value.belongDeptDisabled = true
					}
				}
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

// 发起流程
const submitMaterialPurchaseProcess = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	console.log('submitMaterialPurchaseProcess:', processDefinitionId, variables, startUserSelectAssignees)
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return materialPurchaseApi.materialPurchaseStart(params)
}

const handleSubmit = row => {
	proxy.$modal
		.confirm('确定发起审批流程？')
		.then(() => {
			materialPurchaseApi
				.getById(row.id)
				.then(res => {
					if (res && res.data) {
						startProcess({
							rowData: res.data,
							businessId: route.meta?.menuId,
							businessTypeCode: 'bpm:equipment:controller:materialPurchaseStart',
							businessSubmit: submitMaterialPurchaseProcess,
							onSuccess() {
								proxy.$modal.msgSuccess('发起成功')
								getList(queryParams.value)
							},
							onError(err) {
								proxy.$modal.msgError(err.message)
							},
						})
					}
				})
				.catch(error => {
					console.error('获取详情失败:', error)
					proxy.$modal.msgError('获取详情失败')
				})
		})
		.catch(() => {})
}

// 审批历史
const handleHistory = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.procInstId,
		},
	})
}

// 初始化方法
const init = async () => {
	queryParams.value = {
		startPage: 1,
		pageSize: 20,
	}
	getList(null)
}

// 按钮列表
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:materialPurchase:add',
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
