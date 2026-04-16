<template>
	<div class="material-allocate-operation">
		<el-form ref="baseFormRef" :model="baseForm" :rules="baseFormRules" :disabled="readonly" label-width="110px">
			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="调出单位" prop="fromCompanyId">
						<el-select
							v-model="baseForm.fromCompanyId"
							placeholder="请选择调出单位"
							clearable
							filterable
							:disabled="readonly"
							@change="handleFromCompanyChange"
						>
							<el-option v-for="item in companyList" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="调出仓库" prop="fromWarehouseId">
						<el-select
							v-model="baseForm.fromWarehouseId"
							placeholder="请选择调出仓库"
							clearable
							filterable
							:disabled="readonly || !baseForm.fromCompanyId"
							@change="handleFromWarehouseChange"
						>
							<el-option v-for="item in fromWarehouseOptions" :key="item.id" :label="item.warehouseName" :value="item.id" />
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="调入单位" prop="toCompanyId">
						<el-select
							v-model="baseForm.toCompanyId"
							placeholder="请选择调入单位"
							clearable
							filterable
							:disabled="readonly"
							@change="handleToCompanyChange"
						>
							<el-option v-for="item in companyList" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="调入仓库" prop="toWarehouseId">
						<el-select
							v-model="baseForm.toWarehouseId"
							placeholder="请选择调入仓库"
							clearable
							filterable
							:disabled="readonly || !baseForm.toCompanyId"
							@change="handleToWarehouseChange"
						>
							<el-option v-for="item in toWarehouseOptions" :key="item.id" :label="item.warehouseName" :value="item.id" />
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="24">
					<el-form-item label="标题" prop="title">
						<el-input v-model="baseForm.title" maxlength="100" placeholder="请输入调拨标题" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row>
				<el-col :span="24">
					<el-form-item label="调拨原因" prop="applyReason">
						<el-input
							v-model="baseForm.applyReason"
							type="textarea"
							:rows="3"
							maxlength="500"
							show-word-limit
							placeholder="请输入调拨原因"
						/>
					</el-form-item>
				</el-col>
			</el-row>

		</el-form>

		<el-card header="调拨物资" style="margin-top: 20px">
			<div v-if="!readonly" class="material-actions">
				<el-button type="primary" icon="Plus" @click="handleShowMaterialSelect" :disabled="!baseForm.fromWarehouseId">
					添加物资
				</el-button>
				<span v-if="!baseForm.fromWarehouseId" class="tips-text">请先选择调出仓库</span>
			</div>

			<el-table :data="selectedMaterialList" border style="width: 100%; margin-top: 12px">
				<el-table-column type="index" label="序号" width="60" align="center" />
				<el-table-column label="物资名称" prop="materialName" min-width="180" />
				<el-table-column label="规格型号" prop="specification" min-width="140" />
				<el-table-column label="品牌" prop="brand" min-width="120" />
				<el-table-column label="单位" prop="unitName" align="center" width="90" />
				<el-table-column label="可调数量" prop="availableQty" align="right" width="120" />
				<el-table-column label="调拨数量" min-width="140" align="center">
					<template #default="{ row }">
						<el-input-number
							v-model="row.allocQty"
							:min="0"
							:precision="4"
							:max="Number(row.availableQty || 0)"
							controls-position="right"
							style="width: 100%"
							:disabled="readonly"
							@change="() => handleAllocQtyChange(row)"
						/>
					</template>
				</el-table-column>
				<el-table-column v-if="!readonly" label="操作" align="center" width="80" fixed="right">
					<template #default="{ $index }">
						<el-button type="danger" link @click="handleDeleteMaterial($index)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-empty v-if="selectedMaterialList.length === 0" :description="readonly ? '暂无调拨物资' : '暂无调拨物资，请点击上方按钮添加'" />
		</el-card>

		<el-dialog v-model="dialogVisible" title="选择待调拨物资" width="88%" top="5vh" :close-on-click-modal="false" @close="handleDialogClose">
			<el-form :model="materialSearchForm" :inline="true" label-width="85px" style="margin-top: 15px">
				<el-form-item label="物资名称">
					<el-input v-model="materialSearchForm.materialName" placeholder="请输入物资名称" clearable @keyup.enter="loadMaterialList" />
				</el-form-item>
				<el-form-item label="规格型号">
					<el-input v-model="materialSearchForm.specificationModel" placeholder="请输入规格型号" clearable @keyup.enter="loadMaterialList" />
				</el-form-item>
				<el-form-item label="品牌">
					<el-input v-model="materialSearchForm.brand" placeholder="请输入品牌" clearable @keyup.enter="loadMaterialList" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="Search" @click="loadMaterialList">查询</el-button>
				</el-form-item>
			</el-form>

			<div class="dialog-content">
				<div class="left-table">
					<el-table :data="materialList" border height="50vh" v-loading="materialLoading">
						<el-table-column type="index" label="序号" width="50" align="center" />
						<el-table-column label="物资名称" prop="materialName" min-width="160" />
						<el-table-column label="规格型号" prop="specificationModel" min-width="130" />
						<el-table-column label="品牌" prop="brand" min-width="120" />
						<el-table-column label="单位" prop="unitName" align="center" width="90" />
						<el-table-column label="库存数量" prop="stockQuantity" align="right" width="120" />
