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
			:expand-config="{ trigger: 'default', accordion: true }"
			:cellClickEvent="cellClickEvent"
		>
			<template #expand="{ row }">
				<DetailTable :row="row" />
			</template>
		</BaseTable>
	</div>

	<el-drawer v-model="warehouseOutVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="warehouseOutVisible = false">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
				<template v-if="title !== '查看详情'">
					<el-button
						type="primary"
						@click="save"
						v-hasPermi="['equipment:materialWarehouseOut:add', 'equipment:materialWarehouseOut:update']"
					>
						保存
					</el-button>
				</template>
			</div>
		</template>
	</el-drawer>
</template>
<script setup name="materialWarehouseOut">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance, toRaw, watch } from 'vue'
import { ElButton, ElTag, ElTable, ElTableColumn } from 'element-plus'
import materialWarehouseOutApi from '@/api/equipment/materialWarehouseOut/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

/**--------------变量定义------------ */
const tableData = ref([]) // 表数据
const title = ref('') // 详情标题
const total = ref('') // 数据总数
const warehouseOutVisible = ref(false) // 是否显示详情
const detailRef = ref(null) // 明细组件ref
const isAdd = ref(false) // 是否新增
const clickRow = ref(null) // 点击的行数据

const baseTable = ref(null)
const selectData = reactive([
	// 查询条件
	{ name: '出库单号', type: 'input', modelValue: 'warehouseOutNo', span: 8 },
	{ name: '出库主题', type: 'input', modelValue: 'warehouseOutTitle', span: 8 },
	{ name: '仓库名称', type: 'input', modelValue: 'warehouseName', span: 8 },
])

// 行点击事件
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	// 根据选中行的状态更新确认按钮的禁用状态
	updateConfirmButtonDisabled()
}

// 查看详情事件（只读）
const viewDetail = row => {
	const viewRow = row
	warehouseOutVisible.value = true
	title.value = '查看详情'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = true // 设置为只读
		materialWarehouseOutApi.getById(viewRow.id).then(res => {
			if (res.code === '0000' && res.data) {
				proxy.setFormData(detailRef.value.formData.form, res.data)
				detailRef.value.editDetailList(res.data.detailList || [])
				detailRef.value.init(false)
			}
		})
	})
}

