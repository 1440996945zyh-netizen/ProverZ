<!-- 物资出库申请表格（用于出库时选择） -->
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
import materialOutApplicationApi from '@/api/equipment/materialWarehouseOutApplication/index'
import { ElTable, ElTableColumn } from 'element-plus'

//查询
const baseTableRef = ref()
const total = ref()
const tableHeight = reactive(window.innerHeight - 250)

const getList = e => {
	const params = {
		...queryParams.value,
		...e,
	}
	materialOutApplicationApi.getListWithDetails(params).then(res => {
		if (res.code === '0000' && res.data) {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}

//顶部 搜索表单
const selectData = reactive([
	{
		name: '出库领料申请单号',
		type: 'input',
		modelValue: 'warehouseOutNo',
		span: 16,
	},
	{
		name: '主题',
		type: 'input',
		modelValue: 'warehouseOutTitle',
		span: 8,
	},
])

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
	warehouseId: null, // 仓库ID，从父组件传入
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
						h(ElTableColumn, {
							prop: 'stockQuantity',
							label: '库存数量',
							align: 'right',
							width: 120,
							formatter: row => {
								return row.stockQuantity != null ? row.stockQuantity : '-'
							},
						}),
						h(ElTableColumn, {
							prop: 'applicationQuantity',
							label: '申请数量',
							align: 'right',
							width: 120,
							formatter: row => {
								return row.applicationQuantity != null ? row.applicationQuantity : '-'
							},
						}),
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
		prop: 'warehouseOutNo',
		label: '出库领料申请单号',
		minWidth: 180,
	},
	{
		prop: 'warehouseOutTitle',
		label: '主题',
		minWidth: 200,
	},
	{
		prop: 'createByName',
		label: '申请人',
		minWidth: 120,
	},
])
const checkboxConfig = reactive({
	reserve: true,
	prop: 'createTime',
	range: true, // 开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({}) => {
		// 返回可选的单选框
		return true
	},
})

// 复选框变化事件
const checkboxChange = data => {
	if (data && data.records) {
		checkData.value = data.records
	} else if (data && Array.isArray(data)) {
		checkData.value = data
	}
}

// 全选变化事件
const selectAllChangeEvent = data => {
	if (data && data.records) {
		checkData.value = data.records
	} else if (data && Array.isArray(data)) {
		checkData.value = data
	}
}

// 获取选中的数据（通过BaseTable的方法）
const getSelectedData = () => {
	if (baseTableRef.value && baseTableRef.value.getSelectEvent) {
		return baseTableRef.value.getSelectEvent() || []
	}
	return checkData.value || []
}
// 复选框选中
const checkData = ref([])
// const checkboxChange = res => {
// 	checkData.value = res
// }
// const selectAllChangeEvent = res => {
// 	getSelectedData,
// 	checkData.value = res
// }

// 暴露方法给父组件
defineExpose({
	getList,
	queryParams,
	checkData,
})
</script>

<style scoped>
/* 修复展开行明细表格样式 - 确保在正常文档流中 */
.detail-table-wrapper {
	padding: 10px;
	background: #f5f7fa;
}
</style>