<!--						<el-table-column label="库存单价" prop="stockUnitPrice" align="right" width="120">-->
<!--							<template #default="{ row }">{{ formatNumber(row.stockUnitPrice) }}</template>-->
<!--						</el-table-column>-->
						<el-table-column label="操作" width="80" align="center" fixed="right">
							<template #default="{ row }">
								<el-button type="primary" link icon="Plus" @click="handleAddToPreSelect(row)" />
							</template>
						</el-table-column>
					</el-table>
					<el-pagination
						v-model:current-page="materialPagination.current"
						v-model:page-size="materialPagination.size"
						:page-sizes="[10, 20, 50, 100]"
						:total="materialPagination.total"
						layout="total, sizes, prev, pager, next, jumper"
						@current-change="handleMaterialPageChange"
						@size-change="handleMaterialSizeChange"
						style="margin-top: 10px"
					/>
				</div>

				<div class="right-table">
					<div class="right-table-header">已选择物资</div>
					<el-table :data="preSelectedMaterialList" border height="50vh">
						<el-table-column label="物资名称" prop="materialName" min-width="140" />
<!--						<el-table-column label="调拨数量" prop="allocQty" width="100" align="right" />-->
						<el-table-column label="操作" width="60" align="center">
							<template #default="{ $index }">
								<el-button type="danger" link icon="Minus" @click="handleRemoveFromPreSelect($index)" />
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>

			<template #footer>
				<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px">
					<el-button @click="handleDialogClose">取消</el-button>
					<el-button type="primary" @click="handleConfirmMaterial">确定</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="materialAllocateOperation">
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
import api from '@/api/equipment/materialAllocate'
import materialWarehouseApi from '@/api/equipment/materialWarehouse'
import { getListByLevel } from '@/api/system/dept'

defineProps({
	readonly: { type: Boolean, default: false },
	mode: { type: String, default: 'add' },
})

const { proxy } = getCurrentInstance()
const baseFormRef = ref()
const companyList = ref([])
const warehouseList = ref([])
const fromWarehouseOptions = ref([])
const toWarehouseOptions = ref([])
const selectedMaterialList = ref([])
const preSelectedMaterialList = ref([])
const materialList = ref([])
const materialLoading = ref(false)
const dialogVisible = ref(false)

const materialPagination = reactive({
	current: 1,
	size: 20,
	total: 0,
})

const materialSearchForm = reactive({
	materialName: '',
	specificationModel: '',
	brand: '',
})

const baseForm = reactive({
	id: null,
	allocateCode: '',
	title: '',
	fromCompanyId: null,
	fromCompanyName: '',
	fromWarehouseId: null,
	fromWarehouseName: '',
	toCompanyId: null,
	toCompanyName: '',
	toWarehouseId: null,
	toWarehouseName: '',
	applyReason: '',
})

const baseFormRules = {
	fromCompanyId: [{ required: true, message: '请选择调出单位', trigger: 'change' }],
	fromWarehouseId: [{ required: true, message: '请选择调出仓库', trigger: 'change' }],
	toCompanyId: [{ required: true, message: '请选择调入单位', trigger: 'change' }],
	toWarehouseId: [{ required: true, message: '请选择调入仓库', trigger: 'change' }],
	title: [{ required: true, message: '请输入调拨标题', trigger: 'blur' }],
	applyReason: [{ required: true, message: '请输入调拨原因', trigger: 'blur' }],
}

