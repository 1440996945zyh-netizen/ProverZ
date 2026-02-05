<template>
	<el-form :model="form" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="baseData">
				<el-row :gutter="24">
					<el-col :span="6">
						<el-form-item label="采购单主题" prop="purchaseTitle">
							<el-input v-model="form.purchaseTitle" placeholder="请输入采购单主题" :disabled="formDisabled" maxlength="200" />
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
						<el-form-item label="采购类型" prop="purchaseTypeCode">
							<el-select v-model="form.purchaseTypeCode" placeholder="请选择采购类型" :disabled="formDisabled" style="width: 100%" @change="handlePurchaseTypeChange">
								<el-option label="比价" value="01" />
								<el-option label="招标" value="02" />
								<el-option label="定点服务" value="03" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-if="form.purchaseTypeCode === '03'">
						<el-form-item label="定点服务类别" prop="fixedServiceCategoryCode">
							<Select
								:dataConfig="{ url: '/api/internal/public/getDictListByType/FIX_SERVICE' }"
								v-model:value="form.fixedServiceCategoryCode"
								v-model:label="form.fixedServiceCategoryName"
								:disabled="formDisabled"
							/>
						</el-form-item>
					</el-col>
<!--					<el-col :span="8">-->
<!--						<el-form-item label="含税金额" prop="taxIncludedAmount">-->
<!--							<el-input v-model="form.taxIncludedAmount" placeholder="自动计算" :disabled="true" />-->
<!--						</el-form-item>-->
<!--					</el-col>-->
<!--					<el-col :span="8">-->
<!--						<el-form-item label="不含税金额" prop="taxExcludedAmount">-->
<!--							<el-input v-model="form.taxExcludedAmount" placeholder="自动计算" :disabled="true" />-->
<!--						</el-form-item>-->
<!--					</el-col>-->
					<el-col :span="24" v-if="form.purchaseStatus === 1">
						<el-form-item label="失败原因" prop="failureReason">
							<el-input v-model="form.failureReason" type="textarea" :rows="3" :disabled="true" maxlength="500" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>

			<!-- 明细列表 -->
			<el-collapse-item title="物资采购明细" name="detailList">
				<template #title>
					<div style="width: 100%; display: flex; justify-content: space-between">
						<span>物资采购明细</span>
						<div style="display: flex;">
              <div style="margin-right: 16px">
                <el-statistic group-separator="," :precision="2" :value-style="{ fontSize: '15px',color: 'blue' }" :value="Number(form.taxIncludedAmount) || 0">
                  <template v-slot:prefix>
                    <span style="font-size: 15px">总金额：</span>
                  </template>
                </el-statistic>
              </div>
              <div style="margin-right: 16px">
                <el-statistic group-separator="," :precision="2" :value-style="{ fontSize: '15px',color: 'blue' }" :value="Number(form.taxExcludedAmount) || 0">
                  <template v-slot:prefix>
                    <span style="font-size: 15px">不含税金额：</span>
                  </template>
                </el-statistic>
              </div>
							<el-button plain size="medium" @click.stop="addDetail" :disabled="formDisabled" style="margin: 8px 10px 0px 0px">
								待采购清单
							</el-button>
						</div>
					</div>
				</template>
				<EditTable
					ref="detailTableRef"
					:name="'物资采购明细'"
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

      <!-- 比价信息 -->
      <el-collapse-item v-if="form.purchaseTypeCode === '01'" title="比价信息" name="comparisonList">
