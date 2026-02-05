<template>
	<div class="finance-supply">
		<el-form :model="localFormData" ref="ruleForm" :rules="rules" label-position="top" :inline="true" :disabled="readonly">
			<el-collapse v-model="activeNames">
				<!-- 设备供货信息 -->
				<el-collapse-item title="设备供货信息" name="supply">
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="出厂编号" prop="factoryNumber" class="form-table-item">
								<el-input v-model="localFormData.factoryNumber" placeholder="出厂编号" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备自重(T)" prop="equipWeight" class="form-table-item">
								<el-input-number v-model="localFormData.equipWeight" placeholder="设备自重" style="width: 100%" :precision="2" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备购置时间" prop="purchaseTime" class="form-table-item">
								<el-date-picker
									v-model="localFormData.purchaseTime"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
									@change="calculateDepreciatedPeriod"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备使用时间" prop="usageTime" class="form-table-item">
								<el-date-picker
									v-model="localFormData.usageTime"
									type="date"
									placeholder="添加日期"
									style="width: 100%"
									value-format="YYYY-MM-DD"
								/>
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="供货单位" prop="supplierUnit" class="form-table-item">
								<el-input v-model="localFormData.supplierUnit" placeholder="供货单位" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="制造厂家" prop="manufacturer" class="form-table-item">
								<el-input v-model="localFormData.manufacturer" placeholder="制造厂家" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="排放标准" prop="emissionStandard" class="form-table-item">
								<Select :dataConfig="{ params: { type: 'DICT', dictType: 'EMISSION' } }" v-model:value="localFormData.emissionStandard" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="发动机功率/装机容量(Kw)" prop="enginePower" class="form-table-item">
								<el-input-number v-model="localFormData.enginePower" placeholder="发动机功率/装机容量" style="width: 100%" :precision="2" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>

				<!-- 财务信息 -->
				<el-collapse-item title="财务信息" name="finance" style='margin-top: 20px'>
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备资产编号" prop="assetsNo" class="form-table-item">
								<el-input v-model="localFormData.assetsNo" placeholder="设备资产编号" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="设备原值(元)" prop="originalValue" class="form-table-item">
								<el-input-number v-model="localFormData.originalValue" placeholder="设备原值" style="width: 100%" :precision="2" :min="0" @change="calculateNetValue" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="资产净值(元)" prop="netValue" class="form-table-item">
								<el-input-number v-model="localFormData.netValue" placeholder="资产净值" style="width: 100%" :precision="2" :readonly="true" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="0" class="form-table-row">
						<el-col :span="6" class="form-table-col">
							<el-form-item label="折旧期限(月)" prop="depreciationPeriod" class="form-table-item">
								<el-input-number v-model="localFormData.depreciationPeriod" placeholder="折旧期限" style="width: 100%" :min="0" @change="calculateNetValue" />
							</el-form-item>
						</el-col>
						<el-col :span="6" class="form-table-col">
							<el-form-item label="已折旧期限(月)" prop="depreciatedPeriod" class="form-table-item">
								<el-input-number v-model="localFormData.depreciatedPeriod" placeholder="已折旧期限" style="width: 100%" :min="0" :readonly="true" @change="calculateNetValue" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
			</el-collapse>
		</el-form>

		<!-- 变更记录 -->
		<el-collapse v-model="activeNames" style='margin-top: 20px;'>
			<el-collapse-item title="设备供货信息历史记录" name="supplyChangeLog">
				<ChangeLog v-if="formData.id" ref="supplyChangeLogRef" :equipId="formData.id" changeType="SUPPLY" :readonly="readonly" :height='300' />
			</el-collapse-item>
			<el-collapse-item title="财务信息历史记录" name="financeChangeLog" style='margin-top: 20px;'>
				<ChangeLog v-if="formData.id" ref="financeChangeLogRef" :equipId="formData.id" changeType="FINANCE" :readonly="readonly" :height='300' />
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup name="FinanceSupply">
import { ref, reactive, watch, onMounted, getCurrentInstance } from 'vue'
import Select from '@/components/Select'
import ChangeLog from './ChangeLog.vue'

