<template style="margin: 0px;padding: 0px !important;">
  <div style="width:100%;height: 500px;margin: 0px;padding:0px;border:solid 1px #DDD">
    <el-row :gutter="5">
      <el-col :span="12">
        <div style="width:100%;height: 40px;padding: 0px 0px 10px 10px;line-height: 40px;">
          <span style="font-size: 14px;font-weight: bold;">进场记录：</span>
          <span class="orange" style="font-size: 14px;font-weight: bold;margin:0px 10px;">{{ tableDatas.inQuantity ? tableDatas.inQuantity : 0 }}</span>
          <span>件</span>
          <span class="orange" style="font-size: 14px;font-weight: bold;margin:0px 10px;">{{ tableDatas.inTon ? tableDatas.inTon : 0 }}</span>
          <span>吨</span>
        </div>
        <div style="width:100%;height: 450px;">
          <BaseTable
            ref="baseTable"
            :tableColumns="tableColumns"
            :tableData="tableDatas.in"
            :tableHeight="450"
            :cellClickEvent="cellClickEvent"
            :loading="loading"
            :total="total"
            :syncResize="true"
          />
        </div>
      </el-col>
      <el-col :span="12">
        <div style="width:100%;height: 40px;padding: 0px 0px 10px 10px;line-height: 40px;">
          <span style="font-size: 14px;font-weight: bold;">出场记录：</span>
          <span class="orange" style="font-size: 14px;font-weight: bold;margin:0px 10px;">{{ tableDatas.outQuantity ? tableDatas.outQuantity : 0 }}</span>
          <span>件</span>
          <span class="orange" style="font-size: 14px;font-weight: bold;margin:0px 10px;">{{ tableDatas.outTon ? tableDatas.outTon : 0 }}</span>
          <span>吨</span>
        </div>
        <div style="width:100%;height: 450px;">
          <BaseTable
            ref="baseTable"
            :tableColumns="tableColumns"
            :tableData="tableDatas.out"
            :tableHeight="450"
            :cellClickEvent="cellClickEvent"
            :loading="loading"
            :total="total"
            :syncResize="true"
          />
        </div>
      </el-col>
    </el-row>
	</div>
</template>

<script setup name="detail">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
import Select from '@/components/Select'
import SearchHeader from '@/components/SearchHeader/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/portTrends/index.js'
// import tableParamsStore from '@/store/modules/tableParams'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const props = defineProps({
	detailRow: {
		type: Object,
	},
})
const tableDatas = ref({
  in: [],
	inTon: '', // 进场吨数
  inQuantity: 0, // 进场件数
  out: [], // 出，字段同进
  outTon: '0', // 出场吨数
	outQuantity: 0, // 出场件数
	balanceTon: '0.0000', // 结存吨数
	balanceQuantity: 0, // 结存吨数
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

const show=()=>{
  console.log(tableDatas.value)
}

defineExpose({
  tableDatas,
  show,

})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
//.title {
//	height: 40px;
//	line-height: 40px;
//	padding-left: 10px;
//	background: rgb(233, 241, 252);
//	font-size: 13px;
//}
//.content {
//	display: flex;
//	.in,
//	.out {
//		width: 50%;
//		font-size: 13px;
//		.content_title {
//			background: rgb(246, 247, 251);
//			height: 40px;
//			line-height: 40px;
//			padding-left: 10px;
//		}
//		.orange {
//			color: rgb(238, 63, 19);
//			margin-left: 5px;
//		}
//	}
//}
</style>