<!--        <template #title>-->
<!--          <div style="width: 100%; display: flex; justify-content: space-between">-->
<!--            <span>比价信息</span>-->
<!--            <div style="display: flex">-->
<!--              <el-button type="primary" @click.stop="addComparison" :disabled="formDisabled" style="margin: 8px 10px 0px 0px">-->
<!--                新增-->
<!--              </el-button>-->
<!--            </div>-->
<!--          </div>-->
<!--        </template>-->
        <EditTable
          ref="comparisonTableRef"
          :name="'比价信息'"
          :tableData="comparisonList"
          :tableColumns="comparisonColumns"
          :tableHeight="tableHeightBj"
          :cellClickEvent="comparisonCellClickEvent"
          :headerCellClickEvent="comparisonHeaderCellClickEvent"
          :editRules="comparisonEditRules"
          :rowConfig="rowConfig"
		  :hasAdd="true"
          :disabledKey="'rowDisabled'"
        />
      </el-collapse-item>
		</el-collapse>
	</el-form>

	<!-- 选择申报物资明细抽屉 -->
	<el-drawer v-model="applicationDetailDrawerVisible" title="选择申报物资明细" size="85%">
		<applicationDetailTable ref="applicationDetailTableRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="applicationDetailDrawerVisible = false">取消</el-button>
				<el-button type="primary" @click="saveApplicationDetails">确定</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="materialPurchaseDetail">
import { ref, reactive, nextTick, onMounted, h, getCurrentInstance, computed, watch } from 'vue'
import { ElButton, ElInput, ElInputNumber, ElSelect, ElOption } from 'element-plus'
import EditTable from '@/components/EditTable'
import Select from '@/components/Select/index.vue'
import RemoteSelect from '@/components/RemoteSelect/index.vue'
import applicationDetailTable from './applicationDetailTable/index.vue'
import materialApplicationApi from '@/api/equipment/materialApplication/index'
const { proxy } = getCurrentInstance()
const tableHeightBj = 300
const tableHeight = 500
const ruleForm = ref()
const detailTableRef = ref()
const comparisonTableRef = ref()
const formDisabled = ref(false)
const activeNames = ref(['baseData', 'detailList'])
const applicationDetailDrawerVisible = ref(false) // 是否显示选择申报物资明细抽屉
const applicationDetailTableRef = ref() // 申报物资明细表格ref

const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }


// 表单数据
const formData = reactive({
	form: {
		id: null,
		purchaseTitle: '',
		purchaseNo: '',
		supplierId: null,
		supplierName: '',
		purchaseTypeCode: '',
		purchaseTypeName: '',
		fixedServiceCategoryCode: '',
		fixedServiceCategoryName: '',
		taxIncludedAmount: 0.00,
		taxExcludedAmount: 0.00,
		purchaseStatus: 0,
		failureReason: '',
	},
	detailList: [],
	comparisonList: [],
})

const { form, detailList, comparisonList } = formData

