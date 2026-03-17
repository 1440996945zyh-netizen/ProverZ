<template>
	<el-form :model="form" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="baseData">
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="申报主题" prop="applicationTitle">
							<el-input
								v-model="form.applicationTitle"
								placeholder="请输入申报主题"
								:disabled="formDisabled"
								maxlength="200"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="申报类型" prop="applicationTypeCode">
							<el-select
								v-model="form.applicationTypeCode"
								placeholder="请选择申报类型"
								:disabled="formDisabled"
								style="width: 100%"
								@change="handleApplicationTypeChange"
							>
								<el-option label="月度" value="01" />
								<el-option label="临时" value="02" />
								<el-option label="定点服务" value="03" />
							</el-select>
						</el-form-item>
						、
					</el-col>
					<el-col :span="8" v-if="form.applicationTypeCode === '03'">
						<el-form-item label="定点服务类别" prop="fixedServiceCategoryCode">
							<Select
								:dataConfig="{ url: '/api/internal/public/getDictListByType/FIXEDPOINT_SERVICE' }"
								v-model:value="form.fixedServiceCategoryCode"
								v-model:label="form.fixedServiceCategoryName"
								:disabled="formDisabled"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="备注" prop="remark">
							<el-input
								v-model="form.remark"
								:autosize="{ minRows: 2, maxRows: 4 }"
								type="textarea"
								placeholder="请输入备注"
								:disabled="formDisabled"
								maxlength="500"
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>

			<!-- 明细列表 -->
			<el-collapse-item title="物资申报明细" name="detailList">
				<template #title>
					<div style="width: 100%; display: flex; justify-content: space-between">
						<span>物资申报明细</span>
						<!--						<div style="display: flex">-->
						<!--							<el-button plain size="medium" @click.stop="addDetail" :disabled="formDisabled" style="margin: 8px 10px 0px 0px">-->
						<!--								新增明细-->
						<!--							</el-button>-->
						<!--						</div>-->
					</div>
				</template>
				<EditTable
					ref="detailTableRef"
					:name="'物资申报明细'"
					:tableData="detailList"
					:tableColumns="detailColumns"
					:tableHeight="tableHeight"
					:cellClickEvent="detailCellClickEvent"
					:headerCellClickEvent="detailHeaderCellClickEvent"
					:editRules="detailEditRules"
					:rowConfig="rowConfig"
					:hasAdd="true"
					:disabledKey="'rowDisabled'"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="materialApplicationDetail">
import { ref, reactive, nextTick, onMounted, h, getCurrentInstance, computed, watch } from 'vue'
import { ElButton, ElInput, ElInputNumber } from 'element-plus'
import EditTable from '@/components/EditTable'
import Select from '@/components/Select/index.vue'
import materialCodeApi from '@/api/equipment/materialCode/index'
import materialWarehouseInApi from '@/api/equipment/materialWarehouseIn/index'
import publicApi from '@/api/public/index'
const { proxy } = getCurrentInstance()
const tableHeight = reactive(window.innerHeight - 450)
const ruleForm = ref()
const detailTableRef = ref()
const formDisabled = ref(false)
const activeNames = ref(['baseData', 'detailList'])

const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }

// 物资代码选项列表
const materialCodeOptions = ref([])

// 设备选项列表
const equipmentOptions = ref([])

// 加载物资代码列表
const loadMaterialCodeList = () => {
	materialCodeApi
		.getAllList()
		.then(res => {
			if (res.code === '0000' && res.data) {
				// 转换为下拉框选项格式
				const options = res.data.map(item => ({
					value: item.id,
					label: item.materialName,
					materialCode: item.materialCode,
					materialName: item.materialName,
					specificationModel: item.specificationModel || '',
					unitName: item.unitName || '',
				}))
				materialCodeOptions.value = options
				// 更新列配置中的selectData（使用Vue的响应式更新）
				if (detailColumns && detailColumns.length > 0) {
					detailColumns[0].selectData = [...options] // 使用展开运算符确保响应式更新
				}
				//console.log('物资代码选项已加载:', options.length, '条')
			} else {
				//console.error('物资代码数据格式错误:', res)
			}
		})
		.catch(error => {
			console.error('加载物资代码列表失败:', error)
			proxy.$message.error('加载物资代码列表失败')
		})
}

