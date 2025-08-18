<template>
	<div class="app-container">
		<div class="selectBox">
			<div></div>
			<div>
				<el-button v-hasPermi="['master:workSchedule:query']" type="primary" icon="Search" @click="getList">刷新</el-button>
				<el-button v-hasPermi="['master:workSchedule:save']" type="primary" @click="doSave">保存</el-button>
			</div>
		</div>
		<EditTable
			ref="editTableRef"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:border="true"
			:rowConfig="rowConfig"
			:exportConfig="exportConfig"
			:editRules="editRules"
			:showFooter="true"
			:tableHeight="'normalTableHeight'"
		/>
	</div>
</template>

<script setup name="workSchedule">
import EditTable from '@/components/EditTable/index.vue'
import api from '@/api/master/workSchedule/index.js'

const editConfig = reactive({ trigger: 'click', mode: 'cell' })
const editTableRef = ref() // editTable的ref
const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'row_id' }
const exportConfig = {}
const { proxy } = getCurrentInstance()

const tableColumns = reactive([
	{ prop: 'workScheduleLabel', label: '班次', min_width: 250, align: 'center' },
	{
		prop: 'startDayType',
		label: '起始日',
		min_width: 250,
		align: 'canter',
		editType: 'select',
		modelLabel: 'startDayLable',
		editRender: {},
		selectLabel: 'startDayLable',
		selectValue: 'startDayType',
		selectData: [
			{
				startDayLable: '昨日',
				startDayType: '0',
			},
			{
				startDayLable: '本日',
				startDayType: '1',
			},
			{
				startDayLable: '次日',
				startDayType: '2',
			},
		],
	},
	{ prop: 'startTime', label: '起始时分(≥)', min_width: 250, align: 'canter', editType: 'time', editRender: {}, disabledSeconds: true },
	{
		prop: 'endDayType',
		label: '截止日',
		editType: 'select',
		editRender: {},
		min_width: 250,
		align: 'canter',
		modelLabel: 'endDayLable',
		selectLabel: 'endDayLable',
		selectValue: 'endDayType',
		selectData: [
			{
				endDayLable: '昨日',
				endDayType: '0',
			},
			{
				endDayLable: '本日',
				endDayType: '1',
			},
			{
				endDayLable: '次日',
				endDayType: '2',
			},
		],
	},
	{ prop: 'endTime', label: '截止时分(＜)', editType: 'time', editRender: {}, disabledSeconds: true },
])
const tableData = ref([])

const editRules = ref({
	startDayType: proxy.getRules({
		required: true,
	}),
	startTime: proxy.getRules({
		required: true,
	}),
	endDayType: proxy.getRules({
		required: true,
	}),
	endTime: proxy.getRules({
		required: true,
	}),
})

//工班设置保存
const doSave = async () => {
	if (await editTableRef.value.validAllEvent()) {
		console.log(editTableRef.value, '111')
		proxy.$modal.confirm('确认保存?').then(res => {
			console.log(tableData.value)
			api.save(tableData.value)
				.then(res => {
					if (res.code == '0000') {
						getList()
						proxy.$modal.msgSuccess(res.msg)
					}
				})
				.catch(err => {})
		})
	}
}

// 查询列表
const getList = e => {
	api.getlist().then(res => {
		tableData.value = res.data
		console.log(tableData.value)
	})
}

getList()
</script>
<style lang="less" scoped>
@import '../../../assets/styles/searchform.scss';
.selectBox {
	display: flex;
	justify-content: space-between;
	align-content: center;
	height: 40px;
	margin: 8px 0;
	padding-right: 5px;
	.left {
		width: 0%;
	}
	.right {
		width: 100%;
		justify-content: flex-end;
	}
}
</style>
