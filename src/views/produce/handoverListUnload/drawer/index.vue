<template>
	<el-form :model="formData" ref="ruleForm" label-width="100px" :inline="true" label-position="top">
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="船舶信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="作业公司" prop="companyId">
							<Select
								:dataConfig="{ params: { type: 'DEPT_WORK_COMPANY' } }"
								v-model:value="formData.companyId"
								v-model:label="formData.companyName"
								placeholder="作业公司"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="船名航次" prop="shipNameVoyage">
							<div style="width: 100%">
								<el-input v-model="formData.shipNameVoyage" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="scn" prop="scn">
							<div style="width: 100%">
								<el-input v-model="formData.scn" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货种" prop="cargoCategoryName">
							<div style="width: 100%">
								<el-input v-model="formData.cargoCategoryName" disabled />
							</div>
						</el-form-item>
					</el-col>

				</el-row>
        <el-row>
          <el-col :span="6">
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
          </el-col>
        </el-row>
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item prop="" label="交接清单上传" style="line-height: 50px; display: inline">
							<upload
								:fileTypeName="fileTypeName"
								businessType="HANDOVERLIST"
								:businessId="formData.shipvoyageItemId"
								@changeFile="changeFile"
							/>
						</el-form-item>
					</el-col>
          <el-col :span="6">
            <el-form-item prop="" label="海关报关单上传" style="line-height: 50px; display: inline">
              <upload
                :fileTypeName="fileTypeName"
                businessType="HANDOVERLIST_HG"
                :businessId="formData.shipvoyageItemId"
                @changeFile="changeFile"
              />
            </el-form-item>
          </el-col>

					<el-col :span="6">
						<el-form-item prop="" label="第三方检测报告上传" style="line-height: 50px; display: inline">
							<upload
								:fileTypeName="fileTypeName"
								businessType="HANDOVERLIST_JC"
								:businessId="formData.shipvoyageItemId"
								@changeFile="changeJCFile"
							/>
						</el-form-item>
					</el-col>
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
					:hasAdd="true"
					@input="tableInput"
					@change="tableSelectChange"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import upload from '../../../../components/upload/index'
import math from '@/utils/math.js'
import Select from "@/components/Select/index.vue";
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import EditTable from '@/components/EditTable/index.vue'
import {ElButton} from "element-plus";
import api from '@/api/produce/handoverListUnload/index.js'

const { proxy } = getCurrentInstance() // 相当于vue2里的this


const collapseOpen = ['1', '2'] // 打开的面板
const formData = reactive({
	id: '',
	companyId:'',
	companyName:'',
	shipNameVoyage: '', //船舶航次
	shipvoyageItemId:'',
	shipvoyageId:'',
	scn: '', //船舶航次
	cargoCategoryName: '', //货种
	tradeType:'',
	loadUnload:'',
	berthTime: '', //靠泊时间
	leaveBerthTime: '', //离泊时间
	quantity: 0, //件数
	ton: 0, //重量
	ticketNum: 0, //票数
	fileIds: [], //图片上传
	hgFileIds: [], //海关报关单
	jcFileIds: [], //第三方检测报告单
})
const validate = async () => {
	let flag = await EditTableRef.value.validAllEvent()
	return flag
}
// 可编辑表格
const EditTableRef = ref('')
const tableData = ref([])
// 文件上传
const changeFile = file => {
	// console.log('文件上传', file)
	formData.fileIds = file
}
// 海关报关单
const changeHGFile = file => {
	// console.log('文件上传', file)
	formData.hgFileIds = file
}
// 第三方检测报告
const changeJCFile = file => {
	// console.log('文件上传', file)
	formData.jcFileIds = file
}
const hatchNumsArray = ref([])

