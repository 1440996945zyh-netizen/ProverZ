<template>
	<el-collapse v-model="activeNames">
		<!-- <el-collapse-item title="委托信息" name="1">
			<el-form :model="formData" ref="ruleForm" label-width="auto" :rules="rules">
				<el-row :gutter="10">
					<el-col :span="8">
						<el-form-item label="网厅委托" prop="mvbillLabel">
							<template #label>
								<span class="formLabelOnClick" @click="check">网厅委托</span>
							</template>
							<el-input
								v-model="formData.mvbillLabel"
								placeholder="点击左侧标题 选择网厅委托"
								style="width: 100%"
								readonly
							></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="委托人" prop="clientCode">
							<div style="width: 100%">
								<Select
									v-model:value="formData.clientCode"
									v-model:label="formData.clientName"
									placeholder="请选择委托人"
									:selectData="clientList"
									:filterable="true"
									selectLabel="customerName"
									selectValue="customerCode"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="货物" prop="cargoCodes">
							<div style="width: 100%">
								<RemoteSelect
									ref="cargoSelect"
									v-model:value="formData.cargoCodes"
									v-model:label="formData.cargoNames"
									placeholder="请选择货物名称"
									type="CARGO_INFO"
									:multiple="true"
									:number="30"
								/>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="进出口" prop="inOut">
							<el-select clearable v-model="formData.inOut" placeholder="请选择进出口" style="width: 100%">
								<el-option label="进口" value="I"></el-option>
								<el-option label="出口" value="E"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="内外贸" prop="tradeType">
							<el-select clearable v-model="formData.tradeType" placeholder="请选择内外贸" style="width: 100%">
								<el-option label="内贸" value="1"></el-option>
								<el-option label="外贸" value="2"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="件数">
							<el-input readonly maxlength="16" v-model.number="formData.billPcs" style="width: 100%"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="重量">
							<el-input readonly maxlength="16" v-model.number="formData.billWeight" style="width: 100%"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-collapse-item> -->
		<!-- <el-collapse-item title="堆存信息" name="2"> -->
		<div style="padding: 5px">
			<RemoteSelect
				type="BUS_CARGO_INFO"
				v-model:value="busCargoData.cargoInfoId"
				@change="busCargoInfoChanged"
				placeholder="选择子票货"
			/>
		</div>
		<div style="padding: 5px">
      <Select
        :selectData="[
									{ label: '记账（子过程）', value: '10090001' },
									{ label: '集改散（子过程）', value: '10520001',}
								]"
        v-model:value="busCargoData.processDetailCode"
        v-model:label="busCargoData.processDetailName"
        placeholder="选择新增类型"
      />
		</div>
		<div class="add">
			<el-button type="primary" @click="add">新增</el-button>
			<el-button type="danger" @click="handleDelete">删除</el-button>
		</div>
		<EditTable
			ref="editTable"
			:tableHeight="'null'"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:editRules="rules"
			:loading="false"
			:border="true"
			:selectAllChangeEvent="selectAllChangeEvent"
			@checkbox-change="checkboxChangeEvent"
			@focus="tableFocus"
		/>
		<!-- </el-collapse-item> -->
	</el-collapse>
	<!-- <el-drawer v-model="detailVisible" title="详情" size="80%">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:tableColumns="tableColumnsD"
			:tableData="tableDataD"
			:tableHeight="'tabTableHeight'"
			:cellClickEvent="cellClickEvent"
			:loading="loading"
			:total="total"
			:syncResize="true"
		/>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="submit">确定</el-button>
			</div>
		</template>
	</el-drawer> -->
</template>

<script setup name="childTicket">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import api from '@/api/produce/portTrends/index.js'
import RemoteSelect from '@/components/RemoteSelect'
import EditTable from '@/components/EditTable'
import Select from "@/components/Select/index.vue";
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const cargoTypeCode = ref('')
// const activeNames = reactive(['1', '2'])
const detailVisible = ref(false)
// "cargoInfoId": "1692006594084212736", // 票货ID，必填
//         "storehouseId": "1674255043844509696", // 库场ID，必填
//         "storehouseName": "场地01", // 库场名称，必填
//         "regionId": "1674263741979561984", // 区域ID，必填
//         "regionName": "区域01", // 区域名称，必填
//         "massId": "1674263804407582720", // 垛位ID，必填
//         "massName": "垛位01", // 垛位名称，必填
//         "quantity": 3, // 件数
//         "ton": 1.2345, // 吨数（数量），必填
//         "inoutStorageCode": "30", // 进出场类型编码，字典INOUT_STORAGE 10理货/20作业票/30补录/40调账/50清场，必填
//         "inoutStorageName": "补录", // 进出场类型名称，字典INOUT_STORAGE 10理货/20作业票/30补录/40调账/50清场，必填
//         "companyId": "1677242790846795776", // 作业公司ID，必填
//         "companyName": "东港作业公司" // 作业公司名称，必填
// const formData = ref({
// 	storehouseName: '', // 库场名称
// 	storehouseId: '', // 库场ID
// 	regionName: '', //区域名称
// 	regionId: '', //区域ID
// 	massName: '', // 垛位名称
// 	massId: '', // 垛位ID
// 	quantity: '', // 件数
// 	ton: '', // 吨数（数量）
// 	inoutStorageCode: '', // 进出场类型编码
// 	inoutStorageName: '', // 进出场类型名称
// 	companyId: '', // 作业公司ID
// 	companyName: '', // 作业公司名称
// 	cargoInfoId: '', // 票货ID
// })
const rules = reactive({
	storehouseName: proxy.getRules({ required: true }),
	storehouseId: proxy.getRules({ required: true }),
	regionId: proxy.getRules({ required: true }),
	storageCode: proxy.getRules({ required: true }),
	// massId: proxy.getRules({ required: true }),
	massName: proxy.getRules({ required: true, trigger: 'change' }),
	massId: proxy.getRules({ required: true, trigger: 'change' }),
	quantity: proxy.getRules({ required: true }),
	ton: proxy.getRules({ required: true }),
})

