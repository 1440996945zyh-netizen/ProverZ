<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules" :disabled="formDisabled">
			

			<el-form-item label="处置主题" prop="disposalTitle">
				<el-input v-model="formData.disposalTitle" placeholder="请输入处置主题" maxlength="50" :disabled="formDisabled" />
			</el-form-item>

			<el-form-item label="处置类型" prop="disposalType">
				<Select
					:selectData="unitOptions"
					v-model:value="formData.disposalType"
					v-model:label="formData.disposalTypeLabel"
					placeholder="请选择单位"
					:disabled="formDisabled"
				/>
			</el-form-item>

			<el-form-item label="处置金额合计" prop="disposalAmount">
				<el-input v-model="formData.disposalAmount" placeholder="" maxlength="18" :disabled="true" />
			</el-form-item>

			<el-form-item label="废旧物资详情">
				<div style="display: flex; flex-direction: column; width: 100%">
					<EditTable
						ref="EMaterialWasteDisposalDetailRef"
						:name="'废旧物资详情'"
						:tableData="list"
						:tableColumns="certificateColumns"
						:tableHeight="300"
						:editRules="certificateEditRules"
						:rowConfig="rowConfig"
						:disabledKey="'rowDisabled'"
						:hasAdd="!formDisabled"
						:row-style="{ height: '80px' }"
						@input="handleDisposalAmountChange"
					/>
					<!-- <el-button type="primary" link style="margin-top: 10px" @click="addCertificate">
						<el-icon style="vertical-align: middle; margin-right: 4px">
							<Plus />
						</el-icon>
						新增证书
					</el-button> -->
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="maintenancePersonnelDetail">
import { ref, reactive, getCurrentInstance, toRefs, h, onMounted } from 'vue'
import { ElButton, ElInput, ElInputNumber, ElSelect, ElOption, ElDatePicker } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import EditTable from '@/components/EditTable'
import Select from '@/components/Select/index.vue'
import Upload from '@/components/upload'
import api from '@/api/equipment/maintenancePersonnel/index'
import publicApi from '@/api/public/index.js'
import materialCodeApi from '@/api/equipment/materialCode/index'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const EMaterialWasteDisposalDetailRef = ref()
const rowConfig = { isCurrent: true, isHover: true, keyField: 'row_id' }
const formDisabled = ref(false)

const data = reactive({
	formData: {
		id: null,
		disposalTitle: null,
		disposalType: '',
		disposalAmount: '',
	},
	list: [],
})
const { formData, list } = toRefs(data)

const unitOptions = ref([])

const getUnitList = () => {
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'DISPOSAL_TYPE' }).then(res => {
		if (res.code === '0000') {
			unitOptions.value = res.data
		}
	})
}

onMounted(() => {
	getUnitList()
	loadMaterialCodeList()
})

const rules = reactive({
	disposalTitle: proxy.getRules({ required: true }),
	disposalType: proxy.getRules({ required: true }),
	// disposalAmount: proxy.getRules({ required: true }),
})

const certificateColumns = reactive([
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
	{
		label: '金额',
		prop: 'disposalAmount',
		editType: 'input',
		editRender: {
			component: ElInput,
			props: {
				placeholder: '请输入金额',
			},
		},
		minWidth: 150,
	},
	{
		label: '数量',
		prop: 'disposalQuantity',
		editType: 'input',
		editRender: {
			component: ElInput,
			props: {
				placeholder: '请输入数量',
			},
		},
		minWidth: 150,
	},
	{
		prop: '',
		label: '添加',
		width: 80,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							deleteCertificate(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])

// 加载物资代码列表
const materialCodeOptions = ref([])
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
				if (certificateColumns && certificateColumns.length > 0) {
					certificateColumns[0].selectData = [...options] // 使用展开运算符确保响应式更新
				}
			}
		})
		.catch(error => {
			console.error('加载物资代码列表失败:', error)
			proxy.$message.error('加载物资代码列表失败')
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
// 金额选择变化处理
const handleDisposalAmountChange = ( e, row, title) =>{
	if(title==='金额'){
		formData.value.disposalAmount = 0
	formData.value.disposalAmount = list.value.reduce((sum, row) => {
		const amount = Number(row.disposalAmount) || 0
		return sum + amount
	}, 0)
	}
	
}

const certificateEditRules = reactive({
	materialId: proxy.getRules({ required: true }),
	disposalAmount: proxy.getRules({ required: true }),
	disposalQuantity: proxy.getRules({ required: true }),
})

const deleteCertificate = row => {
	proxy.$modal
		.confirm('是否确定删除?')
		.then(() => {
			const index = list.value.findIndex(item => item.row_id === row.row_id)
			if (index > -1) {
				list.value.splice(index, 1)
				handleDisposalAmountChange('', row, '金额')
			}
		})
		.catch(err => {})
}

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		}
	})
	return flag
}

const resetForm = () => {
	formData.value.id = null
	formData.value.disposalTitle = null
	formData.value.disposalAmount = ''
	formData.value.disposalType = ''
	list.value = []
	ruleForm.value?.clearValidate()
}

const setFormDisabled = disabled => {
	formDisabled.value = disabled
	if (disabled) {
		list.value.forEach(item => {
			item.rowDisabled = true
		})
	} else {
		list.value.forEach(item => {
			item.rowDisabled = false
		})
	}
}

defineExpose({
	validate,
	resetForm,
	formData,
	list,
	setFormDisabled,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
