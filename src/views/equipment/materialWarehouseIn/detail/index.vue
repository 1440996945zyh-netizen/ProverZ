<template>
	<el-form :model="form" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="baseData">
				<el-row :gutter="24">
					<el-col :span="6">
						<el-form-item label="入库主题" prop="warehouseInTitle">
							<el-input v-model="form.warehouseInTitle" placeholder="请输入入库主题" :disabled="formDisabled" maxlength="200" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="入库类型" prop="warehouseInTypeCode">
							<Select
								:dataConfig="{ url: '/api/internal/public/getDictListByType/WARE_IN_TYPE' }"
								v-model:value="form.warehouseInTypeCode"
								v-model:label="form.warehouseInTypeName"
								:disabled="formDisabled"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="入库日期" prop="warehouseInDate">
							<el-date-picker
								v-model="form.warehouseInDate"
								type="date"
								placeholder="请选择入库日期"
								:disabled="formDisabled"
								style="width: 100%"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="所属仓库" prop="warehouseId">
							<Select
								:selectData="warehouseList"
								v-model:value="form.warehouseId"
								v-model:label="form.warehouseName"
								:disabled="formDisabled"
								placeholder="请选择所属仓库"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="供应商名称" prop="supplierId">
							<RemoteSelect
								type="CUSTOMER_SUPPLIER"
								v-model:value="form.supplierId"
								v-model:label="form.supplierName"
								:disabled="formDisabled"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="交货人" prop="deliveryPersonName">
							<el-input
								v-model="form.deliveryPersonName"
								:disabled="formDisabled"
								placeholder="请输入交货人"
								clearable
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="验收人" prop="acceptancePersonId">
							<Select
								:selectData="userList"
								v-model:value="form.acceptancePersonId"
								v-model:label="form.acceptancePersonName"
								:disabled="formDisabled"
								placeholder="请选择验收人"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="批次号" prop="batchNo">
							<el-input
								v-model="form.batchNo"
								:disabled="formDisabled"
								placeholder="请输入批次号"
								clearable
							/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="备注" prop="remarks">
							<el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注" :disabled="formDisabled" maxlength="500" />
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="附件">
							<Upload businessType="MATERIAL_WAREHOUSE_IN_FILE" :businessId="form.id ? String(form.id) : ''" @changeFile="changeFile" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>

			<!-- 明细列表 -->
			<el-collapse-item title="物资入库明细" name="detailList">
				<template #title>
					<div style="width: 100%; display: flex; justify-content: space-between">
						<span>物资入库明细</span>
						<div style="display: flex">
							<el-button plain size="medium" @click.stop="addDetail" :disabled="formDisabled" style="margin: 8px 10px 0px 0px">
								采购清单
							</el-button>
						</div>
					</div>
				</template>
				<EditTable
					ref="detailTableRef"
					:name="'物资入库明细'"
					:tableData="detailList"
					:tableColumns="detailColumns"
					:tableHeight="tableHeight"
					:cellClickEvent="detailCellClickEvent"
					:headerCellClickEvent="detailHeaderCellClickEvent"
					:editRules="detailEditRules"
					:rowConfig="rowConfig"
					:disabledKey="'rowDisabled'"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>

	<!-- 选择申报物资明细抽屉 -->
	<el-drawer v-model="applicationDetailDrawerVisible" title="采购单" size="85%">
		<applicationDetailTable ref="applicationDetailTableRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="applicationDetailDrawerVisible = false">取消</el-button>
				<el-button type="primary" @click="saveApplicationDetails">确定</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="materialWarehouseInDetail">
import { ref, reactive, nextTick, h, getCurrentInstance, watch, onMounted } from 'vue'
import { ElButton, ElInput, ElInputNumber, ElSelect, ElOption, ElDatePicker } from 'element-plus'
import EditTable from '@/components/EditTable'
import Select from '@/components/Select/index.vue'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import Upload from '@/components/upload'
import publicApi from '@/api/public/index'
import materialWarehouseApi from '@/api/equipment/materialWarehouse/index'
import applicationDetailTable from './applicationDetailTable/index.vue'
const { proxy } = getCurrentInstance()
const tableHeight = reactive(window.innerHeight - 600)
const ruleForm = ref()
const detailTableRef = ref()
const formDisabled = ref(false)
const activeNames = ref(['baseData', 'detailList'])
const applicationDetailDrawerVisible = ref(false) // 选择申报物资明细抽屉显示状态
const applicationDetailTableRef = ref() // 申报物资明细表格ref

