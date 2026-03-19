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
			:expandConfig="{ trigger: 'default', accordion: true }"
			:cellClickEvent="cellClickEvent"
		>
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
						@click="save"
						v-hasPermi="['equipment:materialOutApplication:add', 'equipment:materialOutApplication:update']"
					>
						保存
					</el-button>
				</template>
			</div>
		</template>
	</el-drawer>
</template>
<script setup name="materialWarehouseOutApplication">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import { ref, reactive, nextTick, h, getCurrentInstance, toRaw, watch } from 'vue'
import { ElButton, ElTag, ElTable, ElTableColumn } from 'element-plus'
import { Edit, View, Delete, Promotion, Histogram } from '@element-plus/icons-vue'
import DropDown from '@/components/DropDown/newIndex.vue'
import materialOutApplicationApi from '@/api/equipment/materialWarehouseOutApplication/index'
import { useRoute, useRouter } from 'vue-router'
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'
const { proxy } = getCurrentInstance()

const route = useRoute()
const router = useRouter()

const { startProcess, loading } = useProcessStarter()

const tableData = ref([])
const title = ref('')
const total = ref('')
const applicationVisible = ref(false)
const detailRef = ref(null)
const isAdd = ref(false)
const clickRow = ref(null)

const baseTable = ref(null)
const selectData = reactive([
	{ name: '领料单号', type: 'input', modelValue: 'warehouseOutNo', span: 8 },
	{ name: '领料主题', type: 'input', modelValue: 'warehouseOutTitle', span: 8 },
	{
		name: '状态',
		type: 'select',
		modelValue: 'processStatus',
		span: 8,
		selectData: [
			{ value: '0', label: '未发起' },
			{ value: '1', label: '审批中' },
			{ value: '2', label: '审批通过' },
			{ value: '3', label: '审批不通过' },
			{ value: '4', label: '已办结' },
			{ value: '5', label: '作废' },
		],
	},
])

const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

const DetailTable = {
	props: ['row', 'onRowCountChange'],
	setup(props) {
		const detailList = ref([])
		const loading = ref(false)
		const loaded = ref(false)

		const loadDetailList = async () => {
			if (loaded.value) {
				return
			}
			loading.value = true
			loaded.value = true
			try {
				const res = await materialOutApplicationApi.getById(props.row.id)
				if (res.code === '0000' && res.data) {
					detailList.value = res.data.detailList || []
					if (props.onRowCountChange && typeof props.onRowCountChange === 'function') {
						nextTick(() => {
							props.onRowCountChange(detailList.value.length)
						})
					}
				}
			} catch (error) {
				console.error('加载明细数据失败:', error)
				loaded.value = false
			} finally {
				loading.value = false
			}
		}

		loadDetailList()

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
						h(ElTableColumn, {
							prop: 'applicationQuantity',
							label: '申请数量',
							align: 'right',
							width: 120,
							formatter: row => {
								return row.applicationQuantity != null ? row.applicationQuantity : '-'
							},
						}),
						h(ElTableColumn, { prop: 'brand', label: '品牌', width: 120 }),
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
					],
				),
			])
		}
	},
}

const tableColumns = ref([
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
					row.warehouseOutNo,
				),
			]
		},
	},
	{ label: '领料主题', prop: 'warehouseOutTitle', align: 'left', width: 180 },
	{ label: '仓库名称', prop: 'warehouseName', align: 'left' },
	{ label: '创建人', prop: 'createByName', align: 'left', width: 150 },
	{ label: '创建时间', prop: 'createTime', align: 'center', width: 150 },
	{
		label: '状态',
		prop: 'processStatus',
		align: 'center',
		width: 120,
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
					permission: 'equipment:materialOutApplication:delete',
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
	startPage: 1,
	pageSize: 20,
})

const getList = e => {
	queryParams.value = e || queryParams.value
	clickRow.value = null
	materialOutApplicationApi.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

const add = () => {
	applicationVisible.value = true
	title.value = '新增'
	isAdd.value = true

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		detailRef.value.init(true)
	})
}

const viewDetail = row => {
	const viewRow = row
	applicationVisible.value = true
	title.value = '查看详情'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = true
		materialOutApplicationApi.getById(viewRow.id).then(res => {
			proxy.setFormData(detailRef.value.formData.form, res.data)
			detailRef.value.editDetailList(res.data.detailList || [])
			detailRef.value.init(false)
		})
	})
}

const edit = row => {
	const editRow = row
	applicationVisible.value = true
	title.value = '编辑'
	isAdd.value = false

	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formDisabled = false
		materialOutApplicationApi.getById(editRow.id).then(res => {
			proxy.setFormData(detailRef.value.formData.form, res.data)
			detailRef.value.editDetailList(res.data.detailList || [])
			detailRef.value.init(false)
		})
	})
}

const save = async () => {
	if (await detailRef.value.validate()) {
		let { form, detailList } = JSON.parse(JSON.stringify(toRaw(detailRef.value.formData)))

		const validDetailList = detailList.filter(item => item.materialId != null && item.materialId !== '')
		if (validDetailList.length === 0) {
			proxy.$message.warning('至少需要添加一条明细数据')
			return
		}

		detailList = validDetailList.map(item => {
			const newItem = { ...item }
			if (newItem.equipIds != null && newItem.equipIds !== '') {
				newItem.equipIds = String(newItem.equipIds)
			} else {
				newItem.equipIds = null
			}
			if (newItem.equipNames != null && newItem.equipNames !== '') {
				newItem.equipNames = String(newItem.equipNames)
			} else {
				newItem.equipNames = null
			}
			return newItem
		})

		proxy.$modal.confirm('确定保存?').then(res => {
			let params = {
				...form,
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

const submitMaterialOutApplicationProcess = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	console.log('submitMaterialOutApplicationProcess:', processDefinitionId, variables, startUserSelectAssignees)
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return materialOutApplicationApi.outApplicationStart(params)
}

const handleSubmit = row => {
	proxy.$modal
		.confirm('确定发起审批流程？')
		.then(() => {
			materialOutApplicationApi
				.getById(row.id)
				.then(res => {
					if (res && res.data) {
						startProcess({
							rowData: res.data,
							businessId: route.meta?.menuId,
							businessTypeCode: 'bpm:equipment:controller:outApplicationStart',
							businessSubmit: submitMaterialOutApplicationProcess,
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

const handleHistory = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.procInstId,
		},
	})
}

const init = async () => {
	getList(null)
}

const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:materialOutApplication:add',
	},
])

init()
</script>
<style scoped>
.detail-table-wrapper {
	padding: 10px;
	background: #f5f7fa;
}
</style>
