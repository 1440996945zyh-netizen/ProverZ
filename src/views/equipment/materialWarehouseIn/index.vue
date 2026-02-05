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
			:expandConfig="{ trigger: 'default' }"
			:cellClickEvent="cellClickEvent"
		/>
	</div>

	<el-drawer v-model="warehouseInVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="warehouseInVisible = false">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
				<template v-if="title !== '查看详情'">
					<el-button type="primary" @click="save" v-hasPermi="['equipment:materialWarehouseIn:add', 'equipment:materialWarehouseIn:update']">保存</el-button>
				</template>
			</div>
		</template>
	</el-drawer>

	<!-- 验收对话框 -->
	<el-dialog v-model="acceptanceVisible" title="物资入库验收" width="600px">
		<el-form :model="acceptanceForm" :rules="acceptanceRules" ref="acceptanceFormRef" label-width="100px">
			<el-form-item label="验收状态" prop="acceptanceStatus">
				<el-radio-group v-model="acceptanceForm.acceptanceStatus">
					<el-radio :label="1">通过</el-radio>
					<el-radio :label="2">不通过</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="验收备注" prop="acceptanceRemarks">
				<el-input
					v-model="acceptanceForm.acceptanceRemarks"
					type="textarea"
					:rows="4"
					placeholder="请输入验收备注"
					maxlength="500"
					show-word-limit
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="acceptanceVisible = false">取消</el-button>
				<el-button type="primary" @click="saveAcceptance" v-hasPermi="['equipment:materialWarehouseIn:acceptance']">保存</el-button>
			</div>
		</template>
	</el-dialog>
</template>
<script setup name="materialWarehouseIn">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance, toRaw, watch } from 'vue'
import { ElButton, ElTag, ElTable, ElTableColumn } from 'element-plus'
import materialWarehouseInApi from '@/api/equipment/materialWarehouseIn/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

/**--------------变量定义------------ */
const tableData = ref([]) // 表数据
const title = ref('') // 详情标题
const total = ref('') // 数据总数
const warehouseInVisible = ref(false) // 是否显示详情
const detailRef = ref(null) // 明细组件ref
const isAdd = ref(false) // 是否新增
const clickRow = ref(null) // 点击的行数据
const acceptanceVisible = ref(false) // 是否显示验收对话框
const acceptanceFormRef = ref(null) // 验收表单ref
const acceptanceForm = reactive({
	// 验收表单数据
	id: null,
	acceptanceStatus: 1, // 0-待验收，1-通过，2-不通过
	acceptanceRemarks: '',
})
const acceptanceRules = {
	// 验收表单验证规则
	acceptanceStatus: [{ required: true, message: '请选择验收状态', trigger: 'change' }],
	acceptanceRemarks: [{ required: false, message: '请输入验收备注', trigger: 'blur' }],
}

const baseTable = ref(null)
const selectData = reactive([
	// 查询条件
	{ name: '入库单号', type: 'input', modelValue: 'warehouseInNo', span: 8 },
	{ name: '入库主题', type: 'input', modelValue: 'warehouseInTitle', span: 8 },
	{ name: '供应商名称', type: 'input', modelValue: 'supplierName', span: 8 },
	{
		name: '入库类型',
		type: 'select',
		modelValue: 'warehouseInTypeCode',
		span: 2,
		dataConfig: { url: '/api/internal/public/getDictListByType/WARE_IN_TYPE' },
	},
	{
		name: '验收状态',
		type: 'select',
		modelValue: 'acceptanceStatus',
		span: 2,
	  selectData: [
		{ label: '待验收', value: '0' },
		{ label: '验收通过', value: 1 },
		{ label: '验收不通过', value: 2 },
	  ],

	},
])

// 行点击事件
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

// 获取验收状态标签
const getAcceptanceStatusLabel = (status) => {
	const statusMap = {
		0: '待验收',
		1: '通过',
		2: '不通过',
	}
	return statusMap[status] || '未知'
}

