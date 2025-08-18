<template>
	<el-form
		:model="formData"
		ref="ruleForm"
		label-width="100px"
		:disabled="formData.isDisabled"
		:rules="formData.isDisabled ? '' : rules"
		:inline="true"
		label-position="top"
	>
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="基本信息" name="1">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="作业公司" prop="companyName">
							<div style="width: 100%">
								<el-input v-model="formData.companyName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货主" prop="cargoOwnerName">
							<div style="width: 100%">
								<el-input v-model="formData.cargoOwnerName" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="货名" prop="cargoName">
							<div style="width: 100%">
								<el-input v-model="formData.cargoName" disabled />
							</div>
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
						<el-form-item label="通知单编号" prop="trustNos">
							<div style="width: 100%">
								<el-input v-model="formData.trustNos" disabled />
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="贸别" prop="tradeType">
							<el-input v-model="formData.tradeType" disabled />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="进出口" prop="impExpLabel">
							<el-input v-model="formData.impExpLabel" disabled />
						</el-form-item>
					</el-col>
          <el-col :span="6">
            <el-form-item label="靠泊时间" prop="berthTime">
                <el-input v-model="formData.berthTime"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="离泊时间" prop="leaveBerthTime">
                <el-input v-model="formData.leaveBerthTime"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="完工时间" prop="workEndTime">
                <el-input v-model="formData.workEndTime"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="通知单发布时间" prop="releaseTimes">
                <el-input v-model="formData.releaseTimes"  disabled />
            </el-form-item>
          </el-col>
				</el-row>
			</el-collapse-item>
      <el-collapse-item title="优惠信息" name="2">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6" >
						<el-form-item label="减免类型" prop="reduceType">
              <Select :selectData="reduceTypeList"
                      v-model:value="formData.reduceType" @change="reduceTypeChange" />
            </el-form-item>
					</el-col>
					<el-col :span="6"  v-if="formData.reduceType == '1'">
						<el-form-item label="延期天数" prop="reduceDays">
								<el-input v-model="formData.reduceDays"  />
						</el-form-item>
					</el-col>
          <el-col :span="6"  v-if="formData.reduceType == '2'">
						<el-form-item label="减免截止日期" prop="reduceEndDate">
              <el-date-picker
                v-model="formData.reduceEndDate"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                type="date"
                placeholder="减免截止日期"
              />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="备注" prop="reduceRemark">
								<el-input v-model="formData.reduceRemark"/>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="减免凭证" prop="reduceFileList">
              <Upload
                businessType="CARGO_REDUCE_PROOF"
                :businessId="formData.cargoInfoId"
                @changeFile="changeReduceFile" />
            </el-form-item>
					</el-col>
				</el-row>
			</el-collapse-item>
			<el-collapse-item title="结算信息" name="3">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="合同" prop="contractId">
							<div style="width: 100%">
								<Select
									:dataConfig="{ url: `/api/external/storageCalculate/listContract?cargoInfoId=${formData.id?formData.id:0}&date=${formData.date===undefined||formData.date===null?'':formData.date}` }"
									v-model:value="formData.contractId"
									v-model:label="formData.contractNo"
									selectValue="id"
									selectLabel="contractNo"
									@change="contactChange"
                  :disabled='disableContract'
								/>
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6">
            <el-form-item label="合同匹配日期" prop="date">
              <div style="width: 100%">
                <el-date-picker
                  v-model="formData.date"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  type="date"
                  placeholder="可选"
                  @change="formData.contractId = '';contactChange(undefined)"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="费率" prop="rate">
              <div style="width: 100%">
                <el-input v-model="formData.rate" disabled />
              </div>
            </el-form-item>
          </el-col>
					<el-col :span="6">
						<el-form-item label="免堆存期" prop="freeStorageDays">
							<div style="width: 100%">
								<el-input v-model="formData.freeStorageDays" disabled />
							</div>
						</el-form-item>
					</el-col>
          <el-col :span="6">
            <el-form-item label="总金额" prop="allPrice">
              <div style="width: 100%">
                <el-input v-model="formData.allPrice" disabled />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否使用优惠" prop="allPrice">
              <Select :selectData="reduceIsList"
                      v-model:value="formData.isUseReduce" @change="isUserReduceChange"/>
            </el-form-item>

          </el-col>
          <el-col :span="24">
            <el-form-item label="附件合同">
              <Upload
                businessType="BUSINESS_CONTRACT_01"
                :businessId="formData.contractId"
                @changeFile="changeFile"
                :showUploadBtn="false"
                :showRemoveBtn="false"
                disabled
              />
            </el-form-item>
          </el-col>
				</el-row>
				<EditTable
					ref="EditTableRef"
					:showToolBar="true"
					:tableHeight="400"
					:autoResize="true"
					:tableColumns="tableColumns"
					:tableData="formData.details"
					@input="tableInput"
					@change="tableChange"
				/>
			</el-collapse-item>
		</el-collapse>
	</el-form>