const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }

// 表单数据
const formData = reactive({
	form: {
		id: null,
		warehouseInTitle: '',
		warehouseInNo: '',
		warehouseInTypeCode: '',
		warehouseInTypeName: '',
		warehouseInDate: null,
		deptId: null,
		deptName: '',
		warehouseId: null,
		warehouseName: '',
		supplierId: null,
		supplierName: '',
		remarks: '',
		deliveryPersonId: null,
		deliveryPersonName: '',
		acceptancePersonId: null,
		acceptancePersonName: '',
		batchNo: '', // 批次号
		fileIds: [], // 附件ID列表
	},
	detailList: [],
})

const { form, detailList } = formData

// 用户列表（负责人列表，不按部门查询）
const userList = ref([])

// 仓库列表
const warehouseList = ref([])

// 表单验证规则
const rules = reactive({
	warehouseInTitle: proxy.getRules({ required: true }),
	warehouseInTypeCode: proxy.getRules({ required: true }),
	warehouseInDate: proxy.getRules({ required: true }),
	warehouseId: proxy.getRules({ required: true }),
	supplierId: proxy.getRules({ required: true }),
	acceptancePersonId: proxy.getRules({ required: true }),
})

// 加载用户列表（不按部门查询，获取所有用户）
const loadUserList = () => {
	publicApi.getLocalSelect({
		type: 'USER',
	}).then(res => {
		if (res.code == '0000') {
			userList.value = res.data.map(item => ({
				label: item.label || item.userName,
				value: item.value || item.id,
			}))
		}
	})
}

// 加载仓库列表
const loadWarehouseList = () => {
	materialWarehouseApi.getListForSelect().then(res => {
		if (res.code == '0000' && res.data) {
			warehouseList.value = res.data.map(item => ({
				label: item.warehouseName,
				value: item.id,
			}))
		}
	})
}