// 展开明细表格组件
const DetailTable = {
	props: ['row', 'onRowCountChange'],
	setup(props) {
		const detailList = ref([])
		const loading = ref(false)
		const loaded = ref(false) // 标记是否已加载

		// 懒加载明细数据
		const loadDetailList = async () => {
			if (loaded.value) {
				return // 已经加载过，不再重复加载
			}
			loading.value = true
			loaded.value = true // 标记为已加载，避免重复请求
			try {
				const res = await materialWarehouseOutApi.getById(props.row.id)
				if (res.code === '0000' && res.data) {
					detailList.value = res.data.detailList || []
					// 数据加载完成后，将行数传递给 BaseTable
					if (props.onRowCountChange && typeof props.onRowCountChange === 'function') {
						nextTick(() => {
							props.onRowCountChange(detailList.value.length)
						})
					}
				}
			} catch (error) {
				console.error('加载明细数据失败:', error)
				loaded.value = false // 加载失败，允许重试
			} finally {
				loading.value = false
			}
		}

		// 立即加载数据（当组件被渲染时）
		loadDetailList()

		// 监听 detailList 变化，更新行数
		watch(
			detailList,
			newList => {
				if (props.onRowCountChange && typeof props.onRowCountChange === 'function') {
					nextTick(() => {
						props.onRowCountChange(newList.length)
					})
				}
			},
			{ immediate: false },
		)

		return () => {
			if (loading.value) {
				return h('div', { style: 'padding: 20px; text-align: center;' }, '加载中...')
			}
			if (detailList.value.length === 0) {
				return h('div', { style: 'padding: 20px; text-align: center; color: #999;' }, '暂无明细数据')
			}
			return h('div', { class: 'detail-table-wrapper' }, [
				h(
					ElTable,
					{
						data: detailList.value,
						border: true,
						size: 'small',
						style: 'width: 100%',
					},
					[
						h(ElTableColumn, { prop: 'materialName', label: '物资名称', width: 150 }),
						h(ElTableColumn, { prop: 'specificationModel', label: '规格型号', width: 150 }),
						h(ElTableColumn, { prop: 'unitName', label: '计量单位', align: 'center', width: 100 }),
						h(ElTableColumn, { prop: 'flowDirection', label: '流向', width: 150 }),
						h(ElTableColumn, {
							prop: 'stockQuantity',
							label: '库存数据',
							align: 'right',
							width: 120,
							formatter: row => {
								return row.stockQuantity != null ? row.stockQuantity : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'applicationQuantity',
							label: '申领数量',
							align: 'right',
							width: 120,
							formatter: row => {
								return row.applicationQuantity != null ? row.applicationQuantity : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'outQuantitySum',
							label: '已申领数量',
							align: 'right',
							width: 120,
							formatter: row => {
								return row.outQuantitySum != null ? row.outQuantitySum : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'outQuantity',
							label: '本次出库数量',
							align: 'right',
							width: 140,
							formatter: row => {
								return row.outQuantity != null ? row.outQuantity : '-'
							},
						}),
					],
				),
			])
		}
	},
}

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 50, align: 'center' },
	{
		label: '出库单号',
		prop: 'warehouseOutNo',
		align: 'left',
		width: 200,
		render: row => {
			if (!row || !row.warehouseOutNo) {
				return []
			}
			return [
				h(
					'span',
					{
						style: 'color: #409EFF; cursor: pointer;',
						onClick: () => {
							viewDetail(row)
						},
					},
					row.warehouseOutNo,
				),
			]
		},
	},
	{ label: '出库主题', prop: 'warehouseOutTitle', align: 'left', width: 140 },
	{ label: '部门名称', prop: 'deptName', align: 'left', width: 200 },
	{ label: '所属仓库', prop: 'warehouseName', align: 'left' },
	{ label: '领料人', prop: 'receiverName', align: 'left' },
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			if (row.status === null || row.status === undefined) {
				return [h(ElTag, { type: 'info' }, { default: () => '待验收' })]
			}
			return [h(ElTag, { type: getAcceptanceStatusType(row.status) }, { default: () => getAcceptanceStatusLabel(row.status) })]
		},
	},
	{ label: '创建人', prop: 'createByName', align: 'left' },
	{ label: '创建时间', prop: 'createTime', align: 'center', width: 160 },
	{ label: '确认人', prop: 'confirmByName', align: 'left', width: 120 },
	{ label: '确认时间', prop: 'confirmTime', align: 'center', width: 160 },
	{
		prop: '',
		label: '操作',
		width: 100,
		fixed: 'right',
		align: 'center',
		render: row => {
			const buttons = []

			// 暂时注释掉编辑按钮
			// buttons.push(
			// 	h(
			// 		ElButton,
			// 		{
			// 			onClick: () => {
			// 				edit(row)
			// 			},
			// 			type: 'primary',
			// 			link: true,
			// 			icon: 'Edit',
			// 		},
			// 		{ default: () => '编辑' }
			// 	)
			// )

			// 已确认状态不能删除
			const isDisabled = row.status !== null && row.status !== undefined && row.status === 1
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
						disabled: isDisabled,
						permission: 'equipment:materialWarehouseOut:delete',
					},
					{ default: () => '删除' },
				),
			)

			return buttons
		},
	},
])

const queryParams = ref({
	// 分页变量
	startPage: 1,
	pageSize: 20,
})

