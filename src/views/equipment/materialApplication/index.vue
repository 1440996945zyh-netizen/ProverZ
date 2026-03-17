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
			<!-- 1. 展开行插槽：展示明细子表格 -->
			<template #expand="{ row }">
				<DetailTable :row="row" />
			</template>
		</BaseTable>
	</div>

	<el-drawer v-model="applicationVisible" :title="title" size="80%">
		<detail ref="detailRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="applicationVisible = false">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
				<template v-if="title !== '查看详情'">
					<el-button
						type="primary"
						@click="save('1')"
						v-hasPermi="['equipment:materialApplication:add', 'equipment:materialApplication:update']"
					>
						保存
					</el-button>
					<!-- <el-button
						type="success"
						@click="save('2')"
						v-hasPermi="['equipment:materialApplication:add', 'equipment:materialApplication:update']"
						v-if="isAdd || isEdit || isRejected"
					>
						保存并上报
					</el-button> -->
				</template>
			</div>
		</template>
	</el-drawer>

	<!-- 审批弹窗 -->
	<!-- <el-dialog v-model="approvalVisible" title="审批" width="500px">
		<el-form :model="approvalForm" label-width="100px">
			<el-form-item label="审批结果">
				<el-radio-group v-model="approvalForm.status">
					<el-radio label="3">通过</el-radio>
					<el-radio label="4">驳回</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="审批备注">
				<el-input
					v-model="approvalForm.approvalRemark"
					type="textarea"
					:rows="4"
					placeholder="请输入审批备注"
					maxlength="500"
					show-word-limit
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="approvalVisible = false">取消</el-button>
				<el-button type="primary" @click="handleApprove">确定</el-button>
			</div>
		</template>
	</el-dialog> -->
</template>
<script setup name="materialApplication">
/**--------------引用------------ */
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, onMounted, h, getCurrentInstance, toRaw, computed, watch } from 'vue'
import {
	ElButton,
	ElTag,
	ElTable,
	ElTableColumn,
	ElDialog,
	ElForm,
	ElFormItem,
	ElRadioGroup,
	ElRadio,
	ElInput,
	ElTooltip,
} from 'element-plus'
import { Edit, View, Delete, Promotion, Histogram } from '@element-plus/icons-vue'
import DropDown from '@/components/DropDown/newIndex.vue'
import materialApplicationApi from '@/api/equipment/materialApplication/index'
import publicApi from '@/api/public/index'
import { useRoute, useRouter } from 'vue-router'
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

const route = useRoute()
const router = useRouter()

const { startProcess, loading } = useProcessStarter()

/**--------------变量定义------------ */
const tableData = ref([]) // 表数据
const title = ref('') // 详情标题
const total = ref('') // 数据总数
const applicationVisible = ref(false) // 是否显示详情
const detailRef = ref(null) // 明细组件ref
const isAdd = ref(false) // 是否新增
const isRejected = ref(false) // 是否为驳回状态修改
const isEdit = ref(false) // 是否为编辑状态
// const approvalVisible = ref(false) // 是否显示审批弹窗
// const approvalForm = reactive({
// 	id: null,
// 	status: '3', // 默认通过
// 	approvalRemark: '',
// })
const clickRow = ref(null) // 点击的行数据

