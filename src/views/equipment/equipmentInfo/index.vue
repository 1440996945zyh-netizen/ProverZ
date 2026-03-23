<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:loading="loading"
			:cellClickEvent="cellClickEvent"
			:total="total"
      		:showNum = '3'
			:defaultWidth="50"
		/>
	</div>
	<el-drawer v-model="open" :title="title" size="70%">
		<detail ref="detailRef" :readonly="isReadonly" :mode="detailMode" @saved="handleDetailSaved" />
		<template #footer>
			<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
				<el-button @click="cancel">取消</el-button>
				<el-button v-if="!isReadonly && detailMode === 'add'" type="primary" @click="save" v-hasPermi="['equipment:equipmentInfo:add']">
					确定
				</el-button>
				<el-button v-if="!isReadonly && detailMode === 'edit'" type="primary" @click="saveCurrentTab" v-hasPermi="['equipment:equipmentInfo:update']">
					保存
				</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="equipmentInfo">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/equipmentInfo/index'
import equipmentTypeApi from '@/api/equipment/equipmentType/index'
import { ref, reactive, nextTick, h, getCurrentInstance, onMounted } from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const detailRef = ref(null)
const total = ref('')
const title = ref('')
const open = ref(false)
const isReadonly = ref(false)
const detailMode = ref('add') // 'add' 或 'edit'
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
	equipBigCategoryId: null,
	equipMiddleCategoryId: null,
	equipSmallCategoryId: null,
})
const tableData = ref([])
const loading = ref(false)
const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '使用部门', prop: 'useOrgName', align: 'left', width: 170 },
	{ label: '设备小类', prop: 'equipSmallCategoryName', align: 'left', width: 170 },
	{ label: '设备名称', prop: 'equipName', align: 'left', minWidth: 200 },
	{ label: '设备编号', prop: 'equipCode', align: 'left', minWidth: 180 },
	{ label: '规格', prop: 'specificCode', align: 'left', width: 120 },
	{ label: '型号', prop: 'modelNumber', align: 'left', width: 120 },
	{ label: '出厂编号', prop: 'factoryNumber', align: 'left', width: 150 },
	{ label: '设备使用时间', prop: 'usageTime', align: 'center', width: 150 },
	{ label: '制造厂家', prop: 'manufacturer', align: 'left', width: 190 },
	{ label: '设备自重', prop: 'equipWeight', align: 'right', width: 100 },
	{ label: '发动机功率', prop: 'enginePower', align: 'right', width: 120 },
	{
		label: '使用状态',
		prop: 'equipState',
		align: 'center',
		width: 100,
		render: row => {
			const stateValue = row.equipState
			// 根据字典编号判断标签类型：01,02->success, 03,04->warning, 05,06->danger, 07->info
			let tagType = 'info'
			if (stateValue === '01' || stateValue === '02' ) {
				tagType = 'success'
			} else if (stateValue === '03'  || stateValue === '04' ) {
				tagType = 'warning'
			} else if (stateValue === '05'  || stateValue === '06' ) {
				tagType = 'danger'
			} else if (stateValue=== '07' ) {
				tagType = 'info'
			}

			return [
				h(
					ElTag,
					{
						type: tagType,
					},
					{
						default: () => row.equipStateName,
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 210,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'equipment:equipmentInfo:update',
					},
					{
						default: () => '修改',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							view(row)
						},
						type: 'primary',
						link: true,
						icon: 'View',
            permission: 'equipment:equipmentInfo:update',
					},
					{
						default: () => '查看',
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
						permission: 'equipment:equipmentInfo:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

// 设备类型树形数据
const equipmentTypeTreeData = ref([])
// 设备类型树加载状态
const equipmentTypeTreeLoaded = ref(false)

// 加载设备类型树
const loadEquipmentTypeTree = () => {
	equipmentTypeTreeLoaded.value = false
	equipmentTypeApi.getTree().then(res => {
		if (res.code == '0000') {
			equipmentTypeTreeData.value = res.data || []
			equipmentTypeTreeLoaded.value = true
		} else {
			equipmentTypeTreeLoaded.value = true
		}
	}).catch(() => {
		equipmentTypeTreeLoaded.value = true
	})
}

// 递归查找树节点
const findTreeNode = (tree, id) => {
	for (const node of tree) {
		if (node.id === id) {
			return node
		}
		if (node.children && node.children.length > 0) {
			const found = findTreeNode(node.children, id)
			if (found) {
				return found
			}
		}
	}
	return null
}

// 设备类型查询条件的onChange处理函数
const handleEquipmentTypeChange = (value) => {
	// 如果数据还没加载完成，等待数据加载完成后再执行
	if (!equipmentTypeTreeLoaded.value || !equipmentTypeTreeData.value || equipmentTypeTreeData.value.length === 0) {
		// 等待数据加载完成（最多等待1秒，每100ms检查一次）
		let retryCount = 0
		const maxRetries = 10
		const checkData = () => {
			retryCount++
			if (equipmentTypeTreeLoaded.value && equipmentTypeTreeData.value && equipmentTypeTreeData.value.length > 0) {
				// 数据已加载，执行变更
				nextTick(() => {
					executeChange(value)
				})
			} else if (retryCount < maxRetries) {
				// 如果还没加载完成，再等一会儿
				setTimeout(checkData, 100)
			} else {
				// 超时，清空查询条件
				console.warn('设备类型数据加载超时')
				queryParams.value.equipBigCategoryId = null
				queryParams.value.equipMiddleCategoryId = null
				queryParams.value.equipSmallCategoryId = null
			}
		}
		setTimeout(checkData, 50)
		return
	}
	// 数据已加载，直接执行
	nextTick(() => {
		executeChange(value)
	})
}

// 执行变更逻辑
const executeChange = (value) => {
	// 根据选择的节点级别设置对应的查询字段
	if (!value) {
		queryParams.value.equipBigCategoryId = null
		queryParams.value.equipMiddleCategoryId = null
		queryParams.value.equipSmallCategoryId = null
		return
	}

	// 查找节点
	const selectedNode = findTreeNode(equipmentTypeTreeData.value, value)
	if (!selectedNode) {
		console.warn('未找到选中的节点，value:', value, 'treeData:', equipmentTypeTreeData.value)
		// 即使找不到节点，也要清空其他分类ID，避免使用错误的查询条件
		queryParams.value.equipBigCategoryId = null
		queryParams.value.equipMiddleCategoryId = null
		queryParams.value.equipSmallCategoryId = null
		return
	}

	// 获取节点的级别
	const categoryLevel = selectedNode.categoryLevel
	if (categoryLevel === 1) {
		// 一级：设备大类
		queryParams.value.equipBigCategoryId = value
		queryParams.value.equipMiddleCategoryId = null
		queryParams.value.equipSmallCategoryId = null
	} else if (categoryLevel === 2) {
		// 二级：设备中类
		queryParams.value.equipBigCategoryId = null
		queryParams.value.equipMiddleCategoryId = value
		queryParams.value.equipSmallCategoryId = null
	} else if (categoryLevel === 3) {
		// 三级：设备小类
		queryParams.value.equipBigCategoryId = null
		queryParams.value.equipMiddleCategoryId = null
		queryParams.value.equipSmallCategoryId = value
	}
}

const selectData = reactive([
	{
		name: '设备编号',
		type: 'input',
		modelValue: 'equipCode',
		span: 8,
	},
	{
		name: '设备名称',
		type: 'input',
		modelValue: 'equipName',
		span: 8,
	},
	// {
	// 	name: '设备类型',
	// 	type: 'tree-select',
	// 	modelValue: 'equipmentTypeId',
	// 	span: 6,
	// 	treeData: equipmentTypeTreeData,
	// 	treeDataLoaded: equipmentTypeTreeLoaded,
	// 	dataConfig: {
	// 		props: { value: 'id', label: 'typeName', children: 'children' },
	// 		valueKey: 'id',
	// 	},
	// 	onChange: handleEquipmentTypeChange,
	// },
	{
		name: '设备状态',
		type: 'select',
		modelValue: 'equipState',
		span: 8,
		dataConfig: {
			params: { type: 'DICT', dictType: 'E_STATUS' }
		},
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add(),
		permission: 'equipment:equipmentInfo:add',
	},
])

const clickRow = ref({})

// 点击查询的事件
const getList = e => {
	loading.value = true
	// 过滤掉 equipmentTypeId，因为它不应该作为查询参数（应该使用 equipBigCategoryId 等）
	const params = { ...e }
	if (params.equipmentTypeId !== undefined) {
		delete params.equipmentTypeId
	}
	// 合并 queryParams 中的分类ID
	queryParams.value = { ...queryParams.value, ...params }
	api.getList(queryParams.value).then(res => {
		loading.value = false
		if (res.code == '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		} else {
			proxy.$message.error(res.msg)
		}
	})
}

// 新增事件
const add = () => {
	open.value = true
	title.value = '新增设备台账信息'
	detailMode.value = 'add'
	isReadonly.value = false
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value
	open.value = true
	title.value = '修改设备台账信息'
	detailMode.value = 'edit'
	isReadonly.value = false
	nextTick(() => {
		// 先重置表单
		detailRef.value.resetForm()
		// 然后加载数据
		api.getById(editRow.id).then(res => {
			if (res.code == '0000') {
				const msg = res.data
				// 逐个赋值，确保响应式更新
				Object.keys(msg).forEach(key => {
					if (detailRef.value.formData.hasOwnProperty(key)) {
						detailRef.value.formData[key] = msg[key]
					}
				})
				// 加载对应的下拉列表数据
				nextTick(() => {
					detailRef.value.loadEditCategoryData()
					// 加载变更记录
					if (detailRef.value.mainRef && typeof detailRef.value.mainRef.loadChangeLogs === 'function') {
						setTimeout(() => {
							detailRef.value.mainRef.loadChangeLogs()
						}, 200)
					}
				})
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}

// 查看事件
const view = row => {
	const viewRow = row || clickRow.value
	open.value = true
	title.value = '查看设备台账信息'
	detailMode.value = 'edit'
	isReadonly.value = true
	nextTick(() => {
		// 先重置表单
		detailRef.value.resetForm()
		// 然后加载数据
		api.getById(viewRow.id).then(res => {
			if (res.code == '0000') {
				const msg = res.data
				// 逐个赋值，确保响应式更新
				Object.keys(msg).forEach(key => {
					if (detailRef.value.formData.hasOwnProperty(key)) {
						detailRef.value.formData[key] = msg[key]
					}
				})
				// 加载对应的下拉列表数据
				nextTick(() => {
					detailRef.value.loadEditCategoryData()
				})
			} else {
				proxy.$message.error(res.msg)
			}
		})
	})
}

// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value
	proxy.$modal
		.confirm('确定删除？')
		.then(() => {
			api.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(() => {})
}

// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存?').then(() => {
			// 深拷贝表单数据
			const submitData = JSON.parse(JSON.stringify(detailRef.value.formData))

			// 确保图片ID列表是数组，不是空字符串
			if (!Array.isArray(submitData.panoramaImageIds)) {
				submitData.panoramaImageIds = []
			}
			if (!Array.isArray(submitData.orientationImageIds)) {
				submitData.orientationImageIds = []
			}
			if (!Array.isArray(submitData.accessoryImageIds)) {
				submitData.accessoryImageIds = []
			}

			if (title.value == '修改设备台账信息') {
				api.update(submitData).then(res => {
					if (res.code == '0000') {
						proxy.$message.success(res.msg)
						getList(queryParams.value)
						open.value = false
					} else {
						proxy.$message.error(res.msg)
					}
				})
			} else {
				delete submitData.id
				api.add(submitData).then(res => {
					if (res.code == '0000') {
						proxy.$message.success(res.msg)
						getList(queryParams.value)
						open.value = false
					} else {
						proxy.$message.error(res.msg)
					}
				})
			}
		})
	}
}

// 取消事件
const cancel = () => {
	open.value = false
}

// 处理详情页保存成功事件
const handleDetailSaved = () => {
	// 刷新列表
	getList(queryParams.value)
	// 关闭抽屉
	open.value = false
}

// 保存当前标签页
const saveCurrentTab = () => {
	if (detailRef.value && detailRef.value.mainRef) {
		const mainRef = detailRef.value.mainRef
		if (mainRef && typeof mainRef.getSaveMethod === 'function') {
			const saveMethod = mainRef.getSaveMethod()
			if (saveMethod) {
				saveMethod()
			} else {
				proxy.$message.warning('当前标签页不支持保存')
			}
		} else {
			proxy.$message.warning('无法获取保存方法')
		}
	}
}

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

// 初始化：先加载设备类型树，再加载列表
onMounted(() => {
	loadEquipmentTypeTree()
	getList(queryParams.value)
})
</script>

