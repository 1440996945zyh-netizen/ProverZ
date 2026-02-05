<template>
	<div class="app-container">
		<!-- 主列表设备类型分类显示 -->
		<div class="container-content">
			<BaseTable
				ref="equipmentTypeTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableData="equipmentTypeList"
				:tableColumns="tableColumns"
				:treeConfig="treeConfig"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="equipmentTypeLazyTable"
				:cellClickEvent="cellClickEvent"
				:loading="tableLoading"
				:showPagination="false"
				:showToolBar="false"
			/>
		</div>
		<!-- 新增弹窗/编辑弹窗 -->
		<Dialog v-model:visible="open" :title="title" width="25%">
			<detail ref="detailRef" :parent-data="parentData" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm" v-hasPermi="['equipment:equipmentType:add', 'equipment:equipmentType:update']">
						确定
					</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="equipmentParts">
import { ref, reactive, computed, nextTick, getCurrentInstance, onMounted, toRefs, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/equipmentType/index'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance()

const storeHight = computed(() => tableParamsStore().normalTableHeight)
const tableHeight = computed(() => storeHight.value) //表格高度
const equipmentTypeTableRef = ref(null) // BaseTable实例ref
const equipmentTypeList = ref([]) // 设备类型分类树形数据
const open = ref(false) // 弹窗显示状态
const title = ref('') // 弹窗标题
const parentData = ref(null) // 父级数据
const detailRef = ref(null) // 详情组件ref
const rowConfig = { keyField: 'id', treeNode: true }

const queryParams = ref({
	typeName: '',
})

// 获取级别名称
const getLevelName = level => {
	const levelMap = {
		1: '设备大类',
		2: '设备中类',
		3: '设备小类',
		4: '设备机构',
		5: '设备部件',
	}
	return levelMap[level] || ''
}

/* 表格数据列 */
const tableColumns = ref([
	// 列1：设备类型名称（树形节点列）
	{
		prop: 'typeName',
		label: '设备类型名称',
		align: 'left',
		showOverFlow: true,
		treeNode: true, // 标记为树形节点列（关键配置）
	},
	// 列2：分类级别
	{
		prop: 'categoryLevel',
		label: '分类级别',
		align: 'center',
		render: row => {
			let type = ''
			let label = getLevelName(row.categoryLevel)
			if (row.categoryLevel === 3) {
				type = 'primary'
			} else if (row.categoryLevel === 4) {
				type = 'warning'
			} else if (row.categoryLevel === 5) {
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
	// 列3：排序
	{
		prop: 'sortOrder',
		label: '排序',
		align: 'center',
	},
	// 列4：创建时间
	{
		prop: 'createTime',
		label: '创建时间',
		align: 'center',
	},
	// 列5：操作列（编辑/新增子级/删除）
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
						permission: 'equipment:equipmentParts:update',
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
						permission: 'equipment:equipmentParts:add',
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
						permission: 'equipment:equipmentParts:delete',
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
				hasChildren: item.categoryLevel < 5, // 设备部件不能再有子级
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
		name: '设备类型名称',
		type: 'input',
		modelValue: 'typeName',
		span: 24,
	},
])

/* 右侧按钮 */
const buttonList = reactive([
	// {
	// 	label: '新增',
	// 	type: 'primary',
	// 	icon: 'Plus',
	// 	click: () => handleAdd(),
	// 	permission: 'equipment:equipmentType:add',
	// },
])

/**
 * 查询主列表数据
 */
const getList = e => {
	tableLoading.value = true
	queryParams.value = e
	api.partsTree(queryParams.value)
		.then(response => {
			equipmentTypeList.value = response.data.map(item => ({
				...item,
				hasChildren: item.categoryLevel < 5, // 设备部件不能再有子级
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

/** 新增设备类型分类 */
const handleAdd = async row => {
	reset()
	open.value = true
	if (row != null && row.id) {
		// 添加子级
		if (row.categoryLevel >= 5) {
			proxy.$modal.msgWarning('设备部件不能再添加子级')
			open.value = false
			return
		}
		title.value = `新增${getLevelName(row.categoryLevel + 1)}`
		parentData.value = {
			id: row.id,
			typeName: row.typeName,
			categoryLevel: row.categoryLevel,
		}
		nextTick(() => {
			detailRef.value.resetForm()
			// 根据父级自动设置级别
			detailRef.value.formData.categoryLevel = row.categoryLevel + 1
			detailRef.value.formData.parentId = row.id
		})
	} else {
		// 新增顶级（设备大类）
		title.value = '新增设备大类'
		nextTick(() => {
			detailRef.value.resetForm()
			// 顶级默认为设备大类
			detailRef.value.formData.categoryLevel = 1
			detailRef.value.formData.parentId = null
		})
	}
}

/** 编辑设备类型分类 */
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
						typeName: resData.parentName || '父级分类',
					}
				: null
			// 逐个属性赋值，参考machineType页面的写法
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.typeName = resData.typeName
			detailRef.value.formData.parentId = resData.parentId
			detailRef.value.formData.categoryLevel = resData.categoryLevel
			detailRef.value.formData.sortOrder = resData.sortOrder || 0
		})
	})
}

/** 行点击事件 */
const cellClickEvent = ({ row }) => {
	console.log('行点击事件', row)
}

const submitForm = async () => {
	if (await detailRef.value.validate()) {
		const params = detailRef.value.formData
		if (params.id) {
			api.updateParts(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList(queryParams.value)
			})
		} else {
			api.addParts(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList(queryParams.value)
			})
		}
	}
}

/**
 * @description 删除设备类型分类
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
	getList(queryParams.value)
})
</script>

<style lang="scss" scoped>
.app-container {
	padding: 20px;
}
</style>