const props = defineProps({
	formData: {
		type: Object,
		required: true,
		default: () => ({})
	},
	readonly: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:formData'])

const { proxy } = getCurrentInstance()
const ruleForm = ref(null)
const activeNames = ref(['supply', 'finance', 'supplyChangeLog', 'financeChangeLog'])

// 本地表单数据 - 直接使用 props.formData 的引用
const localFormData = props.formData

// 监听本地数据变化，同步到父组件
watch(() => props.formData, (newVal) => {
	emit('update:formData', newVal)
}, { deep: true })

// 验证规则
const rules = reactive({
	purchaseTime: proxy.getRules({ required: true }),
	usageTime: proxy.getRules({ required: true }),
	originalValue: proxy.getRules({ required: true }),
})

// 计算已折旧期限（根据设备购置时间和当前时间计算月份差）
const calculateDepreciatedPeriod = () => {
	if (!localFormData.purchaseTime) {
		localFormData.depreciatedPeriod = null
		calculateNetValue()
		return
	}

	const purchaseDate = new Date(localFormData.purchaseTime)
	const currentDate = new Date()

	const yearDiff = currentDate.getFullYear() - purchaseDate.getFullYear()
	const monthDiff = currentDate.getMonth() - purchaseDate.getMonth()

	const totalMonths = yearDiff * 12 + monthDiff

	let months = totalMonths
	if (currentDate.getDate() < purchaseDate.getDate()) {
		months = totalMonths - 1
	}

	localFormData.depreciatedPeriod = Math.max(1, months + 1)
	calculateNetValue()
}

// 计算资产净值（根据设备原值、折旧期限和已折旧期限计算）
const calculateNetValue = () => {
	if (!localFormData.originalValue || !localFormData.depreciationPeriod || !localFormData.depreciatedPeriod) {
		localFormData.netValue = null
		return
	}

	const originalValue = Number(localFormData.originalValue)
	const depreciationPeriod = Number(localFormData.depreciationPeriod)
	const depreciatedPeriod = Number(localFormData.depreciatedPeriod)

	if (depreciationPeriod <= 0) {
		localFormData.netValue = null
		return
	}

	// 资产净值计算：资产净值 = 设备原值 - (设备原值 / 折旧期限) * 已折旧期限
	// 使用 BigDecimal 精度计算以确保与后端一致
	const monthlyDepreciation = originalValue / depreciationPeriod
	const totalDepreciation = monthlyDepreciation * depreciatedPeriod
	const netValue = originalValue - totalDepreciation

	localFormData.netValue = Number(netValue.toFixed(2))
}

// 验证表单
const validate = async () => {
	if (!ruleForm.value) return true
	return new Promise((resolve) => {
		ruleForm.value.validate((valid) => {
			resolve(valid)
		})
	})
}

// 重置表单
const resetForm = () => {
	if (ruleForm.value) {
		ruleForm.value.resetFields()
	}
}

// 监听相关字段变化，自动计算资产净值
watch(() => [localFormData.originalValue, localFormData.depreciationPeriod, localFormData.depreciatedPeriod], () => {
	calculateNetValue()
}, { deep: true })

// 初始化
onMounted(() => {
	if (localFormData.purchaseTime) {
		calculateDepreciatedPeriod()
	}
	if (localFormData.originalValue && localFormData.depreciationPeriod && localFormData.depreciatedPeriod) {
		calculateNetValue()
	}
})

const supplyChangeLogRef = ref(null)
const financeChangeLogRef = ref(null)

// 加载变更记录
const loadChangeLog = () => {
	nextTick(() => {
		if (supplyChangeLogRef.value) {
			supplyChangeLogRef.value.loadData()
		}
		if (financeChangeLogRef.value) {
			financeChangeLogRef.value.loadData()
		}
	})
}

defineExpose({
	validate,
	resetForm,
	loadChangeLog
})
</script>

<style scoped lang="scss">
.finance-supply {
	padding: 0;

	:deep(.el-collapse) {
		width: 100%;
		border: none;
	}

	:deep(.el-collapse-item) {
		border: none !important;
		border-bottom: none !important;
	}

	:deep(.el-collapse-item:last-child) {
		border-bottom: none !important;
	}

	:deep(.el-collapse-item__content) {
		padding: 10px;
	}

	:deep(.el-collapse-item__header.is-active),
	:deep(.el-collapse-item__header) {
		border-bottom: 1px solid #ebeef5;
		background-color: #fafafa;
		padding: 10px;
		font-size: 13px;
	}

	.form-table-row {
		border: 1px solid #dcdfe6;
		border-bottom: none;

		&:last-child {
			border-bottom: 1px solid #dcdfe6;
		}
	}

	.form-table-col {
		border-right: 1px solid #dcdfe6;

		&:last-child {
			border-right: none;
		}
	}

	.form-table-item {
		margin-bottom: 0;
		padding: 12px;
		border-bottom: 1px solid #dcdfe6;

		&:last-child {
			border-bottom: none;
		}

		:deep(.el-form-item__label) {
			font-weight: 500;
			color: #606266;
			margin-bottom: 8px;
		}

		:deep(.el-form-item__content) {
			line-height: 32px;
		}
	}

}
</style>