// 加载设备列表
const loadEquipmentList = () => {
	publicApi
		.getLocalSelect({ type: 'EQUIPMENT' })
		.then(res => {
			if (res.code === '0000' && res.data) {
				// 转换为下拉框选项格式，保持value为字符串类型，避免精度丢失
				const options = res.data.map(item => {
					const value = item.value || item.id
					return {
						value: String(value), // 保持为字符串，避免大数字精度丢失
						label: item.label || item.equipName,
					}
				})
				equipmentOptions.value = options
				// 找到设备列的索引并更新selectData
				const equipmentColumnIndex = detailColumns.findIndex(col => col.prop === 'equipIds')
				if (equipmentColumnIndex > -1) {
					detailColumns[equipmentColumnIndex].selectData = [...options]
					// 设备列表加载完成后，更新已存在行的设备名称和ID（确保类型一致）
					nextTick(() => {
						detailList.forEach(row => {
							if (row.equipIds && Array.isArray(row.equipIds) && row.equipIds.length > 0) {
								// 确保equipIds中的值都是字符串类型，避免精度丢失
								row.equipIds = row.equipIds.map(id => String(id))
								// 根据 equipIds 从 selectData 中查找对应的名称
								row.equipNames = row.equipIds
									.map(id => {
										const option = options.find(item => String(item.value) === String(id))
										return option ? option.label : ''
									})
									.filter(name => name)
							}
						})
						// 刷新表格
						if (detailTableRef.value && detailTableRef.value.xTable) {
							detailTableRef.value.xTable.refreshColumn()
						}
					})
				}
			} else {
				console.error('加载设备列表失败:', res)
			}
		})
		.catch(error => {
			console.error('加载设备列表失败:', error)
			proxy.$message.error('加载设备列表失败')
		})
}

// 表单数据
const formData = reactive({
	form: {
		id: null,
		applicationNo: '',
		applicationTitle: '',
		applicationTypeCode: '',
		applicationTypeName: '',
		fixedServiceCategoryCode: '',
		fixedServiceCategoryName: '',
		remark: '',
		deptId: null,
		deptName: '',
	},
	detailList: [],
})

const { form, detailList } = formData

// 表单验证规则
const rules = reactive({
	applicationTitle: proxy.getRules({ required: true }),
	applicationTypeCode: proxy.getRules({ required: true }),
})