// 获取验收状态类型（用于ElTag的颜色）
const getAcceptanceStatusType = (status) => {
	const typeMap = {
		0: 'info', // 待验收 - 灰色
		1: 'success', // 通过 - 绿色
		2: 'danger', // 不通过 - 红色
	}
	return typeMap[status] || 'info'
}

// 查看详情事件（只读）
const viewDetail = row => {
	const viewRow = row
	warehouseInVisible.value = true
	title.value = '查看详情'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = true // 设置为只读
		materialWarehouseInApi.getById(viewRow.id).then(res => {
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
				const res = await materialWarehouseInApi.getById(props.row.id)
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
		watch(detailList, (newList) => {
			if (props.onRowCountChange && typeof props.onRowCountChange === 'function') {
				nextTick(() => {
					props.onRowCountChange(newList.length)
				})
			}
		}, { immediate: false })

		// 格式化金额（千分位）
		const formatAmount = (value) => {
			if (value == null || value === '') {
				return '-'
			}
			const num = Number(value)
			if (isNaN(num)) {
				return value
			}
			return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
		}

		return () => {
			if (loading.value) {
				return h('div', { style: 'padding: 20px; text-align: center;' }, '加载中...')
			}
			if (detailList.value.length === 0) {
				return h('div', { style: 'padding: 20px; text-align: center; color: #999;' }, '暂无明细数据')
			}
			return h('div', { class: 'detail-table-wrapper' }, [
				h(ElTable, {
					data: detailList.value,
					border: true,
					size: 'small',
					style: 'width: 100%'
				}, [
					h(ElTableColumn, { prop: 'materialName', label: '物资名称', width: 150 }),
					h(ElTableColumn, { prop: 'specification', label: '规格型号', width: 100 }),
					h(ElTableColumn, { prop: 'brand', label: '品牌', width: 100 }),
					h(ElTableColumn, {
						prop: 'purchaseQuantity',
						label: '采购数量',
						align: 'right',
						width: 100,
						formatter: (row) => {
							return row.purchaseQuantity != null ? row.purchaseQuantity : '-'
						}
					}),

					h(ElTableColumn, {
						prop: 'warehouseInQuantity',
						label: '本次入库',
						align: 'right',
						width: 120,
						formatter: (row) => {
							return row.warehouseInQuantity != null ? row.warehouseInQuantity : '-'
						}
					}),

					h(ElTableColumn, { prop: 'unit', label: '单位', align: 'center', width: 80 }),
					h(ElTableColumn, {
						prop: 'taxIncludedUnitPrice',
						label: '单价(元)',
						align: 'right',
						width: 100,
						formatter: (row) => {
							return row.taxIncludedUnitPrice != null ? formatAmount(row.taxIncludedUnitPrice) : '-'
						}
					}),
					h(ElTableColumn, {
						prop: 'taxIncludedAmount',
						label: '金额(元)',
						align: 'right',
						width: 100,
						formatter: (row) => {
							return row.taxIncludedAmount != null ? formatAmount(row.taxIncludedAmount) : '-'
						}
					}),
					h(ElTableColumn, {
						prop: 'warrantyExpiryDate',
						label: '质保到期时间',
						align: 'center',
						width: 150,
						formatter: (row) => {
							return row.warrantyExpiryDate || '-'
						}
					}),
					h(ElTableColumn, {
						prop: 'purchaserName',
						label: '采购员',
						width: 100,
						formatter: (row) => {
							return row.purchaserName || '-'
						}
					}),
				])
			])
		}
	}
}

const tableColumns = ref([
	// 表头列
	{
		type: 'expand',
		width: 50,
		fixed: 'left',
		expandSlot: DetailTable
	},
	{ label: '序号', type: 'seq', width: 50, align: 'center', fixed: 'left' },
	{
		label: '入库单号',
		prop: 'warehouseInNo',
		align: 'left',
		width: 150,
		render: row => {
			if (!row || !row.warehouseInNo) {
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
					row.warehouseInNo
				),
			]
		},
	},
	{ label: '入库主题', prop: 'warehouseInTitle', align: 'left', minWidth: 150 },
	{ label: '入库类型', prop: 'warehouseInTypeName', align: 'center', width: 120 },
	{ label: '入库日期', prop: 'warehouseInDate', align: 'center', width: 110 },
	{ label: '部门名称', prop: 'deptName', align: 'left', width: 220 },
	{ label: '所属仓库', prop: 'warehouseName', align: 'left', width: 150 },
	{ label: '供应商名称', prop: 'supplierName', align: 'left', width: 200 },
	{ label: '交货人', prop: 'deliveryPersonName', align: 'left', width: 100 },
	{ label: '验收人', prop: 'acceptancePersonName', align: 'left', width: 100 },
	{ label: '创建人', prop: 'createByName', align: 'left', width: 100 },
	{ label: '创建时间', prop: 'createTime', align: 'center', width: 150 },
	{ label: '实际验收人', prop: 'approvalByName', align: 'left', width: 120 },
	{ label: '实际验收时间', prop: 'approvalTime', align: 'center', width: 150 },
  {
    label: '验收状态',
    prop: 'acceptanceStatus',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      if (row.acceptanceStatus === null || row.acceptanceStatus === undefined) {
        return [h(ElTag, { type: 'info' }, { default: () => '待验收' })]
      }
      return [
        h(
          ElTag,
          { type: getAcceptanceStatusType(row.acceptanceStatus) },
          { default: () => getAcceptanceStatusLabel(row.acceptanceStatus) }
        ),
      ]
    },
  },
	{
		prop: '',
		label: '操作',
		width: 100,
		fixed: 'right',
		align: 'center',
		render: row => {
			const buttons = []

			// 只有待验收状态（0或null/undefined）才能编辑
			const canEdit = row.acceptanceStatus === null || row.acceptanceStatus === undefined || row.acceptanceStatus === 0

			// 编辑按钮始终显示，根据状态禁用
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
			// 			disabled: !canEdit,
			// 		},
			// 		{ default: () => '编辑' }
			// 	)
			// )

			// 只有待验收状态（0或null/undefined）才能删除
			const canDelete = row.acceptanceStatus === null || row.acceptanceStatus === undefined || row.acceptanceStatus === 0

			// 删除按钮始终显示，根据状态禁用
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
						permission: 'equipment:materialWarehouseIn:delete',
						disabled: !canDelete,
					},
					{ default: () => '删除' }
				)
			)

			// 只有待验收状态（0或null/undefined）才能验收
			// const canAcceptance = row.acceptanceStatus === null || row.acceptanceStatus === undefined || row.acceptanceStatus === 0
			// if (canAcceptance) {
			// 	buttons.push(
			// 		h(
			// 			ElButton,
			// 			{
			// 				onClick: () => {
			// 					handleAcceptance(row)
			// 				},
			// 				type: 'success',
			// 				link: true,
			// 				icon: 'Check',
			// 				permission: 'equipment:materialWarehouseIn:acceptance',
			// 			},
			// 			{ default: () => '验收' }
			// 		)
			// 	)
			// }

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
	materialWarehouseInApi.getList(queryParams.value).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

