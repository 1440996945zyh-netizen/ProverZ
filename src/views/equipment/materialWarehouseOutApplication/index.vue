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

	<el-drawer v-model="applicationVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="applicationVisible = false">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
				<template v-if="title !== '查看详情'">
					<el-button type="primary" @click="save('1')" v-hasPermi="['equipment:materialOutApplication:add', 'equipment:materialOutApplication:update']">保存</el-button>
					<el-button type="success" @click="save('2')" v-hasPermi="['equipment:materialOutApplication:add', 'equipment:materialOutApplication:update']" v-if="isAdd || isRejected || (title === '编辑' && currentEditStatus === '1')">保存并上报</el-button>
				</template>
			</div>
		</template>
	</el-drawer>

	<!-- 审核对话框 -->
	<el-dialog v-model="auditDialogVisible" title="审批" width="500px">
		<el-form :model="auditForm" label-width="100px">
			<el-form-item label="审批结果" required>
				<el-radio-group v-model="auditForm.status">
					<el-radio label="3">通过</el-radio>
					<el-radio label="4">不通过</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="审批备注">
				<el-input
					v-model="auditForm.auditRemark"
					type="textarea"
					:rows="4"
					placeholder="请输入审核备注"
					maxlength="500"
					show-word-limit
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="auditDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="submitAudit">确定</el-button>
			</div>
		</template>
	</el-dialog>
</template>
<script setup name="materialWarehouseOutApplication">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance, toRaw, watch } from 'vue'
import { ElButton, ElTag, ElTable, ElTableColumn } from 'element-plus'
import materialOutApplicationApi from '@/api/equipment/materialWarehouseOutApplication/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

/**--------------变量定义------------ */
const tableData = ref([]) // 表数据
const title = ref('') // 详情标题
const total = ref('') // 数据总数
const applicationVisible = ref(false) // 是否显示详情
const detailRef = ref(null) // 明细组件ref
const isAdd = ref(false) // 是否新增
const isSubmit = ref(false) // 是否为上报模式
const isRejected = ref(false) // 是否为驳回状态修改
const currentEditStatus = ref('') // 当前编辑记录的状态
const clickRow = ref(null) // 点击的行数据
const auditDialogVisible = ref(false) // 是否显示审核对话框
const auditForm = ref({
	status: '3', // '3'-审批通过，'4'-驳回
	auditRemark: '', // 审核备注
})
const currentAuditRow = ref(null) // 当前审核的行数据

const baseTable = ref(null)
const selectData = reactive([
	// 查询条件
	{ name: '领料单号', type: 'input', modelValue: 'warehouseOutNo', span: 8 },
	{ name: '领料主题', type: 'input', modelValue: 'warehouseOutTitle', span: 8 },
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		selectData: [
			{ value: '1', label: '暂存' },
			{ value: '2', label: '等待审批' },
			{ value: '3', label: '审批通过' },
			{ value: '4', label: '驳回' },
		],
	},
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	// 更新审核按钮状态
	updateAuditButton()
}