// 明细表格列
const detailColumns = reactive([
	{
		label: '物资名称',
		prop: 'materialCodeId',
		modelLabel: 'materialName',
		editType: 'select',
		editRender: {},
		selectData: [],
		selectLabel: 'label',
		selectValue: 'value',
		change: (e, row) => {
			handleMaterialNameChange(e, row)
		},
		width: 150,
	},
	{
		label: '物资代码',
		prop: 'materialCode',
		width: 120,
	},
	{
		label: '规格型号',
		prop: 'specificationModel',
		width: 100,
	},
	{
		label: '单位',
		prop: 'unit',
		align: 'center',
		width: 70,
	},
	{
		label: '估价',
		prop: 'estimatedPrice',
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
		label: '申报数量',
		prop: 'applicationQuantity',
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
		label: '金额',
		prop: 'amount',
		width: 120,
		align: 'right',
		isThousandth: true, // 千分位格式化
	},
	{
		label: '申报时库存',
		prop: 'applicationStockQuantity',
		width: 120,
		align: 'right',
		isThousandth: true, // 千分位格式化
	},
	{
		label: '流向类型',
		prop: 'flowType',
		editType: 'select',
		editRender: {},
		selectData: [
			{ label: '设备', value: '01' },
			{ label: '其他', value: '02' },
		],
		selectLabel: 'label',
		selectValue: 'value',
		change: (e, row) => {
			// Select 组件单选时返回的是 label，需要转换为 value
			let value = null
			if (typeof e === 'object' && e !== null && e.value !== undefined) {
				value = e.value
			} else if (typeof e === 'string') {
				// 如果是字符串，可能是 label，需要查找对应的 value
				const option = detailColumns[detailColumns.findIndex(col => col.prop === 'flowType')].selectData.find(
					item => item.label === e,
				)
				value = option ? option.value : e
			} else {
				value = e
			}
			// 确保 row.flowType 被正确设置
			row.flowType = value || '02'
			handleFlowTypeChange(value, row)
		},
		width: 120,
	},
	{
		label: '流向',
		prop: 'flowDirection',
		editType: 'input',
		editRender: {},
		width: 150,
		disabledFunc: row => row.flowType === '01', // 选择"设备"时禁用
	},
	{
		label: '设备',
		prop: 'equipIds',
		modelLabel: 'equipNames', // 用于显示设备名称
		editType: 'select',
		editRender: {},
		selectData: [],
		multiple: true,
		selectLabel: 'label',
		selectValue: 'value',
		width: 200,
		disabledFunc: row => row.flowType === '02', // 选择"其他"时禁用
		change: (e, row) => {
			handleEquipmentChange(e, row)
		},
	},
	{ label: '供货时限', prop: 'supplyTimeLimit', editType: 'date', editRender: {}, width: 130 },
	{ label: '建议品牌', prop: 'suggestedBrand', editType: 'input', editRender: {}, width: 120 },
	{ label: '规格描述', prop: 'specificationDesc', editType: 'input', editRender: {}, width: 130 },
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
							deleteDetail(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						disabled: formDisabled.value,
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])

// 明细编辑验证规则
const detailEditRules = ref({
	materialCodeId: proxy.getRules({ required: true }),
	estimatedPrice: proxy.getRules({
		required: true,
		numberCheck: {
			int: 10,
			dec: 2,
		},
	}),
	applicationQuantity: proxy.getRules({
		required: true,
		numberCheck: {
			int: 10,
			dec: 2,
		},
	}),
})

// 新增明细
const addDetail = () => {
	const newRow = {
		row_id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		id: null,
		applicationId: null,
		materialCodeId: null,
		materialCode: '',
		materialName: '',
		specificationModel: '',
		unit: '',
		applicationQuantity: null,
		estimatedPrice: null,
		amount: null,
		applicationStockQuantity: null,
		flowType: '', // 默认选择"其他"
		flowDirection: '',
		equipIds: [],
		equipNames: [], // 设备名称数组（用于显示）
		supplyTimeLimit: '',
		suggestedBrand: '',
		specificationDesc: '',
		rowDisabled: false,
	}
	detailList.push(newRow)
	// 初始化禁用状态
	nextTick(() => {
		if (detailTableRef.value && detailTableRef.value.xTable) {
			detailTableRef.value.xTable.refreshColumn()
		}
	})
}

// 导入申报
const importApplication = () => {
	if (formDisabled.value) {
		return
	}
	// TODO: 实现导入申报功能
	proxy.$message.info('导入申报功能待实现')
}

// 删除明细
const deleteDetail = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			const index = detailList.findIndex(item => item.row_id === row.row_id)
			if (index > -1) {
				detailList.splice(index, 1)
			}
		})
		.catch(err => {})
}

// 明细单元格点击事件
const detailCellClickEvent = even => {
	// 可以在这里处理明细行的点击事件
}