// 新增事件
const add = () => {
	warehouseInVisible.value = true
	title.value = '新增'
	isAdd.value = true

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		detailRef.value.init(true)
	})
}

// 编辑事件
const edit = row => {
	const editRow = row

	// 验证：只有待验收状态才能编辑
	const acceptanceStatus = editRow.acceptanceStatus
	if (acceptanceStatus !== null && acceptanceStatus !== undefined && acceptanceStatus !== 0) {
		proxy.$message.warning('只有待验收状态的入库单才能编辑')
		return
	}

	warehouseInVisible.value = true
	title.value = '编辑'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		materialWarehouseInApi.getById(editRow.id).then(res => {
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

		// 如果是编辑操作，验证验收状态
		if (form.id != null) {
			// 查询当前入库单的验收状态
			materialWarehouseInApi.getById(form.id).then(checkRes => {
				if (checkRes.code === '0000' && checkRes.data) {
					const acceptanceStatus = checkRes.data.acceptanceStatus
					if (acceptanceStatus !== null && acceptanceStatus !== undefined && acceptanceStatus !== 0) {
						proxy.$message.warning('只有待验收状态的入库单才能编辑')
						return
					}
					// 状态验证通过，继续保存
					doSave(form, detailList)
				}
			})
		} else {
			// 新增操作，直接保存
			doSave(form, detailList)
		}
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
			materialWarehouseInApi.add(params).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				warehouseInVisible.value = false
			})
		} else {
			materialWarehouseInApi.update(params).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				warehouseInVisible.value = false
			})
		}
	})
}