// 可编辑表格---------------------------------------------------------------------------
const tableData = ref([
	{
		id: 1,
		storehouseName: '', // 库场名称
		storehouseId: '', // 库场ID
		regionName: '', //区域名称
		regionId: '', //区域ID
		massName: '', // 垛位名称
		massId: '', // 垛位ID
		quantity: '', // 件数
		ton: '', // 吨数（数量）
	},
])
const tableColumns = ref([
	{ label: '', prop: '', type: 'checkbox', width: 80 },
	// {
	// 	label: '垛位',
	// 	prop: 'storageCode',
	// 	modelLabel: 'storageName',
	// 	editType: 'remoteSelect',
	// 	editRender: {},
	// 	type: 'ALL_STORAGE_MASS',
	// 	change: (e, row) => {
	// 		row.storehouseName = e.storehouseName
	// 		row.storehouseId = e.storehouseId
	// 		row.regionName = e.regionName
	// 		row.regionId = e.regionId
	// 		row.massName = e.massName
	// 		row.massId = e.massId

	// 		// console.log('有值了密码', e)

	// 		// // row.userId = e.value
	// 		// console.log('幼稚吗', e)
	// 	},
	// },
	{
		label: '垛位',
		prop: 'massId',
		modelLabel: 'label',
		editType: 'remoteSelect',
		selectLabel: 'label',
		selectValue: 'value',
		editRender: {},
		type: 'ALL_STORAGE_MASS',
		change: (e, row) => {
			console.log(e, row)
			row.massName = e.massName
			row.regionId = e.regionId
			row.regionName = e.regionName
			row.storehouseId = e.storehouseId
			row.storehouseName = e.storehouseName
		},
	},
	// {
	// 	label: '垛位',
	// 	prop: 'massName',
	// 	editType: 'select',
	// 	editRender: {},
	// 	selectLabel: 'massName',
	// 	selectValue: 'massName',
	// 	allowCreate: true,
	// 	change: (e, row) => {
	// 		row.massId = e.massId
	// 	},
	// },
	{ label: '件数', prop: 'quantity', editType: 'input', editRender: { autofocus: '.el-input__inner' } },
	{ label: '重量', prop: 'ton', editType: 'input', editRender: { autofocus: '.el-input__inner' } },
])
// 新增堆存
const add = () => {
	const obj = {
		storehouseName: '', // 库场名称
		storehouseId: '', // 库场ID
		regionName: '', //区域名称
		regionId: '', //区域ID
		massName: '', // 垛位名称
		massId: '', // 垛位ID
		quantity: '', // 件数
		ton: '', // 吨数（数量）
	}
	tableData.value.push(obj)
}
// 选择子票货
const busCargoData = ref({
	cargoInfoId: '', //选择子票货id
	companyId: '', //公司id
	companyName: '', //公司名称
	inoutStorageCode: '30', // 进出场类型编码，
	inoutStorageName: '补录', // 进出场类型名称
  processDetailCode:'10090001',
  processDetailName:''
})
// const busCargoInfoId = ref('')
// 选择子票货触发事件
const busCargoInfoChanged = val => {
	console.log('选择子票货', val)
	busCargoData.value.companyId = val.companyId
	busCargoData.value.companyName = val.companyName
	console.log('怎么没有', busCargoData.value)
	// tonPlan = val.ton
	// formData.quantityPlan = val.quantity
}
const isAllCheck = ref(false)
// 全选事件
const selectAllChangeEvent = ({ checked }) => {
	isAllCheck.value = checked
}
const checkArr = ref([])
// 复选事件
const checkboxChangeEvent = data => {
	checkArr.value = data
}
const tableFocus = (val, rowData, title) => {
	if (title == '垛位') {
		// 查询对应场地下的垛位
		if (val.regionId) {
			api.listMass(val.regionId).then(res => {
				proxy.setEditTableOptions(tableColumns.value, { massName: res.data })
			})
		} else {
			proxy.setEditTableOptions(tableColumns.value, { massName: [] })
		}
	}
}
// 删除堆存（前端）
const handleDelete = () => {
	tableData.value = tableData.value.filter(item => checkArr.value.findIndex(i => i._X_ROW_KEY === item._X_ROW_KEY) < 0)
}
// 选择网厅委托------------------------------------------------------------------------------------
const selectData = reactive([
	{
		name: '船名航次',
		type: 'remoteSelect',
		modelValue: 'shipvoyageId',
		span: 3,
		selectLabel: 'LABEL',
		selectValue: 'VALUE',
		dataType: 'VOYAGE',
	},
	{
		name: '委托人',
		type: 'remoteSelect',
		modelValue: 'clientCode',
		span: 3,
		dataType: 'CUSTOMER_INFO',
	},
	{
		name: '货名',
		type: 'remoteSelect',
		modelValue: 'cargoCode',
		span: 3,
		dataType: 'CARGO_INFO',
	},
])
// const tableDataD = ref([])

