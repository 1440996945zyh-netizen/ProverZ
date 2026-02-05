<template>
	<el-form :model="form" ref="ruleForm" :rules="rules" :inline="true" label-position="top">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="基本信息" name="baseData">
				<el-row :gutter="24">
					<el-col :span="6">
						<el-form-item label="盘点主题" prop="checkTitle">
							<el-input v-model="form.checkTitle" placeholder="请输入盘点主题" :disabled="formDisabled" maxlength="200" />
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
								@change="handleWarehouseChange"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="盘点类型" prop="checkType">
							<el-select v-model="form.checkType" placeholder="请选择盘点类型" :disabled="formDisabled || !!form.id" style="width: 100%">
								<el-option label="全量盘点" :value="1" />
								<el-option label="部分盘点" :value="2" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="盘点开始日期" prop="checkStartDate">
							<el-date-picker
								v-model="form.checkStartDate"
								type="date"
								placeholder="请选择盘点开始日期"
								:disabled="formDisabled"
								style="width: 100%"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="盘点结束日期" prop="checkEndDate">
							<el-date-picker
								v-model="form.checkEndDate"
								type="date"
								placeholder="请选择盘点结束日期"
								:disabled="formDisabled"
								style="width: 100%"
								value-format="YYYY-MM-DD"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6" v-if="form.checkType === 2">
						<el-form-item label="选择物资" prop="materialIds" :required="form.checkType === 2">
							<el-select
								v-model="form.materialIds"
								multiple
								filterable
								placeholder="请选择物资（可多选）"
								style="width: 100%"
								:disabled="formDisabled"
							>
								<el-option
									v-for="item in materialList"
									:key="item.id"
									:label="item.materialName"
									:value="item.id"
								>
									<span>{{ item.materialName }}</span>
									<span v-if="item.specificationModel" style="color: #8492a6; font-size: 13px; margin-left: 10px">
										{{ item.specificationModel }}
									</span>
								</el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="备注" prop="remark">
							<el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" :disabled="formDisabled" maxlength="500" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="materialStockCheckDetail">
import { ref, reactive, nextTick, getCurrentInstance, watch, onMounted } from 'vue'
import Select from '@/components/Select/index.vue'
import materialWarehouseApi from '@/api/equipment/materialWarehouse/index'
import materialStockApi from '@/api/equipment/materialStock/index'
import materialStockCheckApi from '@/api/equipment/materialStockCheck/index'
const { proxy } = getCurrentInstance()
const ruleForm = ref()
const formDisabled = ref(false)
const activeNames = ref(['baseData'])

// 表单数据
const formData = reactive({
	form: {
		id: null,
		checkNo: '',
		checkTitle: '',
		warehouseId: null,
		warehouseName: '',
		checkType: 1, // 默认全量盘点
		checkStartDate: null,
		checkEndDate: null,
		materialIds: [], // 部分盘点时的物资ID列表
		remark: '',
	},
})

const { form } = formData

// 仓库列表
const warehouseList = ref([])

// 物资列表（用于部分盘点选择）
const materialList = ref([])

// 表单验证规则
const rules = reactive({
	checkTitle: proxy.getRules({ required: true }),
	warehouseId: proxy.getRules({ required: true }),
	checkType: proxy.getRules({ required: true }),
	checkStartDate: proxy.getRules({ required: true }),
	checkEndDate: proxy.getRules({ required: true }),
	materialIds: [
		{
			validator: (rule, value, callback) => {
				if (form.checkType === 2) {
					if (!value || value.length === 0) {
						callback(new Error('部分盘点时，必须选择至少一个物资'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['change', 'blur'],
			required: true,
		},
	],
})

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

// 加载物资列表（根据仓库，查询有库存的物资）
const loadMaterialList = () => {
	if (!form.warehouseId) {
		materialList.value = []
		return
	}
	// 查询该仓库下有库存的物资
	materialStockApi.getList({
		startPage: 1,
		pageSize: 10000,
		warehouseId: form.warehouseId,
	}).then(res => {
		if (res.code === '0000' && res.data && res.data.pages) {
			// 去重，同一个物资只保留一条
			const materialMap = new Map()
			res.data.pages.forEach(item => {
				if (item.materialId && !materialMap.has(item.materialId)) {
					materialMap.set(item.materialId, {
						id: item.materialId,
						materialName: item.materialName,
						specificationModel: item.specificationModel,
					})
				}
			})
			materialList.value = Array.from(materialMap.values())
		}
	}).catch(() => {
		materialList.value = []
	})
}

// 仓库变化事件
const handleWarehouseChange = () => {
	if (formDisabled.value || form.id) {
		return
	}
	// 清空物资选择
	form.materialIds = []
	// 加载物资列表
	if (form.checkType === 2) {
		loadMaterialList()
	}
}

// 监听盘点类型变化
watch(() => form.checkType, (newType) => {
	if (formDisabled.value || form.id) {
		return
	}
	form.materialIds = []
	if (newType === 2 && form.warehouseId) {
		loadMaterialList()
	}
})

// 重置表单
const resetForm = () => {
	form.id = null
	form.checkNo = ''
	form.checkTitle = ''
	form.warehouseId = null
	form.warehouseName = ''
	form.checkType = 1
	form.checkStartDate = null
	form.checkEndDate = null
	form.materialIds = []
	form.remark = ''
	materialList.value = []
	if (ruleForm.value) {
		ruleForm.value.clearValidate()
	}
}

// 表单验证
const validate = () => {
	return new Promise((resolve, reject) => {
		if (!ruleForm.value) {
			reject(new Error('表单未初始化'))
			return
		}
		ruleForm.value.validate((valid) => {
			if (valid) {
				resolve(true)
			} else {
				reject(new Error('表单验证失败'))
			}
		})
	})
}

// 初始化
const init = (isNew) => {
	if (isNew) {
		// 自动生成盘点主题：盘点单 + 日期
		const now = new Date()
		const year = now.getFullYear()
		const month = String(now.getMonth() + 1).padStart(2, '0')
		const day = String(now.getDate()).padStart(2, '0')
		form.checkTitle = `盘点单${year}${month}${day}`
		// 设置默认日期为今天
		form.checkStartDate = `${year}-${month}-${day}`
		form.checkEndDate = `${year}-${month}-${day}`
		form.checkType = 1 // 默认全量盘点
	}
}

// 暴露方法
defineExpose({
	resetForm,
	validate,
	init,
	formData,
	loadMaterialList,
})

onMounted(() => {
	loadWarehouseList()
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
