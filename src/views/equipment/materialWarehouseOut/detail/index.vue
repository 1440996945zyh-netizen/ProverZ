<template>
	<el-form :model="form" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="baseData">
				<el-row :gutter="24">
					<el-col :span="8">
						<el-form-item label="出库主题" prop="warehouseOutTitle">
							<el-input v-model="form.warehouseOutTitle" placeholder="请输入出库主题" :disabled="formDisabled" maxlength="200" />
						</el-form-item>
					</el-col>
					<el-col :span="8">
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
					<el-col :span="8">
						<el-form-item label="部门" prop="deptId">
							<Select
								:selectData="deptList"
								v-model:value="form.deptId"
								v-model:label="form.deptName"
								:disabled="formDisabled"
								placeholder="请选择部门"
								@change="handleDeptChange"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="领料人" prop="receiverId">
							<Select
								:selectData="userList"
								v-model:value="form.receiverId"
								v-model:label="form.receiverName"
								:disabled="formDisabled || !form.deptId"
								:placeholder="form.deptId ? '请选择领料人' : '请先选择部门'"
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>

			<!-- 明细列表 -->
			<el-collapse-item title="物资出库明细" name="detailList">
				<template #title>
					<div style="width: 100%; display: flex; justify-content: space-between">
						<span>物资出库明细</span>
						<div style="display: flex">
						<el-button plain size="medium" @click.stop="openApplicationDrawer" :disabled="formDisabled || !form.warehouseId" style="margin: 8px 10px 0px 0px">
							导入物资领料申请
						</el-button>
						</div>
					</div>
				</template>
				<EditTable
					ref="detailTableRef"
					:name="'物资出库明细'"
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

	<!-- 选择物资出库申请抽屉 -->
	<el-drawer v-model="applicationDrawerVisible" title="选择物资出库申请" size="70%">
		<applicationTable ref="applicationTableRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="applicationDrawerVisible = false">取消</el-button>
				<el-button type="primary" @click="saveApplicationDetails">确定</el-button>
			</div>
		</template>
	</el-drawer>
</template>
<script setup name="materialWarehouseOutDetail">
import { ref, reactive, nextTick, h, getCurrentInstance, onMounted, watch, computed } from 'vue'
import { ElButton, ElInput, ElInputNumber } from 'element-plus'
import EditTable from '@/components/EditTable'
import Select from '@/components/Select/index.vue'
import publicApi from '@/api/public/index'
import materialWarehouseApi from '@/api/equipment/materialWarehouse/index'
import { listDept } from '@/api/system/dept'
import applicationTable from './applicationTable/index.vue'
const { proxy } = getCurrentInstance()
const tableHeight = reactive(window.innerHeight - 420)
const ruleForm = ref()
const detailTableRef = ref()
const formDisabled = ref(false)
const activeNames = ref(['baseData', 'detailList'])
const applicationDrawerVisible = ref(false) // 选择物资出库申请抽屉显示状态
const applicationTableRef = ref() // 物资出库申请表格ref

const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }

// 表单数据
const formData = reactive({
	form: {
		id: null,
		warehouseOutTitle: '',
		warehouseOutNo: '',
		warehouseId: null,
		warehouseName: '',
		deptId: null,
		deptName: '',
		receiverId: null,
		receiverName: '',
	},
	detailList: [],
})

const { form, detailList } = formData

// 用户列表
const userList = ref([])

// 部门列表
const deptList = ref([])

// 仓库列表
const warehouseList = ref([])

// 表单验证规则
const rules = reactive({
	warehouseOutTitle: proxy.getRules({ required: true }),
	warehouseId: proxy.getRules({ required: true }),
	deptId: proxy.getRules({ required: true }),
	receiverId: proxy.getRules({ required: true }),
})

// 加载部门列表
const loadDeptList = () => {
	// 查询部门列表：DEPT_LEVEL=2（部门级别），IN_OUT_TYPE=I（内部），STATUS=1（在用）
	listDept({
		deptLevel: 2,
		inOutType: 'I',
		status: '1'
	}).then(res => {
		if (res.code == '0000') {
			deptList.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id,
			}))
		}
	})
}

// 加载用户列表（根据部门ID）
const loadUserList = (deptId) => {
	if (!deptId) {
		userList.value = []
		return
	}
	publicApi.getLocalSelect({
		type: 'USER',
		deptId: deptId
	}).then(res => {
		if (res.code == '0000') {
			userList.value = res.data.map(item => ({
				label: item.label || item.userName,
				value: item.value || item.id,
			}))
		}
	})
}

// 部门变化时，清空领料人并重新加载用户列表
const handleDeptChange = () => {
	form.receiverId = null
	form.receiverName = ''
	if (form.deptId) {
		loadUserList(form.deptId)
	} else {
		userList.value = []
	}
}

