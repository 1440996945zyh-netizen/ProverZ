<template>
	<el-form :model="form" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="baseData">
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="出库主题" prop="warehouseOutTitle">
							<el-input
								v-model="form.warehouseOutTitle"
								placeholder="请输入出库主题"
								:disabled="formDisabled"
								maxlength="200"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="仓库" prop="warehouseId">
							<Select
								:selectData="warehouseList"
								v-model:value="form.warehouseId"
								v-model:label="form.warehouseName"
								:disabled="formDisabled"
								placeholder="请选择仓库"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="备注" prop="remarks">
							<el-input
								v-model="form.remarks"
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
			<el-collapse-item title="物资领料申请明细" name="detailList">
				<template #title>
					<div style="width: 100%; display: flex; justify-content: space-between">
						<span>物资申领明细</span>
						<div style="display: flex">
							<!--							<el-button type="primary" @click.stop="addDetail" :disabled="formDisabled" style="margin: 8px 10px 0px 0px">-->
							<!--								新增明细-->
							<!--							</el-button>-->
							<el-button
								plain
								size="medium"
								@click.stop="openApplicationDrawer"
								:disabled="formDisabled"
								style="margin: 8px 10px 0px 0px"
							>
								导入申报
							</el-button>
						</div>
					</div>
				</template>
				<EditTable
					ref="detailTableRef"
					:hasAdd="true"
					:name="'物资出库申请明细'"
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

	<!-- 选择物资申报抽屉 -->
	<el-drawer v-model="applicationDrawerVisible" title="选择物资申报" size="65%">
		<applicationTable ref="applicationTableRef" :warehouseId="form.warehouseId" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="applicationDrawerVisible = false">取消</el-button>
				<el-button type="primary" @click="saveApplicationDetails">确定</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="materialWarehouseOutApplicationDetail">
import { ref, reactive, nextTick, onMounted, h, getCurrentInstance, watch } from 'vue'
import { ElButton, ElInput, ElInputNumber } from 'element-plus'
import EditTable from '@/components/EditTable'
import Select from '@/components/Select/index.vue'
import materialCodeApi from '@/api/equipment/materialCode/index'
import materialWarehouseApi from '@/api/equipment/materialWarehouse/index'
import materialWarehouseInApi from '@/api/equipment/materialWarehouseIn/index'
import publicApi from '@/api/public/index'
import applicationTable from './applicationTable/index.vue'
const { proxy } = getCurrentInstance()
const tableHeight = reactive(window.innerHeight - 450)
const ruleForm = ref()
const detailTableRef = ref()
const formDisabled = ref(false)
const activeNames = ref(['baseData', 'detailList'])
const applicationDrawerVisible = ref(false) // 选择物资申报抽屉显示状态
const applicationTableRef = ref() // 物资申报表格ref

const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }

// 物资代码选项列表
const materialCodeOptions = ref([])

// 设备选项列表
const equipmentOptions = ref([])

// 仓库列表
const warehouseList = ref([])