// 表单验证规则
const rules = reactive({
	purchaseTitle: proxy.getRules({ required: true }),
	supplierId: proxy.getRules({ required: true }),
	purchaseTypeCode: proxy.getRules({ required: true }),
	fixedServiceCategoryCode: [
		{
			validator: (rule, value, callback) => {
				// 如果采购类型为定点服务（'03'），则定点服务类别必填
				if (form.purchaseTypeCode === '03') {
					if (!value || value === '') {
						callback(new Error('请选择定点服务类别！'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: 'change',
		},
	],
})

// 明细表格列
const detailColumns = reactive([
	{
		label: '申请单号',
		prop: 'applicationNo',
    align: 'center',
		width: 150
	},
	{
		label: '物资名称',
		prop: 'materialName',
		minWidth: 150
	},
	// {
	// 	label: '物资类别',
	// 	prop: 'categoryName',
	// 	width: 220
	// },
	{
		label: '规格型号',
		prop: 'specificationModel',
		width: 100
	},
	{
		label: '单位',
		prop: 'unit',
    align: 'center',
		width: 80
	},
	{
		label: '申报数量',
		prop: 'applicationQuantity',
		width: 100,
		align: 'right',
	},
	{
		label: '采购数量',
		prop: 'purchaseQuantity',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 0,
				precision: 2,
			},
		},
		width: 110,
		align: 'right',
	},
	{
		label: '税率(%)',
		prop: 'taxRate',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 0,
				max: 100,
				precision: 2,
			},
		},
		width: 100,
		align: 'right',
	},
	{
		label: '单价',
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
	// {
	// 	label: '不含税单价',
	// 	prop: 'taxExcludedUnitPrice',
	// 	width: 80,
	// 	align: 'right',
	// },
	{
		label: '金额',
		prop: 'taxIncludedAmount',
		width: 110,
		align: 'right',
		isThousandth: true,
	},
	{
		label: '不含税金额',
		prop: 'taxExcludedAmount',
		width: 110,
		align: 'right',
		isThousandth: true,
	},
	{
		label: '税额',
		prop: 'taxAmount',
		width: 100,
		align: 'right',
		isThousandth: true,
	},
	{
		prop: '',
		label: '操作',
		width: 80,
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
])

// 比价信息表格列
const comparisonColumns = reactive([
	{
		label: '采购商',
		prop: 'supplierId',
		modelLabel: 'supplierName', // 用于同步供应商名称
		editType: 'remoteSelect',
		type: 'CUSTOMER_SUPPLIER', // 远程下拉框类型，与基本信息中的供应商名称一致
		editRender: {
			component: RemoteSelect,
			props: {
				placeholder: '请选择供应商',
			},
		},
	},
	{
		label: '报价',
		prop: 'quotationPrice',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 0,
				precision: 2,
			},
		},
		width: 450,
		align: 'right',
	},
	{
		prop: '',
		label: '添加',
		width: 90,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteComparison(row)
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
])

// 比价信息编辑验证规则
const comparisonEditRules = ref({
	supplierId: proxy.getRules({ required: true }),
	quotationPrice: proxy.getRules({
		required: true,
		numberCheck: {
			int: 10,
			dec: 2,
		},
	}),
})

// 明细编辑验证规则
const detailEditRules = ref({
	purchaseQuantity: proxy.getRules({
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
	// 采购类型必填，需要先选择采购类型
	if (!form.purchaseTypeCode) {
		proxy.$message.warning('请先选择采购类型！')
		return
	}
	// 如果采购类型为定点服务，定点服务类别必填
	if (form.purchaseTypeCode === '03' && (!form.fixedServiceCategoryCode || form.fixedServiceCategoryCode === '')) {
		proxy.$message.warning('请选择定点服务类别！')
		return
	}
	applicationDetailDrawerVisible.value = true
	nextTick(() => {
		// 重置日期区间为默认值（一个月前到今天）
		if (applicationDetailTableRef.value && applicationDetailTableRef.value.init) {
			// 传递采购类型和定点服务类别
			const purchaseTypeCode = form.purchaseTypeCode
			const fixedServiceCategoryCode = form.fixedServiceCategoryCode || ''
			applicationDetailTableRef.value.init(purchaseTypeCode, fixedServiceCategoryCode)
		} else {
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

	// 检查是否有重复的明细
	const duplicateDetails = []
	const newDetails = []

	selectedDetails.forEach(item => {
		// 检查是否已存在（根据applicationDetailId判断）
		const exists = detailList.some(detail => detail.applicationDetailId === item.id)
		if (exists) {
			duplicateDetails.push(item)
		} else {
			newDetails.push(item)
		}
	})

	// 如果有重复的明细，提示用户
	if (duplicateDetails.length > 0) {
		const materialNames = duplicateDetails.map(item => item.materialName || '未知物资').join('、')
		proxy.$message.warning(`以下物资明细已存在：${materialNames}`)
	}

	// 如果没有新的明细可添加，直接关闭抽屉
	if (newDetails.length === 0) {
		applicationDetailDrawerVisible.value = false
		return
	}

	// 将新的明细添加到采购明细列表
	newDetails.forEach(item => {
		detailList.push({
			row_id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			id: null,
			purchaseId: null,
			applicationDetailId: item.id,
			applicationNo: item.applicationNo || '',
			applicationTitle: item.applicationTitle || '',
			materialName: item.materialName || '',
			materialCode: item.materialCode || '',
			categoryName: item.categoryName || '',
			specificationModel: item.specificationModel || '',
			unit: item.unit || '',
			applicationQuantity: item.applicationQuantity || null,
			purchaseQuantity: item.applicationQuantity || null, // 默认采购数量等于申报数量
			taxRate: null,
			taxIncludedUnitPrice: null,
			taxExcludedUnitPrice: null,
			taxIncludedAmount: null,
			taxExcludedAmount: null,
			taxAmount: null,
			rowDisabled: false,
		})
	})

	// 关闭抽屉
	applicationDetailDrawerVisible.value = false
	// 重新计算金额
	detailList.forEach(row => {
		calculateDetailAmounts(row)
	})
	calculateMainAmounts()

	// 如果有新增的明细，提示成功
	if (newDetails.length > 0) {
		proxy.$message.success(`成功添加 ${newDetails.length} 条明细`)
	}
}

// 删除明细
const deleteDetail = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			const index = detailList.findIndex(item => item.row_id === row.row_id)
			if (index > -1) {
				detailList.splice(index, 1)
				calculateMainAmounts()
			}
		})
		.catch(err => {})
}

// 明细单元格点击事件
const detailCellClickEvent = even => {
	// 可以在这里处理明细行的点击事件
}

// 新增比价信息
const addComparison = () => {
	if (formDisabled.value) {
		return
	}
	comparisonList.push({
		row_id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		id: null,
		purchaseId: null,
		supplierId: null,
		supplierName: '',
		quotationPrice: null,
		rowDisabled: false,
	})
}

// 删除比价信息
const deleteComparison = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			const index = comparisonList.findIndex(item => item.row_id === row.row_id)
			if (index > -1) {
				comparisonList.splice(index, 1)
			}
		})
		.catch(err => {})
}

// 比价信息单元格点击事件
const comparisonCellClickEvent = even => {
	// 可以在这里处理比价信息行的点击事件
}

// 比价信息表头单元格点击事件
const comparisonHeaderCellClickEvent = even => {
	if (even.column.field == '') {
		addComparison()
	}
}


// 采购类型变化处理
const handlePurchaseTypeChange = (value) => {
	const typeMap = {
		'01': '比价',
		'02': '招商',
		'03': '定点服务',
	}
	form.purchaseTypeName = typeMap[value] || ''
	if (value !== '03') {
		form.fixedServiceCategoryCode = ''
		form.fixedServiceCategoryName = ''
		// 清空定点服务类别后，清除该字段的验证错误
		nextTick(() => {
			ruleForm.value?.clearValidate('fixedServiceCategoryCode')
		})
	} else {
		// 如果切换到定点服务，触发定点服务类别的验证
		nextTick(() => {
			ruleForm.value?.validateField('fixedServiceCategoryCode')
		})
	}
	// 如果采购类型不是比价，清空比价信息
	if (value !== '01') {
		comparisonList.length = 0
		// 从activeNames中移除比价信息折叠项
		const index = activeNames.value.indexOf('comparisonList')
		if (index > -1) {
			activeNames.value.splice(index, 1)
		}
	} else {
		// 如果采购类型是比价，添加比价信息折叠项到activeNames
		if (!activeNames.value.includes('comparisonList')) {
			activeNames.value.push('comparisonList')
		}
	}
}

// 监听明细数据变化，自动计算金额
watch(
	() => detailList.map(d => ({
		purchaseQuantity: d.purchaseQuantity,
		taxRate: d.taxRate,
		taxIncludedUnitPrice: d.taxIncludedUnitPrice,
		taxExcludedUnitPrice: d.taxExcludedUnitPrice,
	})),
	() => {
		detailList.forEach(row => {
			calculateDetailAmounts(row)
		})
		calculateMainAmounts()
	},
	{ deep: true }
)

// 计算明细的含税金额、不含税金额和税额
const calculateDetailAmounts = (row) => {
	if (!row.purchaseQuantity || row.purchaseQuantity <= 0) {
		row.taxIncludedAmount = null
		row.taxExcludedAmount = null
		row.taxAmount = null
		return
	}

	const quantity = parseFloat(row.purchaseQuantity) || 0
	const taxRate = parseFloat(row.taxRate) || 0

	// 如果含税单价存在，计算含税金额和不含税金额
	if (row.taxIncludedUnitPrice && row.taxIncludedUnitPrice > 0) {
		// 含税金额 = 含税单价 * 数量，保留2位小数
		const taxIncludedAmount = Math.round((row.taxIncludedUnitPrice * quantity) * 100) / 100
		row.taxIncludedAmount = parseFloat(taxIncludedAmount.toFixed(2))

		// 计算不含税单价 = 含税单价 / (1 + 税率/100)，保留2位小数
		const taxExcludedUnitPrice = Math.round((row.taxIncludedUnitPrice / (1 + taxRate / 100)) * 100) / 100
		row.taxExcludedUnitPrice = parseFloat(taxExcludedUnitPrice.toFixed(2))

		// 不含税金额 = 不含税单价 * 数量，保留2位小数
		const taxExcludedAmount = Math.round((taxExcludedUnitPrice * quantity) * 100) / 100
		row.taxExcludedAmount = parseFloat(taxExcludedAmount.toFixed(2))

		// 计算税额 = 含税金额 - 不含税金额，保留2位小数
		const taxAmount = Math.round((row.taxIncludedAmount - row.taxExcludedAmount) * 100) / 100
		row.taxAmount = parseFloat(taxAmount.toFixed(2))
	}
	// 如果不含税单价存在，计算不含税金额和含税金额
	else if (row.taxExcludedUnitPrice && row.taxExcludedUnitPrice > 0) {
		// 不含税金额 = 不含税单价 * 数量，保留2位小数
		const taxExcludedAmount = Math.round((row.taxExcludedUnitPrice * quantity) * 100) / 100
		row.taxExcludedAmount = parseFloat(taxExcludedAmount.toFixed(2))

		// 计算含税单价 = 不含税单价 * (1 + 税率/100)，保留2位小数
		const taxIncludedUnitPrice = Math.round((row.taxExcludedUnitPrice * (1 + taxRate / 100)) * 100) / 100
		row.taxIncludedUnitPrice = parseFloat(taxIncludedUnitPrice.toFixed(2))

		// 含税金额 = 含税单价 * 数量，保留2位小数
		const taxIncludedAmount = Math.round((taxIncludedUnitPrice * quantity) * 100) / 100
		row.taxIncludedAmount = parseFloat(taxIncludedAmount.toFixed(2))

		// 计算税额 = 含税金额 - 不含税金额，保留2位小数
		const taxAmount = Math.round((row.taxIncludedAmount - row.taxExcludedAmount) * 100) / 100
		row.taxAmount = parseFloat(taxAmount.toFixed(2))
	}
}

// 计算主表的含税金额和不含税金额（从明细汇总）
const calculateMainAmounts = () => {
	let totalTaxIncludedAmount = 0
	let totalTaxExcludedAmount = 0

	detailList.forEach(detail => {
		if (detail.taxIncludedAmount) {
			totalTaxIncludedAmount += parseFloat(detail.taxIncludedAmount) || 0
		}
		if (detail.taxExcludedAmount) {
			totalTaxExcludedAmount += parseFloat(detail.taxExcludedAmount) || 0
		}
	})

	// 汇总后保留2位小数，避免精度丢失
	if (totalTaxIncludedAmount > 0) {
		totalTaxIncludedAmount = Math.round(totalTaxIncludedAmount * 100) / 100
		form.taxIncludedAmount = parseFloat(totalTaxIncludedAmount.toFixed(2))
	} else {
		form.taxIncludedAmount = '¥0.00'
	}

	if (totalTaxExcludedAmount > 0) {
		totalTaxExcludedAmount = Math.round(totalTaxExcludedAmount * 100) / 100
		form.taxExcludedAmount = parseFloat(totalTaxExcludedAmount.toFixed(2))
	} else {
		form.taxExcludedAmount = '¥0.00'
	}
}

// 明细表头点击事件
const detailHeaderCellClickEvent = () => {
	// 可以在这里处理表头点击事件
}

// 处理明细数据（编辑时调用）
const editDetailList = data => {
	if (data && data.length > 0) {
		detailList.length = 0 // 清空现有明细
		data.forEach((item, index) => {
			detailList.push({
				row_id: `row_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
				id: item.id || null,
				purchaseId: item.purchaseId || null,
				applicationDetailId: item.applicationDetailId || null,
				applicationNo: item.applicationNo || '',
				applicationTitle: item.applicationTitle || '',
				materialName: item.materialName || '',
				materialCode: item.materialCode || '',
				categoryName: item.categoryName || '',
				specificationModel: item.specificationModel || '',
				unit: item.unit || '',
				applicationQuantity: item.applicationQuantity || null,
				purchaseQuantity: item.purchaseQuantity || null,
				taxRate: item.taxRate || null,
				taxIncludedUnitPrice: item.taxIncludedUnitPrice || null,
				taxExcludedUnitPrice: item.taxExcludedUnitPrice || null,
				taxIncludedAmount: item.taxIncludedAmount || null,
				taxExcludedAmount: item.taxExcludedAmount || null,
				taxAmount: item.taxAmount || null,
				rowDisabled: false,
			})
		})
		calculateMainAmounts()
	} else {
		detailList.length = 0
	}
}

// 重置表单
const resetForm = () => {
	ruleForm.value?.resetFields()
	form.id = null
	form.purchaseTitle = ''
	form.purchaseNo = ''
	form.supplierId = null
	form.supplierName = ''
	form.purchaseTypeCode = ''
	form.purchaseTypeName = ''
	form.fixedServiceCategoryCode = ''
	form.fixedServiceCategoryName = ''
	form.taxIncludedAmount = null
	form.taxExcludedAmount = null
	form.purchaseStatus = 0
	form.failureReason = ''
	detailList.length = 0
	comparisonList.length = 0
}

// 处理比价信息数据（编辑时调用）
const editComparisonList = data => {
	if (data && data.length > 0) {
		comparisonList.length = 0 // 清空现有比价信息
		data.forEach((item, index) => {
			comparisonList.push({
				row_id: `row_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
				id: item.id || null,
				purchaseId: item.purchaseId || null,
				supplierId: item.supplierId || null,
				supplierName: item.supplierName || '',
				quotationPrice: item.quotationPrice || null,
				rowDisabled: false,
			})
		})
		// 如果有比价信息，确保比价信息折叠项展开
		nextTick(() => {
			if (!activeNames.value.includes('comparisonList')) {
				activeNames.value.push('comparisonList')
			}
		})
		// 如果有比价信息，确保比价信息折叠项展开
		nextTick(() => {
			if (!activeNames.value.includes('comparisonList')) {
				activeNames.value.push('comparisonList')
			}
		})
	} else {
		comparisonList.length = 0
	}
}

// 验证
const validate = async () => {
	let flag = false
	// 验证采购类型必填
	if (!form.purchaseTypeCode) {
		proxy.$message.warning('请选择采购类型！')
		return false
	}
	// 如果采购类型为定点服务，验证定点服务类别必填
	if (form.purchaseTypeCode === '03' && (!form.fixedServiceCategoryCode || form.fixedServiceCategoryCode === '')) {
		proxy.$message.warning('请选择定点服务类别！')
		return false
	}
	let flag2 = await detailTableRef.value?.validAllEvent()
	let flag3 = true
	// 如果采购类型为比价，验证比价信息
	if (form.purchaseTypeCode === '01') {
		flag3 = await comparisonTableRef.value?.validAllEvent()
	}
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
		} else if (!flag3) {
			proxy.$message.warning('请完善比价信息！')
			flag = false
			return
		} else {
			flag = false
		}
	})
	return flag
}

// 初始化
const init = isAdd => {
	if (isAdd) {
		// 自动生成采购单主题：采购单 + 日期
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		form.purchaseTitle = `采购单${year}${month}${day}`
	} else {
		// 编辑或查看时，如果采购类型为比价，确保比价信息折叠项展开
		nextTick(() => {
			if (form.purchaseTypeCode === '01' && !activeNames.value.includes('comparisonList')) {
				activeNames.value.push('comparisonList')
			}
		})
	}
}

defineExpose({
	validate,
	resetForm,
	formData,
	formDisabled,
	init,
	editDetailList,
	editComparisonList,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>