// 监听deptId变化，编辑时自动加载用户列表
watch(() => form.deptId, (newVal, oldVal) => {
	if (newVal) {
		// 如果部门ID变化了，或者用户列表为空，则加载用户列表
		if (newVal !== oldVal || !userList.value.length) {
			loadUserList(newVal)
		}
	} else {
		// 如果部门ID被清空，清空用户列表
		userList.value = []
	}
})

// 监听仓库ID变化，仓库改变时清空明细列表
watch(() => form.warehouseId, (newVal, oldVal) => {
	// 如果仓库ID变化了（不是初始化），清空明细列表
	if (oldVal !== undefined && newVal !== oldVal && !formDisabled.value) {
		detailList.length = 0
	}
})

// 监听明细列表中出库数量的变化，验证是否大于申请数量和库存数量
watch(
	() => detailList.map(d => ({
		row_id: d.row_id,
		outQuantity: d.outQuantity,
		applicationQuantity: d.applicationQuantity,
		stockQuantity: d.stockQuantity,
		materialName: d.materialName,
	})),
	(newVal, oldVal) => {
		if (formDisabled.value) {
			return
		}
		// 找出变化的行
		if (oldVal && oldVal.length > 0) {
			newVal.forEach((newItem, index) => {
				const oldItem = oldVal[index]
				if (oldItem && newItem.outQuantity !== oldItem.outQuantity) {
					const row = detailList.find(r => r.row_id === newItem.row_id)
					if (row) {
						handleOutQuantityChange(row)
					}
				}
			})
		}
	},
	{ deep: true }
)

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
	},
	{
		label: '规格型号',
		prop: 'specificationModel',
	},
	{
		label: '计量单位',
		prop: 'unitName',
		width: 100,
	},
	{
		label: '流向',
		prop: 'flowDirection',
	},
	{
		label: '库存数据',
		prop: 'stockQuantity',
		width: 120,
		align: 'right',
	},
	{
		label: '申领数量',
		prop: 'applicationQuantity',
		width: 120,
		align: 'right',
	},
	{
		label: '已申领数量',
		prop: 'outQuantitySum',
		width: 120,
		align: 'right',
	},
	{
		label: '本次出库数量',
		prop: 'outQuantity',
		editType: 'input',
		editRender: {
			component: ElInputNumber,
			props: {
				controlsPosition: 'right',
				min: 0,
				precision: 2,
			},
		},
		width: 140,
		align: 'right',
	},
	// {
	// 	label: '未申领数量',
	// 	prop: 'remainingQuantity',
	// 	width: 120,
	// 	align: 'right',
	// },
	{
		prop: '',
		label: '操作',
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
					}
				),
			]
		},
	},
]

// 明细表格列（根据formDisabled动态过滤）
const detailColumns = reactive([...baseDetailColumns])

// 监听formDisabled变化，动态更新列
watch(
	() => formDisabled.value,
	(newVal) => {
		if (newVal) {
			// 查看模式下，隐藏库存数据、已申领数量和未申领数量，但保留申领数量
			detailColumns.length = 0
			detailColumns.push(...baseDetailColumns.filter(col =>
				col.prop !== 'stockQuantity' &&
				col.prop !== 'outQuantitySum' &&
				col.prop !== 'remainingQuantity'
			))
		} else {
			// 编辑模式下，显示所有列
			detailColumns.length = 0
			detailColumns.push(...baseDetailColumns)
		}
	},
	{ immediate: true }
)

// 明细编辑规则
const detailEditRules = reactive({
	outQuantity: proxy.getRules({
		required: true,
		numberCheck: {
			int: 10,
			dec: 2,
		},
	}),
})

// 打开选择物资出库申请抽屉
const openApplicationDrawer = () => {
	if (formDisabled.value) {
		return
	}
	if (!form.warehouseId) {
		proxy.$message.warning('请先选择所属仓库')
		return
	}
	applicationDrawerVisible.value = true
	nextTick(() => {
		// 设置仓库ID到查询参数
		if (applicationTableRef.value) {
			applicationTableRef.value.queryParams.warehouseId = form.warehouseId
			applicationTableRef.value.getList(applicationTableRef.value.queryParams)
		}
	})
}