/**
 * 初始化下拉数据
 */
const loadOptions = async () => {
	const [companyRes, warehouseRes] = await Promise.all([getListByLevel(1), materialWarehouseApi.getListForSelect()])
	if (companyRes.code === '0000') {
		companyList.value = (companyRes.data || []).map(item => ({ label: item.deptName, value: item.id }))
	}
	if (warehouseRes.code === '0000') {
		warehouseList.value = warehouseRes.data || []
		updateWarehouseOptions()
	}
}

const updateWarehouseOptions = () => {
	fromWarehouseOptions.value = warehouseList.value.filter(item => item.companyId === baseForm.fromCompanyId)
	toWarehouseOptions.value = warehouseList.value.filter(item => item.companyId === baseForm.toCompanyId)
}

const findCompanyName = companyId => companyList.value.find(item => item.value === companyId)?.label || ''
const findWarehouse = warehouseId => warehouseList.value.find(item => item.id === warehouseId)

const handleFromCompanyChange = value => {
	baseForm.fromCompanyName = findCompanyName(value)
	baseForm.fromWarehouseId = null
	baseForm.fromWarehouseName = ''
	selectedMaterialList.value = []
	updateWarehouseOptions()
}

const handleFromWarehouseChange = value => {
	const warehouse = findWarehouse(value)
	baseForm.fromWarehouseName = warehouse?.warehouseName || ''
	selectedMaterialList.value = []
}

const handleToCompanyChange = value => {
	baseForm.toCompanyName = findCompanyName(value)
	baseForm.toWarehouseId = null
	baseForm.toWarehouseName = ''
	updateWarehouseOptions()
}

const handleToWarehouseChange = value => {
	const warehouse = findWarehouse(value)
	baseForm.toWarehouseName = warehouse?.warehouseName || ''
}

/**
 * 打开物资选择弹窗
 */
const handleShowMaterialSelect = () => {
	if (!baseForm.fromWarehouseId) {
		proxy.$message.warning('请先选择调出仓库')
		return
	}
	dialogVisible.value = true
	preSelectedMaterialList.value = selectedMaterialList.value.map(item => ({ ...item }))
	materialPagination.current = 1
	loadMaterialList()
}

/**
 * 查询待调拨物资
 */
const loadMaterialList = () => {
	if (!baseForm.fromWarehouseId) {
		proxy.$message.warning('请先选择调出仓库')
		return
	}
	materialLoading.value = true
	api.selectMaterial({
		startPage: materialPagination.current,
		pageSize: materialPagination.size,
		warehouseId: baseForm.fromWarehouseId,
		materialName: materialSearchForm.materialName,
		specificationModel: materialSearchForm.specificationModel,
		brand: materialSearchForm.brand,
	}).then(res => {
		if (res.code === '0000') {
			materialList.value = res.data.pages || []
			materialPagination.total = res.data.totalNum || 0
		} else {
			proxy.$message.error(res.msg || '查询待调拨物资失败')
		}
	}).finally(() => {
		materialLoading.value = false
	})
}

const handleMaterialPageChange = current => {
	materialPagination.current = current
	loadMaterialList()
}

const handleMaterialSizeChange = size => {
	materialPagination.size = size
	materialPagination.current = 1
	loadMaterialList()
}

/**
 * 预选时按物资ID去重
 */
const handleAddToPreSelect = row => {
	const exists = preSelectedMaterialList.value.some(item => item.materialId === row.materialId)
	if (exists) {
		proxy.$message.warning('该物资已添加')
		return
	}
	preSelectedMaterialList.value.push({
		materialId: row.materialId,
		materialCode: row.materialCode,
		materialName: row.materialName,
		specification: row.specificationModel,
		specDesc: row.specificationModel,
		brand: row.brand,
		unitCode: row.unitCode,
		unitName: row.unitName,
		availableQty: row.stockQuantity,
		allocQty: null,
	})
}

const handleRemoveFromPreSelect = index => {
	preSelectedMaterialList.value.splice(index, 1)
}

const handleConfirmMaterial = () => {
	selectedMaterialList.value = preSelectedMaterialList.value.map(item => ({ ...item }))
	dialogVisible.value = false
}

