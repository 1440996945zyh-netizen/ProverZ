<!--
 * @Author: zhangsd
 * @Date: 2025-12-17 10:24:11
 * @LastEditTime: 2025-12-25 14:46:28
 * @LastEditors: zhangsd
 * @Description: 流程分类
 * @FilePath: \view\src\views\bpmModel\category\index.vue
-->
<!--
 * @Author: zhangsd
 * @Date: 2025-12-17 10:00:00
 * @LastEditTime: 2025-12-17 11:00:00
 * @LastEditors: zhangsd
 * @Description: BPM流程分类管理
 * @FilePath: \view\src\views\bpm\category\index.vue
-->
<template>
	<div class="app-container">
		<!-- 流程分类管理 -->
		<div class="container-context">
			<BaseTable
				ref="categoryTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="categoryTable"
				:loading="tableLoading"
				:showPagination="true"
				:showToolBar="false"
				:showNum="6"
				defaultWidth="55"
				:total="total"
			/>
		</div>

		<!-- 新增/编辑弹窗 -->
		<Dialog :title="dialogTitle" v-model:visible="dialogVisible">
			<div class="form-wrap">
				<el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
					<el-form-item label="分类名" prop="name">
						<el-input v-model="formData.name" placeholder="请输入分类名" />
					</el-form-item>
					<el-form-item label="分类标志" prop="code">
						<el-input v-model="formData.code" placeholder="请输入分类标志" />
					</el-form-item>
					<el-form-item label="分类描述" prop="description">
						<el-input v-model="formData.description" type="textarea" placeholder="请输入分类描述" />
					</el-form-item>
					<el-form-item label="分类状态" prop="status">
						<el-radio-group v-model="formData.status">
							<el-radio v-for="dict in CommonStatusEnumLabel" :key="dict.value" :value="dict.value">
								{{ dict.label }}
							</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="分类排序" prop="sort">
						<el-input-number v-model="formData.sort" placeholder="请输入分类排序" class="!w-full" :precision="0" />
					</el-form-item>
				</el-form>
			</div>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">取 消</el-button>
					<el-button type="primary" @click="submitForm" :disabled="formLoading">确 定</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
defineOptions({ name: 'BpmCategory' })
import { ref, reactive, onMounted, computed, getCurrentInstance, h } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
import { formatDate } from '@/utils/common/date'
import { CommonStatusEnum, CommonStatusEnumLabel } from '@/utils/bpm/constantEnumeration'
import { CategoryApi } from '@/api/system/bpm/category'

// 获取当前实例（用于$message/$confirm等）
const { proxy } = getCurrentInstance()
// 国际化&消息提示（兼容原有逻辑）
const message = proxy.$message

// 表格高度计算（参考示例）
const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value - 15)

// 表格基础配置
const categoryTableRef = ref(null)
const rowConfig = { keyField: 'id' } // 行唯一标识
const tableLoading = ref(false)
const total = ref(0)
const tableData = ref([])

// 搜索条件（适配BaseTable的searchHeader）
const selectData = reactive([
	{
		name: '分类名',
		type: 'input',
		modelValue: 'name',
		span: 5,
	},
	{
		name: '分类标志',
		type: 'input',
		modelValue: 'code',
		span: 5,
	},
	{
		name: '分类状态',
		type: 'select',
		modelValue: 'status',
		span: 5,
		selectData: [
			{ dictLabel: '开启', dictValue: '0' },
			{ dictLabel: '禁用', dictValue: '1' },
		],
		selectLabel: 'dictLabel', // 下拉选项的文本字段
		selectValue: 'dictValue', // 下拉选项的value字段
	},

	{
		type: 'daterange', // 搜索框类型
		modelValue: 'createTime', // 绑定字段
		span: 6, // 占位，共24
		name: '创建时间',
		shortcuts: [],
	},
])