// const getList = async e => {
// 	console.log(e, 'eee??')
// 	const res = await api.getvesselbill(e)
// 	tableDataD.value = res.data.pages
// }

// const tableColumnsD = reactive([
// 	{ label: '主受理单号', width: 180, prop: 'mvbillNo', sortable: true },
// 	{ label: '受理单号', width: 180, prop: 'vbillNo', sortable: true },
// 	{ label: '委托人', width: 180, prop: 'clientName', sortable: true },
// 	{ label: '船名船号', width: 100, prop: 'vesselName', sortable: true },
// 	{ label: '航次', width: 80, prop: 'voyage', sortable: true },
// 	{ label: '货名', width: 80, prop: 'cargoName' },
// 	{ label: '件数', width: 80, prop: 'pieces', sortable: true },
// 	{ label: '重量', width: 80, prop: 'weight', sortable: true },
// 	{ label: '备注', prop: 'billDescription' },
// ])
// 选择
// const check = () => {
// 	detailVisible.value = true
// 	getList({ startPage: 1, pageSize: 10 })
// }
// 拿到行数据,给上一级用
// const clickRow = ref({})
// const cellClickEvent = ({ row }) => {
// 	console.log(row, 'rowww')
// 	clickRow.value = JSON.parse(JSON.stringify(row))
// }
// 确定选择
const submit = () => {
	let selectionCopy = JSON.parse(JSON.stringify(clickRow.value))
	// formData.value.billId = selectionCopy.id
	// formData.value.mvbillNo = selectionCopy.mvbillNo
	// formData.value.clientCode = selectionCopy.clientCode
	// formData.value.clientName = selectionCopy.clientName
	// formData.value.inOut = selectionCopy.ieid
	// formData.value.tradeType = selectionCopy.tradeId
	// formData.value.billPcs = selectionCopy.pieces
	// formData.value.billWeight = selectionCopy.weight
	// formData.value.mvbillLabel = formatLabel(selectionCopy)
	// if (selectionCopy.cargoName) {
	// 	formData.value.cargoNames = selectionCopy.cargoName.split(',')
	// 	formData.value.cargoCodes = selectionCopy.cargoCode.split(',')
	// }
	detailVisible.value = false
}
// 委托单label格式化
// const formatLabel = rowData => {
// 	let shipLabel = rowData.voyage ? rowData.vesselName + rowData.voyage : rowData.vesselName ? rowData.vesselName : ''
// 	let label = `${rowData.clientName ? rowData.clientName + '/' : ''}${rowData.cargoName ? rowData.cargoName + '/' : ''}${
// 		shipLabel ? shipLabel + '/' : ''
// 	}${rowData.mvbillNo ? rowData.mvbillNo + '/' : ''}${rowData.notes ? rowData.notes : ''}`
// 	return label
// }
// const changeSelect = async e => {
// 	console.log('是什么？？？', e)
// 	// const res = await api.getstroagestack(e.value)
// 	tableColumns.value.forEach(item => {
// 		if (item.prop === 'stackCode') {
// 			item.selectData = res.data
// 		}
// 	})
// }
// const ruleForm = ref()
const editTable = ref()
// 表单验证
const validate = async () => {
	if (!busCargoData.value.cargoInfoId) {
		proxy.$message.warning('请选择子票货！')
		return
	}
	let flag = false
	let flag1 = await editTable.value.validAllEvent()
	console.log('可编辑表格', flag1)
	// await ruleForm.value.validate((valid, fields) => {
	if (flag1) {
		flag = true
	} else {
		flag = false
		proxy.$message.warning('请完善表单信息！')
	}
	// })

	return flag
}
const resetForm = () => {
	busCargoData.value = {}
	tableData.value = [
		{
			storehouseName: '', // 库场名称
			storehouseId: '', // 库场ID
			regionName: '', //区域名称
			regionId: '', //区域ID
			massName: '', // 垛位名称
			massId: '', // 垛位ID
			quantity: '', // 件数
			ton: '', // 吨数（数量）
		},
	]
	// for (const key in formData.value) {
	// 	formData.value[key] = ''
	// }
}
defineExpose({
	// formData,
	tableData,
	validate,
	resetForm,
	busCargoData,
	// clickRow,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.add {
	display: flex;
	justify-content: flex-end;
	margin: 5px 0;
}
.formLabelOnClick {
	color: #409eff;
	cursor: pointer;
}
</style>