const handleDialogClose = () => {
	dialogVisible.value = false
	preSelectedMaterialList.value = []
	materialSearchForm.materialName = ''
	materialSearchForm.specificationModel = ''
	materialSearchForm.brand = ''
}

const handleDeleteMaterial = index => {
	selectedMaterialList.value.splice(index, 1)
}

/**
 * 数量变化时只做边界控制
 */
const handleAllocQtyChange = row => {
	if (row.allocQty != null && Number(row.allocQty) > Number(row.availableQty || 0)) {
		row.allocQty = row.availableQty
	}
}

const formatNumber = value => {
	if (value == null || value === '') {
		return '-'
	}
	return Number(value).toFixed(2)
}

const getTodayCode = () => {
	const date = new Date()
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}${month}${day}`
}

/**
 * 提交前统一校验主表与明细
 */
const validate = async () => {
	if (baseForm.fromWarehouseId && baseForm.toWarehouseId && baseForm.fromWarehouseId === baseForm.toWarehouseId) {
		proxy.$message.warning('调出仓库与调入仓库不能相同')
		return false
	}
	if (selectedMaterialList.value.length === 0) {
		proxy.$message.warning('请至少添加一条调拨物资')
		return false
	}
	const invalidRow = selectedMaterialList.value.find(item => !item.allocQty || Number(item.allocQty) <= 0 || Number(item.allocQty) > Number(item.availableQty || 0))
	if (invalidRow) {
		proxy.$message.warning(`请检查物资【${invalidRow.materialName}】的调拨数量`)
		return false
	}
	try {
		await baseFormRef.value.validate()
		return true
	} catch (error) {
		return false
	}
}

/**
 * 组装后端需要的提交数据
 */
const buildSubmitData = () => {
	return {
		...baseForm,
		detailList: selectedMaterialList.value.map((item, index) => ({
			id: item.id,
			sortNum: index + 1,
			materialId: item.materialId,
			materialCode: item.materialCode,
			materialName: item.materialName,
			specification: item.specification,
			specDesc: item.specDesc,
			brand: item.brand,
			unitCode: item.unitCode,
			unitName: item.unitName,
			allocQty: item.allocQty,
			availableQty: item.availableQty,
		})),
	}
}

/**
 * 重置表单默认值
 */
const resetForm = () => {
	baseFormRef.value?.resetFields()
	Object.assign(baseForm, {
		id: null,
		allocateCode: '',
		title: `物资调拨${getTodayCode()}`,
		fromCompanyId: null,
		fromCompanyName: '',
		fromWarehouseId: null,
		fromWarehouseName: '',
		toCompanyId: null,
		toCompanyName: '',
		toWarehouseId: null,
		toWarehouseName: '',
		applyReason: '',
	})
	selectedMaterialList.value = []
	preSelectedMaterialList.value = []
	materialSearchForm.materialName = ''
	materialSearchForm.specificationModel = ''
	materialSearchForm.brand = ''
	updateWarehouseOptions()
}

/**
 * 详情回显
 */
const loadDetailData = data => {
	Object.keys(baseForm).forEach(key => {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			baseForm[key] = data[key]
		}
	})
	updateWarehouseOptions()
	selectedMaterialList.value = (data.detailList || []).map(item => ({
		...item,
		availableQty: item.availableQty ?? item.allocQty ?? 0,
	}))
}

onMounted(async () => {
	await loadOptions()
	nextTick(() => {
		resetForm()
	})
})

defineExpose({
	baseForm,
	selectedMaterialList,
	validate,
	resetForm,
	loadDetailData,
	buildSubmitData,
})
</script>

<style scoped lang="scss">
.material-allocate-operation {
	padding: 20px;
}

.material-actions {
	display: flex;
	align-items: center;
}

.tips-text {
	color: var(--el-color-warning);
	margin-left: 10px;
}

:deep(.el-card__header) {
	padding: 12px 20px;
	font-weight: bold;
}

:deep(.el-card__body) {
	padding: 15px 20px;
}

.dialog-content {
	display: flex;
	gap: 15px;

	.left-table {
		flex: 1;
		min-width: 0;
	}

	.right-table {
		width: 260px;
		flex-shrink: 0;

		.right-table-header {
			padding: 8px 12px;
			background-color: var(--el-fill-color-light);
			border: 1px solid var(--el-border-color);
			border-bottom: none;
			font-weight: bold;
			font-size: 14px;
		}
	}
}
</style>
