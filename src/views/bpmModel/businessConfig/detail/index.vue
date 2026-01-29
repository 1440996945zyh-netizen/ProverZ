<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" :inline="false" label-width="110px">
			<el-row :gutter="20">
				<!-- <el-col :span="24">
					<el-form-item label="业务ID" prop="businessId">
						<el-input v-model="formData.businessId" placeholder="请输入业务ID" :disabled="isViewMode" type="number" min="0" />
					</el-form-item>
				</el-col> -->

				<!-- <el-col :span="12">
					<el-form-item label="业务名称" prop="businessName">
						<el-input v-model="formData.businessName" placeholder="请输入业务名称" :disabled="isViewMode" />
					</el-form-item>
				</el-col> -->
				<el-col :span="24">
					<el-form-item label="业务名称" prop="businessId">
						<el-tree-select
							v-model="formData.businessId"
							:data="menuOptions"
							:props="{ value: 'menuId', label: 'menuName', children: 'children' }"
							value-key="businessId"
							placeholder="选择上级菜单"
							check-strictly
							style="width: 100%"
							@change="handleMenuChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="业务类型" prop="businessTypeCode">
						<Select
							:selectData="businessTypeOptions"
							v-model:value="formData.businessTypeCode"
							v-model:label="formData.businessTypeName"
						/>
					</el-form-item>
				</el-col>

				<!-- <el-col :span="12">
					<el-form-item label="业务类型编码" prop="businessTypeCode">
						<el-input v-model="formData.businessTypeCode" placeholder="请输入业务类型编码" :disabled="isViewMode" />
					</el-form-item>
				</el-col> -->

				<!-- <el-col :span="12">
					<el-form-item label="流程模型ID" prop="procModelId">
						<el-input v-model="formData.procModelId" placeholder="请输入流程模型ID" :disabled="isViewMode" />
					</el-form-item>
				</el-col> -->

				<el-col :span="24">
					<el-form-item label="流程模型名称" prop="procModelName">
						<Select :selectData="modelList" v-model:value="formData.procModelId" v-model:label="formData.procModelName" />
					</el-form-item>
				</el-col>

				<!-- <el-col :span="12">
					<el-form-item label="流程定义KEY" prop="procDefKey">
						<el-input v-model="formData.procDefKey" placeholder="请输入流程定义KEY" :disabled="isViewMode" />
					</el-form-item>
				</el-col> -->
				<el-col :span="24">
					<el-form-item label="状态" prop="status">
						<ElSwitch
							v-model="formData.status"
							:active-value="'1'"
							:inactive-value="'0'"
							active-text="启用"
							inactive-text="禁用"
							:disabled="isViewMode"
						/>
					</el-form-item>
				</el-col>

				<el-col :span="24">
					<el-form-item label="备注" prop="remark">
						<el-input
							v-model="formData.remark"
							type="textarea"
							placeholder="请输入备注"
							:disabled="isViewMode"
							:rows="3"
							maxlength="500"
						/>
					</el-form-item>
				</el-col>
			</el-row>

			<!-- 查看模式下显示更多信息 -->
			<el-row v-if="isViewMode && formData.id">
				<el-col :span="24">
					<el-divider content-position="left">其他信息</el-divider>
				</el-col>
				<el-col :span="24">
					<el-form-item label="创建人">
						<el-input :value="formData.createByName" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="创建时间">
						<el-input :value="formatDateTime(formData.createTime)" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="更新人">
						<el-input :value="formData.updateByName" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="更新时间">
						<el-input :value="formatDateTime(formData.updateTime)" disabled />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup name="bpmBusinessConfigDetail">
import { ref, reactive, getCurrentInstance } from 'vue'
import { getContentsMenu } from '@/api/system/menu'
import dayjs from 'dayjs'
import publicApi from '@/api/public'
import Select from '@/components/Select/index.vue'
const { proxy } = getCurrentInstance()
const ruleForm = ref()
const isViewMode = ref(false)

const formData = reactive({
	id: null,
	businessId: null,
	businessName: '',
	businessTypeCode: '',
	businessTypeName: '',
	procModelId: '',
	procModelName: '',
	procDefKey: '',
	remark: '',
	status: '1', // 默认启用
	createBy: null,
	createByName: '',
	createTime: null,
	updateBy: null,
	updateByName: '',
	updateTime: null,
})

// 上级菜单下拉树数据
const menuOptions = ref([])

