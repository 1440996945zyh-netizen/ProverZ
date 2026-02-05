<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-row :gutter="20">
<!--				<el-col :span="12">-->
<!--					<el-form-item label="物资代码" prop="materialCode" v-if="formData.id">-->
<!--						<el-input v-model="formData.materialCode" placeholder="物资代码由系统自动生成" disabled />-->
<!--					</el-form-item>-->
<!--				</el-col>-->
				<el-col :span="12">
					<el-form-item label="物资名称" prop="materialName">
						<el-input v-model="formData.materialName" placeholder="请输入物资名称" maxlength="200" />
					</el-form-item>
				</el-col>
        <el-col :span="12">
          <el-form-item label="计量单位" prop="unitCode">
            <el-select v-model="formData.unitCode" placeholder="请选择计量单位" clearable style="width: 100%" @change="handleUnitChange">
              <el-option
                v-for="item in unitOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="物资类别" prop="categoryId">
						<el-input v-model="categoryName" disabled placeholder="物资类别" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="采购类型" prop="purchaseTypeCode">
						<el-select v-model="formData.purchaseTypeCode" placeholder="请选择采购类型" clearable style="width: 100%">
							<el-option
								v-for="item in purchaseTypeOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="12">
					<el-form-item label="规格型号">
						<el-input v-model="formData.specificationModel" placeholder="请输入规格型号" maxlength="200" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="品牌">
						<el-input v-model="formData.brand" placeholder="请输入品牌" maxlength="100" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20">

				<el-col :span="12">
					<el-form-item label="助记码">
						<el-input v-model="formData.mnemonicCode" placeholder="请输入助记码" maxlength="50" />
					</el-form-item>
				</el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="formData.status">
              <el-radio label="0">启用</el-radio>
              <el-radio label="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
			</el-row>


			<el-row :gutter="20">
				<el-col :span="24">
					<el-form-item label="附件">
						<upload
							:fileTypeName="fileTypeName"
							businessType="MATERIAL_CODE_FILE"
							:businessId="formData.id ? String(formData.id) : ''"
							@changeFile="changeFile"
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup name="materialCodeDetail">
import { ref, reactive, watch, getCurrentInstance, onMounted, toRefs } from 'vue'
import categoryApi from '@/api/equipment/materialCategory/index'
import publicApi from '@/api/public/index'
import upload from '@/components/upload/index.vue'

const props = defineProps({
	categoryId: {
		type: [Number, String],
		default: null,
	},
})

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const data = reactive({
	formData: {
		id: null,
		categoryId: null,
		materialCode: '',
		materialName: '',
		purchaseTypeCode: '',
		purchaseTypeName: '',
		specificationModel: '',
		brand: '',
	unitCode: '',
	unitName: '',
	mnemonicCode: '',
	status: '0', // 默认启用
	fileIds: [], // 附件文件ID数组
},
	purchaseTypeOptions: [],
	unitOptions: [],
})
const { formData, purchaseTypeOptions, unitOptions } = toRefs(data)

// 文件类型限制
const fileTypeName = ref('.jpeg, .png, .doc, .docx, .pdf, .jpg, .xlsx, .xls')

const rules = reactive({
	// materialCode 由后端自动生成，不需要前端验证
	materialName: proxy.getRules({ required: true }),
	categoryId: proxy.getRules({ required: true }),
	purchaseTypeCode: proxy.getRules({ required: true }),
	unitCode: proxy.getRules({ required: true }),
})

// 类别名称
const categoryName = ref('请先选择类别')

// 监听类别ID变化
watch(
	() => props.categoryId,
	newVal => {
		if (newVal) {
			formData.value.categoryId = newVal
			// 查询类别名称
			categoryApi.getById(newVal).then(response => {
				if (response.code === '0000' && response.data) {
					categoryName.value = response.data.categoryName || '已选择类别'
				}
			}).catch(() => {
				categoryName.value = '已选择类别'
			})
		} else {
			categoryName.value = '请先选择类别'
		}
	},
	{ immediate: true }
)

// 处理计量单位变化
const handleUnitChange = (value) => {
	const selectedUnit = unitOptions.value.find(item => item.value === value)
	if (selectedUnit) {
		formData.value.unitName = selectedUnit.label
	} else {
		formData.value.unitName = ''
	}
}

// 加载采购类型选项
const loadPurchaseTypeOptions = () => {
	// 从字典接口获取
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'MAT_CODE' }).then(response => {
		if (response.code === '0000' && response.data) {
			purchaseTypeOptions.value = response.data.map(item => ({
				value: item.value,
				label: item.label,
			}))
		}
	})
}

// 加载计量单位选项
const loadUnitOptions = () => {
	// 这里可以从字典接口获取，暂时使用示例数据
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'UNIT' }).then(response => {
		if (response.code === '0000' && response.data) {
			unitOptions.value = response.data.map(item => ({
				value: item.value,
				label: item.label,
			}))
		}
	})
}

// 处理采购类型变化
watch(
	() => formData.value.purchaseTypeCode,
	newVal => {
		if (newVal) {
			const selectedType = purchaseTypeOptions.value.find(item => item.value === newVal)
			if (selectedType) {
				formData.value.purchaseTypeName = selectedType.label
			}
		} else {
			formData.value.purchaseTypeName = ''
		}
	}
)

const validate = async () => {
	return new Promise((resolve) => {
		ruleForm.value.validate((valid, fields) => {
			if (valid) {
				// 验证类别必须是三级分类
				if (formData.value.categoryId) {
					categoryApi.getById(formData.value.categoryId).then(response => {
						if (response.code === '0000' && response.data) {
							if (response.data.categoryLevel != 3) {
								proxy.$message.warning('物资代码只能选择三级分类')
								resolve(false)
							} else {
								resolve(true)
							}
						} else {
							proxy.$message.warning('请选择有效的物资类别')
							resolve(false)
						}
					}).catch(() => {
						proxy.$message.warning('请选择有效的物资类别')
						resolve(false)
					})
				} else {
					resolve(true)
				}
			} else {
				proxy.$message.warning('请完善表单信息！')
				resolve(false)
			}
		})
	})
}

// 文件上传回调
const changeFile = file => {
	formData.value.fileIds = file
}

const resetForm = () => {
	// 逐个属性重置，保持响应式
	formData.value.id = null
	formData.value.categoryId = props.categoryId || null
	formData.value.materialCode = ''
	formData.value.materialName = ''
	formData.value.purchaseTypeCode = ''
	formData.value.purchaseTypeName = ''
	formData.value.specificationModel = ''
	formData.value.brand = ''
	formData.value.unitCode = ''
	formData.value.unitName = ''
	formData.value.mnemonicCode = ''
	formData.value.status = '0' // 默认启用
	formData.value.fileIds = [] // 重置文件ID数组
	ruleForm.value?.clearValidate()
}

onMounted(() => {
	loadPurchaseTypeOptions()
	loadUnitOptions()
})

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>

