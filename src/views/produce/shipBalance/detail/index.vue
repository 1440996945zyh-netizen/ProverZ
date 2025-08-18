<template>
	<div class="formData">
		<EditTable
			ref="editTable"
			:showSearchHeader="false"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:tableHeight="'normalTableHeight'"
			:checkbox-config="checkboxConfig"
			:selectAllChangeEvent="selectAllChangeEvent"
			@checkbox-change="checkboxChangeEvent"
		/>
	</div>
</template>

<script setup name="detail">
import EditTable from '@/components/EditTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import Select from '@/components/Select'

const ruleForm = ref()
const tableData = ref([])
// 表格表头参数
const tableColumns = reactive([
	{ label: '', type: 'checkbox', width: 40,fixed: 'left', },
  { label: '通知单号', prop: 'trustNo', editType: 'input',width: 120},
  { label: '日期', prop: 'workDate', editType: 'input',width: 120},
  { label: '班次', prop: 'className', editType: 'input',width: 90},
  { label: '船名航次', prop: 'shipVoyageName', editType: 'input',width: 120},
  { label: '装卸', prop: 'loadUnload', editType: 'input',width: 120},
  { label: '货名', prop: 'cargoName', editType: 'input',width: 120},
  { label: '操作班组', prop: 'deptName', editType: 'input',width: 120},
  { label: '人员班组', prop: 'personNelName', editType: 'input',width: 120},
  { label: '作业过程', prop: 'processName', editType: 'input',width: 120},
  { label: '作业子过程', prop: 'processDetailName', editType: 'input',width: 120},
  { label: '件数', prop: 'quantity', editType: 'input',editRender: {},width: 150,fixed: 'right', },
  { label: '吨数', prop: 'ton', editType: 'input',editRender: {},width: 150,fixed: 'right',},
  { label: '机械类型', prop: 'equipmentTypeName', editType: 'input',width: 120},
  { label: '机械编号', prop: 'equipmentNo', editType: 'input',width: 120},
  { label: '开始时间', prop: 'startTime', editType: 'input',width: 120},
  { label: '结束时间', prop: 'endTime', editType: 'input',width: 120},
  { label: '起始区域', prop: 'srms', editType: 'input',width: 120},
  { label: '终点区域', prop: 'srmt', editType: 'input',width: 120},
])

const dtoList = ref([])
//选中数据
const checkboxChangeEvent = arr => {
	if (arr.length > 0) {
    dtoList.value = arr
	} else {
    dtoList.value = []
	}
}

const flagTz = ref(true)
// 调整按钮

const emit = defineEmits(['add'])
// 重置
const resetting = () => {
	flagTz.value = true
	emit('add')
}
// 全选事件
const selectAllChangeEvent = arr => {
	if (arr.records.length > 0) {
    dtoList.value = arr.records
	} else {
    dtoList.value = []
	}
  dtoList.value = arr.records
}
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, //  开启复选框范围选择功能
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}

defineExpose({
	validate,
	tableData,
  dtoList
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
