<!-- 物资申报表格（用于出库申请时选择） -->
<template>
	<BaseTable
		ref="baseTableRef"
		:showSearchHeader="true"
		:selectData="selectData"
		:searchClick="getList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:syncResize="true"
		:total="total"
		:tableHeight="tableHeight"
		:checkbox-config="checkboxConfig"
		:expand-config="{ trigger: 'default', accordion: true }"
		@checkbox-change="checkboxChange"
		@selectAllChangeEvent="selectAllChangeEvent"
	>
		<template #expand="{ row }">
			<DetailTable :row="row" />
		</template>
	</BaseTable>
</template>

<script setup name="applicationTableForWarehouseOut">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import materialApplicationApi from '@/api/equipment/materialApplication/index'
import { ElTable, ElTableColumn } from 'element-plus'

// 接收仓库ID作为props
const props = defineProps({
	warehouseId: {
		type: Number,
		default: null,
	},
})

//查询
const baseTableRef = ref()
const total = ref()
const tableHeight = reactive(window.innerHeight - 280)

const getList = e => {
	const params = {
		...queryParams.value,
		...e,
	}
	// 如果有仓库ID，添加到查询参数中（用于查询库存数量）
	if (props.warehouseId) {
		params.warehouseId = props.warehouseId
	}
	materialApplicationApi.getListWithDetails(params).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

//顶部 搜索表单
const selectData = reactive([
	{
		name: '申请单号',
		type: 'input',
		modelValue: 'applicationNo',
		span: 8,
	},
	{
		name: '申报主题',
		type: 'input',
		modelValue: 'applicationTitle',
		span: 8,
	},
	{
		name: '申报类型',
		type: 'select',
		modelValue: 'applicationTypeCode',
		span: 8,
		dataConfig: {
			url: '/api/internal/public/getDictListByType/APPLICATION_TYPE',
		},
	},
])

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})

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
		// 格式化金额（千分位）
		const formatAmount = value => {
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
						h(ElTableColumn, {
							prop: 'applicationQuantity',
							label: '申报数量',
							align: 'right',
							width: 100,
							formatter: row => {
								return row.applicationQuantity != null ? row.applicationQuantity : '-'
							},
						}),
						h(ElTableColumn, { prop: 'unit', label: '单位', align: 'center', width: 80 }),
						h(ElTableColumn, {
							prop: 'estimatedPrice',
							label: '估价(元)',
							align: 'right',
							width: 100,
							formatter: row => {
								return row.estimatedPrice != null ? row.estimatedPrice : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'amount',
							label: '金额(元)',
							align: 'right',
							width: 120,
							formatter: row => {
								return row.amount != null ? row.amount : '-'
							},
						}),
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

const tableData = ref([])
const tableColumns = reactive([
	{ label: '', type: 'checkbox', width: 50 },
	{
		prop: 'applicationNo',
		label: '申报CODE',
		minWidth: 200,
	},
	{
		prop: 'applicationTitle',
		label: '申报主题',
		minWidth: 150,
	},
	{
		prop: 'applicationTypeName',
		label: '申报类型',
		width: 120,
	},
	{
		prop: 'deptName',
		label: '申报者所在部门',
		minWidth: 220,
	},
	{
		prop: 'createByName',
		label: '申报者',
		width: 150,
	},
	{
		prop: 'createTime',
		label: '申报时间',
		width: 150,
		isTime: true,
	},
])

// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({}) => {
		// 返回可选的单选框
		return true
	},
}

// 复选框选中
const checkData = ref([])
const checkboxChange = res => {
	checkData.value = res
}
const selectAllChangeEvent = res => {
	checkData.value = res
}

const init = initDate => {
	if (initDate) {
		// 可以在这里初始化搜索条件
	}
}

defineExpose({
	getList,
	checkData,
	queryParams,
	tableData,
	init,
})
</script>

<style scoped>
/* 修复展开行明细表格样式 - 确保在正常文档流中 */
.detail-table-wrapper {
	padding: 10px;
	background: #f5f7fa;
}
</style>