// 保存选择的物资出库申请明细
const saveApplicationDetails = () => {
	// 判断是否选择申请
	if (!applicationTableRef.value) {
		proxy.$message.warning('请选择物资出库申请！')
		return
	}

	// 获取选中的申请列表（优先使用getSelectedData方法，否则使用checkData）
	let selectedApplications = []
	if (applicationTableRef.value.getSelectedData) {
		selectedApplications = applicationTableRef.value.getSelectedData()
	} else if (applicationTableRef.value.checkData) {
		// checkData可能是ref，需要访问.value
		selectedApplications = applicationTableRef.value.checkData.value || applicationTableRef.value.checkData || []
	}

	if (!selectedApplications || selectedApplications.length < 1) {
		proxy.$message.warning('请选择物资出库申请！')
		return
	}

	// 收集所有明细（允许重复导入，已注释去重逻辑）
	const newDetails = []
	// 使用 applicationId + materialId 的组合作为唯一键（已注释，允许重复导入）
	// const applicationMaterialKeySet = new Set()

	// 检查当前明细列表中已存在的 applicationId + materialId 组合（已注释，允许重复导入）
	// detailList.forEach(existingDetail => {
	// 	if (existingDetail.applicationId && existingDetail.materialId) {
	// 		const key = `${existingDetail.applicationId}_${existingDetail.materialId}`
	// 		applicationMaterialKeySet.add(key)
	// 	}
	// })

	selectedApplications.forEach(application => {
		if (application.detailList && application.detailList.length > 0) {
			application.detailList.forEach(detail => {
				// 过滤掉库存数量为0的明细
				const stockQuantity = detail.stockQuantity || 0
				if (Number(stockQuantity) <= 0) {
					return // 跳过库存数量为0的明细
				}

				// 检查是否已存在该物资申领ID和物资ID的组合（已注释，允许重复导入）
				const applicationId = application.id || null
				const materialId = detail.materialId || null

				if (!applicationId || !materialId) {
					return // 跳过没有applicationId或materialId的明细
				}

				// const key = `${applicationId}_${materialId}`
				// if (!applicationMaterialKeySet.has(key)) {
				// 	applicationMaterialKeySet.add(key)
					// 计算未出库数量 = 申请数量 - 已出库数量
					const applicationQuantity = Number(detail.applicationQuantity || 0)
					const outQuantitySum = Number(detail.outQuantitySum || 0)
					const remainingQuantity = applicationQuantity - outQuantitySum

					newDetails.push({
						row_id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
						id: null,
						warehouseOutId: null,
						applicationId: applicationId, // 保存物资申领ID
						materialId: materialId,
						materialCode: detail.materialCode || '',
						materialName: detail.materialName || '',
						specificationModel: detail.specificationModel || '',
						brand: detail.brand || '',
						unitCode: detail.unitCode || '',
						unitName: detail.unitName || '',
						warehouseOutAppDetailId: detail.id || null,
						outQuantity: remainingQuantity > 0 ? remainingQuantity : null, // 默认出库数量等于未出库数量
						flowDirection: detail.flowDirection || '',
						stockQuantity: detail.stockQuantity || 0, // 库存数量
						applicationQuantity: applicationQuantity, // 申请数量
						outQuantitySum: outQuantitySum, // 已出库数量
						remainingQuantity: remainingQuantity, // 未出库数量
						rowDisabled: false,
					})
				// } else {
				// 	// 如果已存在，提示用户（已注释，允许重复导入）
				// 	proxy.$message.warning(`物资【${detail.materialName || ''}】已存在，跳过导入`)
				// }
			})
		}
	})

	if (newDetails.length === 0) {
		proxy.$message.warning('所选申请中没有可用的明细数据')
		applicationDrawerVisible.value = false
		return
	}

	// 将新的明细添加到出库明细列表
	detailList.push(...newDetails)

	// 关闭抽屉
	applicationDrawerVisible.value = false
	proxy.$message.success(`成功导入${newDetails.length}条明细`)
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
	// 当出库数量变化时，验证是否大于申请数量
	if (column.property === 'outQuantity') {
		handleOutQuantityChange(row)
	}
}

// 处理出库数量变化事件
const handleOutQuantityChange = (row) => {
	if (formDisabled.value) {
		return
	}
	// 验证出库数量不能大于未出库数量
	if (row.outQuantity != null && row.remainingQuantity != null) {
		if (Number(row.outQuantity) > Number(row.remainingQuantity)) {
			proxy.$message.warning(`物资【${row.materialName || ''}】的出库数量不能大于未申领数量（${row.remainingQuantity}）`)
			// 自动修正为未出库数量
			row.outQuantity = Number(row.remainingQuantity)
		}
	}
	// 验证出库数量不能大于库存数量
	if (row.outQuantity != null && row.stockQuantity != null) {
		if (Number(row.outQuantity) > Number(row.stockQuantity)) {
			proxy.$message.warning(`物资【${row.materialName || ''}】的出库数量不能大于库存数量（${row.stockQuantity}）`)
			// 自动修正为库存数量
			row.outQuantity = Number(row.stockQuantity)
		}
	}
	// 验证：本次出库数量 + 数据库中的已申领数量 <= 申领数量
	if (row.outQuantity != null && row.applicationQuantity != null && row.outQuantitySum != null) {
		const totalOutQuantity = Number(row.outQuantity) + Number(row.outQuantitySum)
		if (totalOutQuantity > Number(row.applicationQuantity)) {
			const maxAllowed = Number(row.applicationQuantity) - Number(row.outQuantitySum)
			proxy.$message.warning(`物资【${row.materialName || ''}】的出库数量 + 已申领数量（${row.outQuantitySum}）不能超过申领数量（${row.applicationQuantity}），最大可出库数量为：${maxAllowed}`)
			// 自动修正为最大可出库数量
			row.outQuantity = maxAllowed > 0 ? maxAllowed : 0
		}
	}
}

