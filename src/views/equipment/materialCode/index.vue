<template>
	<div class="app-container">
		<el-row :gutter="20">
			<!-- 左侧：物资类别树 -->
			<el-col :span="5" style="padding-right: 0px !important">
				<div class="head-container">
					<el-input
						v-model="categoryName"
						placeholder="请输入类别名称"
						clearable
						prefix-icon="Search"
						style="margin-bottom: 20px"
					/>
				</div>
				<div class="head" :style="{ height: heightDiv + 'px' }">
					<el-tree
						ref="categoryTreeRef"
						:data="categoryTreeData"
						:props="{ children: 'children', label: 'categoryName' }"
						node-key="id"
						:default-expand-all="false"
						:default-expanded-keys="[0]"
						:highlight-current="true"
						:filter-node-method="filterNode"
						@node-click="handleCategoryClick"
					/>
				</div>
			</el-col>

			<!-- 右侧：物资代码列表 -->
			<el-col :span="19" style="padding-left: 0px !important">
				<BaseTable
					ref="materialCodeTableRef"
					:showSearchHeader="true"
					:selectData="selectData"
					:searchClick="getList"
					:buttonList="buttonList"
					:tableData="tableData"
					:tableColumns="tableColumns"
					:cellClickEvent="cellClickEvent"
					:loading="tableLoading"
					:total="pagination.total"
				/>
			</el-col>
		</el-row>

		<!-- 新增/编辑弹窗 -->
		<Dialog v-model:visible="open" :title="title" width="50%">
			<detail ref="detailRef" :category-id="selectedCategoryId" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm" v-hasPermi="['equipment:materialCode:add', 'equipment:materialCode:update']">
						确定
					</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="materialCode">
import { ref, reactive, getCurrentInstance, onMounted, nextTick, watch, h } from 'vue'
import { ElButton, ElTag, ElTree } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/materialCode/index'
import categoryApi from '@/api/equipment/materialCategory/index'

const { proxy } = getCurrentInstance()

const heightDiv = ref(window.innerHeight - 150)
const materialCodeTableRef = ref(null)
const categoryTreeRef = ref(null)
const categoryTreeData = ref([])
const tableData = ref([])
const tableLoading = ref(false)
const open = ref(false)
const title = ref('')
const detailRef = ref(null)
const selectedCategoryId = ref(null)
const selectedCategoryName = ref('')
const categoryName = ref('')

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
	categoryId: null,
	materialCode: undefined,
	materialName: undefined,
})

const pagination = ref({
	total: 0,
})

/* 搜索框数据 */
const selectData = reactive([
	{
		name: '物资代码',
		type: 'input',
		modelValue: 'materialCode',
		span: 12,
	},
	{
		name: '物资名',
		type: 'input',
		modelValue: 'materialName',
		span: 12,
	},
])

/* 右侧按钮 */
const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd(),
		permission: 'equipment:materialCode:add',
	},
	{
		label: '导出',
		type: 'primary',
		icon: 'Download',
		click: () => {
			proxy.$modal.msgInfo('导出功能待实现')
		},
	},
])

