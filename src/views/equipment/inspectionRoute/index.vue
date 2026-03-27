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
		/>
		<el-drawer v-model="isShow" title="巡检路线" size="70%">
			<detail ref="viewRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="isShow = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>
<script setup name="inspectionRoute">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/equipment/inspectionRoute/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElMessage, ElTag } from 'element-plus'
import detail from './detail/index.vue'

const { proxy } = getCurrentInstance()

const selectData = reactive([
	{
		name: '路线编码',
		type: 'input',
		modelValue: 'routeCode',
		span: 8,
	},
	{
		name: '路线名称',
		type: 'input',
		modelValue: 'routeName',
		span: 8,
	},
	{
		name: '路线级别',
		type: 'select',
		modelValue: 'routeLevel',
		selectData: [
			{ label: '普通', value: '1' },
			{ label: '高危', value: '2' },
		],
		span: 8,
	},
])
const buttonList = ref([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add,
		permission: 'equipment:inspectionRoute:add',
	},
])
const total = ref(0)
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const tableData = ref([])
const tableColumns = reactive([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '路线编码', prop: 'routeCode' },
	{ label: '路线名称', prop: 'routeName' },
	{
		label: '路线级别',
		prop: 'routeLevel',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.routeLevel == '1' ? '' : 'warning',
					},
					{
						default: () => (row.routeLevel == '1' ? '普通' : '高危'),
					},
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
						permission: 'equipment:inspectionRoute:update',
					},
					{
						default: () => '编辑',
					},
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
						permission: 'equipment:inspectionRoute:delete',
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])
const getList = e => {
	queryParams.value = e
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
const viewRef = ref(null)
const isShow = ref(false)
const add = () => {
	isShow.value = true
	nextTick(() => {
		viewRef.value.resetForm()
	})
}
const save = async () => {
	if (await viewRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(viewRef.value.formData))
		if (!viewRef.value.tableData || viewRef.value.tableData.length == 0) {
			return proxy.$message.warning('请添加巡检点')
		}
		params.subList = viewRef.value.tableData
		proxy.$modal.confirm('确认保存？').then(res => {
			if (params.id) {
				api.update(params).then(res => {
					isShow.value = false
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				})
			} else {
				api.add(params).then(res => {
					isShow.value = false
					proxy.$message.success(res.msg)
					getList(queryParams.value)
				})
			}
		})
	}
}
const handleUpdate = row => {
	isShow.value = true
	nextTick(() => {
		viewRef.value.resetForm()
		api.getById(row.id).then(res => {
			viewRef.value.formData = JSON.parse(JSON.stringify(res.data))
			viewRef.value.tableData = res.data.subList || []
		})
	})
}
const handleDelete = row => {
	proxy.$modal.confirm('确认删除？').then(res => {
		api.delete(row.id).then(res => {
			proxy.$message.success(res.msg)
			getList(queryParams.value)
		})
	})
}

getList(queryParams.value)
</script>

<style></style>