// 物资名称选择变化处理
const handleMaterialNameChange = async (e, row) => {
	// console.log('handleMaterialNameChange - e:', e)
	// console.log('handleMaterialNameChange - row:', row)
	// console.log('handleMaterialNameChange - materialCodeOptions:', materialCodeOptions.value)

	// Select组件change事件返回的可能是label值，也可能是整个对象
	// contract中使用e.value，说明e可能是整个对象
	// 但Select组件代码显示单选时返回的是label值
	// 需要兼容两种情况
	let option = null

	if (typeof e === 'object' && e !== null && e.value !== undefined) {
		// 如果e是对象且有value属性，说明是完整的选项对象
		option = e
	} else if (typeof e === 'string') {
		// 如果e是字符串，说明是label值，需要查找
		option = materialCodeOptions.value.find(item => item.label === e)
	} else {
		// 其他情况，尝试查找
		option = materialCodeOptions.value.find(item => item.label === e)
	}

	//console.log('handleMaterialNameChange - option:', option)

	if (option) {
		// 自动填充物资代码、规格型号、计量单位
		row.materialCodeId = option.value
		row.materialCode = option.materialCode || ''
		row.materialName = option.label || option.materialName || ''
		row.specificationModel = option.specificationModel || ''
		row.unit = option.unitName || ''

		// 查询申报时库存（不传 warehouseId，查询所有仓库的库存总和）
		if (option.value) {
			try {
				const res = await materialWarehouseInApi.getStockQuantity(option.value, null)
				if (res.code === '0000' && res.data !== undefined && res.data !== null) {
					row.applicationStockQuantity = res.data
				} else {
					row.applicationStockQuantity = 0
				}
			} catch (error) {
				console.error('查询库存失败:', error)
				row.applicationStockQuantity = 0
			}
		}
		//console.log('handleMaterialNameChange - updated row:', row)
	} else {
		// 清空相关字段
		row.materialCodeId = null
		row.materialCode = ''
		row.materialName = ''
		row.specificationModel = ''
		row.unit = ''
		row.applicationStockQuantity = null
	}
}

// 计算金额（金额 = 估价 * 申报数量）
const calculateAmount = row => {
	const estimatedPrice = row.estimatedPrice || 0
	const applicationQuantity = row.applicationQuantity || 0
	row.amount = Number((estimatedPrice * applicationQuantity).toFixed(2))
}

// 监听明细列表变化，自动计算金额
watch(
	detailList,
	() => {
		detailList.forEach(row => {
			calculateAmount(row)
		})
	},
	{ deep: true },
)

// 明细表头点击事件（新增行）
const detailHeaderCellClickEvent = even => {
	if (even.column.field == '') {
		addDetail()
	}
}

// 申报类型变化处理
const handleApplicationTypeChange = value => {
	// 根据选择的申报类型设置名称
	const typeMap = {
		'01': '月度',
		'02': '临时',
		'03': '定点服务',
	}
	form.applicationTypeName = typeMap[value] || ''

	// 如果不是定点服务，清空定点服务类别
	if (value !== '03') {
		form.fixedServiceCategoryCode = ''
		form.fixedServiceCategoryName = ''
	}
}

// 设备选择变化处理
const handleEquipmentChange = (e, row) => {
	// Select 组件多选时，change 事件返回的是选项对象数组（rowData）
	// 每个对象包含 label 和 value 等属性
	// 参考 workTicketNew 页面的实现方式
	// EditTable 中，v-model:value 和 v-model:label 会自动更新 row.equipIds 和 row.equipNames
	// 但为了确保数据一致性，我们在这里手动更新
	if (Array.isArray(e) && e.length > 0) {
		// 保持为字符串类型，避免精度丢失
		row.equipIds = e.map(item => String(item.value || item.id))
		row.equipNames = e.map(item => item.label || item.equipName || item.name || '')
	} else {
		row.equipIds = []
		row.equipNames = []
	}
}

// 流向类型变化处理
const handleFlowTypeChange = (value, row) => {
	if (value === '01') {
		// 选择"设备"时，清空流向字段
		row.flowDirection = ''
		// 初始化设备ID数组和设备名称数组
		if (!row.equipIds || !Array.isArray(row.equipIds)) {
			row.equipIds = []
		}
		if (!row.equipNames || !Array.isArray(row.equipNames)) {
			row.equipNames = []
		}
	} else if (value === '02') {
		// 选择"其他"时，清空设备ID和设备名称
		row.equipIds = []
		row.equipNames = []
	} else {
		// 清空时，清空所有相关字段
		row.flowDirection = ''
		row.equipIds = []
		row.equipNames = []
	}
	// 强制更新表格，确保禁用状态生效
	nextTick(() => {
		if (detailTableRef.value && detailTableRef.value.xTable) {
			detailTableRef.value.xTable.clearEdit()
			// 刷新列以更新禁用状态
			detailTableRef.value.xTable.refreshColumn()
		}
	})
}