const baseTable = ref(null)
const selectData = reactive([
	// 查询条件
	{ name: '申请单号', type: 'input', modelValue: 'applicationNo', span: 8 },
	{ name: '申报主题', type: 'input', modelValue: 'applicationTitle', span: 8 },
	// {
	// 	name: '申报类型',
	// 	type: 'select',
	// 	modelValue: 'applicationTypeCode',
	// 	span: 8,
	// 	dataConfig: {
	// 		url: '/api/internal/public/getDictListByType/APPLICATION_TYPE',
	// 	},
	// },
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
	// // 更新审批按钮状态
	// updateApprovalButton()
}

// // 更新审批按钮状态
// const updateApprovalButton = () => {
// 	if (clickRow.value && clickRow.value.status === '2') {
// 		// // 状态为等待审批，启用按钮
// 		// buttonList[1].disabled = false
// 	} else {
// 		// // 其他状态，禁用按钮
// 		// buttonList[1].disabled = true
// 	}
// }

// // 批量审批处理（从右上角按钮点击）
// const handleBatchApproval = () => {
// 	// 检查是否有选中的行
// 	if (!clickRow.value) {
// 		proxy.$message.warning('请先选择要审批的记录')
// 		return
// 	}
// 	// 检查选中的行状态是否为等待审批
// 	if (clickRow.value.status !== '2') {
// 		proxy.$message.warning('只能审批状态为"等待审批"的记录')
// 		return
// 	}
// 	// 打开审批弹窗
// 	openApprovalDialog(clickRow.value)
// }

// 打开审批弹窗
// const openApprovalDialog = row => {
// 	approvalForm.id = row.id
// 	approvalForm.status = '3' // 默认通过
// 	approvalForm.approvalRemark = ''
// 	approvalVisible.value = true
// }
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
				const res = await materialApplicationApi.getById(props.row.id)
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
			//console.log('DetailTable render函数被调用，loading:', loading.value, 'detailList.length:', detailList.value.length)
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
						h(ElTableColumn, { prop: 'suggestedBrand', label: '建议品牌', width: 150 }),
						h(ElTableColumn, { prop: 'applicationQuantity', label: '申报数量', align: 'right', width: 100 }),
						h(ElTableColumn, { prop: 'unit', label: '单位', align: 'center', width: 80 }),
						h(ElTableColumn, { prop: 'estimatedPrice', label: '估价(元)', align: 'right', width: 100 }),
						h(ElTableColumn, { prop: 'amount', label: '金额(元)', align: 'right', width: 120 }),
						h(ElTableColumn, {
							prop: 'flowType',
							label: '流向类型',
							align: 'center',
							width: 100,
							formatter: row => {
								if (row.flowType === '01') {
									return '设备'
								} else if (row.flowType === '02') {
									return '其他'
								}
								return row.flowType || '-'
							},
						}),
						h(ElTableColumn, { prop: 'flowDirection', label: '流向', width: 150 }),
						h(ElTableColumn, {
							prop: 'equipNames',
							label: '设备',
							width: 200,
							showOverflowTooltip: true,
							formatter: row => {
								if (row.equipNames) {
									if (typeof row.equipNames === 'string') {
										return row.equipNames || '-'
									} else if (Array.isArray(row.equipNames)) {
										return row.equipNames.length > 0 ? row.equipNames.join('，') : '-'
									}
								}
								return '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'supplyTimeLimit',
							label: '供货时限',
							align: 'center',
							width: 150,
							formatter: row => {
								return row.supplyTimeLimit || '-'
							},
						}),
						h(ElTableColumn, { prop: 'specificationDesc', label: '规格描述', width: 150 }),
					],
				),
			])
		}
	},
}