const handleMenuChange = val => {
	console.log('handleMenuChange', val)
	// 递归查找菜单项
	const findMenu = (menus, id) => {
		for (const menu of menus) {
			if (menu.menuId == id) {
				return menu
			}
			if (menu.children && menu.children.length > 0) {
				const found = findMenu(menu.children, id)
				if (found) return found
			}
		}
		return null
	}

	// 查找选中的菜单项
	const selectedMenu = findMenu(menuOptions.value, val)
	if (selectedMenu) {
		// 将菜单名称赋值给 businessName

		formData.businessName = selectedMenu.menuName
		getBusinessTypeList()
	}
}

const getTreeselect = async () => {
	try {
		menuOptions.value = []
		const response = await getContentsMenu()
		const menu = { menuId: 0, menuName: '主类目', children: [] }
		menu.children = proxy.flattenToTree(response.data, 'menuId')
		menuOptions.value.push(menu)
	} catch (error) {
		console.error('获取菜单失败', error)
		proxy.$modal.msgError('获取菜单失败，请稍后重试')
	}
}

// 校验规则
const rules = reactive({
	businessId: [
		{ required: true, message: '请输入业务ID', trigger: 'blur' },
		{
			validator: (rule, value, callback) => {
				if (value && !/^\d+$/.test(value)) {
					callback(new Error('业务ID必须为数字'))
				} else if (value && Number(value) <= 0) {
					callback(new Error('业务ID必须大于0'))
				} else {
					callback()
				}
			},
			trigger: 'blur',
		},
	],
	businessName: proxy.getRules({
		required: true,
		length: '1-100',
		message: '请输入业务名称',
	}),
	businessTypeCode: proxy.getRules({
		required: true,
		length: '1-50',
		message: '请输入业务类型编码',
	}),
	businessTypeName: proxy.getRules({
		required: true,
		length: '1-300',
		message: '请输入业务类型名称',
	}),
	procModelId: proxy.getRules({
		required: true,
		length: '1-64',
		message: '请输入流程模型ID',
	}),
	procModelName: proxy.getRules({
		required: true,
		length: '1-255',
		message: '请输入流程模型名称',
	}),
	procDefKey: proxy.getRules({
		required: true,
		length: '1-255',
		message: '请输入流程定义KEY',
	}),
	status: proxy.getRules({
		required: true,
		message: '请选择状态',
	}),
	remark: proxy.getRules({
		length: '0-500',
		message: '备注不能超过500个字符',
	}),
})
// 格式化日期时间
const formatDateTime = dateTime => {
	if (!dateTime) return '-'
	return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

// 验证表单
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

// 重置表单
const resetForm = () => {
	isViewMode.value = false

	if (ruleForm.value) {
		ruleForm.value.resetFields()
	}
}

// 设置表单数据（用于编辑时回填）
const setFormData = data => {
	Object.keys(data).forEach(key => {
		if (data[key] !== undefined && data[key] !== null) {
			formData[key] = data[key]
		}
	})
}
const businessTypeOptions = ref([]) // 存储业务类型下拉选项
// 根据字典查询业务类型
const getBusinessTypeList = () => {
	publicApi
		.getLocalSelect({ type: 'DICT', dictType: 'BUSINESS_TYPE', remark: formData.businessName })
		.then(response => {
			businessTypeOptions.value = response.data.map(item => ({
				label: item.dictLabel,
				value: item.dictValue,
			}))
		})
		.catch(error => {
			console.error('获取业务类型列表失败', error)
		})
}
const handleBusinessTypeChange = value => {
	const selectedOption = businessTypeOptions.value.find(option => option.value === value)
	if (selectedOption) {
		formData.businessTypeName = selectedOption.label
	}
}
const modelList = ref([]) // 存储流程模型下拉选项
const initData = async () => {
	publicApi
		.getLocalSelect({
			type: 'BPM_MODEL',
		})
		.then(res => {
			if (res.code === '0000') {
				console.log(res.data, '11111111')
				modelList.value = res.data || []
			} else {
			}
		})
		.catch(err => {})
}

onMounted(() => {
	getTreeselect()
	initData()
})

defineExpose({
	validate,
	resetForm,
	formData,
	isViewMode,
	setFormData,
})
</script>

<style lang="scss" scoped>
.formData {
	padding: 20px;

	.el-row {
		margin-bottom: 15px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.el-divider {
		margin: 20px 0;
	}
}
</style>
