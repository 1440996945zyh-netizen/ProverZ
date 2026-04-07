<template>
	<div class="app-container">
		<!-- 主列表物资类别显示 -->
		<div class="container-content">
			<BaseTable
				ref="materialCategoryTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableData="materialCategoryList"
				:tableColumns="tableColumns"
				:treeConfig="treeConfig"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="materialCategoryLazyTable"
				:cellClickEvent="cellClickEvent"
				:loading="tableLoading"
				:showPagination="false"
				:showToolBar="false"
			/>
		</div>
		<!-- 新增弹窗/编辑弹窗 -->
		<Dialog v-model:visible="open" :title="title" width="30%">
			<detail ref="detailRef" :parent-data="parentData" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm" v-hasPermi="['equipment:materialCategory:add', 'equipment:materialCategory:update']">
						确定
					</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="materialCategory">
import { ref, reactive, computed, nextTick, getCurrentInstance, onMounted, toRefs, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/materialCategory/index'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance()

const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value) //表格高度
const materialCategoryTableRef = ref(null) // BaseTable实例ref
const materialCategoryList = ref([]) // 物资类别树形数据
const open = ref(false) // 弹窗显示状态
const title = ref('') // 弹窗标题
const parentData = ref(null) // 父级数据
const detailRef = ref(null) // 详情组件ref
const rowConfig = { keyField: 'id', treeNode: true }

const data = reactive({
	queryParams: {
		categoryName: undefined,
	},
})
const { queryParams } = toRefs(data)

// 获取级别名称
const getLevelName = level => {
	const levelMap = {
		1: '一级类别',
		2: '二级类别',
		3: '三级类别',
	}
	return levelMap[level] || ''
}

/* 表格数据列 */
const tableColumns = ref([
	// 列1：类别名称（树形节点列）
	{
		prop: 'categoryName',
		label: '类别名称',
		align: 'left',
		showOverFlow: true,
		treeNode: true, // 标记为树形节点列（关键配置）
	},
	// 列2：类别编码
	{
		prop: 'categoryCode',
		label: '类别编码',
		align: 'left',
		width: 150,
	},
	// 列3：分类级别
	{
		prop: 'categoryLevel',
		label: '分类级别',
		align: 'center',
		width: 120,
		render: row => {
			let type = ''
			let label = getLevelName(row.categoryLevel)
			if (row.categoryLevel === 1) {
				type = 'primary'
			} else if (row.categoryLevel === 2) {
				type = 'warning'
			} else if (row.categoryLevel === 3) {
				type = 'success'
			}
			return [
				h(
					ElTag,
					{
						type: type,
						size: 'default',
					},
					{
						default: () => {
							return label
						},
					}
				),
			]
		},
	},
	// 列4：是否纳入劳保管理
	// {
	// 	prop: 'isLaborProtection',
	// 	label: '是否纳入劳保管理',
	// 	align: 'center',
	// 	width: 170,
	// 	render: row => {
	// 		const isLabor = row.isLaborProtection === 1
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					type: isLabor ? 'success' : 'info',
	// 					size: 'default',
	// 				},
	// 				{
	// 					default: () => {
	// 						return isLabor ? '是' : '否'
	// 					},
	// 				}
	// 			),
	// 		]
	// 	},
	// },
	// 列5：排序
	{
		prop: 'sortOrder',
		label: '排序',
		align: 'center',
		width: 100,
	},
	// 列6：创建时间
	{
		prop: 'createTime',
		label: '创建时间',
		align: 'center',
		width: 180,
	},
	// 列7：操作列（编辑/新增子级/删除）
	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 220,
		fixed: 'right',
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
						permission: 'equipment:materialCategory:update',
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleAdd(row)
						},
						type: 'primary',
						link: true,
						icon: 'Plus',
						permission: 'equipment:materialCategory:add',
					},
					{
						default: () => '新增',
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
						permission: 'equipment:materialCategory:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

/* 树形表格配置 - 懒加载 */
const treeConfig = reactive({
	children: 'children',
	hasChild: 'hasChildren',
	lazy: true,
	loadMethod: async ({ row }) => {
		tableLoading.value = true
		try {
			const res = await api.getByParentId(row.id)
			return res.data.map(item => ({
				...item,
				hasChildren: item.categoryLevel < 3, // 三级类别不能再有子级
			}))
		} finally {
			tableLoading.value = false
		}
	},
})

/* 表格加载 */
const tableLoading = ref(false)

/* 查询条件 */
const selectData = reactive([
	{
		name: '类别名称',
		type: 'input',
		modelValue: 'categoryName',
		span: 24,
	},
])

/* 右侧按钮 */
const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd(),
		permission: 'equipment:materialCategory:add',
	},
])

