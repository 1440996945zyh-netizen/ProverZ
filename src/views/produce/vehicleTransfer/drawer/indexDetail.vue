<template>
	<div>
		<BaseTable
			ref="baseTable"
			:showSearchHeader="false"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:tableHeight="'pageTableHeight'"
      :html-content="collectHtml"
      :loading="loading"
      :total="total"
		/>
	</div>
      <div>
        <p>总趟数：{{ carCount }}, 总吨数：{{ tons }}</p>
      </div>
</template>

<script setup name="drawer">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/vehicleTransfer/index'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import math from '../../../../utils/math'
const collectHtml = ref(`<p>Hello, <strong>Vue 3</strong>!</p>`)
const trustId = ref(null)
const carCount = ref(0)
const tons = ref(0)
const total = ref(0)
const trustCargoId = ref(null)
const loading = ref(false) // 是否加载中
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '车号', prop: 'equipmentNo' },
	{ label: '司机', prop: 'operatorsName' },
	{ label: '最新状态', prop: '' },
	{ label: '趟数', prop: 'carCount' },
	{ label: '总吨数', prop: 'tons' },
	{ label: '绑定日期', prop: 'createTime',width:170 },
	{ label: '开始作业', prop: 'startTime' },
	{ label: '结束作业', prop: 'endTime' },
])

const message = ref('确定要修改车辆状态吗？')
const handleStatusChange = (row) => {
	proxy.$modal.confirm(`${message.value}`).then(() => {
		api.addOrDeleteVehicleTransfer(row).then(res => {
			proxy.$modal.msgSuccess(res.msg)
			getTrustCagroDispatchSecondary()
		})
	})
}

// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({}) => {
		// 返回可选的单选框
		return true
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}

const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
	checkboxList.value = data.records
}
// 单选
const checkboxChange = data => {
	checkboxList.value = data
}

const setTableData = data => {
  carCount.value=0
  tons.value = 0
	tableData.value = data
   carCount.value = data.reduce((total, item) => total + item.carCount, 0)
  let a = 0
  data.forEach(item=> {
    a = math.numAdd(a, item.tons);
    // 将累加结果赋值给tons.value
    tons.value = a.toFixed(2);
  })
}
const getCheckboxList = () => {
	return checkboxList.value
}
const getTrustCagroDispatchSecondary = () => {
	api.getTrustCagroDispatchSecondary({
		trustId: trustId.value,
		trustCargoId: trustCargoId.value,
	}).then(res => {
		tableData.value = res.data
	})
}

defineExpose({
	setTableData,
	getCheckboxList,
	trustId,
	trustCargoId
})

</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
	width: 100%;
	padding: 0 10px 0 0;
	justify-content: space-between;
	align-items: center;
}
</style>
