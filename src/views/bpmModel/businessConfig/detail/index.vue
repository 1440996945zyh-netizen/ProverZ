<!--
 * @Author: zhangsd
 * @Date: 2026-02-02 16:11:56
 * @LastEditTime: 2026-02-02 19:54:09
 * @LastEditors: zhangsd
 * @Description: 新增业务关联
 * @FilePath: \view\src\views\bpmModel\businessConfig\detail\index.vue
-->


<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" label-width="110px">
			<el-row :gutter="20">
				<!--  业务模块（菜单树，必选） -->
				<el-col :span="24">
					<el-form-item label="业务模块" prop="businessId">
						<el-tree-select
							v-model="formData.businessId"
							:data="menuOptions"
							:props="treeSelectProps"
							placeholder="请选择业务模块（菜单）"
							check-strictly
							style="width: 100%"
							@change="handleMenuChange"
						/>
					</el-form-item>
				</el-col>

				<!-- 模块按钮（下拉，根据模块级联加载，必选） -->
				<el-col :span="24">
					<el-form-item label="关联按钮" prop="businessTypeCode">
						<Select
							:selectData="btnOptions"
							v-model:value="formData.businessTypeCode"
							v-model:label="formData.businessTypeName"
							placeholder="请先选择业务模块"
							:disabled="!formData.businessId"
						/>
					</el-form-item>
				</el-col>
				<!--  关联流程模型（下拉，必选） -->
				<el-col :span="24">
					<el-form-item label="关联流程模型" prop="procModelId">
						<Select
							:selectData="modelList"
							v-model:value="formData.procModelId"
							v-model:label="formData.procModelName"
							placeholder="请选择流程模型"
						/>
					</el-form-item>
				</el-col>

				<!--  状态（开关，默认启用） -->
				<el-col :span="24">
					<el-form-item label="状态" prop="status">
						<el-switch
							v-model="formData.status"
							:active-value="'1'"
							:inactive-value="'0'"
							active-text="启用"
							inactive-text="禁用"
							:disabled="isViewMode"
						/>
					</el-form-item>
				</el-col>

				<!-- 备注（选填） -->
				<el-col :span="24">
					<el-form-item label="备注" prop="remark">
						<el-input
							v-model="formData.remark"
							type="textarea"
							placeholder="请输入备注（选填）"
							:disabled="isViewMode"
							:rows="3"
							maxlength="200"
							show-word-limit
						/>
					</el-form-item>
				</el-col>
			</el-row>

			<!-- 查看模式下显示更多信息 -->
			<el-row v-if="isViewMode && formData.id">
				<el-col :span="24">
					<el-divider content-position="left">配置详情</el-divider>
				</el-col>
				<el-col :span="12">
					<el-form-item label="创建人">
						<el-input :value="formData.createByName || '-'" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="创建时间">
						<el-input :value="formatDate(formData.createTime)" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="更新人">
						<el-input :value="formData.updateByName || '-'" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="更新时间">
						<el-input :value="formatDate(formData.updateTime)" disabled />
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup name="bpmBusinessConfigDetail">
import { ref, reactive, getCurrentInstance, onMounted, nextTick } from 'vue'
import { getContentsMenu, getListByParentId } from '@/api/system/menu'
import dayjs from 'dayjs'
import publicApi from '@/api/public'
import api from '@/api/system/bpm/businessConfig/index.js'
import Select from '@/components/Select/index.vue'
import { formatDate } from '@/utils/common/date'
const { proxy } = getCurrentInstance()
const ruleForm = ref(null)
const isViewMode = ref(false)

// 表单核心数据
const formData = reactive({
	id: null,
	// 业务模块
	businessId: null,
	businessName: '',
	// 业务类型
	businessTypeCode: '',
	businessTypeName: '',
	// 流程模型
	procModelId: '',
	procModelName: '',
	procDefId: '',
	procDefKey: '',
	// 基础信息
	status: '1', // 默认启用
	remark: '',
	// 审计字段
	createBy: null,
	createByName: '',
	createTime: null,
	updateBy: null,
	updateByName: '',
	updateTime: null,
})

// 菜单树配置
const treeSelectProps = ref({
	value: 'menuId',
	label: 'menuName',
	children: 'children',
})

// 下拉选项数据源
const menuOptions = ref([]) // 业务模块（菜单树）
const btnOptions = ref([]) // 关联按钮（级联加载）
const modelList = ref([]) // 流程模型列表

/**
 * 菜单树选择变化 - 一级级联：加载对应模块的按钮
 * @param menuId
 */