const tableColumns = ref([
	// 表头列

	{ label: '序号', type: 'seq', width: 50, align: 'center' },
	{
		label: '申请单号',
		prop: 'applicationNo',
		align: 'left',
		width: 150,
		render: row => {
			if (!row || !row.applicationNo) {
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
					row.applicationNo,
				),
			]
		},
	},
	{ label: '申报主题', prop: 'applicationTitle', align: 'left', width: 150 },
	{ label: '申报类型', prop: 'applicationTypeName', align: 'center', width: 120 },
	{ label: '定点服务类别', prop: 'fixedServiceCategoryName', align: 'center', width: 150 },
	{ label: '申报部门', prop: 'deptName', align: 'center', minWidth: 220 },
	{ label: '申报人', prop: 'createByName', align: 'left', width: 100 },
	{ label: '申报时间', prop: 'createTime', align: 'center', width: 150 },
	// { label: '审批人', prop: 'approvalByName', align: 'left', width: 100 },
	// { label: '审批时间', prop: 'approvalTime', align: 'center', isTime: true, width: 150 },
	// {
	// 	label: '审批备注',
	// 	prop: 'approvalRemark',
	// 	align: 'left',
	// 	minWidth: 150,
	// 	showOverflow: 'tooltip', // 内容过长时显示tooltip
	// },
	{
		label: '状态',
		prop: 'processStatus',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			const statusMap = {
				0: { label: '未发起', type: 'info' },
				1: { label: '审批中', type: 'warning' },
				2: { label: '审批通过', type: 'success' },
				3: { label: '审批不通过', type: 'danger' },
				4: { label: '已办结', type: 'success' },
				5: { label: '作废', type: 'danger' },
			}
			const status = statusMap[row.processStatus] || { label: '未知', type: 'info' }
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
					},
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 120,
		fixed: 'right',
		align: 'center',
		render: row => {
			const dropDownList = []

			dropDownList.push(
				{
					name: '详情',
					command: '详情',
					click: () => viewDetail(row),
					icon: View,
				},
				{
					name: '编辑',
					command: '编辑',
					click: () => edit(row),
					icon: Edit,
					disabled: row.processStatus !== '0',
				},
				{
					name: '发起',
					command: '发起',
					click: () => handleSubmit(row),
					icon: Promotion,
					disabled: row.processStatus !== '0',
				},
				{
					name: '审批历史',
					command: '审批历史',
					click: () => handleHistory(row),
					icon: Histogram,
					type: 'primary',
				},
				{
					name: '删除',
					command: '删除',
					click: () => handleDelete(row),
					type: 'danger',
					icon: Delete,
					permission: 'equipment:materialApplication:delete',
					disabled: row.processStatus !== '0',
				},
			)

			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }),
					},
				),
			]
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
	// buttonList[1].disabled = true // 查询时禁用审批按钮
	clickRow.value = null // 清空选中的行
	materialApplicationApi.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

// 新增事件
const add = () => {
	applicationVisible.value = true
	title.value = '新增'
	isAdd.value = true
	isEdit.value = false
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
	isEdit.value = false
	isRejected.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = true // 设置为只读
		materialApplicationApi.getById(viewRow.id).then(res => {
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
	isEdit.value = true

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		materialApplicationApi.getById(editRow.id).then(res => {
			const data = res.data

			proxy.setFormData(detailRef.value.formData.form, data)
			detailRef.value.editDetailList(res.data.detailList || [])
			detailRef.value.init(false)
		})
	})
}

// // 参照申报事件
// const referenceApplication = row => {
// 	const referenceRow = row
// 	applicationVisible.value = true
// 	title.value = '参照申报'
// 	isAdd.value = true // 设置为新增模式，保存时新增数据
// 	isEdit.value = false
// 	isRejected.value = false

// 	nextTick(() => {
// 		detailRef.value.resetForm()
// 		detailRef.value.formDisabled = false
// 		materialApplicationApi.getById(referenceRow.id).then(res => {
// 			// 清空ID和申请单号，这样保存时会新增数据
// 			const data = JSON.parse(JSON.stringify(res.data))
// 			data.id = null // 清空ID，走新增流程
// 			data.applicationNo = '' // 清空申请单号，后端会自动生成
// 			// 重新生成申报主题
// 			const now = new Date()
// 			const year = now.getFullYear()
// 			const month = String(now.getMonth() + 1).padStart(2, '0')
// 			const day = String(now.getDate()).padStart(2, '0')
// 			data.applicationTitle = `物资申报${year}${month}${day}`
// 			// 清空状态
// 			data.status = ''
// 			// 清空审核信息
// 			data.approvalRemark = ''
// 			data.approvalBy = null
// 			data.approvalByName = ''
// 			data.approvalTime = null

