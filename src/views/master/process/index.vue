<!-- 作业过程 -->
<template>
	<div>
		<div class="app-container">
			<BaseTable
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:total="total"
			/>
		</div>

		<el-drawer v-model="detailVisible" :title="title" size="30%">
			<detail :processTypeList="processTypeList" :orignList="orignList" ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="saveProcess">保存</el-button>
				</div>
			</template>
		</el-drawer>

		<el-drawer v-model="subProcessVisible" title="子过程" size="85%">
			<subProcessList :orignList="orignList" ref="subProcessListRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="subProcessVisible = false">关闭</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="process">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import subProcessList from './subProcessList/index.vue'
import api from '@/api/master/process/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

// 字典数据
const processTypeList = ref([])
const orignList = ref([])
const selectData = reactive([
	{
		name: '作业过程种类',
		type: 'select',
		modelValue: 'processTypeCd',
		span: 12,
		selectData: [],
	},
	{
		name: '作业过程名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'processNm', // 绑定字段
		span: 12, // 占位，共24
	},
])
const total = ref(0) // 数据总数
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	parentId: -1,
})
// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	api.getlist(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => addProcess, // 回调函数
		permission: 'master:process:add', // 权限
	},
])
const detailRef = ref(null) // 编辑作业过程ref
const detailVisible = ref(false) // 编辑作业过程抽屉
const subProcessListRef = ref(null) // 子过程ref
const subProcessVisible = ref(false) // 子过程抽屉

const title = ref('')
//显示新增作业过程抽屉
const addProcess = () => {
	title.value = '新增'
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.formData.id = '' // 新增清空
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{
		prop: 'processNm',
		label: '作业过程名称',
		// minWidth: 200,
	},
	{
		prop: 'shortCd',
		label: '助记码',
		// width: 150,
	},
	{
		prop: 'processTypeNm',
		label: '过程种类',
		// width: 150,
	},
	{
		prop: 'planTypeNm',
		label: '所属计划',
		// width: 150,
	},
	{
		prop: 'sourceNm',
		label: '源',
		// width: 80,
	},
	{
		prop: 'targetNm',
		label: '目的',
		// width: 80,
	},
	// {
	// 	prop: 'isSelectSubticketNm',
	// 	label: '是否选择票货',
	// 	width: 150,
	// 	align: 'center',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					type: row.isSelectSubticketNm == '是' ? '' : 'info',
	// 				},
	// 				{
	// 					default: () => row.isSelectSubticketNm,
	// 				}
	// 			),
	// 		]
	// 	},
	// },
	// {
	// 	prop: 'isCreateTicketNm',
	// 	label: '是否新增目标票货',
	// 	width: 180,
	// 	align: 'center',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					type: row.isCreateTicketNm == '是' ? '' : 'info',
	// 				},
	// 				{
	// 					default: () => row.isCreateTicketNm,
	// 				}
	// 			),
	// 		]
	// 	},
	// },
	// {
	// 	prop: 'isMergeTicketNm',
	// 	label: '是否合并票货',
	// 	width: 150,
	// 	align: 'center',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					type: row.isMergeTicketNm == '是' ? '' : 'info',
	// 				},
	// 				{
	// 					default: () => row.isMergeTicketNm,
	// 				}
	// 			),
	// 		]
	// 	},
	// },
	{
		label: '操作',
		align: 'center',
		width: 220,
		fixed: 'right',
		sortable: false,
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							editProcess(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'master:process:update', // 权限
					},
					{
						default: () => '编辑',
					}
				),

				h(
					ElButton,
					{
						onClick: () => {
							showSubProcess(row)
						},
						type: 'primary',
						link: true,
						icon: 'Operation',
						permission: 'master:process:query', // 权限
					},
					{
						default: () => '子过程',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							deleteProcess(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'master:process:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])

// 编辑事件
const editProcess = row => {
	title.value = '编辑'
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		proxy.setFormData(detailRef.value.formData, row)
	})
}
//保存作业过程
const saveProcess = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData))
		params.parentId = -1
		proxy.$modal.confirm('确定保存？').then(() => {
			if (params.id) {
				api.update(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insert(params).then(res => {
					proxy.$modal.msgSuccess(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			}
		})
	}
}
//删除作业过程
const deleteProcess = async row => {
	proxy.$modal.confirm(`确定删除？`).then(result => {
		if (result) {
			api.deleteProcess(row.id).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				getList(queryParams.value)
			})
		}
	})
}
//显示子过程抽屉
const showSubProcess = row => {
	subProcessVisible.value = true
	nextTick(() => {
		subProcessListRef.value.queryParams.parentId = row.id
		subProcessListRef.value.queryParams.processTypeCd = row.processTypeCd
		subProcessListRef.value.queryParams.parentProcessCd = row.processCd
		subProcessListRef.value.getList(subProcessListRef.value.queryParams)
	})
}

const getDictList = () => {
	api.getDictList({ types: 'PROCESS_TYPE,SOURCE_TARGET_TYPE' }).then(res => {
		orignList.value = res.data.SOURCE_TARGET_TYPE
		processTypeList.value = res.data.PROCESS_TYPE
		selectData[0].selectData = res.data.PROCESS_TYPE // 筛选框赋值
	})
}

// 查字典
getDictList()

getList(queryParams.value)
</script>

<style lang="scss" scoped></style>