// 表格列配置
const tableColumns = ref([
	{
		prop: 'id',
		label: '分类编号',
		align: 'center',
	},
	{
		prop: 'name',
		label: '分类名',
		align: 'center',
	},
	{
		prop: 'code',
		label: '分类标志',
		align: 'center',
	},
	{
		prop: 'description',
		label: '分类描述',
		align: 'center',
	},
	{
		prop: 'status',
		label: '分类状态',
		align: 'center',
		render: row => {
			const statusItem = CommonStatusEnumLabel.find(item => item.value == row.status)
			return h(
				ElTag,
				{
					type: statusItem?.type || 'info',
				},
				{
					default: () => statusItem?.label || '未知状态',
				}
			)
		},
	},
	{
		prop: 'sort',
		label: '分类排序',
		align: 'center',
	},
	{
		prop: 'createTime',
		label: '创建时间',
		align: 'center',
		width: 180,
		formatter: (row, column, cellValue) => {
			return formatDate(row.row.createTime)
		},
	},
	{
		prop: '',
		label: '操作',
		width: 200,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => edit(row),
						type: 'primary',
						link: true,
						icon: 'Edit',
					},
					{ default: () => '编辑' }
				),
				h(
					ElButton,
					{
						onClick: () => handleDelete(row.id),
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{ default: () => '删除' }
				),
			]
		},
	},
])

// 操作按钮列表
const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add(),
		permission: 'bpm:category:insert', // 权限控制
	},
])

// 弹窗配置
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const formLoading = ref(false)
const formType = ref('')
const formRef = ref(null)

// 表单数据&校验规则
const formData = ref({
	id: undefined,
	name: undefined,
	code: undefined,
	description: undefined,
	status: CommonStatusEnum.ENABLE,
	sort: undefined,
})

const formRules = reactive({
	name: [{ required: true, message: '分类名不能为空', trigger: 'blur' }],
	code: [{ required: true, message: '分类标志不能为空', trigger: 'blur' }],
	status: [{ required: true, message: '分类状态不能为空', trigger: 'blur' }],
	sort: [{ required: true, message: '分类排序不能为空', trigger: 'blur' }],
})

// 新增操作
const add = () => {
	formType.value = 'create'
	dialogTitle.value = '新增'
	resetForm()
	dialogVisible.value = true
}

// 编辑操作
const edit = row => {
	formType.value = 'update'
	dialogTitle.value = '编辑'
	resetForm()
	dialogVisible.value = true

	// 加载编辑数据
	formLoading.value = true
	CategoryApi.getCategoryDetail(row.id)
		.then(res => {
			formData.value = res.data || {}
		})
		.finally(() => {
			formLoading.value = false
		})
}

// 删除操作
const handleDelete = id => {
	proxy
		.$confirm('确认删除该分类吗？', '警告', {
			confirmButtonText: '确认',
			cancelButtonText: '取消',
			type: 'warning',
		})
		.then(() => {
			CategoryApi.deleteCategory(id).then(() => {
				message.success('删除成功')
				getList()
			})
		})
		.catch(() => {
			// 取消删除不做处理
		})
}

// 表单提交
const submitForm = () => {
	formRef.value.validate().then(() => {
		formLoading.value = true
		let promise = null
		if (formType.value === 'create') {
			promise = CategoryApi.createCategory(formData.value)
		} else {
			promise = CategoryApi.updateCategory(formData.value)
		}

		promise
			.then(() => {
				message.success(formType.value === 'create' ? '新增成功' : '更新成功')
				dialogVisible.value = false
				getList() // 刷新列表
			})
			.finally(() => {
				formLoading.value = false
			})
	})
}

// 重置表单
const resetForm = () => {
	formData.value = {
		id: undefined,
		name: undefined,
		code: undefined,
		description: undefined,
		status: CommonStatusEnum.ENABLE,
		sort: undefined,
	}
	if (formRef.value) {
		formRef.value.resetFields()
	}
}

// 获取列表数据
const getList = (params = {}) => {
	tableLoading.value = true
	// 构造查询参数（兼容BaseTable的搜索参数）
	const queryParams = {
		...params,
	}

	tableLoading.value = false
	CategoryApi.getCategoryPage(queryParams)
		.then(res => {
			tableData.value = res.data.pages || []
			total.value = res.data.totalNum
		})
		.finally(() => {
			tableLoading.value = false
		})
}

// 初始化加载列表
onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>
.app-container {
	height: 100%;
	padding: 10px;
}

.container-context {
	height: calc(100% - 20px);
}

.form-wrap {
	padding: 10px 0;
}

.dialog-footer {
	text-align: right;
}
</style>