// 明细表头点击事件
const detailHeaderCellClickEvent = ({ column }) => {
	// 可以在这里处理表头点击事件
}

// 处理明细数据（编辑时调用）
const editDetailList = data => {
	if (data && data.length > 0) {
		detailList.length = 0
		data.forEach((item, index) => {
			detailList.push({
				row_id: `row_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
				id: item.id || null,
				warehouseOutId: item.warehouseOutId || null,
				materialId: item.materialId || null,
				materialCode: item.materialCode || '',
				materialName: item.materialName || '',
				specificationModel: item.specificationModel || '',
				brand: item.brand || '',
				unitCode: item.unitCode || '',
				unitName: item.unitName || '',
				warehouseOutAppDetailId: item.warehouseOutAppDetailId || null,
				outQuantity: item.outQuantity || null,
				flowDirection: item.flowDirection || '',
				stockQuantity: item.stockQuantity || 0, // 库存数量
				applicationQuantity: item.applicationQuantity || null, // 申请数量
				outQuantitySum: item.outQuantitySum || 0, // 已出库数量
				remainingQuantity: item.remainingQuantity || (item.applicationQuantity || 0) - (item.outQuantitySum || 0), // 未出库数量
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

// 重置表单
const resetForm = () => {
	form.id = null
	form.warehouseOutTitle = ''
	form.warehouseOutNo = ''
	form.warehouseId = null
	form.warehouseName = ''
	form.deptId = null
	form.deptName = ''
	form.receiverId = null
	form.receiverName = ''
	detailList.length = 0
}

// 验证
const validate = async () => {
	let flag = false
	let flag2 = false
	let flag3 = true

	// 验证出库数量不能大于未出库数量和库存数量
	if (detailList && detailList.length > 0) {
		for (let i = 0; i < detailList.length; i++) {
			const row = detailList[i]
			// 验证出库数量不能大于未出库数量
			if (row.outQuantity != null && row.remainingQuantity != null) {
				if (Number(row.outQuantity) > Number(row.remainingQuantity)) {
					proxy.$message.warning(`第${i + 1}行：物资【${row.materialName || ''}】的出库数量(${row.outQuantity})不能大于未出库数量(${row.remainingQuantity})`)
					flag3 = false
					return false
				}
			}
			// 验证出库数量不能大于库存数量
			if (row.outQuantity != null && row.stockQuantity != null) {
				if (Number(row.outQuantity) > Number(row.stockQuantity)) {
					proxy.$message.warning(`第${i + 1}行：物资【${row.materialName || ''}】的出库数量(${row.outQuantity})不能大于库存数量(${row.stockQuantity})`)
					flag3 = false
					return false
				}
			}
			// 验证：本次出库数量 + 数据库中的已申领数量 <= 申领数量
			if (row.outQuantity != null && row.applicationQuantity != null && row.outQuantitySum != null) {
				const totalOutQuantity = Number(row.outQuantity) + Number(row.outQuantitySum)
				if (totalOutQuantity > Number(row.applicationQuantity)) {
					proxy.$message.warning(`第${i + 1}行：物资【${row.materialName || ''}】的出库数量(${row.outQuantity}) + 已申领数量(${row.outQuantitySum}) = ${totalOutQuantity}，不能超过申领数量(${row.applicationQuantity})`)
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
		// 自动生成出库单主题：出库单 + 日期
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		form.warehouseOutTitle = `出库单${year}${month}${day}`
	} else {
		// 编辑或查看时，如果有部门ID，加载用户列表
		if (form.deptId) {
			loadUserList(form.deptId)
		}
		// 确保明细折叠项展开
		nextTick(() => {
			if (detailList.length > 0 && !activeNames.value.includes('detailList')) {
				activeNames.value.push('detailList')
			}
		})
	}
}

// 组件挂载时加载部门列表和仓库列表
onMounted(() => {
	loadDeptList()
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