</template>

<script setup name="drawer">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import EditTable from '@/components/EditTable/index.vue'
import Select from '@/components/Select/index.vue'
import math from '@/utils/math.js'
import api from '@/api/statement/stackFeeCount/index.js'
import Upload from '@/components/upload'

const fileIds=ref([]) // 文件列表
const disableContract=ref(false) // 禁止按钮
const settlementList = ref([]) //结算方式下拉框
const collapseOpen = ['1', '2','3'] // 打开的面板
const ruleForm = ref()
const reduceDaysShowFlag = ref(false)
const reduceTypeList = ref([
  {label:'延期',value:'1'},
  {label:'免堆存费',value:'0'},
  {label:'指定日期',value:'2'}
])
const reduceIsList = ref([
  {label:'是',value :'1'},
  {label:'否',value :'0'},
])
  //下面这个好像没啥用
const reduceForm = ref({
  id:'',
  cargoInfoId:'',
  reduceType:'',
  reduceDays:0,
  remark:'',
  fileIds:[]
})

const formData = ref({
	id: '',
	companyId: '',
	companyName: '',
	cargoOwnerName: '',
	cargoAgentName: '',
	cargoName: '',
	shipNameVoyage: '',
  tradeType: '',
	impExpLabel: '',
	remark: '',
	details: [],
  settlementFlag: '',
  settlementBasisName:'',
  settlementBasisCode:'',
	berthTime:'',
	workEndTime:'',
  contractNo:'',
  contractId:'',
  contractRateId:'',
  freeStorageDays:'',
  rate:'',
  handoverlistId:'',
  cargoInfoId:'',
  cargoOwnerId:'',
  shipvoyageItemId:'',
  shipvoyageId:'',
  tax: '',
  trustId: '',
	trustNos: '',
	leaveBerthTime: '',
	releaseTimes: '',
  allPrice:0,
  date: '',
  reduceId:'',
  reduceType:'',
  reduceDays:0,
  reduceRemark:'',
  reduceFileList:[],
  reduceEndDate:null
})
const rules = ref({
	// contractId: [{ required: true, message: '合同必须选择' }],
  // reduceType: [{ required: true, message: '减免类型必选' }],
  reduceDays: [{ required: true, message: '减免天数必填' }],
  // reduceRemark: [{ required: true, message: '减免备注必填' }],
  reduceEndDate: [{ required: true, message: '减免截至日期必填' }],
 // reduceFileList: [{ required: true, message: '减免凭证必须上传' }],

})
const setTableData = data => {
  formData.value.details = data
  formData.value.allPrice = 0
  data.forEach(x=>{
    formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
  })
}
const isUserReduceChange = e =>{
  formData.value.isUseReduce = e.value
  if(formData.value.contractId!=''){
    //重新计获取堆存费信息
    let params= {
      cargoInfoId:formData.value.cargoInfoId,
      contractRateId:formData.value.contractRateId,
      isUseReduce:e.value
    }
    api.listDetailWithContract(params).then(res => {
      formData.details = res.data
    })

  }


}

