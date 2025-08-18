<template>
	<el-form :model="formData" ref="ruleForm" label-width="100px" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="作业通知单信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="通知单编号" prop="trustNo">
							<div style="width: 100%">
								<el-input v-model="formData.trustNo" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="下发日期" prop="releaseTime">
							<div style="width: 100%">
								<el-input v-model="formData.releaseTime" disabled />
							</div>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="6">
						<el-form-item label="靠泊时间" prop="berthTime">
							<div style="width: 100%">
								<el-input v-model="formData.berthTime" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="离泊时间" prop="leaveBerthTime">
							<div style="width: 100%">
								<el-input v-model="formData.leaveBerthTime" disabled />
							</div>
						</el-form-item>
					</el-col> -->
				</el-row>
			</el-collapse-item>
			<el-collapse-item title="货物信息" name="2">
				<template #title>
					<el-row class="listOperate">
						<div style="float: left">
							<span style="padding-right: 5px">货物信息</span>
							<span style="padding-right: 5px">件数:{{ formData.quantity }} |</span>
							<span style="padding-right: 5px">重量:{{ formData.ton }} |</span>
							<span style="padding-right: 5px">票数:{{ formData.ticketNum }}</span>
						</div>
					</el-row>
				</template>
				<EditTable
					ref="EditTableRef"
					:showToolBar="true"
					:tableHeight="400"
					:autoResize="true"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:editRules="editRules"
					@input="tableInput"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import EditTable from '@/components/EditTable/index.vue'
const collapseOpen = ['1', '2'] // 打开的面板
const formData = reactive({
	id: '',
	trustNo: '', //指令编号
	releaseTime: '', //下发时间
	trustCargoId: '', //票货id
	// berthTime: '', //靠泊时间
	// leaveBerthTime: '', //离泊时间
	quantity: 0, //件数
	ton: 0, //重量
	ticketNum: 0, //票数
})
const validate = async () => {
	let flag = await EditTableRef.value.validAllEvent()
	return flag
}
// 可编辑表格
const EditTableRef = ref('')
const tableData = ref([])
const tableColumns = reactive([
	{
		prop: 'cargoInfoNo',
		label: '票货号',
		minWidth: 120,
	},
  {
    prop: 'cargoOwnerName',
    label: '货主',
    minWidth: 200,
  },
	// {
	// 	prop: 'cargoAgentName',
	// 	label: '货代',
	// 	minWidth: 200,
	// },
	{
		prop: 'cargoName',
		label: '货物',
		width: 150,
	},

	{
		prop: 'jgweightGoods',
		label: '集港过磅量',
		width: 120,
   align:'right'
	},
  {
		prop: 'sgweightGoods',
		label: '疏港过磅量',
		width: 120,
    align:'right'
	},	{
		prop: 'quantity',
		label: '件数',
		width: 150,
		editRender: {},
		editType: 'input',
    align:'right'

  },
	{
		prop: 'ton',
		label: '重量',
		width: 150,
		editRender: {},
		editType: 'input',
    align:'right'

  },
	{
		prop: 'ticketNum',
		label: '票数',
		width: 150,
		editRender: {},
		editType: 'input',
    align:'right'

  },
  /*{
    prop: 'weightGoods',
    label: '过磅数',
    width: 150,
  },*/
	{
		prop: 'remark',
		label: '备注',
		width: 260,
		editRender: {},
		editType: 'input',
    align:'right'

  },
])
const editRules = ref({
	ton: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 2,
		},
	}),
	quantity: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 0,
		},
	}),
	ticketNum: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 0,
		},
	}),
})
// 列回调事件
const tableInput = (val, changeRow, title) => {
	if (title == '件数') {
		formData.quantity = 0
		tableData.value.forEach(item => {
			if (Number(item.quantity)) {
				formData.quantity += Number(item.quantity)
			}
		})
	}
	if (title == '重量') {
		formData.ton = 0
		tableData.value.forEach(item => {
			if (Number(item.ton)) {
				formData.ton += Number(item.ton)
			}
		})
	}
	if (title == '票数') {
		formData.ticketNum = 0
		tableData.value.forEach(item => {
			if (Number(item.ticketNum)) {
				formData.ticketNum += Number(item.ticketNum)
			}
		})
	}
}
defineExpose({
	validate,
	formData,
	tableData,
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