// 			proxy.setFormData(detailRef.value.formData.form, data)
// 			// 清空明细ID，让明细也走新增流程
// 			const detailList = (res.data.detailList || []).map(item => {
// 				const newItem = JSON.parse(JSON.stringify(item))
// 				newItem.id = null // 清空明细ID
// 				newItem.applicationId = null // 清空关联的主表ID
// 				return newItem
// 			})
// 			detailRef.value.editDetailList(detailList)
// 			detailRef.value.init(false)
// 		})
// 	})
// }

// 保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		let { form, detailList } = JSON.parse(JSON.stringify(toRaw(detailRef.value.formData)))

		// 验证：必须至少有一条有效明细（新增和编辑都需要）
		// 过滤掉空行（没有选择物资名称的行）
		const validDetailList = detailList.filter(item => item.materialCodeId != null && item.materialCodeId !== '')
		if (validDetailList.length === 0) {
			proxy.$message.warning('至少需要添加一条明细数据')
			return
		}
		// 处理设备ID和设备名称：将数组转换为逗号分隔的字符串
		detailList = validDetailList.map(item => {
			item.equipIds = item.equipIds ? item.equipIds.join(',') : ''
			item.equipNames = item.equipNames ? item.equipNames.join(',') : ''
			return item
		})

		proxy.$modal.confirm('确定保存?').then(res => {
			let params = {
				...form,
				detailList: detailList,
			}
			if (params.id == null) {
				materialApplicationApi.add(params).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					applicationVisible.value = false
				})
			} else {
				materialApplicationApi.update(params).then(res => {
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
			materialApplicationApi.delete(deleteRow.id).then(res => {
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

// // 审批事件
// const handleApprove = () => {
// 	if (!approvalForm.status) {
// 		proxy.$message.warning('请选择审批结果')
// 		return
// 	}
// 	const statusName = approvalForm.status === '3' ? '审批通过' : '驳回'
// 	proxy.$modal.confirm(`确定${statusName}?`).then(() => {
// 		materialApplicationApi
// 			.approve(approvalForm.id, approvalForm.status, approvalForm.approvalRemark)
// 			.then(res => {
// 				proxy.$message.success(res.msg)
// 				approvalVisible.value = false
// 				clickRow.value = null // 清空选中行
// 				buttonList[1].disabled = true // 禁用审批按钮
// 				getList(queryParams.value)
// 			})
// 			.catch(err => {
// 				proxy.$message.error(err.msg || '审批失败')
// 			})
// 	})
// }

// 初始化方法
const init = async () => {
	getList(null)
}

// 发起流程
const submitMaterialApplicationProcess = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	console.log('submitMaterialApplicationProcess:', processDefinitionId, variables, startUserSelectAssignees)
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return materialApplicationApi.materialApplicationStart(params)
}

const handleSubmit = row => {
	proxy.$modal
		.confirm('确定发起审批流程？')
		.then(() => {
			materialApplicationApi
				.getById(row.id)
				.then(res => {
					if (res && res.data) {
						startProcess({
							rowData: res.data,
							businessId: route.meta?.menuId,
							businessTypeCode: 'bpm:equipment:controller:materialApplyStart',
							businessSubmit: submitMaterialApplicationProcess,
							onSuccess() {
								proxy.$modal.msgSuccess('发起成功')
								getList(queryParams.value)
							},
							onError(err) {
								proxy.$modal.msgError(err.message)
							},
						})
					}
				})
				.catch(error => {
					console.error('获取详情失败:', error)
					proxy.$modal.msgError('获取详情失败')
				})
		})
		.catch(() => {})
}

// 审批历史
const handleHistory = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.procInstId,
		},
	})
}

// 按钮列表
const buttonList = reactive([
	// 搜索区域的按钮
	{
		label: '新增', // 按钮名称
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:materialApplication:add',
	},

	// {
	// 	label: '审批',
	// 	type: 'primary',
	// 	icon: 'View',
	// 	click: handleBatchApproval,
	// 	permission: 'equipment:materialApplication:approve',
	// 	disabled: true, // 默认禁用，点击行后根据状态启用
	// },
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
