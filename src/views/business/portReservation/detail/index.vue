<template>
	<div>
		<el-form :model="formData" ref="ruleForm" label-position="top" label-width="120px" :rules="rules">
			<el-collapse v-model="activeNames">
				<el-collapse-item title="指令票货信息" name="1">
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="通知单编号" prop="tbtTrustNo">
								<RemoteSelectTable
									:dataConfig="{
										url: `/api/external/trustTradeReservation/listTrustCargo?startPage=1&pageSize=15&keyword=`,
									}"
									v-model:value="formData.tbtTrustNo"
									v-model:label="formData.tbtTrustNo"
									selectValue="tbtTrustNo"
									selectLabel="tbtTrustNo"
									:tableColumns="tableColumns1"
									@change="changeSelect1"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="作业过程" prop="tbtProcessName">
								<el-input v-model="formData.tbtProcessName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="作业公司" prop="tbtCompanyName">
								<el-input v-model="formData.tbtCompanyName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="船名航次" prop="shipNameVoyage">
								<el-input v-model="formData.shipNameVoyage" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="货主" prop="tbtcCargoOwnerName">
								<el-input v-model="formData.tbtcCargoOwnerName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="货代" prop="tbtcCargoOwnerName">
								<el-input v-model="formData.tbtcCargoOwnerName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="货名" prop="tbtcCargoName">
								<el-input v-model="formData.tbtcCargoName" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="总件数" prop="tbtcQuantity">
								<el-input v-model="formData.tbtcQuantity" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
					</el-row>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="总重量" prop="tbtcTon">
								<el-input v-model="formData.tbtcTon" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="6">
							<el-form-item label="贸别" prop="tbtTradeType">
								<el-input v-model="formData.tbtTradeType" :disabled="true" placeholder="" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
				<el-collapse-item name="2">
					<template #title>
						<div>
							<span>预约车队信息</span>
							<span style="position: relative; left: 790px">
								可预约重量：
								<span style="color: deepskyblue">{{ ton }}</span>
								可预约件数：
								<span style="color: deepskyblue">{{ quantity }}</span>
								<!-- <el-button @click.stop="importData" link type="primary">导入车队</el-button> -->
							</span>
						</div>
					</template>
					<el-row :gutter="20">
						<el-col :span="6">
							<el-form-item label="车队" prop="customerId">
								<Select
									:selectData="formData.assignFleets"
									v-model:value="formData.customerId"
									v-model:label="formData.customerName"
									selectLabel="customerName"
									selectValue="customerId"
									placeholder="车队"
									@change="changeCustomer"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="10">
							<el-form-item label="起止时间" prop="times">
								<el-date-picker
									format="YYYY-MM-DD HH:mm"
									v-model="formData.times"
									type="datetimerange"
									start-placeholder="开始时间"
									end-placeholder="结束时间"
									value-format="YYYY-MM-DD HH:mm:ss"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="4">
							<el-form-item label="预约重量" prop="ton">
								<el-input v-model="formData.ton" placeholder="" />
							</el-form-item>
						</el-col>
						<el-col :span="4">
							<el-form-item label="预约件数" prop="quantity">
								<el-input v-model="formData.quantity" placeholder="" />
							</el-form-item>
						</el-col>
					</el-row>
				</el-collapse-item>
				<el-collapse-item title="" name="3">
					<template #title>
						<div>
							<span>车辆信息</span>
							<span style="position: relative; left: 812px">
								<el-button @click.stop="downLoadModel" link type="primary">下载模板</el-button>
								<el-button @click.stop="importData" link type="primary">导入车队</el-button>
							</span>
						</div>
					</template>
					<EditTable
						:name="'车辆信息'"
						ref="baseTable"
						:showSearchHeader="false"
						:showPagination="false"
						:showToolBarEditTable="true"
						:tableColumns="tableColumns"
						:tableData="formData.cars"
						:tableHeight="tableHeight"
						:editRules="editRules"
						:headerCellClickEvent="rateHeaderCellClickEvent"
						:headerCellClassName="headerCellClassName"
						:rowConfig="rowConfig"
					/>
				</el-collapse-item>
			</el-collapse>
		</el-form>
		<el-dialog v-model="dialogVisible" title="车队导入" width="30%" :before-close="handleClose">
			<el-upload
				ref="upload"
				action="#"
				:show-file-list="false"
				:on-change="handleExcel"
				:limit="1"
				:multiple="false"
				accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				:auto-upload="false"
				:headers="headers"
			>
				<!--accept 只接受某种格式的文件-->
				<el-button size="small" type="primary">导入车队</el-button>
			</el-upload>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<!-- <el-button type="primary" @click="dialogVisible = false">Confirm</el-button> -->
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="portReservation">
import { ref, reactive, nextTick, h, watch, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/business/portReservation/index'
import EditTable from '@/components/EditTable/index.vue'
import RemoteSelectTable from '@/components/RemoteSelectTable/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
import { ElButton } from 'element-plus'
import Select from '@/components/Select'
const baseTable = ref()
const ruleForm = ref()
const upload = ref()
// 校验规则
const rules = ref({
	tbtTrustNo: proxy.getRules({ required: true }),
	customerId: proxy.getRules({ required: true }),
	ton: proxy.getRules({
		required: true,
		numberCheck: {
			int: 7,
			dec: 4,
		},
	}),
	quantity: proxy.getRules({
		numberCheck: {
			int: 8,
		},
	}),
	times: proxy.getRules({ required: true }),
})
const activeNames = reactive(['1', '2', '3'])
const formData = reactive({
	id: '',
	cars: [],
	trustId: '',
	tbtTrustNo: '',
	trustCargoId: '',
	quantity: '',
	ton: '',
	times: [],
	startTime: '',
	endTime: '',
	customerId: '',
	customerName: '',
	// 多余
	tbtProcessName: '',
	tbtCompanyName: '',
	shipNameVoyage: '',
	tbtcCargoOwnerName: '',
	tbtcCargoAgentName: '',
	tbtcCargoName: '',
	tbtcQuantity: '',
	tbtcTon: '',
	tbtTradeType: '',
	assignFleets: [],
})
// 时间集合
const timeData = ref('')
// 下拉框表格
const tableColumns1 = ref([
	{ prop: 'tbtTrustNo', label: '通知单编号', width: 160 },
	{ prop: 'tbtProcessName', label: '作业过程', width: 120 },
	{ prop: 'tbtCompanyName', label: '作业公司', width: 160 },
	{ prop: 'shipNameVoyage', label: '船名航次', width: 160 },
	{ prop: 'tbtcCargoOwnerName', label: '货主', width: 160 },
	{ prop: 'tbtcCargoAgentName', label: '货代', width: 160 },
	{ prop: 'tbtcCargoName', label: '货名', width: 160 },
	{ prop: 'tbtPlanQuantity', label: '件数', width: 160 },
	{ prop: 'tbtPlanTon', label: '量', width: 120 },
	{ prop: 'tbtTradeType', label: '贸别', width: 140 },
])
const changeSelect1 = val => {
	if (!val) {
		formData.trustId = ''
		formData.trustCargoId = ''
		formData.tbtProcessName = ''
		formData.tbtCompanyName = ''
		formData.shipNameVoyage = ''
		formData.tbtcCargoOwnerName = ''
		formData.tbtcCargoAgentName = ''
		formData.tbtcCargoName = ''
		formData.tbtcQuantity = ''
		formData.tbtcTon = ''
		formData.tbtTradeType = ''
		formData.assignFleets = []
		formData.customerId = ''
		formData.customerName = ''
		return
	}
	if (!Object.keys(val).length == 0) {
		console.log('集疏港预约', val)
		formData.trustId = val.tbtcTrustId
		formData.trustCargoId = val.tbtcId
		formData.tbtProcessName = val.tbtProcessName
		formData.tbtCompanyName = val.tbtCompanyName
		formData.shipNameVoyage = val.shipNameVoyage
		formData.tbtcCargoOwnerName = val.tbtcCargoOwnerName
		formData.tbtcCargoAgentName = val.tbtcCargoAgentName
		formData.tbtcCargoName = val.tbtcCargoName
		formData.tbtcQuantity = val.tbtPlanQuantity
		formData.tbtcTon = val.tbtPlanTon
		formData.tbtTradeType = val.tbtTradeType
		formData.assignFleets = val.assignFleets
	}
}
// 校验规则
const editRules = ref({
	carNo: [{ required: true, message: '车牌号必须填写' }],
	status: [{ required: true, message: '车辆状态必须填写' }],
})
// 车队可预约量
const ton = ref('')
const quantity = ref('')
// 修改车队
const changeCustomer = val => {
	availableData.assignFleetId = val.id
	getAvailable()
}
const availableData = reactive({
	assignFleetId: '',
	trustTradeReservationId: '',
})
// 获取可预约数据
const getAvailable = () => {
	api.getAvailable(availableData).then(res => {
		ton.value = res.data.ton
		quantity.value = res.data.quantity
	})
}

// 可编辑列表
const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight
const tableColumns = ref([
	{ label: '车牌号', prop: 'carNo', editType: 'input', editRender: {} },
	{ label: '司机姓名', prop: 'driverName', editType: 'input', editRender: {} },
	{ label: '司机身份证号', prop: 'driverIdCard', editType: 'input', editRender: {} },
	{ label: '司机联系电话', prop: 'driverPhone', editType: 'input', editRender: {} },
	{
		label: '车辆状态',
		prop: 'status',
		editType: 'select',
		editRender: {},
		selectData: [
			{ label: '正常', value: 10 },
			{ label: '冻结', value: 20 },
		],
	},
	{
		prop: '',
		label: '添加',
		width: 200,
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const rateInfo = ref({
	driverIdCard: null,
	driverName: null,
	driverPhone: null,
	carNo: null,
	status: 10,
})
// 新增
const rateHeaderCellClickEvent = even => {
	if (even.column.field == '') {
		formData.cars.push(JSON.parse(JSON.stringify(rateInfo.value)))
	}
}
const headerCellClassName = even => {
	if (even.column.field == '') {
		return 'add'
	}
}
// 删除事件
const handleDelete = row => {
	let rowIndex = ''
	formData.cars.forEach((item, index) => {
		if (item._X_ROW_KEY == row._X_ROW_KEY) {
			rowIndex = index
		}
	})
	formData.cars.splice(rowIndex, 1)
}
const validate = async () => {
	let flags = false
	let flag1 = await baseTable.value.validAllEvent()
	await ruleForm.value.validate((valid, fields) => {
		if (valid && flag1) {
			flags = true
		} else {
			flags = false
			// proxy.$message.warning('请完善表单信息！')
		}
	})
	return flags
}
// 下载模板
const downLoadModel = () => {
	api.downloadFile().then(res => {
		let data = res
		let blod = new Blob([data], { type: 'application/vnd.ms-excel;charset=utf-8' })
		const url = window.URL.createObjectURL(blod)
		if (window.navigator.msSaveOrOpenBlod) {
			try {
				window.navigator.msSaveBlob(blod, '车辆导入模板.xlsx')
			} catch (e) {
				console.log(e)
			}
		} else {
			const link = document.createElement('a')
			link.style.display = 'none'
			link.href = url
			link.setAttribute('download', '车辆导入模板.xlsx')
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		}
	})
}
// 导入
const dialogVisible = ref(false)
const headers = reactive({ 'Content-Type': 'multipart/form-data;chatset=UTF-8' })
const importData = () => {
	dialogVisible.value = true
}
const fileTemp = ref({})
const handleExcel = files => {
	upload.value.clearFiles() //清空已上传文件列表
	fileTemp.value = files.raw
	if (fileTemp.value) {
		if (
			fileTemp.value.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
			fileTemp.value.type == 'application/vnd.ms-excel'
		) {
			let file = new FormData()
			file.append('file', fileTemp.value)
			console.log(file)
			api.uploadFile(file).then(res => {
				if (res.data.length > 0) {
					res.data.forEach(item => {
						item.status = 10
						formData.cars.push(item)
					})
				}
				dialogVisible.value = false
				proxy.$message.success('上传成功')
			})
		} else {
			proxy.$message({
				type: 'warning',
				message: '文件格式不正确，请参考模板文件填写！',
			})
		}
	} else {
		proxy.$message({
			type: 'warning',
			message: '请上传附件！',
		})
	}
}
const resetForm = () => {
	ruleForm.value.resetFields()
	formData.cars = []
	formData.id = ''
	ton.value = ''
	quantity.value = ''
}
// 监听
watch(
	() => formData.customerId,
	newVal => {
		console.log(newVal)
	},
	{ deep: true, immediate: true }
)
defineExpose({
	validate,
	resetForm,
	formData,
	ton,
	quantity,
	availableData,
	getAvailable,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