const setTableData2 = data => {
  formData.value.details = data
}
const validate = async () => {
/*	let flag = await EditTableRef.value.validAllEvent()
	if (!flag) {
		return flag
	}*/
  if(formData.value.reduceType ==''){
    return true;
  }
  let flag = true
	await ruleForm.value.validate((valid, fields) => {
		if (!valid) {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
const resetForm = () => {
	ruleForm.value.resetFields()
  // proxy.$bus.emit('resetFileList') //清空文件上传
    formData.value.id = ''
    formData.value.companyId= ''
    formData.value.companyName= ''
    formData.value.cargoOwnerName= ''
    formData.value.cargoAgentName= ''
    formData.value.cargoName= ''
    formData.value.shipNameVoyage= ''
    formData.value.tradeType= ''
    formData.value.impExpLabel= ''
    formData.value.remark= ''
    formData.value.details=[]
    formData.value.settlementFlag= ''
    formData.value.settlementBasisName=''
    formData.value.settlementBasisCode=''
    formData.value.berthTime=''
    formData.value.workEndTime=''
    formData.value.contractNo=''
    formData.value.contractId=''
    formData.value.contractRateId=''
    formData.value.freeStorageDays=''
    formData.value.rate=''
    formData.value.handoverlistId=''
    formData.value.cargoInfoId=''
    formData.value.cargoOwnerId=''
    formData.value.shipvoyageItemId=''
    formData.value.shipvoyageId=''
    formData.value.allPrice=''
    formData.value.tax=''
    formData.value.trustId=''
    formData.value.trustNos=''
    formData.value.leaveBerthTime=''
    formData.value.releaseTimes=''
    formData.value.details =[]
    formData.value.reduceId=''
    formData.value.reduceType=''
    formData.value.reduceDays=0
    formData.value.reduceEndDate=null
    formData.value.reduceRemark=''
    formData.value.reduceFileList=[]

}

// 上传文件
const changeFile = files => {
  // console.log('删除附件', files)
  fileIds.value = files
}


const reduceTypeChange = e =>{
  //减免类型改变控制延期天数的显示

  console.log(e,"减免类型改变事件");

  if(e===undefined||e==null){
    formData.value.reduceDays = 0
    formData.value.reduceEndDate = null
  }else if(e.value=='0'){
    formData.value.reduceDays = 0
    formData.value.reduceEndDate = null
    reduceDaysShowFlag.value = false


  }else if(e.value=='1'){
    formData.value.reduceDays = 0
    formData.value.reduceEndDate = null
    reduceDaysShowFlag.value = true
  }else if(e.value=='2'){
    formData.value.reduceDays = 0
    formData.value.reduceEndDate = null
  }
}
const changeReduceFile = files => {
  formData.value.reduceFileList = files
}

// 可编辑表格
const EditTableRef = ref('')
const tableColumns = ref([
	{
		prop: 'date',
		label: '日期',
		minWidth: 200,
	},
  {
    prop: 'ton',
    label: '堆存量',
    minWidth: 200,
  },
	{
		prop: 'billableTon',
		label: '计费量',
		minWidth: 200,
	},
	{
		prop: 'inTon',
		label: '进场量',
		minWidth: 120,
	},
	{
		label: '出场量',
		prop: 'outTon',
		width: 150,
	},
  {
    prop: 'amount',
    label: '金额',
    width: 150,
  },
])
// 合同选中回调事件
const contactChange = row => {
  if (row) {
    formData.value.contractRateId = row.rate.contractRateId
    formData.value.freeStorageDays = row.rate.freeStorageDays
    formData.value.rate = row.rate.rate
    formData.value.tax = row.rate.tax
    let params= {
      cargoInfoId:formData.value.id,
      contractRateId:row.rate.contractRateId,
    }
    api.listDetailWithContract(params).then(res => {
      formData.value.details =res.data
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
      })
    })
  } else {
    formData.value.contractRateId = undefined
    formData.value.freeStorageDays = undefined
    formData.value.rate = undefined
    formData.value.tax = undefined
    api.listDetail(formData.value.id).then(res => {
      formData.value.details =res.data
      formData.value.allPrice = 0
    })
  }
}
defineExpose({
	validate,
	formData,
	resetForm,
  contactChange,
  settlementList,
  setTableData,
  disableContract,
  fileIds,
  setTableData2
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
