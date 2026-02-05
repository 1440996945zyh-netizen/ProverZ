<template>
	<div class="app-container">
		<BaseTable
			ref="materialWarehouseTableRef"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableData="tableData"
			:tableColumns="tableColumns"
			:cellClickEvent="cellClickEvent"
			:loading="tableLoading"
			:total="total"
		/>

		<!-- 新增/编辑弹窗 -->
		<Dialog v-model:visible="open" :title="title" width="50%">
			<detail ref="detailRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm" v-hasPermi="['equipment:materialWarehouse:add', 'equipment:materialWarehouse:update']">
						确定
					</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="materialWarehouse">
import { ref, reactive, getCurrentInstance, onMounted, nextTick, toRefs, h } from 'vue'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/materialWarehouse/index'

const { proxy } = getCurrentInstance()

const materialWarehouseTableRef = ref(null)
const tableData = ref([])
const tableLoading = ref(false)
const open = ref(false)
const title = ref('')
const detailRef = ref(null)

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		warehouseCode: undefined,
		warehouseName: undefined,
		companyId: undefined,
	},
	total: 0
})
const { queryParams, total } = toRefs(data)

/* 表格数据列 */
const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 50, align: 'center' },
	{ label: '仓库编号', prop: 'warehouseCode', align: 'left', },
	{ label: '仓库名称', prop: 'warehouseName', align: 'left',  },
	{ label: '公司名称', prop: 'companyName', align: 'left',  },
	{ label: '创建人', prop: 'createByName', align: 'left',  },
	{ label: '创建时间', prop: 'createTime', align: 'center',  },
	{
		prop: '',
		label: '操作',
		width: 150,
		fixed: 'right',
		align: 'center',
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
						permission: 'equipment:materialWarehouse:update',
					},
					{
						default: () => '编辑',
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
						permission: 'equipment:materialWarehouse:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

/* 查询条件 */
const selectData = reactive([
	{
		name: '仓库编号',
		type: 'input',
		modelValue: 'warehouseCode',
		span: 12,
	},
	{
		name: '仓库名称',
		type: 'input',
		modelValue: 'warehouseName',
		span: 12,
	},
])

/* 右侧按钮 */
const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd(),
		permission: 'equipment:materialWarehouse:add',
	},
	{
		label: '导出',
		type: 'warning',
		icon: 'Download',
		click: () => handleExport(),
		permission: 'equipment:materialWarehouse:export',
	},
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	// 可以在这里处理行点击事件
}

/**
 * 查询列表
 */
const getList = (e) => {
	tableLoading.value = true
	queryParams.value = e
	api.getList(queryParams.value)
		.then(response => {
			if (response.code === '0000' && response.data) {
				tableData.value = response.data.pages || []
				total.value = response.data.totalNum || 0
			} else {
				tableData.value = []
				total.value = 0
			}
		})
		.finally(() => {
			tableLoading.value = false
		})
}

/**
 * 新增
 */
const handleAdd = () => {
	open.value = true
	title.value = '新增物资仓库'
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

/**
 * 编辑
 */
const handleUpdate = row => {
	open.value = true
	title.value = '编辑物资仓库'
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			if (response.code === '0000' && response.data) {
				const resData = response.data
				Object.keys(resData).forEach(key => {
					if (detailRef.value.formData.hasOwnProperty(key)) {
						detailRef.value.formData[key] = resData[key]
					}
				})
			}
		})
	})
}

/**
 * 删除
 */
const handleDelete = row => {
	proxy.$modal
		.confirm('确定删除物资仓库：' + row.warehouseName + '？')
		.then(function () {
			return api.delete(row.id)
		})
		.then(() => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

/**
 * 提交表单
 */
const submitForm = async () => {
	if (await detailRef.value.validate()) {
		const params = detailRef.value.formData
		if (params.id) {
			api.update(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList(queryParams.value)
			})
		} else {
			api.add(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList(queryParams.value)
			})
		}
	}
}

/**
 * 取消
 */
const cancel = () => {
	open.value = false
	reset()
}

/**
 * 重置
 */
const reset = () => {
	// 可以在这里重置查询条件
}

/**
 * 导出
 */
const handleExport = () => {
	proxy.$modal.msgSuccess('导出功能待实现')
}


getList(queryParams.value)

</script>

<style lang="less" scoped>
.app-container {
	padding: 20px;
}
</style>