const tableColumns = reactive([
	{
		prop: 'cargoInfoNo',
		label: '票货号',
		minWidth: 120,
	},
	// {
	//   prop: 'deliveryNumbers',
	//   label: '提运单号',
	//   width: 150,
	//   editRender: {},
	//   editType: 'input',
	// },
	{
		prop: 'cargoOwnerId',
		label: '货主',
		editType: 'remoteSelect',
		type: 'CUSTOMER_CARGO_OWNER',
		editRender: {},
		selectLabel: 'label', // options绑定的值，默认为label，和默认一致则不用传。
		selectValue: 'value', // options绑定的值，默认为value，和默认一致则不用传。
		modelLabel: 'cargoOwnerName', // 选中label绑定的字段
		modelValue: 'cargoOwnerId', // 选中label绑定的字段
		selectData: [],
		width: 150,
		disabled: false,
	},
	{
		prop: 'cargoName',
		label: '货物',
		editType: 'remoteSelect',
		type: 'CARGO_INFO_SIGN',
		editRender: {},
		selectLabel: 'label', // options绑定的值，默认为label，和默认一致则不用传。
		selectValue: 'value', // options绑定的值，默认为value，和默认一致则不用传。
		modelLabel: 'cargoName', // 选中label绑定的字段
		modelValue: 'cargoCode', // 选中label绑定的字段
		selectData: [],
		disabled: false,
		width: 150,
		change:(e,row)=>{
			row.cargoCode = e.value
			row.packingCode = e.workType
			if(e.workType=='1'){
				row.packingCode = '02'
				row.packingName = '件'
			}else if(e.workType=='2'){
				row.packingCode = '01'
				row.packingName = '散'
			}else {
// 异
			}
		}
	},
	{
		prop: 'packingCode',
		label: '件散',
		width: 150,
		editRender: {},
		editType: 'select',
		modelValue: 'packingCode',
		modelLabel: 'packingName',
		selectValue: 'value',
		selectLabel: 'label',
		disabled: true,
		selectData: [
			{
				value:'1',label:'件'
			},      {
				value:'2',label:'散'
			},    {
				value:'3',label:'木材'
			},
		],
		change: (e, row) => {
			if(row.cargoName==null||row.cargoName==''){
				proxy.$message.warning("先选择货物");
				row.workType =''
			}else{
				row.packingName = e.label
			}

		}
	},
	{

		prop: 'hatchNumsTmp',
		label: '舱口',
		width: 100,
		modelLabel: 'hatchNumsTmp',
		editRender: {},
		multiple: true,
		editType: 'select',
		selectData: hatchNumsArray,
		disabled: false,
	},
	{
		prop: 'quantity',
		label: '件数',
		width: 150,
		editRender: {},
		editType: 'input',
	},
	{
		prop: 'ton',
		label: '重量',
		width: 150,
		editRender: {},
		editType: 'input',
	},
	{
		prop: 'volumeTon',
		label: '体积吨',
		width: 150,
		editRender: {},
		editType: 'input',
	},
	{
		prop: 'ticketNum',
		label: '票数',
		width: 150,
		editRender: {},
		editType: 'input',
	},

	{
		prop: 'remark',
		label: '备注',
		width: 260,
		editRender: {},
		editType: 'input',
	},
	{
		prop: '',
		label: '添加',
		width: 100,
		align: 'center',
		fixed: 'right',
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
const editRules = ref({
	ton: proxy.getRules({
		required: false,
		numberCheck: {
			int: 8,
			dec: 4,
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
				formData.quantity = math.numAdd(formData.quantity, Number(item.quantity))
				//formData.quantity += Number(item.quantity)
			}
		})
	}
	if (title == '重量') {
		formData.ton = 0
		tableData.value.forEach(item => {
			if (Number(item.ton)) {
				formData.ton = math.numAdd(formData.ton, Number(item.ton))
				//formData.ton += Number(item.ton)
			}
		})
	}
	if (title == '票数') {
		formData.ticketNum = 0
		tableData.value.forEach(item => {
			if (Number(item.ticketNum)) {
				formData.ticketNum = math.numAdd(formData.ticketNum, Number(item.ticketNum))
				//formData.ticketNum += Number(item.ticketNum)
			}
		})
	}
}
//删除事件
const handleDelete = async row =>{

	//校验是否存在通知单
	let tmpFlag= false
	if(row.id  != null && row.id !=''){
		if(row.cargoInfoId!=null && row.cargoInfoId !=''){

			await api.isHaveTrust(row.cargoInfoId).then(res=>{
				tmpFlag = res.data
			})

		}
	}
	if(tmpFlag == true){
		proxy.$message.error("通知单已发布不允许删除！")
		return ;
	}else{
		let rowIndex = ''
		tableData.value.forEach((item, index) => {
			if (item._X_ROW_KEY == row._X_ROW_KEY) {
				rowIndex = index
			}
		})
		tableData.value.splice(rowIndex, 1)
	}


}
const tableSelectChange = (e, row, item, label)=>{
	if(item='货物')
		console.log(e, row, item, label);
}
// 表单清空
const resetForm = () => {
	// proxy.resetObj(formData.value)
	//   proxy.$bus.emit('resetFileList') //文件上传清空
	formData.id= ''
	formData.shipNameVoyage= '' //船舶航次
	formData.scn = '' //船舶航次
	formData.cargoCategoryName= '' //货种
	formData.berthTime= '' //靠泊时间
	formData.leaveBerthTime= '' //离泊时间
	formData.quantity= 0 //件数
	formData.ton= 0 //量
	formData.tradeType= '' //量
	formData.loadUnload= '' //量
	formData.ticketNum= 0 //票数
	formData.fileIds= [] //图片上传
	formData.hgFileIds= [] //海关报关单
	formData.jcFileIds= [] //第三方检测报告单
	hatchNumsArray.value = []
	tableData.value =[]
}
watch(()=> tableData.value,(newValue,oldValue)=>{
	console.log(tableColumns)
	newValue.forEach(o=>{
		if (o.workType=='散' && tableData.value.length>1){
			proxy.$message.error("散货只允许添加一条记录")
		}
	})
})
defineExpose({
	hatchNumsArray,
	validate,
	formData,
	tableData,
	resetForm,
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
