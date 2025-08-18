<template>
	<el-drawer v-model="instructDrawerVisible" append-to-body title="作业指令" size="70%" :show-close="false">
		<template #header="{}">
			<div class="title">
				<div style="width: 200px"><span>导入上班次集疏港申请</span></div>
				<div style="display: flex">
					<el-button style="margin-left: 10px" type="primary" icon="Plus" @click="add">导入</el-button>
				</div>
			</div>
		</template>
		<el-row style="margin-top: 10px; margin-bottom: 10px; margin-left: 10px" :gutter="20">
			<el-col :span="4">
				<el-date-picker
					style="margin-right: 10px !important; width: 100px"
					v-model="searchData.workDate"
					type="date"
					value-format="YYYY-MM-DD"
					format="YYYY-MM-DD"
					placeholder="日期"
				></el-date-picker>
			</el-col>
			<el-col :span="4">
				<Select
					v-model:value="searchData.classCode"
					v-model:label="searchData.className"
					:selectLabel="'dictLabel'"
					:selectValue="'dictValue'"
					placeholder="班次"
					:dataConfig="{
						url: '/api/internal/public/getDictListByType/WORK_SCHEDULE',
					}"
				/>
			</el-col>
			<el-col :span="4">
				<el-button style="margin-left: 10px" type="primary" icon="Search" @click="getList">查询</el-button>
			</el-col>
		</el-row>
		<BaseTable
			ref="baseTableRef"
			:showSearchHeader="false"
			:selectData="selectData"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:tableHeight="'pageTableHeight'"
			:checkbox-config="checkboxConfig"
			:selectAllChangeEvent="checkboxChangeEvent"
			@checkbox-change="checkboxChangeEvent"
		/>
	</el-drawer>
</template>

<script setup name="instructions">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, getCurrentInstance, nextTick, h } from 'vue'
import publicApi from '@/api/public/index.js'
import api from '@/api/storage/openPortApply/index'
import Select from '@/components/Select'
import { getBeforeAfter } from '@/utils/index'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const searchData = ref({
	workDate: '',
	classCode: '',
	className: '',
})
const baseTableRef = ref(null)
const instructDrawerVisible = ref(false)
const emit = defineEmits(['change'])
const checkDate = ref([]) // 选中数据
const importDate = ref({}) // 导入数据 2.集疏港3.倒运4.杂项/辅助返回一条数据（对象），1.装卸船返回一个对象（list（多条）、和日期班次字段）
// const trustNo=ref('')//作业指令
const props = defineProps({
	//指令类型1.装卸船2.集疏港3.倒运4.杂项/辅助
	trustType: {
		type: String,
	},
	value: {
		type: String,
	},
	permission: {
		type: String,
	},
})
const value = computed({
	get() {
		return props.value
	},
	set(val) {
		emit('update:value', val)
	},
})
const formData = ref({
	workDate: '',
	classCode: '',
	className: '',
})
// 表格数据
const tableData = ref([])

const tableColumns = ref([
	{ label: '', type: 'checkbox', width: 50 },
	{ prop: 'planNo', label: '申请编号', width: 160, align: 'center' },
	{ prop: 'companyName', label: '作业公司', width: 110, align: 'left' },
	{ prop: 'deptName', label: '申请部门', width: 'time', align: 'left' },
	{ prop: 'workDate', label: '日期', width: 160, align: 'center' },
	{ prop: 'className', label: '班次', width: 120, align: 'center' },
	{ prop: 'cargoOwnerName', label: '货主', width: 120, align: 'center' },
	// { prop: 'cargoAgentName', label: '货代', width: 120, align: 'center' },
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ label: '结算依据', prop: 'settlementBasisName', width: 120, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '申请机械', width: 180, align: 'left' },
	{ prop: 'laborNum', label: '申请装卸队', width: 110, align: 'left' },
	{ prop: 'processName', label: '作业过程', width: 150, align: 'center' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{ prop: 'massNamesSource', label: '源垛位', width: 150, align: 'left' },
	{ prop: 'remark', label: '作业要求', width: 150, align: 'left' },
	{
		prop: '',
		label: '操作',
		width: 'operate',
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'storage:openPortApply:update',
					},
					{
						default: () => '编辑',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							console.log(row)
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'storage:openPortApply:delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const selectData = reactive([
	{
		name: '日期',
		type: 'date',
		modelValue: 'workDate', //对应字段
		span: 12,
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 12,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
])
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: false, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({ row }) => {
		// 返回可选的单选框
		return row.isDisable ? false : true
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 导入事件
const add = () => {
	/*
	 * 集疏港目前只允许单选
	 * */

	console.log(props.trustType, '当前状态')
	checkDate.value = baseTableRef.value.getSelectEvent()
	if (props.trustType == '2' && checkDate.value.length == 0) {
		//船舶计划可以导入多条指令
		return proxy.$message.warning('请至少勾选一条数据！')
	}
	if (props.trustType == '2') {
		// console.log('选中数据默认', formData.value)
		let voyages = checkDate.value.map(item => item.voyage) //船名航次
		let voyagesNum = new Set(voyages).size //已选中数量，如果相同为1，反之2

		let processNames = checkDate.value.map(item => item.processNames) //作业过程
		let processNamesNum = new Set(processNames).size //已选中数量，如果相同为1，反之2
		importDate.value.trustIds = checkDate.value.map(item => item.id)

		importDate.value = checkDate.value
	} else {
		return proxy.$message.warning('trustType类型错误！')
	}
	instructDrawerVisible.value = false
	emit('change', importDate.value)
}
watch(
	() => instructDrawerVisible.value,
	newV => {
		if (newV) {
			init()
		}
	},
	{ deep: true }
)
const init = () => {
	//设置搜索框数据
	publicApi.getNowDate({ dateTime: getBeforeAfter('before', 0.5, 'YYYY-MM-DD hh:mm:ss') }).then(res => {
		searchData.value.workDate = res.data.workDate
		searchData.value.classCode = res.data.classCode
		searchData.value.className = res.data.className
	})

	if (props.trustType) {
		if (instructDrawerVisible.value) {
			getList(searchData.value)
		}
	} else {
		return proxy.$message.warning('参数trustType未传！')
	}
}
// 选中回调 只可选中一条
const checkboxChangeEvent = data => {
	// 不需要 开启多选时备注下面代码就可以
	// if (data.length >= 1) {
	// 	tableData.value.forEach(item => {
	// 		if (data[0].id == item.id) {
	// 			item.isDisable = false
	// 		} else {
	// 			item.isDisable = true
	// 		}
	// 	})
	// } else {
	// 	// 取消选中 解除所有选中框禁用
	// 	tableData.value.forEach(item => {
	// 		item.isDisable = false
	// 	})
	// }
	// 结束
}
const getList = () => {
	if (props.trustType == '1' && (!formData.value.workDate || !formData.value.classCode)) {
		proxy.$message.warning('请填写完整查询条件！')
		return
	}
	searchData.value.trustType = props.trustType
	api.getList(searchData.value).then(res => {
		tableData.value = res.data
	})
}

init()
defineExpose({
	importDate,
	value,
	instructDrawerVisible,
	formData,
	baseTableRef,
})
</script>

<style scoped>
.title {
	margin-top: 20px;
	display: flex;
	justify-content: space-between;
}
</style>
