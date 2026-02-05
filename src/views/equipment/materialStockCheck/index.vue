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
			:total="total"
			:cellClickEvent="cellClickEvent"
		/>
	</div>

	<el-drawer v-model="checkVisible" :title="title" size="70%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="checkVisible = false">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
				<template v-if="title !== '查看详情'">
					<el-button type="primary" @click="save" v-hasPermi="['equipment:materialStockCheck:add', 'equipment:materialStockCheck:update']">保存</el-button>
				</template>
			</div>
		</template>
	</el-drawer>

	<!-- 明细抽屉 -->
	<el-drawer v-model="detailListVisible" title="盘点明细" size="90%">
		<detailList ref="detailListRef" :checkId="currentCheckId" />
	</el-drawer>
</template>
<script setup name="materialStockCheck">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import detailList from './detailList/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance, computed } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import materialStockCheckApi from '@/api/equipment/materialStockCheck/index'
const { proxy } = getCurrentInstance()

/**--------------变量定义------------ */
const tableData = ref([])
const title = ref('')
const total = ref('')
const checkVisible = ref(false)
const detailRef = ref(null)
const isAdd = ref(false)
const clickRow = ref(null)
const detailListVisible = ref(false)
const detailListRef = ref(null)
const currentCheckId = ref(null)

const baseTable = ref(null)
const selectData = reactive([
	{ name: '盘点单号', type: 'input', modelValue: 'checkNo', span: 8 },
	{ name: '盘点主题', type: 'input', modelValue: 'checkTitle', span: 8 },
	{ name: '仓库名称', type: 'input', modelValue: 'warehouseName', span: 8 },
	{
		name: '盘点状态',
		type: 'select',
		modelValue: 'checkStatus',
		span: 2,
		selectData: [
			{ label: '待盘点', value: 0 },
			{ label: '盘点中', value: 1 },
			{ label: '已完成', value: 2 },
		],
	},
])

// 行点击事件
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

// 获取盘点状态标签
const getCheckStatusLabel = (status) => {
	const statusMap = {
		0: '待盘点',
		1: '盘点中',
		2: '已完成',
		3: '已调整',
	}
	return statusMap[status] || '未知'
}

// 获取盘点状态类型
const getCheckStatusType = (status) => {
	const typeMap = {
		0: 'info',
		1: 'warning',
		2: 'success',
		3: 'success',
	}
	return typeMap[status] || 'info'
}

// 查看详情事件
const viewDetail = row => {
	const viewRow = row
	checkVisible.value = true
	title.value = '查看详情'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = true
		materialStockCheckApi.getById(viewRow.id).then(res => {
			if (res.code === '0000' && res.data) {
				proxy.setFormData(detailRef.value.formData.form, res.data)
				// 如果是部分盘点，需要加载物资ID列表（查看时只显示，不加载物资列表）
				if (res.data.checkType === 2 && res.data.detailList && res.data.detailList.length > 0) {
					// 从明细中提取唯一的物资ID列表
					const materialIdSet = new Set()
					res.data.detailList.forEach(item => {
						if (item.materialId) {
							materialIdSet.add(item.materialId)
						}
					})
					detailRef.value.formData.form.materialIds = Array.from(materialIdSet)
				}
				detailRef.value.init(false)
			}
		})
	})
	// 查看时不自动打开明细抽屉，用户可以在详情抽屉中手动打开
}

// 打开明细抽屉
const openDetailList = (checkId) => {
	currentCheckId.value = checkId
	detailListVisible.value = true
	nextTick(() => {
		if (detailListRef.value) {
			detailListRef.value.loadDetailList()
		}
	})
}

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
	{
		label: '盘点单号',
		prop: 'checkNo',
		align: 'left',
		width: 150,
		render: row => {
			if (!row || !row.checkNo) {
				return []
			}
			return [
				h(
					'span',
					{
						style: 'color: #409EFF; cursor: pointer;',
						onClick: () => {
							openDetailList(row.id)
						},
					},
					row.checkNo
				),
			]
		},
	},
	{ label: '盘点主题', prop: 'checkTitle', align: 'left', minWidth: 120 },
	{ label: '仓库名称', prop: 'warehouseName', align: 'left', minWidth: 150 },
	{ label: '盘点类型', prop: 'checkTypeName', align: 'center', minWidth: 100 },
	{ label: '盘点开始日期', prop: 'checkStartDate', align: 'center', minWidth: 120 },
	{ label: '盘点结束日期', prop: 'checkEndDate', align: 'center', minWidth: 120 },
	{ label: '创建人', prop: 'createByName', align: 'left', width: 100 },
	{ label: '创建时间', prop: 'createTime', align: 'center', width: 150 },
	{ label: '备注', prop: 'remark', align: 'center', minWidth: 150 },
	{ 
		label: '明细总数', 
		prop: 'totalDetailCount', 
		align: 'center', 
		width: 100 
	},
	{ 
		label: '未盘点', 
		prop: 'uncheckedCount', 
		align: 'center', 
		width: 100 
	},
	{ 
		label: '待确认', 
		prop: 'pendingConfirmCount', 
		align: 'center', 
		width: 100 
	},
	{ 
		label: '已盘点', 
		prop: 'checkedCount', 
		align: 'center', 
		width: 100 
	},
	{
		label: '盘点状态',
		prop: 'checkStatus',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			if (row.checkStatus === null || row.checkStatus === undefined) {
				return [h(ElTag, { type: 'info' }, { default: () => '待盘点' })]
			}
			return [
				h(
					ElTag,
					{ type: getCheckStatusType(row.checkStatus) },
					{ default: () => getCheckStatusLabel(row.checkStatus) }
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
			const buttons = []

			// 只有待盘点状态才能编辑和删除
			const canEdit = row.checkStatus === null || row.checkStatus === undefined || row.checkStatus === 0

			buttons.push(
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'equipment:materialStockCheck:update',
						disabled: !canEdit,
					},
					{ default: () => '编辑' }
				)
			)

			buttons.push(
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'equipment:materialStockCheck:delete',
						disabled: !canEdit,
					},
					{ default: () => '删除' }
				)
			)

			return buttons
		},
	},
])

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})

