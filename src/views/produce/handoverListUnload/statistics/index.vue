<template>
	<el-form :model="statisticsData" label-width="100px" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="货物信息" name="2">
				<template #title>
					<el-row class="listOperate">
						<div style="float: left">
							<span style="padding-right: 5px">货物信息</span>
							<span style="padding-right: 5px">完成件数:{{ statisticsData.quantity }} |</span>
							<span style="padding-right: 5px">完成重量:{{ statisticsData.ton }} </span>
						</div>
					</el-row>
				</template>
				<EditTable
					ref="EditTableRef"
					:showToolBar="true"
					:tableHeight="500"
					:autoResize="true"
					:tableColumns="tableColumns"
					:tableData="tableData"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="statistics">
import upload from '../../../../components/upload/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import EditTable from '@/components/EditTable/index.vue'
const collapseOpen = ['1', '2'] // 打开的面板
const statisticsData = reactive({
	id: '',
	shipNameVoyage: '', //船舶航次
	cargoCategoryName: '', //货种
	berthTime: '', //靠泊时间
	leaveBerthTime: '', //离泊时间
	quantity: 0, //件数
	ton: 0, //重量
	ticketNum: 0, //票数
})
// 可编辑表格
const EditTableRef = ref('')
const tableData = ref([])

const tableColumns = reactive([
	{
		prop: 'cargoInfoNo',
		label: '票货号',
		minWidth: 110,
    align:'center',
	},
  {
    prop: 'cargoOwnerName',
    label: '货主',
    minWidth: 180,
    align:'center',
  },
	{
		prop: 'cargoName',
		label: '货物',
		width: 120,
    align:'center',
	},

	{
		prop: 'quantity',
		label: '件数',
		width: 80,
    align:'right',
	},
	{
		prop: 'ton',
		label: '重量',
		width: 100,
    align:'right',
	},
  /*{
		prop: 'volumeTon',
		label: '体积吨',
		width: 100,
    align:'right',
	},
	{
		prop: 'ticketNum',
		label: '票数',
		width: 80,
    align:'right',
	},*/
  {
    prop: 'tallyZqQuantity',
    label: '直取完成件数',
    width: 100,
    align:'right',
  },
  {
    prop: 'tallyZqTon',
    label: '直取完成吨数',
    width: 100,
    align:'right',
  },
  {
    prop: 'tallyZyQuantity',
    label: '转运完成件数',
    width: 100,
    align:'right',
  },
  {
    prop: 'tallyZyTon',
    label: '转运完成吨数',
    width: 100,
    align:'right',
  },
  {
    prop: 'tallyAllQuantity',
    label: '合计完成件数',
    width: 100,
    align:'right',
  },
  {
    prop: 'tallyAllTon',
    label: '合计完成吨数',
    width: 100,
    align:'right',
  },
  {
    prop: 'remainderQuantity',
    label: '剩余件数',
    width: 100,
    align:'right',
  },
  {
    prop: 'remainderTon',
    label: '剩余吨数',
    width: 100,
    align:'right',
  },

	{
		prop: 'remark',
		label: '备注',
		width: 260,
    align:'center',
	},
])

defineExpose({
	tableData,
  statisticsData
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