/* 表格数据列 */
const tableColumns = ref([
	{ label: '物资代码', prop: 'materialCode', align: 'left', },
	{ label: '物资名', prop: 'materialName', align: 'left', },
	{ label: '物资类别', prop: 'categoryPath', align: 'left', width: 250 },
	{ label: '规格型号', prop: 'specificationModel', align: 'left', width: 150 },
	{ label: '品牌', prop: 'brand', align: 'left', width: 120 },
	{ label: '计量单位', prop: 'unitName', align: 'center', width: 100 },
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		width: 100,
		render: row => {
			const isEnabled = row.status == '0'
			return [
				h(
					ElTag,
					{
						type: isEnabled ? 'success' : 'info',
						size: 'default',
					},
					{
						default: () => {
							return isEnabled ? '启用' : '停用'
						},
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 150,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleUpdate(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'equipment:materialCode:update',
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'equipment:materialCode:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	// 可以在这里处理行点击事件
}

/**
 * 通过条件过滤节点
 */
const filterNode = (value, data) => {
	if (!value) return true
	return data.categoryName.indexOf(value) !== -1
}

/**
 * 根据名称筛选类别树
 */
watch(categoryName, val => {
	proxy.$refs['categoryTreeRef'].filter(val)
})

/**
 * 加载物资类别树
 */
const loadCategoryTree = () => {
	categoryApi.getTree().then(response => {
		const treeList = response.data || []
		// 添加虚拟根节点"物资类别"
		categoryTreeData.value = [
			{
				id: 0, // 使用0作为虚拟根节点的ID
				categoryName: '物资类别',
				categoryLevel: null, // 虚拟根节点没有级别
				children: treeList,
			},
		]
		// 默认选中虚拟根节点，查询全部物资代码
		nextTick(() => {
			selectedCategoryId.value = null
			selectedCategoryName.value = '全部'
			queryParams.value.categoryId = null
			// 默认展开并选中虚拟根节点
			if (categoryTreeRef.value) {
				categoryTreeRef.value.setCurrentKey(0)
			}
		})
	})
}

/**
 * 处理类别点击
 */
const handleCategoryClick = (data) => {
	// 如果是虚拟根节点"物资类别"，查询全部物资代码
	if (data.id === 0 && data.categoryName === '物资类别') {
		selectedCategoryId.value = null
		selectedCategoryName.value = '全部'
		queryParams.value.categoryId = null
		handleQuery()
		return
	}
	// 点击任何类别都可以查询，不做级别限制
	selectedCategoryId.value = data.id
	selectedCategoryName.value = data.categoryName
	queryParams.value.categoryId = data.id
	handleQuery()
}

/**
 * 查询列表
 */
const getList = (params) => {
	tableLoading.value = true
	const searchParams = Object.assign({}, queryParams.value, params || {})
	api.getList(searchParams)
		.then(response => {
			if (response.code === '0000' && response.data) {
				tableData.value = response.data.pages || []
				pagination.value.total = response.data.totalNum || 0
			} else {
				tableData.value = []
				pagination.value.total = 0
			}
		})
		.finally(() => {
			tableLoading.value = false
		})
}

/**
 * 查询按钮
 */
const handleQuery = () => {
	queryParams.value.startPage = 1
	getList(queryParams.value)
}

/**
 * 新增
 */
const handleAdd = () => {
	if (!selectedCategoryId.value) {
		proxy.$modal.msgWarning('请先选择三级分类的物资类别')
		return
	}
	// 验证选中的类别是否为三级分类
	const selectedCategory = findCategoryById(categoryTreeData.value, selectedCategoryId.value)
	if (!selectedCategory || selectedCategory.categoryLevel != 3) {
		proxy.$modal.msgWarning('物资代码只能选择三级分类，请选择三级分类')
		return
	}
	open.value = true
	title.value = '新增物资代码'
	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formData.categoryId = selectedCategoryId.value
		detailRef.value.selectedCategoryName = selectedCategoryName.value
	})
}

/**
 * 递归查找类别
 */
const findCategoryById = (tree, id) => {
	for (const node of tree) {
		// 跳过虚拟根节点
		if (node.id === 0 && node.categoryName === '物资类别') {
			if (node.children && node.children.length > 0) {
				const found = findCategoryById(node.children, id)
				if (found) {
					return found
				}
			}
			continue
		}
		if (node.id === id) {
			return node
		}
		if (node.children && node.children.length > 0) {
			const found = findCategoryById(node.children, id)
			if (found) {
				return found
			}
		}
	}
	return null
}

/**
 * 编辑
 */
const handleUpdate = (row) => {
	open.value = true
	title.value = '编辑物资代码'
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			if (response.code === '0000' && response.data) {
				const resData = response.data
				Object.keys(resData).forEach(key => {
					if (detailRef.value.formData.hasOwnProperty(key)) {
						detailRef.value.formData[key] = resData[key]
					}
				})
				selectedCategoryId.value = response.data.categoryId
				selectedCategoryName.value = response.data.categoryName
			}
		})
	})
}

/**
 * 删除
 */
const handleDelete = (row) => {
	proxy.$modal
		.confirm('确定删除该物资代码？')
		.then(() => {
			return api.delete(row.id)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

/**
 * 提交表单
 */
const submitForm = async () => {
	if (await detailRef.value.validate()) {
		const params = detailRef.value.formData
		if (params.id) {
			api.update(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList()
			})
		} else {
			api.add(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList()
			})
		}
	}
}

/**
 * 取消
 */
const cancel = () => {
	open.value = false
}

onMounted(() => {
	loadCategoryTree()
	getList(queryParams.value)
})
</script>

<style lang="less" scoped>
.head-container {
	padding: 5px;
}
.head {
	overflow-y: auto;
}
</style>