/**--------------方法------------ */
const getList = e => {
	queryParams.value = e || queryParams.value
	clickRow.value = null
	materialStockCheckApi.getList(queryParams.value).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

// 新增事件
const add = () => {
	checkVisible.value = true
	title.value = '新增'
	isAdd.value = true

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		detailRef.value.init(true)
	})
	// 新增时暂不打开明细抽屉，保存后再打开
}

// 编辑事件
const edit = row => {
	const editRow = row

	// 验证：只有待盘点状态才能编辑
	const checkStatus = editRow.checkStatus
	if (checkStatus !== null && checkStatus !== undefined && checkStatus !== 0) {
		proxy.$message.warning('只有待盘点状态的盘点单才能编辑')
		return
	}

	checkVisible.value = true
	title.value = '编辑'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		materialStockCheckApi.getById(editRow.id).then(res => {
			if (res.code === '0000' && res.data) {
				proxy.setFormData(detailRef.value.formData.form, res.data)
				// 如果是部分盘点，需要加载物资ID列表
				if (res.data.checkType === 2 && res.data.detailList && res.data.detailList.length > 0) {
					// 从明细中提取唯一的物资ID列表
					const materialIdSet = new Set()
					res.data.detailList.forEach(item => {
						if (item.materialId) {
							materialIdSet.add(item.materialId)
						}
					})
					detailRef.value.formData.form.materialIds = Array.from(materialIdSet)
					// 加载物资列表
					if (res.data.warehouseId) {
						detailRef.value.loadMaterialList()
					}
				}
				detailRef.value.init(false)
			}
		})
	})
}

// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		const formData = JSON.parse(JSON.stringify(detailRef.value.formData))
		const { form } = formData

		// 如果是编辑操作，验证盘点状态
		if (form.id != null) {
			materialStockCheckApi.getById(form.id).then(checkRes => {
				if (checkRes.code === '0000' && checkRes.data) {
					const checkStatus = checkRes.data.checkStatus
					if (checkStatus !== null && checkStatus !== undefined && checkStatus !== 0) {
						proxy.$message.warning('只有待盘点状态的盘点单才能编辑')
						return
					}
					doSave(form)
				}
			})
		} else {
			doSave(form)
		}
	}
}

// 执行保存操作
const doSave = (form) => {
	proxy.$modal.confirm('确定保存?').then(() => {
		const params = {
			...form,
			// 不传递detailList，后端会根据盘点类型和物资ID自动生成明细
		}
		materialStockCheckApi.save(params).then(res => {
			proxy.$message.success(res.msg)
			getList(queryParams.value)
			checkVisible.value = false
			// 如果是编辑，保存后刷新明细抽屉
			if (form.id) {
				nextTick(() => {
					if (detailListRef.value) {
						detailListRef.value.loadDetailList()
					}
				})
			} else {
				// 如果是新增，保存后获取新创建的盘点单ID并打开明细抽屉
				// 这里需要从返回结果中获取ID，或者重新查询列表获取最新一条
				setTimeout(() => {
					getList(queryParams.value)
				}, 500)
			}
		})
	})
}

// 删除事件
const handleDelete = row => {
	const deleteRow = row
	const checkStatus = deleteRow.checkStatus
	if (checkStatus !== null && checkStatus !== undefined && checkStatus !== 0) {
		proxy.$message.warning('只有待盘点状态的盘点单才能删除')
		return
	}
	proxy.$modal
		.confirm('确定删除?')
		.then(() => {
			materialStockCheckApi.deleteCheck(deleteRow.id).then(res => {
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

// 初始化方法
const init = async () => {
	getList(null)
}

// 按钮列表
const buttonList = computed(() => {
	const buttons = [
		{
			label: '新建',
			type: 'primary',
			icon: 'Plus',
			click: add,
			permission: 'equipment:materialStockCheck:add',
		},
	]
	return buttons
})

// 处理修改按钮点击（从顶部按钮栏）
const handleEdit = () => {
	if (!clickRow.value) {
		proxy.$message.warning('请先选择要修改的盘点单')
		return
	}
	// 验证：只有待盘点状态才能编辑
	const checkStatus = clickRow.value.checkStatus
	if (checkStatus !== null && checkStatus !== undefined && checkStatus !== 0) {
		proxy.$message.warning('只有待盘点状态的盘点单才能修改')
		return
	}
	edit(clickRow.value)
}

init()
</script>
<style scoped>
</style>