const handleMenuChange = async menuId => {
	if (!menuId) {
		// 清空后续级联数据
		btnOptions.value = []

		formData.businessName = ''
		formData.businessTypeCode = ''
		formData.businessTypeName = ''
		return
	}
	// 递归查找选中的菜单名称
	const findMenuName = (menus, id) => {
		for (const menu of menus) {
			if (menu.menuId == id) return menu.menuName
			if (menu.children && menu.children.length) {
				const res = findMenuName(menu.children, id)
				if (res) return res
			}
		}
		return ''
	}
	formData.businessName = findMenuName(menuOptions.value, menuId)
	// 加载模块对应的按钮列表（对接后端接口，传menuId）
	try {
		const res = await getListByParentId(menuId)
		if (res.code === '0000' && res.data) {
			const filterBtnList = res.data
				.filter(item => item.menuType === 'F' && item.status == '0')
				.map(item => ({
					value: item.menuId,
					label: item.menuName,
				}))
			btnOptions.value = filterBtnList

			if (filterBtnList.length === 0) {
				proxy.$message.info('该业务模块下暂无可用的启用按钮')
			}
		} else {
			btnOptions.value = []
		}
	} catch (error) {
		console.error('加载模块按钮失败：', error)
		proxy.$modal.msgError('加载模块按钮失败，请稍后重试')
		btnOptions.value = []
	}
}

/**
 * 表单校验规则
 */
const rules = reactive({
	// 业务模块
	businessId: [{ required: true, message: '请选择业务模块', trigger: 'change' }],
	// 业务类型
	businessTypeCode: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
	// 流程模型
	procModelId: [{ required: true, message: '请选择关联的流程模型', trigger: 'change' }],
	// 状态
	status: [{ required: true, message: '请选择配置状态', trigger: 'change' }],
	// 备注
	remark: [{ max: 200, message: '备注不能超过200个字符', trigger: 'blur' }],
})
/**
 * 表单校验
 */
const validate = async () => {
	try {
		await ruleForm.value.validate()
		return true
	} catch (error) {
		proxy.$message.warning('请完善必填项信息！')
		return false
	}
}

/**
 * 重置表单
 */
const resetForm = () => {
	isViewMode.value = false
	formData.id = null
	// 重置基础数据：区分字符串和null，避免类型错误
	Object.keys(formData).forEach(key => {
		if (['status'].includes(key)) return
		formData[key] = ['businessName', 'businessBtnName', 'businessTypeName', 'procModelName', 'remark'].includes(key) ? '' : null
	})
	formData.status = '1'
	// 重置下拉选项
	btnOptions.value = []
	// 重置表单校验
	if (ruleForm.value) {
		ruleForm.value.resetFields()
	}
}

/**
 * 设置表单数据
 * @param data
 */
const setFormData = data => {
	// 回填级联数据：根据选中的模块，重新加载按钮（保证下拉选项匹配）
	if (data) {
		api.getDetail(data.id)
			.then(res => {
				if (res && res.data) {
					let responseData = res.data || {}
					nextTick(() => {
						handleMenuChange(responseData.businessId)
						Object.keys(responseData).forEach(key => {
							if (responseData[key] !== undefined && responseData[key] !== null) {
								formData[key] = responseData[key]
							}
						})
						console.log('formData', formData)
					})
				}
			})
			.catch(error => {
				console.error('获取详情失败:', error)
				proxy.$modal.msgError('获取详情失败')
			})
	}
}

/**
 * 加载菜单树
 */
const getTreeselect = async () => {
	try {
		const response = await getContentsMenu()
		const menu = { menuId: 0, menuName: '业务模块根节点', children: [] }
		menu.children = proxy.flattenToTree(response.data, 'menuId')
		menuOptions.value = [menu]
	} catch (error) {
		console.error('获取业务模块失败：', error)
		proxy.$modal.msgError('获取业务模块失败，请稍后重试')
	}
}

/**
 * 初始化加载流程模型列表
 */
const initModelList = async () => {
	try {
		const res = await publicApi.getLocalSelect({ type: 'BPM_MODEL' })
		if (res.code === '0000') {
			modelList.value = res.data || []
		}
	} catch (err) {
		console.error('加载流程模型失败：', err)
	}
}

// 初始化加载
onMounted(() => {
	getTreeselect()
	initModelList()
})

// 暴露方法给父组件
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
		margin-bottom: 18px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.el-divider {
		margin: 20px 0;
	}

	:deep(.el-tree-select) {
		width: 100%;
	}
}
</style>