// 处理明细数据（编辑时调用）
const editDetailList = data => {
	if (data && data.length > 0) {
		detailList.length = 0 // 清空现有明细
		data.forEach((item, index) => {
			// 处理设备ID：如果是字符串（逗号分隔），转换为数组
			// 参考 workTicketNew 页面的实现方式
			let equipIds = item.equipIds ? (typeof item.equipIds === 'string' ? item.equipIds.split(',') : item.equipIds) : []
			// 确保是字符串数组，过滤空值并转换为字符串，避免精度丢失
			equipIds = equipIds.filter(id => id && id !== '').map(id => String(id))

			// 处理设备名称：如果是字符串（逗号分隔），转换为数组
			let equipNames = item.equipNames ? (typeof item.equipNames === 'string' ? item.equipNames.split(',') : item.equipNames) : []
			// 如果设备列表已加载，根据equipIds从selectData中查找对应的名称
			const equipmentColumn = detailColumns.find(col => col.prop === 'equipIds')
			if (equipmentColumn && equipmentColumn.selectData && equipmentColumn.selectData.length > 0 && equipIds.length > 0) {
				equipNames = equipIds
					.map(id => {
						const option = equipmentColumn.selectData.find(item => String(item.value) === String(id))
						return option ? option.label : ''
					})
					.filter(name => name)
			}

			const editRow = {
				row_id: `row_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
				id: item.id || null,
				applicationId: item.applicationId || null,
				materialCodeId: item.materialCodeId || null,
				materialCode: item.materialCode || '',
				materialName: item.materialName || '',
				specificationModel: item.specificationModel || '',
				unit: item.unit || '',
				applicationQuantity: item.applicationQuantity || null,
				estimatedPrice: item.estimatedPrice || null,
				amount: item.amount || null,
				applicationStockQuantity: item.applicationStockQuantity || null,
				flowType: item.flowType,
				flowDirection: item.flowDirection || '',
				equipIds: equipIds,
				equipNames: equipNames, // 设备名称数组（从数据库回显或根据ID查找）
				supplyTimeLimit: item.supplyTimeLimit || '',
				suggestedBrand: item.suggestedBrand || '',
				specificationDesc: item.specificationDesc || '',
				rowDisabled: false,
			}
			detailList.push(editRow)
		})
		// 初始化禁用状态
		nextTick(() => {
			if (detailTableRef.value && detailTableRef.value.xTable) {
				detailTableRef.value.xTable.refreshColumn()
			}
		})
	} else {
		detailList.length = 0
	}
}

// 初始化
const init = isAdd => {
	if (isAdd) {
		// 自动生成申请主题：物资申报 + 年月日
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		form.applicationTitle = `物资申报${year}${month}${day}`
	}
	// 加载物资代码列表
	loadMaterialCodeList()
	// 加载设备列表
	loadEquipmentList()
}

// 重置表单
const resetForm = () => {
	ruleForm.value?.resetFields()
	form.id = null
	form.applicationNo = ''
	form.applicationTitle = ''
	form.applicationTypeCode = ''
	form.applicationTypeName = ''
	form.fixedServiceCategoryCode = ''
	form.fixedServiceCategoryName = ''
	form.remark = ''
	form.deptId = null
	form.deptName = ''
	detailList.length = 0
}

// 验证
const validate = async () => {
	let flag = false
	let flag2 = await detailTableRef.value?.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag2) {
			flag = true
		} else if (!valid) {
			proxy.$message.warning('请完善表单信息！')
			flag = false
			return
		} else if (!flag2) {
			proxy.$message.warning('请完善明细信息！')
			flag = false
			return
		} else {
			flag = false
		}
	})
	return flag
}

onMounted(() => {
	loadMaterialCodeList()
	loadEquipmentList()
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