/**--------------方法------------ */
// 点击查询按钮的事件
const getList = e => {
	queryParams.value = e || queryParams.value
	clickRow.value = null // 清空选中的行
	updateConfirmButtonDisabled() // 更新确认按钮状态
	materialWarehouseOutApi.getList(queryParams.value).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

// 新增事件
const add = () => {
	warehouseOutVisible.value = true
	title.value = '新增'
	isAdd.value = true

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		detailRef.value.init(true)
	})
}
const getAcceptanceStatusLabel = status => {
	const statusMap = {
		0: '待确认',
		1: '已确认',
	}
	return statusMap[status] || '未知'
}

const getAcceptanceStatusType = status => {
	const typeMap = {
		0: 'info',
		1: 'success',
	}
	return typeMap[status] || 'info'
}
// 编辑事件
const edit = row => {
	const editRow = row

	warehouseOutVisible.value = true
	title.value = '编辑'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		materialWarehouseOutApi.getById(editRow.id).then(res => {
			if (res.code === '0000' && res.data) {
				proxy.setFormData(detailRef.value.formData.form, res.data)
				detailRef.value.editDetailList(res.data.detailList || [])
				detailRef.value.init(false)
			}
		})
	})
}

// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		let { form, detailList } = JSON.parse(JSON.stringify(toRaw(detailRef.value.formData)))

		// 验证：必须至少有一条有效明细
		const validDetailList = detailList.filter(item => item.materialName != null && item.materialName !== '')
		if (validDetailList.length === 0) {
			proxy.$message.warning('至少需要添加一条明细数据')
			return
		}
		detailList = validDetailList

		doSave(form, detailList)
	}
}

// 执行保存操作
const doSave = (form, detailList) => {
	proxy.$modal.confirm('确定保存?').then(res => {
		let params = {
			...form,
			detailList: detailList,
		}
		if (params.id == null) {
			materialWarehouseOutApi.add(params).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				warehouseOutVisible.value = false
			})
		} else {
			materialWarehouseOutApi.update(params).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				warehouseOutVisible.value = false
			})
		}
	})
}

// 删除事件
const handleDelete = row => {
	const deleteRow = row
	proxy.$modal
		.confirm('确定删除?')
		.then(res => {
			materialWarehouseOutApi.delete(deleteRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(err => {})
}

// 初始化方法
const init = async () => {
	getList(null)
}

// 确认事件
const handleConfirm = row => {
	const confirmRow = row
	// 检查状态，只有待确认状态（0或null）才能确认
	if (confirmRow.status != null && confirmRow.status === 1) {
		proxy.$message.warning('该出库单已确认，无需重复确认')
		return
	}
	proxy.$modal
		.confirm('确定确认该出库单?')
		.then(() => {
			materialWarehouseOutApi.confirm(confirmRow.id).then(res => {
				if (res.code == '0000') {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg)
				}
			})
		})
		.catch(err => {})
}

// 按钮列表
const buttonList = reactive([
	// 搜索区域的按钮
	{
		label: '新建',
		type: 'primary',
		icon: 'Plus',
		click: add,
		permission: 'equipment:materialWarehouseOut:add',
	},
	{
		label: '确认',
		type: 'primary',
		icon: 'view',
		disabled: true, // 默认禁用
		click: () => {
			if (!clickRow.value) {
				proxy.$message.warning('请先选择一条数据')
				return
			}
			handleConfirm(clickRow.value)
		},
		permission: 'equipment:materialWarehouseOut:confirm',
	},
])

// 更新确认按钮的禁用状态
const updateConfirmButtonDisabled = () => {
	const confirmButton = buttonList.find(btn => btn.label === '确认')
	if (confirmButton) {
		// 只有待确认状态（0或null）才能确认
		if (!clickRow.value) {
			confirmButton.disabled = true
		} else {
			const status = clickRow.value.status
			confirmButton.disabled = status !== null && status !== undefined && status !== 0
		}
	}
}

init()
</script>
<style scoped>
/* 修复展开行明细表格样式 - 确保在正常文档流中 */
.detail-table-wrapper {
	padding: 10px;
	background: #f5f7fa;
}
</style>
