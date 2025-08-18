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
						<el-form-item label="票货来源" prop="source">
							<div style="width: 100%">
								<el-input v-model="formData.source" disabled />
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
						<el-form-item label="通知单编号" prop="trustNo">
							<div style="width: 100%">
								<el-input v-model="formData.trustNo" disabled />
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
            <el-form-item label="开工时间" prop="workStartTime">
                <el-input v-model="formData.workStartTime"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="完工时间" prop="workEndTime">
                <el-input v-model="formData.workEndTime"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="首次集港时间" prop="minWeighOutDt">
                <el-input v-model="formData.minWeighOutDt"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="货转时间" prop="transferDate">
                <el-input v-model="formData.transferDate"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="混配时间" prop="mixTime">
                <el-input v-model="formData.mixTime"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="完货时间" prop="mixTime">
                <el-input v-model="formData.realClearDate"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="指令发布时间" prop="mixTime">
                <el-input v-model="formData.releaseTime"  disabled />
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
            <el-form-item label="是否最终结算" prop="date">
              <Select :selectData="[{label:'是',value:'1'},{label:'否',value:'0'}]"
                      v-model:value="formData.isFinal" @change="finalChangeEvent"
                      :disabled='disableContract'/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="结算截至时间" prop="date">
              <div style="width: 100%">
                <el-date-picker
                  v-model="formData.endDate"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  type="date"
                  placeholder="可选"
                  @change="endDataChangeEvent"
                  :disabled='disableContract'
                />
              </div>
            </el-form-item>
          </el-col>
					<el-col :span="6">
						<el-form-item label="合同" prop="contractId">
							<div style="width: 100%">
								<Select
									:dataConfig="{ url: `/api/external/storageFee/listContract?
									cargoInfoId=${formData.id?formData.id:0}
									&date=${formData.date===undefined||formData.date===null?'':formData.date}` }"
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
            <el-form-item label="交接清单量" prop="handoverlistTon">
              <div style="width: 100%">
                <el-input v-model="formData.handoverlistTon" disabled />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="减免前金额" prop="allPrice">
              <div style="width: 100%">
                <el-input v-model="formData.reduceBeforeAmount" disabled />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="减免金额" prop="allPrice">
              <div style="width: 100%">
                <el-input v-model="formData.reduceAMount" disabled />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="本次结算金额" prop="allPrice">
              <div style="width: 100%">
                <el-input v-model="formData.allPrice" disabled />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否使用优惠" prop="allPrice">
              <Select :selectData="reduceIsList"
                      v-model:value="formData.isUseReduce" @change="isUserReduceChange"
                      :disabled='disableContract'/>
            </el-form-item>

          </el-col>
          <el-col :span="12">
            <el-form-item label="合同附件">
              <Upload
                businessType="BUSINESS_CONTRACT_02"
                :businessId="formData.contractId"
                @changeFile="changeFile02"
                :showUploadBtn="false"
                :showRemoveBtn="false"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其他附件">
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
        <p v-if="formData.source=='混配'" style="font-size: 13px">混配记录</p>
        <el-table v-if="formData.source=='混配'" :data="mixCargoTableData" style="width: 100%;height: 200px" border  size="large">
          <el-table-column fixed  prop="cargoInfoNo" label="票货号" width="200" height="100" />
          <el-table-column prop="mixWeight" label="混配重量" width="100" />
          <el-table-column prop="contactNo" label="合同号" width="350" show-overflow-tooltip="true"/>
          <el-table-column prop="remainFreeStorageDays" label="剩余免堆存期" width="200" />
        </el-table>
        <p v-if="formData.source=='混配'" style="font-size: 13px">新票货号免堆存期：{{mixContent}} </p>
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
import api from '@/api/statement/stackFeeCountNew/index.js'
import Upload from '@/components/upload'
import publicApi from '@/api/public/index'

const fileIds=ref([]) // 文件列表
const disableContract=ref(false) // 禁止按钮
const settlementList = ref([]) //结算方式下拉框
const collapseOpen = ['1', '2','3'] // 打开的面板
const ruleForm = ref()
const reduceDaysShowFlag = ref(false)
const mixCargoTableData = ref(null)
const mixContent = ref('')
const reduceTypeList = ref([
  {label:'延期',value:'1'},
  {label:'免堆存费',value:'0'},
  {label:'指定日期',value:'2'}
])
const reduceIsList = ref([
  {label:'是',value :'1'},
  {label:'否',value :'0'},
])

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
  workStartTime:'',
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
	trustNo: '',
	leaveBerthTime: '',
	releaseTimes: '',
  allPrice:0,
  date: '',
  reduceId:'',
  reduceType:'',
  reduceDays:0,
  reduceBeforeAmount:0,
  handoverlistTon:'',
  reduceRemark:'',
  reduceFileList:[],
  isUseReduce:'1',
  reduceEndDate:null,
  endDate : null,
  isFinal:'0',
  isClearLabel:'',
  source:'',
  minWeighOutDt:null,
  realClearDate:null,
  releaseTime:null,
  stackFeeType:''
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
const isUserReduceChange = async e =>{
  if(e.value =='0'){
    formData.value.isUseReduce = '1'
  }else if(e.value == '1'){
    formData.value.isUseReduce = '0'
  }
  formData.value.reduceFileList = []
  await api.getReduceList(formData.value.cargoInfoId).then(res=>{
      let tmpList = []
      tmpList = res.data
      console.log(tmpList,"tmpList");
      console.log(tmpList.length,"tmpList.length");
      if(tmpList!==undefined&&tmpList!=null&&tmpList.length>0){
        if(tmpList[0].reduceType=='' || tmpList[0].reduceType==null){
          proxy.$message.warning("注意：此票货减免信息已被撤销，暂无可用的减免信息");
        }else {
          formData.value.isUseReduce = e.value
          formData.value.reduceId = tmpList[0].id
          formData.value.reduceType = tmpList[0].reduceType
          formData.value.reduceDays = tmpList[0].reduceDays
          formData.value.reduceEndDate = tmpList[0].reduceEndDate
          formData.value.reduceRemark = tmpList[0].remark

          publicApi.getBusFiles({
            businessId: formData.value.cargoInfoId,
            businessType: "CARGO_REDUCE_PROOF"
          }).then(res => {

            formData.value.reduceFileList = res.data.map(o => {
              return o.id;
            })
          })
        }
      } else {
      proxy.$message.warning("未找到优惠信息")
    }

  })
  console.log(formData.value.contractId,"formData.value.contractIdformData.value.contractIdformData.value.contractId");
  if(formData.value.contractId!=''){
    let withContractParam = {
      cargoInfoId:formData.value.cargoInfoId,
      isFinal:formData.value.isFinal,
      endDate:formData.value.endDate,
      freeStorageDays:formData.value.freeStorageDays,
      rate:formData.value.rate,
      tax:formData.value.tax,
      isUseReduce:formData.value.isUseReduce,
      isCalculate:formData.value.stackFeeType
    }
    await api.listDetailWithContract(withContractParam).then(res => {
      formData.value.details =res.data
      formData.value.allPrice = 0;
      let tmpAmount = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
        tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
      })
      formData.value.reduceBeforeAmount  = tmpAmount
      formData.value.reduceAMount  = (tmpAmount - formData.value.allPrice).toFixed(2)
    })
  }else {
    let detailParams = {
      cargoInfoId : formData.value.cargoInfoId,
      isFinal:formData.value.isFinal,
      endDate:formData.value.endDate,
      isCalculate:formData.value.stackFeeType
    }
    await api.listDetail(detailParams).then(res => {
      formData.value.details =res.data
      formData.value.allPrice = 0
      let tmpAmount = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
        tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
      })
      formData.value.reduceBeforeAmount  = tmpAmount
      formData.value.reduceAMount  = (tmpAmount - formData.value.allPrice).toFixed(2)
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
  // proxy.$bus.emit('resetFileList') //清空文件
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
  formData.value.workStartTime=''
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
  formData.value.trustNo=''
  formData.value.leaveBerthTime=''
  formData.value.releaseTimes=''
  formData.value.details =[]
  formData.value.reduceId=''
  formData.value.reduceType=''
  formData.value.reduceDays=0
  formData.value.reduceBeforeAmount=0
  formData.value.handoverlistTon=''
  formData.value.reduceEndDate=null
  formData.value.reduceRemark=''
  formData.value.reduceFileList=[]
  formData.value.endDate=null
  formData.value.isFinal='0'
  formData.value.isClearLabel=''
  formData.value.isUseReduce='1'
  formData.value.source = ''
  formData.value.minWeighOutDt=null
  formData.value.realClearDate=null
  formData.value.releaseTime=null
  formData.value.stackFeeType=''
  mixCargoTableData.value =null
  mixContent.value = ''
}

// 上传文件
const changeFile = files => {
  // console.log('删除附件', files)
  fileIds.value = files
}// 上传文件
const changeFile02 = files => {
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
//是否最终结算结算改变事件
const  finalChangeEvent = e =>{
  if(e.value == '1'){
    formData.value.isFinal = '0'
  }else if (e.value == '0') {
    formData.value.isFinal = '1'
  }
  let detailParams = {
    cargoInfoId : formData.value.cargoInfoId,
    isFinal:e.value,
    endDate:formData.value.endDate,
    isCalculate:formData.value.stackFeeType,
    isXC:formData.value.source == '卸船' ?'1':''
  }

  if(formData.value.contractId===undefined||formData.value.contractId==null ||formData.value.contractId==''){
    api.listDetail(detailParams).then(res=>{
      formData.value.isFinal = e.value
      formData.value.details =res.data
      let tmpAmount = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
        tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
      })
      formData.value.reduceBeforeAmount  = tmpAmount
      formData.value.reduceAMount  = (tmpAmount - formData.value.allPrice).toFixed(2)
    })
  }else{
    let withContractParam = {
      cargoInfoId:formData.value.cargoInfoId,
      isFinal:e.value,
      endDate:formData.value.endDate,
      freeStorageDays:formData.value.freeStorageDays,
      rate:formData.value.rate,
      tax:formData.value.tax,
      isUseReduce:formData.value.isUseReduce,
      isCalculate:formData.value.stackFeeType,
      isXC:formData.value.source == '卸船' ?'1':''
    }
    api.listDetailWithContract(withContractParam).then(res => {
      formData.value.isFinal = e.value
      formData.value.details =res.data
      formData.value.allPrice = 0;
      let tmpAmount = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
        tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
      })
      formData.value.reduceBeforeAmount  = tmpAmount
      formData.value.reduceAMount  = (tmpAmount - formData.value.allPrice).toFixed(2)
    })
  }
}
//结算时间改变事件
const endDataChangeEvent = ()=>{


  if(formData.value.contractId===undefined||formData.value.contractId==null ||formData.value.contractId==''){
    let detailParams = {
      cargoInfoId : formData.value.cargoInfoId,
      isFinal:formData.value.isFinal,
      endDate:formData.value.endDate,
      isCalculate:formData.value.stackFeeType,
      isXC:formData.value.source == '卸船' ?'1':''

    }
    api.listDetail(detailParams).then(res=>{
      formData.value.allPrice = 0;
      formData.value.details =res.data
      let tmpAmount = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
        tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
      })
      formData.value.reduceBeforeAmount  = tmpAmount
      formData.value.reduceAMount  = (tmpAmount - formData.value.allPrice).toFixed(2)
    })
  }else{
    let withContractParam = {
      cargoInfoId:formData.value.cargoInfoId,
      isFinal:formData.value.isFinal,
      endDate:formData.value.endDate,
      freeStorageDays:formData.value.freeStorageDays,
      rate:formData.value.rate,
      tax:formData.value.tax,
      isUseReduce:formData.value.isUseReduce,
      isCalculate:formData.value.stackFeeType,
      isXC:formData.value.source == '卸船' ?'1':''

    }
    api.listDetailWithContract(withContractParam).then(res => {
      formData.value.details =res.data
      formData.value.allPrice = 0;
      let tmpAmount = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
        tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
      })
      formData.value.reduceBeforeAmount  = tmpAmount
      formData.value.reduceAMount  = (tmpAmount - formData.value.allPrice).toFixed(2)

    })
  }
}
// 合同选中回调事件
const contactChange = row => {
  console.log(row)
  console.log(formData.value.id)
  console.log(formData.value.handoverlistId)
  if (row) {
    formData.value.contractRateId = row.rate.contractRateId
    formData.value.freeStorageDays = row.rate.freeStorageDays
    formData.value.rate = row.rate.rate
    formData.value.tax = row.rate.tax
    let withContractParam = {
      cargoInfoId:formData.value.cargoInfoId,
      isFinal:formData.value.isFinal,
      endDate:formData.value.endDate,
      freeStorageDays:formData.value.freeStorageDays,
      rate:formData.value.rate,
      tax:formData.value.tax,
      isUseReduce:formData.value.isUseReduce,
      isCalculate:formData.value.stackFeeType,
      isXC:formData.value.source == '卸船' ?'1':''

    }
    api.listDetailWithContract(withContractParam).then(res => {
      formData.value.details =res.data
      formData.value.allPrice = 0;
      let tmpAmount = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
        tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
      })
      formData.value.reduceBeforeAmount  = tmpAmount
      formData.value.reduceAMount  = (tmpAmount - formData.value.allPrice).toFixed(2)
    })
  } else {
    formData.value.contractRateId = undefined
    formData.value.freeStorageDays = undefined
    formData.value.rate = undefined
    formData.value.tax = undefined
    let detailParams = {
      cargoInfoId : formData.value.cargoInfoId,
      isFinal:formData.value.isFinal,
      endDate:formData.value.endDate,
      isCalculate:formData.value.stackFeeType,
      isXC:formData.value.source == '卸船' ?'1':''

    }
    api.listDetail(detailParams).then(res => {
      formData.value.isFinal = e.value
      formData.value.details =res.data
      let tmpAmount = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
        tmpAmount = math.numAdd(tmpAmount,x.originalAmount).toFixed(2)
      })
      formData.value.reduceBeforeAmount  = tmpAmount
      formData.value.reduceAMount  = (tmpAmount - formData.value.allPrice).toFixed(2)

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
  setTableData2,
  mixCargoTableData,
  mixContent
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