// 用户列表（验收人列表）
const userList = ref([])

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
					unitCode: item.unitCode || '',
					unitName: item.unitName || '',
					brand: item.brand || '',
				}))
				materialCodeOptions.value = options
				// 更新列配置中的selectData（使用Vue的响应式更新）
				if (detailColumns && detailColumns.length > 0) {
					detailColumns[0].selectData = [...options] // 使用展开运算符确保响应式更新
				}
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
							if (row.equipIds != null && row.equipIds !== '') {
								// 确保equipIds是字符串类型，避免精度丢失
								row.equipIds = String(row.equipIds)
								// 根据 equipIds 从 selectData 中查找对应的名称
								const option = options.find(item => String(item.value) === String(row.equipIds))
								row.equipNames = option ? option.label : ''
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

// 加载用户列表（验收人列表，不按部门查询，获取所有用户）
const loadUserList = () => {
	publicApi
		.getLocalSelect({
			type: 'USER',
		})
		.then(res => {
			if (res.code == '0000') {
				userList.value = res.data.map(item => ({
					label: item.label || item.userName,
					value: item.value || item.id,
				}))
			}
		})
}

// 表单数据
const formData = reactive({
	form: {
		id: null,
		warehouseOutNo: '',
		warehouseOutTitle: '',
		warehouseId: null,
		warehouseName: '',
		status: '', // 默认暂存（未审核）
		remarks: '',
		auditRemark: '',
		acceptancePersonId: null,
		acceptancePersonName: '',
		acceptanceTime: null,
	},
	detailList: [],
})

const { form, detailList } = formData

// 加载库存数量
const loadStockQuantity = row => {
	console.log('loadStockQuantity 函数被调用 - row:', row, 'form.warehouseId:', form.warehouseId)
	if (!row.materialId) {
		console.log('loadStockQuantity - materialId为空，返回')
		row.stockQuantity = null
		return
	}
	if (!form.warehouseId) {
		console.warn('loadStockQuantity - 仓库未选择，无法查询库存数量')
		row.stockQuantity = null
		return
	}
	console.log('loadStockQuantity - 开始查询库存数量 - materialId:', row.materialId, 'warehouseId:', form.warehouseId)
	materialWarehouseInApi
		.getStockQuantity(row.materialId, form.warehouseId)
		.then(res => {
			console.log('库存数量查询结果:', res)
			if (res.code === '0000' && res.data !== null && res.data !== undefined) {
				row.stockQuantity = res.data
			} else {
				row.stockQuantity = 0
			}
		})
		.catch(error => {
			console.error('加载库存数量失败:', error)
			row.stockQuantity = 0
		})
}

// 监听仓库变化，重新加载所有明细的库存数量
watch(
	() => form.warehouseId,
	newWarehouseId => {
		if (newWarehouseId) {
			detailList.forEach(row => {
				if (row.materialId) {
					loadStockQuantity(row)
				}
			})
		} else {
			detailList.forEach(row => {
				row.stockQuantity = null
			})
		}
	},
)

// 表单验证规则
const rules = reactive({
	warehouseOutTitle: proxy.getRules({ required: true }),
	warehouseId: proxy.getRules({ required: true }),
})

// 明细表格列
const detailColumns = reactive([
	{
		label: '物资名称',
		prop: 'materialId',
		minWidth: 200,
		modelLabel: 'materialName',
		editType: 'select',
		editRender: {},
		selectData: [],
		selectLabel: 'label',
		selectValue: 'value',
		change: (e, row) => {
			handleMaterialNameChange(e, row)
		},
	},
	// {
	// 	label: '物资代码',
	// 	prop: 'materialCode',
	// 	width: 150
	// },
	{
		label: '规格型号',
		prop: 'specificationModel',
		width: 150,
	},
	{
		label: '计量单位',
		prop: 'unitName',
		width: 100,
	},
	{
		label: '品牌',
		prop: 'brand',
		width: 120,
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
		selectLabel: 'label',
		selectValue: 'value',
		width: 200,
		disabledFunc: row => row.flowType === '02', // 选择"其他"时禁用
		change: (e, row) => {
			handleEquipmentChange(e, row)
		},
	},
	{
		label: '库存数量',
		prop: 'stockQuantity',
		width: 120,
		align: 'right',
	},
	{
		label: '申请数量',
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
		width: 120,
		align: 'right',
		change: (value, row) => {
			// 验证申请数量不能大于库存数量
			if (value != null && row.stockQuantity != null && row.stockQuantity !== '') {
				const appQty = Number(value)
				const stockQty = Number(row.stockQuantity)
				if (!isNaN(appQty) && !isNaN(stockQty) && appQty > stockQty) {
					proxy.$message.warning(`申请数量不能大于库存数量（库存数量：${stockQty}）`)
					// 将申请数量设置为库存数量
					row.applicationQuantity = stockQty
				}
			}
		},
	},
	{
		prop: '',
		label: '新增',
		width: 100,
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
	materialId: proxy.getRules({ required: true }),
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
		outApplicationId: null,
		materialId: null,
		materialName: '',
		specificationModel: '',
		unitCode: '',
		unitName: '',
		brand: '',
		stockQuantity: null,
		applicationQuantity: null,
		flowType: '02', // 默认选择"其他"
		flowDirection: '',
		equipIds: null, // 单选，单个ID
		equipNames: '', // 设备名称（用于显示）
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

// 设备选择变化处理（单选）
const handleEquipmentChange = (e, row) => {
	// Select 组件单选时，change 事件返回的可能是 label 值，也可能是整个对象
	// EditTable 中，v-model:value 和 v-model:label 会自动更新 row.equipIds 和 row.equipNames
	// 但为了确保数据一致性，我们在这里手动更新
	let option = null
	const selectData = detailColumns.find(col => col.prop === 'equipIds')?.selectData || equipmentOptions.value

	if (typeof e === 'object' && e !== null && e.value !== undefined) {
		// 如果e是对象且有value属性，说明是完整的选项对象
		option = e
	} else if (typeof e === 'string') {
		// 如果e是字符串，说明是label值，需要查找
		option = selectData.find(item => item.label === e || String(item.value) === e)
	} else if (e != null) {
		// 其他情况，尝试查找
		option = selectData.find(item => String(item.value) === String(e))
	}

	if (option) {
		// 保持为字符串类型，避免精度丢失
		row.equipIds = String(option.value)
		row.equipNames = option.label || ''
	} else {
		row.equipIds = null
		row.equipNames = ''
	}
}

// 流向类型变化处理
const handleFlowTypeChange = (value, row) => {
	if (value === '01') {
		// 选择"设备"时，清空流向字段
		row.flowDirection = ''
		// 初始化设备ID和设备名称（单选，不是数组）
		if (row.equipIds == null) {
			row.equipIds = null
		}
		if (row.equipNames == null) {
			row.equipNames = ''
		}
	} else if (value === '02') {
		// 选择"其他"时，清空设备ID和设备名称
		row.equipIds = null
		row.equipNames = ''
	} else {
		// 清空时，清空所有相关字段
		row.flowDirection = ''
		row.equipIds = null
		row.equipNames = ''
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

// 物资名称选择变化处理
const handleMaterialNameChange = (e, row) => {
	console.log('handleMaterialNameChange 被调用 - e:', e, 'row:', row)
	// Select组件change事件返回的可能是label值，也可能是整个对象
	let option = null

	// 优先从detailColumns的selectData中查找（这是实际绑定到下拉框的数据）
	const selectData = detailColumns[0]?.selectData || materialCodeOptions.value

	if (typeof e === 'object' && e !== null && e.value !== undefined) {
		// 如果e是对象且有value属性，说明是完整的选项对象
		option = e
	} else if (typeof e === 'string') {
		// 如果e是字符串，说明是label值，需要查找
		option = selectData.find(item => item.label === e)
	} else {
		// 其他情况，尝试查找
		option = selectData.find(item => item.label === e)
	}

	console.log('handleMaterialNameChange - option:', option)
	console.log('handleMaterialNameChange - selectData:', selectData)

	if (option) {
		// 允许物资重复添加，不再检查是否已存在
		// 自动填充物资代码、规格型号、计量单位、品牌
		row.materialId = option.value
		row.materialCode = option.materialCode || ''
		row.materialName = option.label || option.materialName || ''
		row.specificationModel = option.specificationModel || ''
		row.unitCode = option.unitCode || ''
		row.unitName = option.unitName || ''
		row.brand = option.brand || ''
	} else {
		// 清空相关字段
		row.materialId = null
		row.materialCode = ''
		row.materialName = ''
		row.specificationModel = ''
		row.unitCode = ''
		row.unitName = ''
		row.brand = ''
		row.stockQuantity = null
	}

	// 无论option是否存在，只要row.materialId有值，就尝试查询库存数量
	// 这样可以确保即使option查找失败，但materialId已经设置的情况下也能查询库存
	if (row.materialId) {
		console.log('物资选择变化 - materialId:', row.materialId, 'warehouseId:', form.warehouseId)
		console.log('准备调用 loadStockQuantity，row:', row)
		// 无论仓库ID是否为空，都尝试调用（如果为空会在loadStockQuantity中处理）
		try {
			loadStockQuantity(row)
			console.log('loadStockQuantity 调用完成')
		} catch (error) {
			console.error('调用 loadStockQuantity 出错:', error)
		}
	} else {
		console.log('materialId为空，不调用 loadStockQuantity')
	}
}

// 明细表头点击事件（新增行）
const detailHeaderCellClickEvent = even => {
	if (even.column.field == '') {
		addDetail()
	}
}

// 处理明细数据（编辑时调用）
const editDetailList = data => {
	if (data && data.length > 0) {
		detailList.length = 0 // 清空现有明细
		data.forEach((item, index) => {
			// 处理设备ID：单选，如果是字符串（逗号分隔），取第一个值；如果是数组，取第一个元素
			let equipId = null
			if (item.equipIds) {
				if (typeof item.equipIds === 'string') {
					// 如果是逗号分隔的字符串，取第一个值
					const ids = item.equipIds.split(',').filter(id => id && id.trim() !== '')
					equipId = ids.length > 0 ? String(ids[0].trim()) : null
				} else if (Array.isArray(item.equipIds)) {
					// 如果是数组，取第一个元素
					equipId = item.equipIds.length > 0 ? String(item.equipIds[0]) : null
				} else {
					equipId = String(item.equipIds)
				}
			}

			// 处理设备名称：单选，如果是字符串（逗号分隔），取第一个值
			let equipName = ''
			if (item.equipNames) {
				if (typeof item.equipNames === 'string') {
					// 如果是逗号分隔的字符串，取第一个值
					const names = item.equipNames.split(',').filter(name => name && name.trim() !== '')
					equipName = names.length > 0 ? names[0].trim() : ''
				} else if (Array.isArray(item.equipNames)) {
					// 如果是数组，取第一个元素
					equipName = item.equipNames.length > 0 ? item.equipNames[0] : ''
				} else {
					equipName = String(item.equipNames)
				}
			}

			// 如果设备列表已加载，根据equipId从selectData中查找对应的名称
			const equipmentColumn = detailColumns.find(col => col.prop === 'equipIds')
			if (equipmentColumn && equipmentColumn.selectData && equipmentColumn.selectData.length > 0 && equipId) {
				const option = equipmentColumn.selectData.find(opt => String(opt.value) === String(equipId))
				if (option) {
					equipName = option.label
				}
			}

			const editRow = {
				row_id: `row_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
				id: item.id || null,
				outApplicationId: item.outApplicationId || null,
				materialId: item.materialId || null,
				materialName: item.materialName || '',
				specificationModel: item.specificationModel || '',
				unitCode: item.unitCode || '',
				unitName: item.unitName || '',
				brand: item.brand || '',
				stockQuantity: null, // 编辑时重新查询库存数量
				applicationQuantity: item.applicationQuantity || null,
				flowType: item.flowType || '02', // 默认选择"其他"
				flowDirection: item.flowDirection || '',
				equipIds: equipId,
				equipNames: equipName, // 设备名称（从数据库回显或根据ID查找）
				rowDisabled: false,
			}
			detailList.push(editRow)
			// 编辑时加载库存数量
			if (item.materialId && form.warehouseId) {
				loadStockQuantity(detailList[detailList.length - 1])
			}
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
		// 自动生成出库主题：物资出库申请 + 年月日
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		form.warehouseOutTitle = `物资出库申请${year}${month}${day}`
	}
	// 加载物资代码列表
	loadMaterialCodeList()
	// 加载设备列表
	loadEquipmentList()
	// 加载仓库列表
	loadWarehouseList()
	// 加载用户列表
	loadUserList()
}

// 重置表单
const resetForm = () => {
	ruleForm.value?.resetFields()
	form.id = null
	form.warehouseOutNo = ''
	form.warehouseOutTitle = ''
	form.warehouseId = null
	form.warehouseName = ''
	form.status = '' // 默认暂存（未审核）
	form.remarks = ''
	form.auditRemark = ''
	form.acceptancePersonId = null
	form.acceptancePersonName = ''
	form.acceptanceTime = null
	detailList.length = 0
}

// 验证
const validate = async () => {
	let flag = false
	let flag2 = await detailTableRef.value?.validAllEvent()
	let invalidDetails = [] // 用于存储申请数量大于库存数量的明细

	// 验证申请数量不能大于库存数量
	if (flag2) {
		detailList.forEach((item, index) => {
			if (item.materialId && item.applicationQuantity != null && item.stockQuantity != null && item.stockQuantity !== '') {
				const appQty = Number(item.applicationQuantity)
				const stockQty = Number(item.stockQuantity)
				if (!isNaN(appQty) && !isNaN(stockQty) && appQty > stockQty) {
					invalidDetails.push({
						index: index + 1,
						materialName: item.materialName || '未知物资',
						appQty: appQty,
						stockQty: stockQty,
					})
				}
			}
		})

		if (invalidDetails.length > 0) {
			const errorMsg = invalidDetails
				.map(
					detail =>
						`第${detail.index}行【${detail.materialName}】：申请数量（${detail.appQty}）不能大于库存数量（${detail.stockQty}）`,
				)
				.join('\n')
			proxy.$message.warning(errorMsg)
			flag2 = false
		}
	}

	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag2) {
			flag = true
		} else if (!valid) {
			proxy.$message.warning('请完善表单信息！')
			flag = false
			return
		} else if (!flag2) {
			// 如果是因为申请数量验证失败，错误信息已经在上面显示了
			if (invalidDetails.length === 0) {
				proxy.$message.warning('请完善明细信息！')
			}
			flag = false
			return
		} else {
			flag = false
		}
	})
	return flag
}

// 打开物资申报抽屉
const openApplicationDrawer = () => {
	if (formDisabled.value) {
		return
	}
	// 检查是否已选择仓库
	if (!form.warehouseId) {
		proxy.$message.warning('请先选择仓库！')
		return
	}
	applicationDrawerVisible.value = true
	nextTick(() => {
		applicationTableRef.value.getList(applicationTableRef.value.queryParams)
	})
}

// 保存选择的物资申报明细
const saveApplicationDetails = () => {
	// 判断是否选择申报
	if (!applicationTableRef.value || !applicationTableRef.value.checkData || applicationTableRef.value.checkData.length < 1) {
		proxy.$message.warning('请选择物资申报！')
		return
	}

	// 获取选中的申报主表数据
	const selectedApplications = applicationTableRef.value.checkData

	// 收集所有申报的明细
	const newDetails = []
	selectedApplications.forEach(application => {
		// 检查申报是否有明细
		if (application.detailList && application.detailList.length > 0) {
			application.detailList.forEach(detail => {
				// 允许物资重复添加，不再检查是否已存在
				// 从物资代码选项中查找对应的物资信息
				const materialOption = materialCodeOptions.value.find(opt => opt.value === detail.materialCodeId)

				// 处理设备ID：单选，如果是字符串（逗号分隔），取第一个值；如果是数组，取第一个元素
				let equipId = null
				if (detail.equipIds) {
					if (typeof detail.equipIds === 'string') {
						// 如果是逗号分隔的字符串，取第一个值
						const ids = detail.equipIds.split(',').filter(id => id && id.trim() !== '')
						equipId = ids.length > 0 ? String(ids[0].trim()) : null
					} else if (Array.isArray(detail.equipIds)) {
						// 如果是数组，取第一个元素
						equipId = detail.equipIds.length > 0 ? String(detail.equipIds[0]) : null
					} else {
						equipId = String(detail.equipIds)
					}
				}

				// 处理设备名称：单选，如果是字符串（逗号分隔），取第一个值
				let equipName = ''
				if (detail.equipNames) {
					if (typeof detail.equipNames === 'string') {
						// 如果是逗号分隔的字符串，取第一个值
						const names = detail.equipNames.split(',').filter(name => name && name.trim() !== '')
						equipName = names.length > 0 ? names[0].trim() : ''
					} else if (Array.isArray(detail.equipNames)) {
						// 如果是数组，取第一个元素
						equipName = detail.equipNames.length > 0 ? detail.equipNames[0] : ''
					} else {
						equipName = String(detail.equipNames)
					}
				}

				// 将物资申报明细转换为出库申请明细
				const newDetail = {
					row_id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					id: null,
					outApplicationId: null,
					materialId: detail.materialCodeId, // 物资ID
					materialName: detail.materialName || '',
					specificationModel: detail.specificationModel || '',
					unitCode: materialOption ? materialOption.unitCode || '' : '', // 从物资代码选项获取
					unitName: materialOption ? materialOption.unitName || detail.unit || '' : detail.unit || '', // 优先使用物资代码的单位，否则使用申报明细的单位
					brand: detail.suggestedBrand || '', // 使用建议品牌
					stockQuantity: detail.stockQuantity != null ? detail.stockQuantity : null, // 使用接口返回的库存数量
					applicationQuantity: detail.applicationQuantity || null, // 使用申报数量
					flowType: detail.flowType || '02', // 使用流向类型，默认"其他"
					flowDirection: detail.flowDirection || '', // 使用流向
					equipIds: equipId, // 设备ID（单选）
					equipNames: equipName, // 设备名称
					rowDisabled: false,
				}

				// 如果从物资代码选项中找到，补充其他字段
				if (materialOption) {
					newDetail.materialCode = materialOption.materialCode || ''
					if (!newDetail.specificationModel && materialOption.specificationModel) {
						newDetail.specificationModel = materialOption.specificationModel
					}
					if (!newDetail.brand && materialOption.brand) {
						newDetail.brand = materialOption.brand
					}
				}

				newDetails.push(newDetail)
			})
		}
	})

	// 如果没有新的明细可添加，提示用户
	if (newDetails.length === 0) {
		proxy.$message.warning('所选物资申报没有可导入的明细')
		applicationDrawerVisible.value = false
		return
	}

	// 将新的明细添加到出库申请明细列表
	newDetails.forEach(item => {
		detailList.push(item)
		// 如果库存数量为空，且有物资ID和仓库ID，则查询库存数量（接口可能没有返回）
		if (item.stockQuantity == null && item.materialId && form.warehouseId) {
			loadStockQuantity(item)
		}
	})

	proxy.$message.success(`成功导入${newDetails.length}条明细`)
	applicationDrawerVisible.value = false
}

onMounted(() => {
	loadMaterialCodeList()
	loadEquipmentList()
	loadWarehouseList()
	loadUserList()
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
