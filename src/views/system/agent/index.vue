<template>
	<div class="app-container">
		<el-row :gutter="20">
			<el-col :span="24">
				<BaseTable
					ref="baseTable"
					:showSearchHeader="true"
					:selectData="selectData"
					:searchClick="getList"
					:buttonList="buttonList"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:total="total"
				/>
			</el-col>
		</el-row>
		<!-- 新增、修改抽屉 -->
		<el-drawer v-model="agentVisible" :title="title" size="25%">
			<agentDrawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="agentVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="agent">
import agentDrawer from './detail/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/system/agent'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import { ref, reactive } from 'vue'

const agentVisible = ref(false)
const drawerRef = ref(null)
const { proxy } = getCurrentInstance()
const total = ref(0)
const title = ref('新增智能体')
const loading = ref(false)
const clickRow = ref({})

const queryParams = ref({
	startPage: 1,
	pageSize: 20,
	agentName: '',
	status: ''
})

/** 保存 */
const save = async () => {
	if (await drawerRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(drawerRef.value.formData))
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id) {
				api.updateAgent(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					agentVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertAgent(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					agentVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}

const tableData = ref([])
const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 50, align: 'center' },
	{ label: '智能体名称', prop: 'agentName', minWidth: 120 },
	{ label: '智能体标识', prop: 'agentCode', width: 120 },
	{ label: '简介', prop: 'introduction', minWidth: 180, showOverflowTooltip: true },
	{ label: '排序', prop: 'agentSort', width: 80, align: 'center' },
	{ label: '头像', prop: 'avatar', align: 'center' },
	{
		label: '类型',
		width: 80,
		prop: 'type',
		align: 'center',
		render: row => {
			return [
				h('span',
					{},
					{
						default: () => row.type == '1'?'对话':'应用',
					}
				)
			]
		}
	},
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		render: row => {
			return [
				h(ElSwitch, {
					onClick: () => handleStatusChange(row),
					modelValue: row.status,
					'active-value': '1',
					'inactive-value': '0'
				})
			]
		}
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
						onClick: () => edit(row),
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'system:agent:update'
					},
					{ default: () => '编辑' }
				),
				h(
					ElButton,
					{
						onClick: () => handleDelete(row),
						type: 'danger',
						link: true,
						icon: 'Operation',
						permission: 'system:agent:delete'
					},
					{ default: () => '删除' }
				)
			]
		}
	}
])

const selectData = reactive([
	{
		name: '智能体名称',
		type: 'input',
		modelValue: 'agentName',
		span: 12
	},
  {
    name: '状态',
    type: 'select',
    modelValue: 'status',
    span: 12,
    placeholder: '菜单状态',
    selectData: [
      { dictLabel: '可用', dictValue: '1' },
      { dictLabel: '不可用', dictValue: '0' },
    ],
    selectLabel: 'dictLabel', // 下拉选项的文本字段
    selectValue: 'dictValue', // 下拉选项的value字段
  },
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => add(),
		permission: 'system:agent:add'
	}
])

/** 搜索 */
function handleQuery() {
	getList(queryParams.value)
}

/** 删除 */
function handleDelete(row) {
	proxy.$modal
		.confirm('确定删除该智能体？')
		.then(function () {
			return api.deleteById([row.id])
		})
		.then(() => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

/** 状态修改 */
const handleStatusChange = row => {
	const text = row.status === '1' ? '停用' : '启用'
	proxy.$modal
		.confirm('确定' + text + '"' + row.agentName + '"吗？')
		.then(function () {
			return api.updateAgent({ id: row.id, status: row.status === '1' ? '0' : '1', agentName: row.agentName, introduction: row.introduction, avatar: row.avatar, apiKey: row.apiKey, agentSort: row.agentSort })
		})
		.then(() => {
			proxy.$modal.msgSuccess(text + '成功')
			getList(queryParams.value)
		})
		.catch(() => {})
}

/** 编辑 */
function edit(row) {
	const editRow = row || clickRow.value
	title.value = '编辑智能体'
	agentVisible.value = true
	nextTick(() => {
		drawerRef.value.resetForm()
		api.getById(editRow.id).then(res => {
			proxy.setFormData(drawerRef.value.formData, res.data)
		})
	})
}

/** 查询列表 */
const getList = e => {
	loading.value = true
	queryParams.value = Object.assign(queryParams.value, e)
	api.listAgent(queryParams.value).then(res => {
		loading.value = false
		tableData.value = res.data.pages || []
		total.value = res.data.totalNum || 0
	})
}

/** 新增 */
const add = () => {
	agentVisible.value = true
	title.value = '新增智能体'
	nextTick(() => {
		drawerRef.value.resetForm()
	})
}

const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

getList(queryParams.value)
</script>

<style lang="less" scoped>
</style>
