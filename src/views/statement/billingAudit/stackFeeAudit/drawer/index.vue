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
						<el-form-item label="通知单编号" prop="shipNameVoyage">
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
            <el-form-item label="离泊时间" prop="berthTime">
                <el-input v-model="formData.leaveBerthTime"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="完工时间" prop="workEndTime">
                <el-input v-model="formData.workEndTime"  disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="通知单发布时间" prop="workEndTime">
                <el-input v-model="formData.releaseTime"  disabled />
            </el-form-item>
          </el-col>
				</el-row>
			</el-collapse-item>
			<el-collapse-item title="结算信息" name="2">
				<!-- 基本信息 -->
				<el-row :gutter="20">
					<el-col :span="6">
						<el-form-item label="合同" prop="contractId">
							<div style="width: 100%">
								<Select
									:dataConfig="{ url: `/api/external/storageSettle/listContract?handoverlistId=${formData.id?formData.id:0}` }"
									v-model:value="formData.contractId"
									v-model:label="formData.contractNo"
									selectValue="id"
									selectLabel="contractNo"
									@change="contactChange"
                  :disabled='disableContract'
                  :clearable="false"
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
            <el-form-item label="是否使用优惠" prop="isUseReduce">
              <Select :selectData="reduceIsList"
                      v-model:value="formData.isUseReduce" @change="isUserReduceChange" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="优惠类型" prop="allPrice">
              <el-input v-model="formData.reduceTypeLabel" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="备注" prop="allPrice">
              <el-input v-model="formData.reduceRemark" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="(formData.reduceType!==undefined && formData.reduceType!=null&& formData.reduceType =='1' )">
            <el-form-item label="延期天数" prop="allPrice" >
              <el-input v-model="formData.reduceDays" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="6"  v-if="(formData.reduceType!==undefined && formData.reduceType!=null&& formData.reduceType =='2' )">
            <el-form-item label="减免截止日期" prop="reduceEndDate" >
              <el-date-picker
                v-model="formData.reduceEndDate"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                type="date"
                placeholder="减免截止日期"
                disabled
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="减免凭证" prop="reduceFileList">
              <Upload
                businessType="CARGO_REDUCE_PROOF"
                :businessId="formData.cargoInfoId"
                :showUploadBtn="false"
                :showRemoveBtn="false"
              />
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
import api from '@/api/statement/stackFee/index.js'
import Upload from '@/components/upload'

const fileIds=ref([]) // 文件列表
const disableContract=ref(false) // 禁止按钮
const settlementList = ref([]) //结算方式下拉框
const collapseOpen = ['1', '2'] // 打开的面板
const ruleForm = ref()
const reduceIsList = ref([
  {label:'是',value :'1'},
  {label:'否',value :'0'},
])
const formData = ref({
	id: '',
  isUseReduce:'0',
  reduceDays:'0',
  reduceTypeLabel:'',
  reduceEndDate:'',
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
  trustNo: '',
  leaveBerthTime: '',
  releaseTime: '',
  allPrice:0
})
const rules = ref({
	contractId: [{ required: true, message: '合同必须选择' }],
})
const setTableData = data => {
  formData.value.details = data
  formData.value.allPrice = 0
  data.forEach(x=>{
    formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
  })
}

const setTableData2 = data => {
  formData.value.details = data
}
const validate = async () => {
	let flag = await EditTableRef.value.validAllEvent()
	if (!flag) {
		return flag
	}
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
  proxy.$bus.emit('resetFileList') //清空文件上传
  formData.isUseReduce='0',
    formData.reduceDays='0',
    formData.reduceTypeLabel='',
    formData.reduceEndDate='',
    formData.reduceRemark=''

    formData.id = ''
    formData.companyId= ''
    formData.companyName= ''
    formData.cargoOwnerName= ''
    formData.cargoAgentName= ''
    formData.cargoName= ''
    formData.shipNameVoyage= ''
    formData.tradeType= ''
    formData.impExpLabel= ''
    formData.remark= ''
    formData.details=[]
    formData.settlementFlag= ''
    formData.settlementBasisName=''
    formData.settlementBasisCode=''
    formData.berthTime=''
    formData.workEndTime=''
    formData.contractNo=''
    formData.contractId=''
    formData.contractRateId=''
    formData.freeStorageDays=''
    formData.rate=''
    formData.handoverlistId=''
    formData.cargoInfoId=''
    formData.cargoOwnerId=''
    formData.shipvoyageItemId=''
    formData.shipvoyageId=''
    formData.allPrice=''
    formData.tax=''
    formData.trustId=''
    formData.trustNo=''
    formData.leaveBerthTime=''
    formData.releaseTime=''
    formData.value.details =[]
}

// 上传文件
const changeFile = files => {
  // console.log('删除附件', files)
  fileIds.value = files
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
  console.log(row)
  console.log(formData.value.id)
  console.log(formData.value.handoverlistId)
  formData.value.contractRateId = row.rate.contractRateId
  formData.value.freeStorageDays = row.rate.freeStorageDays
  formData.value.rate = row.rate.rate
  formData.value.tax = row.rate.tax
    api.listDetailWithContract(formData.value.id, row.rate.contractRateId).then(res => {
      formData.value.details =res.data
      formData.value.allPrice = 0
      res.data.forEach(x=>{
        formData.value.allPrice = math.numAdd(formData.value.allPrice,x.amount).toFixed(2)
      })
    })
}
const setReduceInfo=(isUseReduce,cargoInfoId)=>{
  if(isUseReduce==''||isUseReduce == '0' ){
    return
  }else if(isUseReduce == '1'){
    api.getReduceList(cargoInfoId).then(res=>{
      console.log(res,"优惠信息初始化")
      if(res.data.length>0){
        nextTick(()=>{
          formData.value.isUseReduce = '1'
          formData.value.reduceTypeLabel =res.data[0].reduceTypeLabel
          formData.value.reduceType = res.data[0].reduceType
          formData.value.reduceRemark = res.data[0].remark
          formData.value.reduceDays = res.data[0].reduceDays
          formData.value.reduceEndDate =res.data[0].reduceEndDate
        })
      }
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
  setReduceInfo,
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