// 更新审核按钮状态
const updateAuditButton = () => {
	if (clickRow.value && clickRow.value.status === '2') {
		// 状态为等待审批，启用按钮
		buttonList[1].disabled = false
	} else {
		// 其他状态，禁用按钮
		buttonList[1].disabled = true
	}
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
				const res = await materialOutApplicationApi.getById(props.row.id)
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
					h(ElTableColumn, { prop: 'specificationModel', label: '规格型号', width: 150 }),
					h(ElTableColumn, { prop: 'unitName', label: '计量单位', align: 'center', width: 100 }),
					h(ElTableColumn, { 
						prop: 'applicationQuantity', 
						label: '申请数量', 
						align: 'right', 
						width: 120,
						formatter: (row) => {
							return row.applicationQuantity != null ? row.applicationQuantity : '-'
						}
					}),
					h(ElTableColumn, { prop: 'brand', label: '品牌', width: 120 }),
					h(ElTableColumn, {
						prop: 'flowType',
						label: '流向类型',
						align: 'center',
						width: 100,
						formatter: (row) => {
							if (row.flowType === '01') {
								return '设备'
							} else if (row.flowType === '02') {
								return '其他'
							}
							return row.flowType || '-'
						}
					}),
					h(ElTableColumn, { prop: 'flowDirection', label: '流向', width: 150 }),
					h(ElTableColumn, {
						prop: 'equipNames',
						label: '设备',
						width: 200,
						showOverflowTooltip: true,
						formatter: (row) => {
							if (row.equipNames) {
								if (typeof row.equipNames === 'string') {
									return row.equipNames || '-'
								} else if (Array.isArray(row.equipNames)) {
									return row.equipNames.length > 0 ? row.equipNames.join('，') : '-'
								}
							}
							return '-'
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
		label: '领料单号',
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
					row.warehouseOutNo
				),
			]
		},
	},
	{ label: '领料主题', prop: 'warehouseOutTitle', align: 'left', width: 180,},
	{ label: '仓库名称', prop: 'warehouseName', align: 'left', },
	{ label: '创建人', prop: 'createByName', align: 'left', width: 150, },
	{ label: '创建时间', prop: 'createTime',  align: 'center' ,width: 150,},
	{
		label: '审批人',
		prop: 'acceptancePersonName',
		align: 'left',
		width: 150,
	},
	{
		label: '审批时间',
		prop: 'acceptanceTime',
		align: 'center',
		width: 150,
	},
	{
		label: '审批备注',
		prop: 'auditRemark',
		align: 'center',
	},
	{
		label: '状态',
		prop: 'status',
		align: 'center',
    width: 120,
		fixed: 'right',
		render: row => {
			const statusMap = {
				'1': { label: '暂存', type: 'info' },
				'2': { label: '等待审批', type: 'warning' },
				'3': { label: '审批通过', type: 'success' },
				'4': { label: '驳回', type: 'danger' },
			}
			const status = statusMap[row.status] || { label: '未知', type: 'info' }
			return [
				h(
					ElTag,
					{
						type: status.type,
					},
					{
						default: () => {
							return status.label
						},
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 200,
		fixed: 'right',
		align: 'center',
		render: row => {
			const buttons = []

			// 编辑按钮始终显示，根据状态禁用
			// 状态为1（暂存）或4（驳回）时可以编辑
			const canEdit = row.status === '1' || row.status === '4'
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
						disabled: !canEdit, // 根据状态禁用
					},
					{ default: () => '编辑' }
				)
			)

			// 删除按钮始终显示，根据状态禁用
			// 只有状态不是"审批通过"（状态不是'3'）时可以删除
			const canDelete = row.status !== '3'
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
						permission: 'equipment:materialOutApplication:delete',
						disabled: !canDelete, // 根据状态禁用
					},
					{ default: () => '删除' }
				)
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
	buttonList[1].disabled = true // 查询时禁用审核按钮
	materialOutApplicationApi.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

// 新增事件
const add = () => {
	applicationVisible.value = true
	title.value = '新增'
	isAdd.value = true
	isSubmit.value = false
	isRejected.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		detailRef.value.init(true)
	})
}

// 查看详情事件（只读）
const viewDetail = row => {
	const viewRow = row
	applicationVisible.value = true
	title.value = '查看详情'
	isAdd.value = false
	isSubmit.value = false
	isRejected.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = true // 设置为只读
		materialOutApplicationApi.getById(viewRow.id).then(res => {
			proxy.setFormData(detailRef.value.formData.form, res.data)
			detailRef.value.editDetailList(res.data.detailList || [])
			detailRef.value.init(false)
		})
	})
}

// 编辑事件
const edit = row => {
	const editRow = row
	applicationVisible.value = true
	title.value = '编辑'
	isAdd.value = false
	isSubmit.value = false
	// 判断是否为驳回状态
	isRejected.value = editRow.status === '4'
	currentEditStatus.value = editRow.status || ''

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		materialOutApplicationApi.getById(editRow.id).then(res => {
			const data = res.data
			// 如果是驳回状态，清空审批信息
			if (editRow.status === '4') {
				data.auditRemark = null
				data.acceptancePersonId = null
				data.acceptancePersonName = null
				data.acceptanceTime = null
			}
			proxy.setFormData(detailRef.value.formData.form, data)
			currentEditStatus.value = res.data.status || ''
			detailRef.value.editDetailList(res.data.detailList || [])
			detailRef.value.init(false)
		})
	})
}

// 上报事件（打开抽屉，设置为上报模式）
const handleSubmit = row => {
	const submitRow = row
	applicationVisible.value = true
	title.value = '上报'
	isAdd.value = false
	isSubmit.value = true
	currentEditStatus.value = submitRow.status || ''

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		materialOutApplicationApi.getById(submitRow.id).then(res => {
			proxy.setFormData(detailRef.value.formData.form, res.data)
			currentEditStatus.value = res.data.status || ''
			detailRef.value.editDetailList(res.data.detailList || [])
			detailRef.value.init(false)
		})
	})
}

