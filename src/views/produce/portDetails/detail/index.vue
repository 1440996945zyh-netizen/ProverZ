<template>
	<div class="app-container">
		<SearchHeader
			ref="searchHeaderRef"
			:selectData="selectData"
			@searchClick="getList"
			:buttonList="buttonList"
			@changeRemoteSelect="changeRemoteSelect"
		/>
		<div class="title">{{ detailRow.cargoInfoLabel }}</div>
		<div class="content">
			<div class="in">
				<div class="content_title">
					<span>进场记录</span>
					<span class="orange">{{ tableDatas.inQuantity ? tableDatas.inQuantity : 0 }}</span>
					<span>件</span>
					<span class="orange">{{ tableDatas.inTon ? tableDatas.inTon : 0 }}</span>
					<span>吨</span>
				</div>
				<BaseTable
					ref="baseTable"
					:tableColumns="tableColumns"
					:tableData="tableDatas.in"
					:tableHeight="'drawerHeaderPageTableHeight'"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:total="total"
					:syncResize="true"
				/>
			</div>
			<div class="out">
				<div class="content_title">
					<span>出场记录</span>
					<span class="orange">{{ tableDatas.outQuantity ? tableDatas.outQuantity : 0 }}</span>
					<span>件</span>
					<span class="orange">{{ tableDatas.outTon ? tableDatas.outTon : 0 }}</span>
					<span>吨</span>
					<span style="margin-left: 5px">结存</span>
					<span class="orange">{{ tableDatas.balanceQuantity ? tableDatas.balanceQuantity : 0 }}</span>
					<span>件</span>
					<span class="orange">{{ tableDatas.balanceTon ? tableDatas.balanceTon : 0 }}</span>
					<span>吨</span>
				</div>
				<BaseTable
					ref="baseTable"
					:tableColumns="tableColumns"
					:tableData="tableDatas.out"
					:tableHeight="'drawerHeaderPageTableHeight'"
					:cellClickEvent="cellClickEvent"
					:loading="loading"
					:total="total"
					:syncResize="true"
				/>
			</div>
		</div>
	</div>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
import Select from '@/components/Select'
import SearchHeader from '@/components/SearchHeader/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/portDetails/index.js'
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
	in: [
		// 进
	],
	outTon: '0', // 出场吨数
	outQuantity: 0, // 出场件数
	inQuantity: 0, // 进场件数
	balanceTon: '0.0000', // 结存吨数
	balanceQuantity: 0, // 结存吨数
	out: [], // 出，字段同进
})
const getList = e => {
	console.log('接收父组件数据', props.detailRow)
	let data = {
		cargoInfoId: props.detailRow.cargoInfoId, //票货ID
		storehouseId: props.detailRow.storehouseId, //库场ID
		regionId: props.detailRow.regionId, //区域ID
		massId: props.detailRow.massId, //垛位ID
		...e,
	}

	console.log('查询数据', data)
	// queryParams.value = Object.assign(queryParams.value, e)
	api.getInoutDetail(data).then(res => {
		// tableDatas.value = res.data
		console.log('详细堆栈列表数据', res)
		tableDatas.value = Object.assign(tableDatas.value, res.data)
		console.log('有数据吗', tableDatas.value)
		// loading.value = false
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
	{ label: '日期', prop: 'workDate' , width: 94 },
	{ label: '班次', prop: 'className' , width: 73 },
	{ label: '船/场（子）', prop: 'processDetailName' , width: 121 },
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
		name: '起始作业班次',
		type: 'select',
		modelValue: 'beginClassCode',
		span: 6,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
	{
		name: '结束作业日期',
		type: 'date',
		modelValue: 'endWorkDate', //对应字段
		span: 6,
	},
	{
		name: '结束作业班次',
		type: 'select',
		modelValue: 'endClassCode',
		span: 6,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
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
.content {
	display: flex;
	.in,
	.out {
		width: 50%;
		font-size: 13px;
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
	}
}
</style>
