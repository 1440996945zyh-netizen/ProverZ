<template>
	<div class="app-container">
		<SearchHeader
			ref="searchHeaderRef"
			:selectData="selectData"
			@searchClick="getList"
			:buttonList="buttonList"
			@changeRemoteSelect="changeRemoteSelect"
      :showNum = '4'
    />
		<div class="title">{{ detailRow.cargoInfoLabel }}</div>
				<div class="content_title">
					<span>进场记录</span>
					<span class="orange">{{ tableDatas.inQuantity ? tableDatas.inQuantity : 0 }}</span>
					<span>件</span>
					<span class="orange">{{ tableDatas.inTon ? tableDatas.inTon : 0 }}</span>
					<span>吨</span>
          <span style="margin-left: 15px">出场记录</span>
          <span class="orange">{{ tableDatas.outQuantity ? tableDatas.outQuantity : 0 }}</span>
          <span>件</span>
          <span class="orange">{{ tableDatas.outTon ? tableDatas.outTon : 0 }}</span>
          <span>吨</span>
          <span style="margin-left: 15px">结存</span>
          <span class="orange">{{ tableDatas.balanceQuantity ? tableDatas.balanceQuantity : 0 }}</span>
          <span>件</span>
          <span class="orange">{{ tableDatas.balanceTon ? tableDatas.balanceTon : 0 }}</span>
          <span>吨</span>
				</div>
				<BaseTable
					ref="baseTable"
					:tableColumns="tableColumns"
					:tableData="tableDatas.inOut"
					:tableHeight="'pageTableHeight'"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:total="total"
					:syncResize="true"
				/>
			</div>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
import Select from '@/components/Select'
import SearchHeader from '@/components/SearchHeader/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/portDetails/index.js'
import {ElTag} from "element-plus";
// import tableParamsStore from '@/store/modules/tableParams'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const props = defineProps({
	detailRow: {
		type: Object,
	},
})
const tableDatas = ref({
	// cargoInfoLabel: '', // 票货信息
	inTon: '', // 进场吨数
	inOut: [
		// 进
	],
	outTon: '0', // 出场吨数
	outQuantity: 0, // 出场件数
	inQuantity: 0, // 进场件数
	balanceTon: '0.0000', // 结存吨数
	balanceQuantity: 0, // 结存吨数
})
const getList = e => {
	console.log('接收父组件数据', props.detailRow)
	let data = {
		cargoInfoId: props.detailRow.cargoInfoId, //票货ID
		...e,
	}
	// queryParams.value = Object.assign(queryParams.value, e)
	api.getCargoInoutDetail(data).then(res => {
		tableDatas.value = Object.assign(tableDatas.value, res.data)
	})
}
watch(
	() => props.detailRow,
	(newCount, oldCount) => {
		// console.log('Count changed:', newCount, oldCount)
		if (newCount) {
			getList()
		}
	},
	{ immediate: true, deep: true }
)

const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
    label: '进出场',
    prop: 'inoutType',
    align: 'center',
    width: 94,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.inoutType == '出库' ? 'info'  : '',
          },
          {
            default: () => row.inoutType
          }
        ),
      ]
    },
  },
	{ label: '日期', prop: 'workDate' , width: 94 },
	{ label: '班次', prop: 'className' , width: 73 },
	{ label: '作业过程', prop: 'processDetailName' , width: 121 },
  { label: '垛位', prop: 'massName' , width: 110 },
  { label: '件数', prop: 'quantity' , width: 75 },
	{ label: '重量', prop: 'ton' , width: 77 },
  {label:'理货人',prop:'createByName', width: 86 },
  {label:'时间',prop:'createTime', width: 152 },
  {label:'运输车号',prop:'transportEquipmentNo', width: 103 },
])
const buttonList = ref([])
const selectData = reactive([
	{
		name: '起始作业日期',
		type: 'date',
		modelValue: 'beginWorkDate', //对应字段
		span: 6,
	},
	{
		name: '结束作业日期',
		type: 'date',
		modelValue: 'endWorkDate', //对应字段
		span: 6,
	},
  {
    name: '作业班次',
    type: 'select',
    modelValue: 'beginClassCode',
    span: 6,
    dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
  },
  {
    name: '出入库状态',
    type: 'select',
    modelValue: 'inoutType',
    span: 6,
    selectData: [
      { label: '出库', value: '1' },
      { label: '入库', value: '2' },
    ],  },
])
const changeRemoteSelect = async e => {
	// console.log('远程查询', e)
	const res = await api.getstroagestack(e.value)
	selectData.forEach(item => {
		if (item.modelValue === 'stackCode') {
			item.selectData = res.data
		}
	})
}

// getList()
defineExpose({})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.title {
	height: 40px;
	line-height: 40px;
	padding-left: 10px;
	background: rgb(233, 241, 252);
	font-size: 13px;
}
.content_title {
  background: rgb(246, 247, 251);
  height: 40px;
  line-height: 40px;
  padding-left: 10px;
}
.orange {
  color: rgb(238, 63, 19);
  margin-left: 5px;
}
</style>
