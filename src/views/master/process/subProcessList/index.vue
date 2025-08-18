<!-- 子过程列表 -->
<template>
	<BaseTable
		:showSearchHeader="true"
		:selectData="selectData"
		:searchClick="getList"
		:buttonList="buttonList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:total="total"
		:tableHeight="'drawerHeaderPageTableHeight'"
	/>

	<el-drawer v-model="subProcssVisible" :title="title" size="30%">
		<subProcess :orignList="orignList" ref="subProcessRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="subProcssVisible = false">取消</el-button>
				<el-button type="primary" @click="saveSubProcess">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import subProcess from './subProcess/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/master/process/index.js'
import { ElButton, ElTag } from 'element-plus'

const subProcssVisible = ref(false)
const props = defineProps({
	orignList: {
		type: Array,
		default: null,
	},
})

const subProcessRef = ref(null)
const selectData = reactive([
	{
		name: '过程名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'processName', // 绑定字段
		span: 24, // 占位，共24
	},
])
const total = ref(0) // 数据总数
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	parentId: '',
	processTypeCd: '',
})
// 点击查询的事件
const getList = e => {
	//重置数据
	tableData.value = new Array()
	queryParams.value = Object.assign(e, queryParams.value)
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
		click: () => addSubProcess, // 回调函数
		permission: 'master:process:add', // 权限
	},
])
const title = ref('')
//新增
const addSubProcess = () => {
	title.value = '新增'
	subProcssVisible.value = true
	nextTick(() => {
		subProcessRef.value.resetForm()
		subProcessRef.value.formData.id = '' // 新增清空
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{
		prop: 'processNm',
		label: '子过程',
		width: 100,
	},
	{
		prop: 'shortCd',
		label: '助记码',
		width: 100,
	},

	{
		prop: 'isTallyTonLabel',
		label: '理货量',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isTallyTonLabel == '是' ? 'success' : 'info',
					},
					{
						default: () => row.isTallyTonLabel,
					}
				),
			]
		},
	},
	{
		prop: 'isTallyCourse',
		label: '是否理货过程',
		align: 'center',
		width: 110,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isTallyCourseNm == '是' ? 'success' : 'info',
					},
					{
						default: () => row.isTallyCourseNm,
					}
				),
			]
		},
	},
	{
		prop: 'isCargoPackageChangeLabel',
		label: '是否改变货物包装',
		align: 'center',
		width: 140,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isCargoPackageChangeLabel == '是' ? 'success' : 'info',
					},
					{
						default: () => row.isCargoPackageChangeLabel,
					}
				),
			]
		},
	},
	// {
	// 	prop: 'isOperationTonLabel',
	// 	label: '是否为操作量',
	// 	align: 'center',
	// 	width: 110,
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					type: row.isOperationTonLabel == '是' ? 'success' : 'info',
	// 				},
	// 				{
	// 					default: () => row.isOperationTonLabel,
	// 				}
	// 			),
	// 		]
	// 	},
	// },
	{
		prop: 'isThroughputLabel',
		label: '是否吞吐量',
		align: 'center',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isThroughputLabel == '是' ? 'success' : 'info',
					},
					{
						default: () => row.isThroughputLabel,
					}
				),
			]
		},
	},
	// {
	// 	prop: 'isNaturalTonLabel',
	// 	label: '是否自然吨',
	// 	width: 100,
	// 	align: 'center',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					type: row.isNaturalTonLabel == '是' ? 'success' : 'info',
	// 				},
	// 				{
	// 					default: () => row.isNaturalTonLabel,
	// 				}
	// 			),
	// 		]
	// 	},
	// },
	{
		prop: 'isSettleLabel',
		label: '是否指定核销',
		width: 110,
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSettleLabel == '是' ? 'success' : 'info',
					},
					{
						default: () => row.isSettleLabel,
					}
				),
			]
		},
	},
  {
    prop: 'isDispatchTallyNm',
    label: '签票部门',
    width: 100,
  },
  {
    prop: 'isFrontierNm',
    label: '是否前沿(源)',
    width: 130,
  },
  {
    prop: 'isMeanwhileNm',
    label: '调度/库场是否同时分配作业量',
    width: 130,
  },
  {
    prop: 'isDispatchTallyShNm',
    label: '直取散货签票部门',
    width: 130,
  },
  {
    prop: 'tallyDataStatNm',
    label: '理货数据统计',
    width: 100,
  },
	{
		prop: 'inOutStorageTypeNm',
		label: '入库标识',
		width: 100,
	},
	{
		prop: 'inOutPortTypeNm',
		label: '进出港配置',
		width: 140,
	},
	{
		prop: 'processTypeNm',
		label: '过程种类',
		width: 120,
	},
	{
		prop: 'sourceNm',
		label: '源',
		width: 100,
	},
	{
		prop: 'targetNm',
		label: '目的',
		width: 100,
	},
	{
		prop: 'createByNm',
		label: '录入人',
		width: 120,
	},

	{
		label: '操作',
		align: 'center',
		width: 160,
		fixed: 'right',
		sortable: false,
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							editSubProcess(row)
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
							deleteSubProcess(row)
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

//编辑
const editSubProcess = row => {
	title.value = '编辑'
	subProcssVisible.value = true
	nextTick(() => {
		subProcessRef.value.resetForm()
		console.log(row, 'row')
		proxy.setFormData(subProcessRef.value.formData, row)
	})
}

//保存子作业过程
const saveSubProcess = async () => {
	if (await subProcessRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(subProcessRef.value.formData))
		params.parentId = queryParams.value.parentId
		params.processTypeCd = queryParams.value.processTypeCd
		params.parentProcessCd = queryParams.value.parentProcessCd
		proxy.$modal.confirm('是否保存？').then(() => {
			if (params.id) {
				api.updateChildprocess(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('修改成功')
						subProcssVisible.value = false
						getList(queryParams.value)
					}
				})
			} else {
				api.insertChildprocess(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('新增成功')
						subProcssVisible.value = false
						getList(queryParams.value)
					}
				})
			}
		})
	}
}
//删除
const deleteSubProcess = row => {
	proxy.$modal.confirm(`是否删除？`).then(result => {
		if (result) {
			api.deleteProcess(row.id).then(res => {
				proxy.$modal.msgSuccess('删除成功')

				getList(queryParams.value)
			})
		}
	})
}
defineExpose({
	queryParams,
	getList,
})
</script>

<style scoped></style>