// 保存事件
const save = async (status) => {
	if (await detailRef.value.validate()) {
		let { form, detailList } = JSON.parse(JSON.stringify(toRaw(detailRef.value.formData)))

		// 验证：必须至少有一条有效明细（新增和编辑都需要）
		// 过滤掉空行（没有选择物资名称的行）
		const validDetailList = detailList.filter(item => item.materialId != null && item.materialId !== '')
		if (validDetailList.length === 0) {
			proxy.$message.warning('至少需要添加一条明细数据')
			return
		}

		// 处理 equipIds 和 equipNames（单选，确保是字符串类型）
		detailList = validDetailList.map(item => {
			const newItem = { ...item }
			// 转换 equipIds（单选，单个值）
			if (newItem.equipIds != null && newItem.equipIds !== '') {
				newItem.equipIds = String(newItem.equipIds)
			} else {
				newItem.equipIds = null
			}
			// 转换 equipNames（单选，单个值）
			if (newItem.equipNames != null && newItem.equipNames !== '') {
				newItem.equipNames = String(newItem.equipNames)
			} else {
				newItem.equipNames = null
			}
			return newItem
		})

		const confirmText = status === '2' ? '确定保存并上报?' : '确定保存?'
		proxy.$modal.confirm(confirmText).then(res => {
			let params = {
				...form,
				status: status, // 设置状态：1-暂存，2-等待审批
				detailList: detailList,
			}
			if (params.id == null) {
				materialOutApplicationApi.add(params).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					applicationVisible.value = false
				})
			} else {
				materialOutApplicationApi.update(params).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					applicationVisible.value = false
				})
			}
		})
	}
}

// 删除事件
const handleDelete = row => {
	const deleteRow = row
	proxy.$modal
		.confirm('确定删除?')
		.then(res => {
			materialOutApplicationApi.delete(deleteRow.id).then(res => {
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

// 批量审核处理（从右上角按钮点击）
const handleBatchAudit = () => {
	// 检查权限（如果需要）
	// if (!proxy.$auth.hasPermi('equipment:materialOutApplication:audit')) {
	// 	proxy.$message.warning('没有权限')
	// 	return
	// }
	// 检查是否有选中的行
	if (!clickRow.value) {
		proxy.$message.warning('请先选择要审核的记录')
		return
	}
	// 检查选中的行状态是否为等待审批
	if (clickRow.value.status !== '2') {
		proxy.$message.warning('只能审核状态为"等待审批"的记录')
		return
	}
	// 打开审核弹窗
	handleAudit(clickRow.value)
}

// 审核事件
const handleAudit = row => {
	currentAuditRow.value = row
	auditForm.value = {
		status: '3', // 默认通过
		auditRemark: '', // 清空备注
	}
	auditDialogVisible.value = true
}

// 提交审核
const submitAudit = () => {
	if (!auditForm.value.status) {
		proxy.$message.warning('请选择审核结果')
		return
	}
	const params = {
		id: currentAuditRow.value.id,
		status: auditForm.value.status,
		auditRemark: auditForm.value.auditRemark || '',
	}
	materialOutApplicationApi.audit(params).then(res => {
		if (res.code === '0000') {
			proxy.$message.success(res.msg || '审核成功')
			auditDialogVisible.value = false
			clickRow.value = null // 清空选中行
			buttonList[1].disabled = true // 禁用审核按钮
			getList(queryParams.value)
		} else {
			proxy.$message.error(res.msg || '审核失败')
		}
	}).catch(error => {
		console.error('审核失败:', error)
		proxy.$message.error('审核失败')
	})
}

// 初始化方法
const init = async () => {
	getList(null)
}

// 按钮列表
const buttonList = reactive([
	// 搜索区域的按钮
	{
		label: '新建',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:materialOutApplication:add',
	},
	{
		label: '审批',
		type: 'primary',
		icon: 'view',
		click: handleBatchAudit,
		permission: 'equipment:materialOutApplication:audit',
		disabled: true, // 默认禁用，点击行后根据状态启用
	},
])

init()
</script>
<style scoped>
/* 修复展开行明细表格样式 - 确保在正常文档流中 */
.detail-table-wrapper {
	padding: 10px;
	background: #f5f7fa;
}
</style>