/**
 * 查询主列表数据
 */
const getList = params => {
	tableLoading.value = true
	// 从 params 中获取查询条件，如果没有则使用 queryParams
	const searchParams = params || queryParams.value
	api.getTree(searchParams)
		.then(response => {
			materialCategoryList.value = response.data.map(item => ({
				...item,
				hasChildren: item.categoryLevel < 3, // 三级类别不能再有子级
			}))
		})
		.finally(() => {
			tableLoading.value = false
		})
}

/**
 * @description 取消关闭弹窗按钮
 */
const cancel = () => {
	open.value = false
	reset()
}

/**
 * @description 重置表单
 */
const reset = () => {
	parentData.value = null
}

/** 新增物资类别 */
const handleAdd = async row => {
	reset()
	open.value = true
	if (row != null && row.id) {
		// 添加子级
		if (row.categoryLevel >= 3) {
			proxy.$modal.msgWarning('三级类别不能再添加子级')
			open.value = false
			return
		}
		title.value = `新增${getLevelName(row.categoryLevel + 1)}`
		// 如果是新增二级或三级类别，需要获取父级的完整信息（包括codeCount）
		// 新增二级类别时：获取一级分类的codeCount
		// 新增三级类别时：获取二级分类的codeCount
		if (row.categoryLevel === 1 || row.categoryLevel === 2) {
			// 获取父级的完整信息（包括codeCount）
			api.getById(row.id).then(response => {
				const parentInfo = response.data
				parentData.value = {
					id: parentInfo.id,
					categoryName: parentInfo.categoryName,
					categoryLevel: parentInfo.categoryLevel,
					codeCount: parentInfo.codeCount || 0, // 父级的codeCount
				}
				nextTick(() => {
					detailRef.value.resetForm()
					// 根据父级自动设置级别
					detailRef.value.formData.categoryLevel = row.categoryLevel + 1
					detailRef.value.formData.parentId = row.id
					// 设置父级的codeCount，用于后端生成编码
					// 新增二级类别时：使用一级分类的codeCount
					// 新增三级类别时：使用二级分类的codeCount
					detailRef.value.formData.codeCount = parentInfo.codeCount || 0
				})
			})
		} else {
			parentData.value = {
				id: row.id,
				categoryName: row.categoryName,
				categoryLevel: row.categoryLevel,
			}
			nextTick(() => {
				detailRef.value.resetForm()
				// 根据父级自动设置级别
				detailRef.value.formData.categoryLevel = row.categoryLevel + 1
				detailRef.value.formData.parentId = row.id
			})
		}
	} else {
		// 新增顶级（一级类别）
		title.value = '新增一级类别'
		nextTick(() => {
			detailRef.value.resetForm()
			// 顶级默认为一级类别
			detailRef.value.formData.categoryLevel = 1
			detailRef.value.formData.parentId = null
		})
	}
}

/** 编辑物资类别 */
const handleUpdate = async row => {
	reset()
	title.value = '编辑'
	open.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 先清空表单
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			parentData.value = resData.parentId
				? {
						id: resData.parentId,
						categoryName: resData.parentName || '父级类别',
					}
				: null
			// 逐个属性赋值
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.categoryCode = resData.categoryCode
			detailRef.value.formData.categoryName = resData.categoryName
			detailRef.value.formData.parentId = resData.parentId
			detailRef.value.formData.categoryLevel = resData.categoryLevel
			detailRef.value.formData.sortOrder = resData.sortOrder || 0
			// detailRef.value.formData.isLaborProtection = resData.isLaborProtection || 0
		})
	})
}

/** 行点击事件 */
const cellClickEvent = ({ row }) => {
	console.log('行点击事件', row)
}

const submitForm = async () => {
	if (await detailRef.value.validate()) {
		const params = { ...detailRef.value.formData }
		// 如果是新增二级或三级类别，需要传递父级的codeCount
		if (!params.id && (params.categoryLevel === 2 || params.categoryLevel === 3) && parentData.value) {
			params.codeCount = parentData.value.codeCount || 0
		}
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
 * @description 删除物资类别
 */
const handleDelete = row => {
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.delete(row.id)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>
.app-container {
	padding: 20px;
}
</style>