// 明细表格列（基础列）
const baseDetailColumns = [
	{
		label: '物资名称',
		prop: 'materialName',
		width: 150,
	},
	{
		label: '申报部门',
		prop: 'deptName',
		width: 180,
	},
	{
		label: '规格型号',
		prop: 'specification',
		width: 100,
	},
	{
		label: '品牌',
		prop: 'brand',
		width: 100,
	},
	{
		label: '采购数量',
		prop: 'purchaseQuantity',
		width: 100,
		align: 'right',
	},
	{
		label: '未入库',
		prop: 'remainingQuantity',
		width: 100,
		align: 'right',
	},
	{
		label: '本次入库',
		prop: 'warehouseInQuantity',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 0,
				precision: 2,
			},
		},
		width: 120,
		align: 'right',
	},
	{
		label: '已入库',
		prop: 'warehouseInQuantitySum',
		width: 100,
		align: 'right',
	},
	// {
	// 	label: '已出库数量',
	// 	prop: 'outQuantity',
	// 	width: 120,
	// 	align: 'right',
	// },
	{
		label: '单位',
		prop: 'unit',
    align: 'center',
		width: 80,
	},
	{
		label: '单价(元)',
		prop: 'taxIncludedUnitPrice',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 0,
				precision: 2,
			},
		},
		width: 100,
		align: 'right',
	},
	{
		label: '金额(元)',
		prop: 'taxIncludedAmount',
		width: 100,
		align: 'right',
		isThousandth: true,
	},
	// {
	// 	label: '不含税单价(元)',
	// 	prop: 'taxExcludedUnitPrice',
	// 	width: 120,
	// 	align: 'right',
	// },
	// {
	// 	label: '不含税金额(元)',
	// 	prop: 'taxExcludedAmount',
	// 	width: 120,
	// 	align: 'right',
	// 	isThousandth: true,
	// },
	// {
	// 	label: '税率(%)',
	// 	prop: 'taxRate',
	// 	editType: 'input',
	// 	editRender: {
	// 		component: ElInputNumber,
	// 		props: {
	// 			controlsPosition: 'right',
	// 			min: 0,
	// 			max: 100,
	// 			precision: 2,
	// 		},
	// 	},
	// 	width: 100,
	// 	align: 'right',
	// },
	// {
	// 	label: '税额(元)',
	// 	prop: 'taxAmount',
	// 	width: 120,
	// 	align: 'right',
	// 	isThousandth: true,
	// },
	{
		label: '质保到期时间',
		prop: 'warrantyExpiryDate',
		editType: 'date',
		editRender: {
			component: ElDatePicker,
			props: {
				type: 'date',
				valueFormat: 'YYYY-MM-DD',
				placeholder: '请选择质保到期时间',
			},
		},
		width: 150,
	},
	{
		label: '采购员',
		prop: 'purchaserId',
		modelLabel: 'purchaserName',
		editType: 'select',
		selectData: userList,
		width: 100,
	},
	{
		prop: '',
		label: '操作',
		width: 100,
    fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteDetail(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: formDisabled.value,
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
]

// 明细表格列（根据formDisabled动态过滤）
const detailColumns = reactive([...baseDetailColumns])

// 监听formDisabled变化，动态更新列（查看时隐藏已入库数量）
watch(
	() => formDisabled.value,
	(newVal) => {
		if (newVal) {
			// 查看模式下，隐藏已入库数量
			const index = detailColumns.findIndex(col => col.prop === 'warehouseInQuantitySum')
			if (index > -1) {
				detailColumns.splice(index, 1)
			}
		} else {
			// 编辑模式下，显示已入库数量（如果不存在则添加）
			const exists = detailColumns.some(col => col.prop === 'warehouseInQuantitySum')
			if (!exists) {
				// 找到"本次入库数量"列的索引
				const warehouseInQuantityIndex = detailColumns.findIndex(col => col.prop === 'warehouseInQuantity')
				if (warehouseInQuantityIndex > -1) {
					// 在"本次入库数量"后面插入"已入库数量"
					detailColumns.splice(warehouseInQuantityIndex + 1, 0, {
						label: '已入库数量',
						prop: 'warehouseInQuantitySum',
						width: 120,
						align: 'right',
					})
				}
			}
		}
	},
	{ immediate: true }
)

// 明细编辑规则
const detailEditRules = reactive({
	warehouseInQuantity: proxy.getRules({
		required: true,
		numberCheck: {
			int: 10,
			dec: 2,
		},
	}),
	taxIncludedUnitPrice: proxy.getRules({
		required: true,
		numberCheck: {
			int: 10,
			dec: 2,
		},
	}),
	taxRate: proxy.getRules({
		required: true,
		numberCheck: {
			int: 3,
			dec: 2,
		},
	}),
	taxIncludedUnitPrice: proxy.getRules({
		required: true,
		numberCheck: {
			int: 10,
			dec: 2,
		},
	}),
})

// 新增明细 - 打开选择申报物资明细抽屉
const addDetail = () => {
	if (formDisabled.value) {
		return
	}
	// 供应商必填，需要先选择供应商
	if (!form.supplierId) {
		proxy.$message.warning('请先选择供应商！')
		return
	}
	applicationDetailDrawerVisible.value = true
	nextTick(() => {
		// 传递供应商ID到查询条件中
		if (applicationDetailTableRef.value && applicationDetailTableRef.value.init) {
			applicationDetailTableRef.value.init(form.supplierId)
		} else {
			applicationDetailTableRef.value.queryParams.supplierId = form.supplierId
			applicationDetailTableRef.value.getList(applicationDetailTableRef.value.queryParams)
		}
	})
}

// 保存选择的申报物资明细
const saveApplicationDetails = () => {
	// 判断是否选择明细
	if (!applicationDetailTableRef.value || !applicationDetailTableRef.value.checkData || applicationDetailTableRef.value.checkData.length < 1) {
		proxy.$message.warning('请选择申报物资明细！')
		return
	}

	// 获取选中的数据
	const selectedDetails = applicationDetailTableRef.value.checkData

	// 校验：只能选择采购单号相同的明细
	const purchaseNos = selectedDetails.map(item => item.purchaseNo).filter(no => no != null && no !== '')
	const uniquePurchaseNos = [...new Set(purchaseNos)]
	if (uniquePurchaseNos.length > 1) {
		const purchaseNoList = uniquePurchaseNos.join('、')
		proxy.$message.warning(`只能选择相同采购单号的明细，当前选择了多个采购单号：${purchaseNoList}`)
		return
	}

	// 如果明细列表中已有数据，校验新选择的明细是否与已有明细的采购单号一致
	if (detailList.length > 0 && uniquePurchaseNos.length > 0) {
		const existingPurchaseNo = detailList[0].purchaseNo
		if (existingPurchaseNo && existingPurchaseNo !== uniquePurchaseNos[0]) {
			proxy.$message.warning(`只能选择与已有明细相同采购单号的明细，已有明细的采购单号为：${existingPurchaseNo}，当前选择的采购单号为：${uniquePurchaseNos[0]}`)
			return
		}
	}

	// 检查是否有重复的明细（根据applicationId判断，因为同一个物资申报明细不应该重复添加）
	const duplicateDetails = []
	const newDetails = []

	selectedDetails.forEach(item => {
		// 检查是否已存在（根据applicationId判断，即物资申报明细ID）
		const exists = detailList.some(detail => detail.applicationId === item.applicationDetailId)
		if (exists) {
			duplicateDetails.push(item)
		} else {
			newDetails.push(item)
		}
	})

	// 如果有重复的明细，提示用户
	if (duplicateDetails.length > 0) {
		const materialNames = duplicateDetails.map(item => item.materialName || '未知物资').join('、')
		proxy.$message.warning(`以下物资明细已存在，不能重复添加：${materialNames}`)
	}

	// 如果没有新的明细可添加，直接关闭抽屉
	if (newDetails.length === 0) {
		applicationDetailDrawerVisible.value = false
		return
	}

	// 将新的明细添加到入库明细列表
	newDetails.forEach(item => {
		// 计算不含税单价
		const taxExcludedUnitPrice = item.taxIncludedUnitPrice && item.taxRate
			? Math.round((item.taxIncludedUnitPrice / (1 + item.taxRate / 100)) * 100) / 100
			: null

		detailList.push({
			row_id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			id: null,
			warehouseInId: null,
			applicationId: item.applicationDetailId,
			purchaseDetailId: item.purchaseDetailId,
			applicationDeptId: item.applicationDeptId || null, // 申报部门ID
			applicationDeptName: item.applicationDeptName || '', // 申报部门名称
			purchaseQuantity: item.purchaseQuantity || null, // 采购数量
			supplierId: item.supplierId || null, // 供应商ID
			supplierName: item.supplierName || '', // 供应商名称
			materialId: item.materialId || null, // 物资ID
			materialName: item.materialName || '',
			deptName: item.applicationDeptName || '', // 申报部门（用于显示）
			specification: item.specificationModel || '', // 规格型号
			brand: item.brand || '', // 品牌
			warehouseInQuantity: item.remainingQuantity || null, // 默认入库数量等于未入库数量
			warehouseInQuantitySum: item.warehouseInQuantity || 0, // 已入库数量
			outQuantity: 0,
			remainingQuantity: item.remainingQuantity || null, // 未入库数量
			unit: item.unit || '',
			unitCode: item.unitCode || null, // 计量单位编码
			taxExcludedUnitPrice: taxExcludedUnitPrice,
			taxIncludedUnitPrice: item.taxIncludedUnitPrice || null,
			taxExcludedAmount: null,
			taxIncludedAmount: null,
			invoicedAmount: 0,
			uninvoicedAmount: null,
			taxAmount: null,
			taxRate: item.taxRate || null,
			materialCode: item.materialCode || '',
			purchaseNo: item.purchaseNo || '', // 采购单号
			purchaseTypeName: item.purchaseTypeName || '', // 采购类型
			fixedServiceCategoryName: item.fixedServiceCategoryName || '', // 定点服务类别
			warrantyExpiryDate: null,
			purchaserId: item.purchaseCreateBy || null, // 采购员ID，默认为采购表创建人
			purchaserName: item.purchaseCreateByName || '', // 采购员名称，默认为采购表创建人
			rowDisabled: false,
		})
	})

	// 关闭抽屉
	applicationDetailDrawerVisible.value = false
	// 重新计算金额和数量
	detailList.forEach(row => {
		calculateDetailAmounts(row)
	})
}

// 删除明细
const deleteDetail = row => {
	if (formDisabled.value) {
		return
	}
	proxy.$modal
		.confirm('确定删除该明细?')
		.then(() => {
			const index = detailList.findIndex(item => item.row_id === row.row_id)
			if (index > -1) {
				detailList.splice(index, 1)
			}
		})
		.catch(err => {})
}


// 明细单元格点击事件
const detailCellClickEvent = ({ row, column }) => {
	if (formDisabled.value) {
		return
	}
	// 计算相关金额和数量
	if (column.property === 'warehouseInQuantity') {
		handleWarehouseInQuantityBlur(row)
	}
	if (column.property === 'outQuantity') {
		// 验证：入库数量 + 已入库数量 不得超过采购数量
		if (row.purchaseQuantity != null) {
			const warehouseInQty = Number(row.warehouseInQuantity || 0)
			const warehouseInQtySum = Number(row.warehouseInQuantitySum || 0)
			const purchaseQty = Number(row.purchaseQuantity)
			const totalQty = warehouseInQty + warehouseInQtySum

			if (totalQty > purchaseQty) {
				proxy.$message.warning(`入库数量(${warehouseInQty}) + 已入库数量(${warehouseInQtySum}) = ${totalQty}，不能超过采购数量(${purchaseQty})`)
			}
		}
	}
	if (column.property === 'taxRate' || column.property === 'taxIncludedUnitPrice') {
		calculateDetailAmounts(row)
	}
	if (column.property === 'taxIncludedAmount' || column.property === 'invoicedAmount') {
		// 计算未开票金额
		if (row.taxIncludedAmount != null && row.invoicedAmount != null) {
			row.uninvoicedAmount = Math.round((row.taxIncludedAmount - row.invoicedAmount) * 100) / 100
		} else if (row.taxIncludedAmount != null) {
			row.uninvoicedAmount = Math.round(row.taxIncludedAmount * 100) / 100
		}
	}
}

// 明细表头点击事件
const detailHeaderCellClickEvent = ({ column }) => {
	// 可以在这里处理表头点击事件
}

// 计算明细金额
const calculateDetailAmounts = row => {
	if (row.taxIncludedUnitPrice != null && row.warehouseInQuantity != null) {
		// 含税金额 = 含税单价 * 入库数量
		row.taxIncludedAmount = Math.round(row.taxIncludedUnitPrice * row.warehouseInQuantity * 100) / 100
	} else {
		row.taxIncludedAmount = null
	}

	if (row.taxRate != null && row.taxIncludedAmount != null) {
		// 税额 = 含税金额 * 税率 / (100 + 税率)
		const rate = row.taxRate / 100
		row.taxAmount = Math.round((row.taxIncludedAmount * rate) / (1 + rate) * 100) / 100
		// 不含税金额 = 含税金额 - 税额
		row.taxExcludedAmount = Math.round((row.taxIncludedAmount - row.taxAmount) * 100) / 100
		// 不含税单价 = 不含税金额 / 入库数量
		if (row.warehouseInQuantity != null && row.warehouseInQuantity > 0) {
			row.taxExcludedUnitPrice = Math.round((row.taxExcludedAmount / row.warehouseInQuantity) * 100) / 100
		}
	} else {
		row.taxAmount = null
		row.taxExcludedAmount = null
	}

	// 计算未开票金额
	if (row.taxIncludedAmount != null && row.invoicedAmount != null) {
		row.uninvoicedAmount = Math.round((row.taxIncludedAmount - row.invoicedAmount) * 100) / 100
	} else if (row.taxIncludedAmount != null) {
		row.uninvoicedAmount = Math.round(row.taxIncludedAmount * 100) / 100
	}
}

// 处理入库数量变化事件（失去焦点或值变化时调用）
const handleWarehouseInQuantityBlur = (row) => {
	if (formDisabled.value) {
		return
	}
	// 验证：入库数量 + 已入库数量 不得超过采购数量
	if (row.purchaseQuantity != null) {
		const warehouseInQty = Number(row.warehouseInQuantity || 0)
		const warehouseInQtySum = Number(row.warehouseInQuantitySum || 0)
		const purchaseQty = Number(row.purchaseQuantity)
		const totalQty = warehouseInQty + warehouseInQtySum

		if (totalQty > purchaseQty) {
			proxy.$message.warning(`入库数量(${warehouseInQty}) + 已入库数量(${warehouseInQtySum}) = ${totalQty}，不能超过采购数量(${purchaseQty})`)
			// 如果入库数量超过限制，调整为最大允许值
			const maxWarehouseInQty = Math.max(0, purchaseQty - warehouseInQtySum)
			row.warehouseInQuantity = maxWarehouseInQty
		}
	}
	// 未入库数量由后端计算，前端不处理
	// 重新计算金额
	calculateDetailAmounts(row)
}

// 监听明细数据变化，自动计算金额
watch(
	() => detailList.map(d => ({
		taxIncludedAmount: d.taxIncludedAmount,
		taxExcludedAmount: d.taxExcludedAmount,
	})),
	() => {
		// 明细变化时，可以在这里处理主表金额汇总
	},
	{ deep: true }
)

// 监听入库数量变化，触发金额计算和验证
watch(
	() => detailList.map(d => ({
		warehouseInQuantity: d.warehouseInQuantity,
		purchaseQuantity: d.purchaseQuantity,
		row_id: d.row_id,
	})),
	(newVal, oldVal) => {
		if (formDisabled.value) {
			return
		}
		// 找出变化的行
		if (oldVal && oldVal.length > 0) {
			newVal.forEach((newItem, index) => {
				const oldItem = oldVal[index]
				if (oldItem && newItem.warehouseInQuantity !== oldItem.warehouseInQuantity) {
					const row = detailList.find(r => r.row_id === newItem.row_id)
					if (row) {
						handleWarehouseInQuantityBlur(row)
					}
				}
			})
		}
	},
	{ deep: true }
)

// 监听供应商变化，清空明细列表
watch(
	() => form.supplierId,
	(newVal, oldVal) => {
		if (formDisabled.value) {
			return
		}
		// 如果供应商发生变化（从有值变为另一个值，或从有值变为空），清空明细列表
		if (oldVal !== null && oldVal !== undefined && oldVal !== '' && newVal !== oldVal) {
			detailList.length = 0
		}
	}
)

// 处理明细数据（编辑时调用）
const editDetailList = data => {
	if (data && data.length > 0) {
		detailList.length = 0
		data.forEach((item, index) => {
			// 未入库数量由后端计算，直接使用后端返回的值
			detailList.push({
				row_id: `row_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
				id: item.id || null,
				warehouseInId: item.warehouseInId || null,
				applicationId: item.applicationId || null,
				purchaseDetailId: item.purchaseDetailId || null,
				applicationDeptId: item.applicationDeptId || null, // 申报部门ID
				applicationDeptName: item.applicationDeptName || '', // 申报部门名称
				purchaseQuantity: item.purchaseQuantity || null, // 采购数量
				supplierId: item.supplierId || null, // 供应商ID
				supplierName: item.supplierName || '', // 供应商名称
				materialId: item.materialId || null, // 物资ID
				materialName: item.materialName || '',
				deptName: item.applicationDeptName || '', // 申报部门（用于显示）
				specification: item.specification || '', // 规格型号
				brand: item.brand || '',
				warehouseInQuantity: item.warehouseInQuantity || null,
				warehouseInQuantitySum: item.warehouseInQuantity || 0, // 已入库数量（当前行的入库数量）
				outQuantity: item.outQuantity || 0,
				remainingQuantity: item.remainingQuantity || null, // 未入库数量（由后端计算）
				unit: item.unit || '',
				unitCode: item.unitCode || null, // 计量单位编码
				taxExcludedUnitPrice: item.taxExcludedUnitPrice || null,
				taxIncludedUnitPrice: item.taxIncludedUnitPrice || null,
				taxExcludedAmount: item.taxExcludedAmount || null,
				taxIncludedAmount: item.taxIncludedAmount || null,
				invoicedAmount: item.invoicedAmount || 0,
				uninvoicedAmount: item.uninvoicedAmount || null,
				taxAmount: item.taxAmount || null,
				taxRate: item.taxRate || null,
			materialCode: item.materialCode || '',
			warrantyExpiryDate: item.warrantyExpiryDate || null,
			purchaserId: item.purchaserId || null,
			purchaserName: item.purchaserName || '',
			rowDisabled: false,
		})
		})
		// 如果有明细，确保明细折叠项展开
		nextTick(() => {
			if (!activeNames.value.includes('detailList')) {
				activeNames.value.push('detailList')
			}
		})
	} else {
		detailList.length = 0
	}
}

// 文件上传回调
const changeFile = files => {
	form.fileIds = files
}

// 重置表单
const resetForm = () => {
	form.id = null
	form.warehouseInTitle = ''
	form.warehouseInNo = ''
	form.warehouseInTypeCode = ''
	form.warehouseInTypeName = ''
	form.warehouseInDate = null
	form.deptId = null
	form.deptName = ''
	form.warehouseId = null
	form.warehouseName = ''
	form.supplierId = null
	form.supplierName = ''
	form.remarks = ''
	form.deliveryPersonId = null
	form.deliveryPersonName = ''
	form.acceptancePersonId = null
	form.acceptancePersonName = ''
	form.batchNo = ''
	form.fileIds = []
	detailList.length = 0
	proxy.$bus.emit('resetFileList') //清空文件上传
	// 注意：入库单号和部门信息由后端自动赋值，前端不处理
}

// 验证
const validate = async () => {
	let flag = false
	let flag2 = false
	let flag3 = true

	// 校验：入库数量 + 已入库数量 不得超过采购数量
	if (detailList && detailList.length > 0) {
		for (let i = 0; i < detailList.length; i++) {
			const row = detailList[i]
			if (row.purchaseQuantity != null) {
				const warehouseInQty = Number(row.warehouseInQuantity || 0)
				const warehouseInQtySum = Number(row.warehouseInQuantitySum || 0)
				const purchaseQty = Number(row.purchaseQuantity)
				const totalQty = warehouseInQty + warehouseInQtySum

				if (totalQty > purchaseQty) {
					proxy.$message.warning(`第${i + 1}行：入库数量(${warehouseInQty}) + 已入库数量(${warehouseInQtySum}) = ${totalQty}，不能超过采购数量(${purchaseQty})`)
					flag3 = false
					return false
				}
			}
		}
	}

	if (!flag3) {
		return false
	}

	flag2 = await detailTableRef.value?.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag2 && flag3) {
			flag = true
		} else if (!valid) {
			proxy.$message.warning('请完善表单信息！')
			flag = false
			return
		} else if (!flag2) {
			proxy.$message.warning('请完善明细信息！')
			flag = false
			return
		}
	})
	return flag
}

// 初始化
const init = isAdd => {
	if (isAdd) {
		// 自动生成入库单主题：入库单 + 日期
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		form.warehouseInTitle = `入库单${year}${month}${day}`
		// 设置默认入库日期为今天
		form.warehouseInDate = `${year}-${month}-${day}`
	} else {
		// 编辑或查看时，确保明细折叠项展开
		nextTick(() => {
			if (detailList.length > 0 && !activeNames.value.includes('detailList')) {
				activeNames.value.push('detailList')
			}
		})
	}
}

// 组件挂载时加载用户列表和仓库列表
onMounted(() => {
	loadUserList()
	loadWarehouseList()
})

defineExpose({
	validate,
	resetForm,
	formData,
	formDisabled,
	init,
	editDetailList,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>