// 删除事件
const handleDelete = row => {
	const deleteRow = row
	// 验证：只有待验收状态才能删除
	const acceptanceStatus = deleteRow.acceptanceStatus
	if (acceptanceStatus !== null && acceptanceStatus !== undefined && acceptanceStatus !== 0) {
		proxy.$message.warning('验收后的入库单不能删除')
		return
	}
	proxy.$modal
		.confirm('确定删除?')
		.then(res => {
			materialWarehouseInApi.delete(deleteRow.id).then(res => {
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

// 验收事件
const handleAcceptance = row => {
	if (!row || !row.id) {
		proxy.$message.warning('请选择要验收的入库单')
		return
	}
	// 验证：只有待验收状态才能验收
	const acceptanceStatus = row.acceptanceStatus
	if (acceptanceStatus !== null && acceptanceStatus !== undefined && acceptanceStatus !== 0) {
		proxy.$message.warning('只有待验收状态的入库单才能验收')
		return
	}
	acceptanceForm.id = row.id
	acceptanceForm.acceptanceStatus = 1 // 默认选择"通过"
	acceptanceForm.acceptanceRemarks = ''
	acceptanceVisible.value = true
	nextTick(() => {
		if (acceptanceFormRef.value) {
			acceptanceFormRef.value.clearValidate()
		}
	})
}

// 保存验收
const saveAcceptance = async () => {
	if (!acceptanceFormRef.value) {
		return
	}
	try {
		await acceptanceFormRef.value.validate()
		proxy.$modal.confirm('确定保存验收信息?').then(() => {
			materialWarehouseInApi.acceptance({
				id: acceptanceForm.id,
				acceptanceStatus: acceptanceForm.acceptanceStatus,
				acceptanceRemarks: acceptanceForm.acceptanceRemarks,
			}).then(res => {
				if (res.code === '0000') {
					proxy.$message.success(res.msg || '验收成功')
					acceptanceVisible.value = false
					getList(queryParams.value)
				} else {
					proxy.$message.error(res.msg || '验收失败')
				}
			}).catch(err => {
				proxy.$message.error(err.msg || '验收失败')
			})
		})
	} catch (error) {
		// 表单验证失败
		console.log('表单验证失败', error)
	}
}

// 按钮列表（根据选中行的验收状态动态显示）
const buttonList = computed(() => {
	const buttons = [
		// 搜索区域的按钮
		{
			label: '新建',
			type: 'primary',
			icon: 'Plus',
			click: add,
			permission: 'equipment:materialWarehouseIn:add',
		},
	]

	// 只有待验收状态（0或null/undefined）才显示验收按钮
	if (clickRow.value && clickRow.value.id) {
		const acceptanceStatus = clickRow.value.acceptanceStatus
		const canAcceptance = acceptanceStatus === null || acceptanceStatus === undefined || acceptanceStatus === 0
		if (canAcceptance) {
			buttons.push({
				label: '验收',
				type: 'primary',
				icon: 'view',
				click: () => {
					if (!clickRow.value || !clickRow.value.id) {
						proxy.$message.warning('请先选择要验收的入库单')
						return
					}
					handleAcceptance(clickRow.value)
				},
				permission: 'equipment:materialWarehouseIn:acceptance',
			})
		}
	}

	return buttons
})

init()
</script>
<style scoped>
/* 修复展开行明细表格样式 - 确保在正常文档流中 */
.detail-table-wrapper {
	padding: 10px;
	background: #f5f7fa;
}
</style>

